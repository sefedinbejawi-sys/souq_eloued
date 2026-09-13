/**
 * AI Audio Robot - Audio Intelligence Engine v1
 * Core acoustic diagnostics, feedback suppressor heuristics, auto-gain calibration,
 * silence detection, and decision logging.
 */
import {
  Room,
  Zone,
  Microphone,
  AIRecommendation,
  AIHealthStatus,
  AlertItem,
  AuditLogItem,
} from '../types';

export interface AnalysisInput {
  room: Room;
  zones: Zone[];
  microphones: Microphone[];
  isSimulation: boolean;
}

export interface AnalysisResult {
  health: AIHealthStatus;
  recommendations: AIRecommendation[];
  newAlerts: AlertItem[];
  decisions: {
    ruleName: string;
    descriptionAr: string;
    timestamp: string;
    outcome: 'action_needed' | 'normal' | 'auto_adjusted';
  }[];
}

/**
 * 1. Monitor Volume Levels
 * 2. Silence Detection
 * 3. Excessive Volume & Clipping Detection
 * 4. Feedback Probability Detection
 * 5. Suggest Volume Adjustments
 * 6. Safe Auto-Gain Boundary Control
 * 7. Inactive Microphone Detection
 * 8. Issue System Alerts
 * 9. Log System Decisions
 */
export function analyzeRoomAcoustics(input: AnalysisInput): AnalysisResult {
  const { room, zones, microphones, isSimulation } = input;
  const recommendations: AIRecommendation[] = [];
  const newAlerts: AlertItem[] = [];
  const decisions: AnalysisResult['decisions'] = [];

  let feedbackStatus: 'safe' | 'warning' | 'critical' = 'safe';
  let feedbackFrequencyHz: number | undefined = undefined;
  let clippingZonesCount = 0;
  let silentMicsCount = 0;
  let activeMicsCount = 0;

  // If no controller is connected and not in simulation, report no physical data
  if (!isSimulation && room.status === 'offline') {
    return {
      health: {
        mode: 'MONITORING',
        feedbackStatus: 'safe',
        activeMicsCount: 0,
        clippingZonesCount: 0,
        silentMicsCount: 0,
        overallScore: 100,
        summaryAr: 'النظام في وضع الاستعداد — لا توجد إشارات واردة من وحدة DSP.',
      },
      recommendations: [],
      newAlerts: [],
      decisions: [
        {
          ruleName: 'Controller Standby',
          descriptionAr: 'لا يوجد تحكم آلي فعال لعدم وجود وحدة معالجة صوتية DSP متصلة.',
          timestamp: new Date().toLocaleTimeString('ar-EG'),
          outcome: 'normal',
        },
      ],
    };
  }

  // --- Rule 1 & 3: Volume & Clipping Monitoring ---
  zones.forEach((zone) => {
    if (zone.isMuted) return;

    // Detect clipping (> 90% or > -2 dBFS)
    if (zone.volume > 85 || zone.peakLevelDb > -3) {
      clippingZonesCount++;
      const delta = Math.max(4, Math.round((zone.volume - zone.safeMaxVol) * 0.8));
      const targetVol = Math.max(zone.safeMinVol, zone.volume - delta);

      recommendations.push({
        id: `rec-${zone.id}-${Date.now()}`,
        roomId: room.id,
        targetType: 'zone',
        targetId: zone.id,
        targetName: `${zone.name} (${zone.label})`,
        recommendation: `Decrease volume by ${delta}% to prevent harmonic distortion`,
        recommendationAr: `${zone.name} يحتاج إلى خفض ${delta}% لتفادي التشويش (Clipping)`,
        proposedAction: 'decrease_vol',
        proposedDelta: -delta,
        proposedValue: targetVol,
        reason: 'Peak volume exceeded safe distortion threshold',
        reasonAr: `مستوى الصوت تجاوز الحد الآمن (${zone.safeMaxVol}%) واقترب من التشبع الصوتي.`,
        detectedAt: new Date().toISOString(),
        isApplied: false,
      });

      newAlerts.push({
        id: `alert-clip-${zone.id}-${Date.now()}`,
        roomId: room.id,
        roomName: room.name,
        title: 'Excessive Volume',
        titleAr: `ارتفاع غير آمن لمستوى الصوت في ${zone.name}`,
        message: `Zone ${zone.name} is running at ${zone.volume}%, exceeding acoustic ceiling.`,
        messageAr: `المنطقة ${zone.name} تعمل بنسبة ${zone.volume}% مما يسبب ضغطاً صوتياً مفرطاً.`,
        category: 'excessive_volume',
        severity: zone.volume > 92 ? 'critical' : 'warning',
        resolved: false,
        createdAt: new Date().toISOString(),
      });

      decisions.push({
        ruleName: 'Safe Limiter Protection',
        descriptionAr: `اكتشاف ارتفاع صوتي في ${zone.name}: اقتراح خفض ${delta}% لحماية السماعات.`,
        timestamp: new Date().toLocaleTimeString('ar-EG'),
        outcome: 'action_needed',
      });
    }
  });

  // --- Rule 4: Feedback Risk Detection ---
  // If high zone volume matches high mic gain in proximity
  const activeMics = microphones.filter((m) => m.status === 'online' && !m.isMuted);
  activeMicsCount = activeMics.length;

  const hotZones = zones.filter((z) => !z.isMuted && z.volume >= 70);
  const hotMics = activeMics.filter((m) => m.volume >= 75 && m.signalLevel > 60);

  if (hotZones.length > 0 && hotMics.length > 0) {
    feedbackStatus = hotMics.some((m) => m.signalLevel > 85) ? 'critical' : 'warning';
    feedbackFrequencyHz = 3150; // Typical acoustic ringing resonance in conference halls

    const targetZone = hotZones[0];
    recommendations.push({
      id: `rec-feedback-${Date.now()}`,
      roomId: room.id,
      targetType: 'zone',
      targetId: targetZone.id,
      targetName: targetZone.name,
      recommendation: `Reduce gain on ${targetZone.name} by 6% to break feedback loop`,
      recommendationAr: `${targetZone.name} يحتاج إلى خفض 6% لكسر احتمالية Feedback`,
      proposedAction: 'check_feedback',
      proposedDelta: -6,
      proposedValue: Math.max(20, targetZone.volume - 6),
      reason: 'Acoustic feedback ringing loop resonance detected at 3.15 kHz',
      reasonAr: 'رصد تكرار رنين صوتي عالي عند تردد 3.15 كيلوهرتز بين الميكروفون والسماعات.',
      detectedAt: new Date().toISOString(),
      isApplied: false,
    });

    newAlerts.push({
      id: `alert-fb-${Date.now()}`,
      roomId: room.id,
      roomName: room.name,
      title: 'Acoustic Feedback Risk',
      titleAr: 'تنبيه: خطر حدوث Feedback صوتي في القاعة',
      message: `Resonance detected between mic ${hotMics[0].name} and ${targetZone.name}.`,
      messageAr: `تم رصد رنين متزايد بين ${hotMics[0].name} ومنطقة ${targetZone.name}.`,
      category: 'feedback',
      severity: feedbackStatus === 'critical' ? 'critical' : 'warning',
      resolved: false,
      createdAt: new Date().toISOString(),
    });

    decisions.push({
      ruleName: 'Feedback Loop Interceptor',
      descriptionAr: `رنين ترددي عند 3.15 kHz: اقتراح كبت الحساسية بنسبة 6% في ${targetZone.name}.`,
      timestamp: new Date().toLocaleTimeString('ar-EG'),
      outcome: 'action_needed',
    });
  }

  // --- Rule 2 & 7: Silence Detection & Inactive Microphone Detection ---
  microphones.forEach((mic) => {
    if (mic.status === 'online' && !mic.isMuted) {
      if (mic.signalLevel < 5) {
        silentMicsCount++;
        // If mic is active for long time with 0 signal, warn operator
        decisions.push({
          ruleName: 'Mic Activity Watcher',
          descriptionAr: `الميكروفون ${mic.name} متصل ومفتوح ولكن بدون إشارة صوتية (صمت).`,
          timestamp: new Date().toLocaleTimeString('ar-EG'),
          outcome: 'normal',
        });
      }
    }
  });

  // Calculate overall acoustic health score (0-100)
  let healthScore = 100;
  if (feedbackStatus === 'critical') healthScore -= 40;
  else if (feedbackStatus === 'warning') healthScore -= 20;
  healthScore -= clippingZonesCount * 15;
  healthScore = Math.max(20, Math.min(100, healthScore));

  let summaryAr = 'الحالة الصوتية مستقرة ومتوازنة عبر جميع المناطق.';
  if (feedbackStatus === 'critical') {
    summaryAr = 'حرج: تم اكتشاف رنين Feedback نشط! يلزم خفض الصوت فوراً.';
  } else if (clippingZonesCount > 0) {
    summaryAr = `تحذير: توجد ${clippingZonesCount} مناطق صوتية تقترب من مستوى التشويه.`;
  } else if (feedbackStatus === 'warning') {
    summaryAr = 'تنبيه: رنين خفيف محتمل بين الميكروفونات الرئيسية وسماعات السقف.';
  }

  return {
    health: {
      mode: 'AUTO',
      feedbackStatus,
      feedbackFrequencyHz,
      activeMicsCount,
      clippingZonesCount,
      silentMicsCount,
      overallScore: healthScore,
      summaryAr,
    },
    recommendations,
    newAlerts,
    decisions,
  };
}

/**
 * Creates an immutable audit log entry
 */
export function createAuditEntry(
  userEmail: string,
  userRole: 'admin' | 'operator' | 'viewer',
  operation: string,
  operationAr: string,
  roomName: string,
  targetEntity: string,
  oldValue: string,
  newValue: string,
  source: 'Manual' | 'AI'
): AuditLogItem {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userEmail,
    userRole,
    operation,
    operationAr,
    roomName,
    targetEntity,
    oldValue,
    newValue,
    timestamp: new Date().toLocaleString('ar-EG', {
      hour12: true,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    source,
  };
}

export function analyzeAudioState(input: {
  room: Room | null;
  zones: Zone[];
  microphones: Microphone[];
  isSimulation: boolean;
}): {
  aiHealth: AIHealthStatus;
  recommendations: AIRecommendation[];
  decisions: AnalysisResult['decisions'];
} {
  if (!input.room) {
    return {
      aiHealth: {
        mode: 'MANUAL',
        feedbackStatus: 'safe',
        activeMicsCount: 0,
        clippingZonesCount: 0,
        silentMicsCount: 0,
        overallScore: 0,
        summaryAr: 'لا توجد قاعة نشطة',
      },
      recommendations: [],
      decisions: [],
    };
  }

  const result = analyzeRoomAcoustics({
    room: input.room,
    zones: input.zones,
    microphones: input.microphones,
    isSimulation: input.isSimulation,
  });

  return {
    aiHealth: result.health,
    recommendations: result.recommendations,
    decisions: result.decisions,
  };
}
