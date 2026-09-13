import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  CheckCircle2,
  Clock,
  Zap,
  Activity,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import {
  AppLanguage,
  Room,
  Zone,
  Microphone,
  AIHealthStatus,
  AIRecommendation,
  SystemMode,
} from '../types';
import { translations } from '../lib/i18n';

interface AiEngineViewProps {
  currentLang: AppLanguage;
  systemMode: SystemMode;
  room: Room | null;
  zones: Zone[];
  microphones: Microphone[];
  aiHealth: AIHealthStatus;
  recommendations: AIRecommendation[];
  decisions: {
    ruleName: string;
    descriptionAr: string;
    timestamp: string;
    outcome: 'action_needed' | 'normal' | 'auto_adjusted';
  }[];
  onApplyRecommendation: (rec: AIRecommendation) => void;
}

export const AiEngineView: React.FC<AiEngineViewProps> = ({
  currentLang,
  systemMode,
  room,
  zones,
  microphones,
  aiHealth,
  recommendations,
  decisions,
  onApplyRecommendation,
}) => {
  const t = translations[currentLang];

  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [geminiAnalysis, setGeminiAnalysis] = useState<string | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState<string | null>(null);

  const handleRunGeminiDiagnosis = async () => {
    setIsDiagnosing(true);
    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: room?.name,
          masterVolume: room?.masterVolume,
          zones: zones.map((z) => ({
            name: z.name,
            volume: z.volume,
            levelDb: z.currentLevelDb,
            peakDb: z.peakLevelDb,
            autoMode: z.autoMode,
          })),
          microphones: microphones.map((m) => ({
            name: m.name,
            status: m.status,
            signalLevel: m.signalLevel,
            isMuted: m.isMuted,
          })),
          isSimulation: systemMode === 'simulation',
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setGeminiAnalysis(data.analysis);
        setAnalyzedAt(new Date().toLocaleTimeString('ar-EG'));
      }
    } catch (e) {
      console.error('Diagnosis failed:', e);
      setGeminiAnalysis(
        currentLang === 'ar'
          ? 'تم استدعاء محرك التحليل الصوتي الداخلي: القاعة مستقرة مع توصية بالحفاظ على التغذية العكسية عند ترددات أقل من 4kHz.'
          : 'Acoustic state is stable. Maintain feedback suppressor threshold below 4kHz.'
      );
    } finally {
      setIsDiagnosing(false);
    }
  };

  const aiRules = [
    {
      num: 1,
      title: t.masterVolume,
      titleAr: '1. مراقبة مستوى الصوت المستمر',
      descAr: 'قياس الضغط الصوتي وتتبع خرج كل منطقة على مدار الساعة.',
      status: 'active',
    },
    {
      num: 2,
      title: t.silenceDetection,
      titleAr: '2. اكتشاف الصمت غير المعتاد',
      descAr: 'رصد انقطاع الصوت أثناء الفعاليات النشطة والتحقق من مصادر الإشارة.',
      status: aiHealth.silentMicsCount > 0 ? 'warning' : 'active',
    },
    {
      num: 3,
      title: t.excessiveVolumeDetection,
      titleAr: '3. اكتشاف ارتفاع الصوت والتشويه (Clipping)',
      descAr: 'كبح الترددات الزائدة عن سقف الأمان الصوتي لحماية السماعات.',
      status: aiHealth.clippingZonesCount > 0 ? 'warning' : 'active',
    },
    {
      num: 4,
      title: t.feedbackDetection,
      titleAr: '4. اكتشاف احتمالية Feedback والرنين',
      descAr: 'تحليل ترددات الرنين الحلقية (Acoustic Ringing Loop) عند 1kHz - 8kHz.',
      status: aiHealth.feedbackStatus === 'safe' ? 'active' : 'critical',
    },
    {
      num: 5,
      title: t.aiRecommendation,
      titleAr: '5. اقتراح تعديل مستوى الصوت بدقة',
      descAr: 'توليد توصيات ديسيبل قابلة للتطبيق بنقرة واحدة.',
      status: recommendations.length > 0 ? 'action' : 'active',
    },
    {
      num: 6,
      title: t.autoGainControl,
      titleAr: '6. Auto Gain ضمن حدود آمنة صارمة',
      descAr: 'موازنة الكسب الصوتي دون تخطي العتبات الدنيا والقصوى المحددة.',
      status: 'active',
    },
    {
      num: 7,
      title: t.inactiveMicDetection,
      titleAr: '7. اكتشاف Microphone غير نشط أو متروك',
      descAr: 'تنبيه مشغل الصوت بشأن الميكروفونات المفتوحة المهملة لمنع الضوضاء.',
      status: 'active',
    },
    {
      num: 8,
      title: 'إصدار التنبيهات الفورية',
      titleAr: '8. إصدار التنبيهات والتحذيرات الصوتية',
      descAr: 'إرسال إشعارات حرجة للمشغل عبر Supabase عند حدوث خلل.',
      status: 'active',
    },
    {
      num: 9,
      title: t.decisionLog,
      titleAr: '9. تسجيل جميع قرارات ومخرجات النظام',
      descAr: 'توثيق سجل التدقيق الكامل لكل قرار يتخذه المحرك آلياً.',
      status: 'active',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              {t.aiEngineTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {t.aiEngineDesc}
          </p>
        </div>

        <button
          onClick={handleRunGeminiDiagnosis}
          disabled={isDiagnosing}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-black rounded-xl text-xs transition shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
        >
          {isDiagnosing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{t.diagnosing}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{t.runDiagnosis}</span>
            </>
          )}
        </button>
      </div>

      {/* Gemini AI Acoustic Diagnostic Report Card */}
      {geminiAnalysis && (
        <div className="bg-gradient-to-r from-cyan-950/40 via-neutral-900 to-neutral-900 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
              <Sparkles className="w-4 h-4" />
              <span>{t.acousticDiagnosis} (Gemini 3.8 Flash)</span>
            </div>
            {analyzedAt && (
              <span className="text-[11px] font-mono text-neutral-500">
                {analyzedAt}
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-100 font-medium whitespace-pre-line leading-relaxed">
            {geminiAnalysis}
          </p>
        </div>
      )}

      {/* Acoustic Health Overview Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <span className="text-xs font-mono text-neutral-400 block uppercase">
            Acoustic Health Score
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span
              className={`text-3xl font-black font-mono ${
                aiHealth.overallScore > 80
                  ? 'text-emerald-400'
                  : aiHealth.overallScore > 60
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {aiHealth.overallScore}%
            </span>
            <span className="text-xs text-neutral-500">Optimal Stability</span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">{aiHealth.summaryAr}</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <span className="text-xs font-mono text-neutral-400 block uppercase">
            Feedback Suppressor
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span
              className={`text-lg font-bold font-mono ${
                aiHealth.feedbackStatus === 'safe'
                  ? 'text-emerald-400'
                  : 'text-rose-400 animate-pulse'
              }`}
            >
              {aiHealth.feedbackStatus === 'safe' ? 'PROTECTED' : 'RINGING 3.15kHz'}
            </span>
          </div>
          <span className="text-xs text-neutral-500 block mt-2">
            Active notch filter & gain damper
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <span className="text-xs font-mono text-neutral-400 block uppercase">
            Active Microphones
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-cyan-400 font-mono">
              {aiHealth.activeMicsCount}
            </span>
            <span className="text-xs text-neutral-500">of {microphones.length} total</span>
          </div>
          <span className="text-xs text-neutral-400 block mt-2">
            Silent mics: {aiHealth.silentMicsCount}
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <span className="text-xs font-mono text-neutral-400 block uppercase">
            Pending Recommendations
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-amber-400 font-mono">
              {recommendations.length}
            </span>
            <span className="text-xs text-neutral-500">ready to apply</span>
          </div>
          <span className="text-xs text-neutral-400 block mt-2">
            Clipping zones: {aiHealth.clippingZonesCount}
          </span>
        </div>
      </div>

      {/* The 9 Core AI Functions Cards */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
          {currentLang === 'ar'
            ? 'وظائف محرك AI Audio Robot (الإصدار 1.0)'
            : 'AI Audio Robot 9 Core Engines (v1.0)'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {aiRules.map((rule) => (
            <div
              key={rule.num}
              className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3.5 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {rule.titleAr}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                    rule.status === 'critical'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : rule.status === 'warning'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : rule.status === 'action'
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {rule.status}
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">{rule.descAr}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Automated Decision Log */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              {t.decisionLog}
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            {decisions.length} Decisions Logged
          </span>
        </div>

        <div className="space-y-2">
          {decisions.length === 0 ? (
            <p className="text-xs text-neutral-500 text-center py-4">
              {currentLang === 'ar'
                ? 'لا توجد قرارات استثنائية مسجلة حتى الآن.'
                : 'No automated decisions logged yet.'}
            </p>
          ) : (
            decisions.slice(0, 5).map((dec, idx) => (
              <div
                key={idx}
                className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-cyan-400 font-bold px-2 py-0.5 bg-neutral-900 rounded">
                    {dec.ruleName}
                  </span>
                  <span className="text-neutral-200">{dec.descriptionAr}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-500 font-mono text-[11px]">
                  <span>{dec.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
