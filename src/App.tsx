import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  AppLanguage,
  AudioController,
  AuditLogItem,
  Microphone,
  Room,
  Speaker,
  SystemMode,
  UserProfile,
  UserRole,
  Zone,
  AIRecommendation,
  AlertItem,
} from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { RoomsManagementView } from './components/RoomsManagementView';
import { MicrophonesView } from './components/MicrophonesView';
import { AiEngineView } from './components/AiEngineView';
import { ControllerArchitectureView } from './components/ControllerArchitectureView';
import { AlertsView } from './components/AlertsView';
import { AuditLogView } from './components/AuditLogView';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';
import {
  INITIAL_SIM_ALERTS,
  INITIAL_SIM_AUDIT,
  INITIAL_SIM_MICS,
  INITIAL_SIM_ROOM,
  INITIAL_SIM_SPEAKERS,
  INITIAL_SIM_ZONES,
} from './data/mockSimulation';
import { analyzeAudioState } from './lib/audioIntelligence';
import { isSupabaseConfigured, supabase } from './lib/supabase';

export default function App() {
  // App-level state
  const [currentLang, setCurrentLang] = useState<AppLanguage>('ar');
  const [systemMode, setSystemMode] = useState<SystemMode>('simulation');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'usr_admin',
    email: 'admin@myeloued.com',
    fullName: 'المسؤول الصوتي العام',
    role: 'admin',
  });

  // Audio entities state
  const [rooms, setRooms] = useState<Room[]>([INITIAL_SIM_ROOM]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(INITIAL_SIM_ROOM.id);
  const [zones, setZones] = useState<Zone[]>(INITIAL_SIM_ZONES);
  const [microphones, setMicrophones] = useState<Microphone[]>(INITIAL_SIM_MICS);
  const [speakers, setSpeakers] = useState<Speaker[]>(INITIAL_SIM_SPEAKERS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_SIM_ALERTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_SIM_AUDIT);
  const [activeController, setActiveController] = useState<AudioController | null>(null);

  // Synchronize HTML dir & lang attributes with selected language
  useEffect(() => {
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // If in simulation mode, add subtle live VU meter activity
  useEffect(() => {
    if (systemMode !== 'simulation') return;

    const interval = setInterval(() => {
      setMicrophones((prevMics) =>
        prevMics.map((mic) => {
          if (mic.isMuted || mic.status !== 'online') return mic;
          // Random slight audio signal fluctuation between 35 and 68%
          const delta = Math.floor(Math.random() * 9) - 4;
          const newLevel = Math.max(10, Math.min(85, mic.signalLevel + delta));
          return { ...mic, signalLevel: newLevel };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [systemMode]);

  // Selected room calculation
  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0] || null;
  const currentZones = zones.filter((z) => z.roomId === currentRoom?.id);
  const currentMics = microphones.filter((m) => !m.roomId || m.roomId === currentRoom?.id);

  // Run Real-time Audio Intelligence heuristics
  const { aiHealth, recommendations, decisions } = analyzeAudioState({
    room: currentRoom,
    zones: currentZones,
    microphones: currentMics,
    isSimulation: systemMode === 'simulation',
  });

  const feedbackActive = aiHealth.feedbackStatus === 'critical';
  const unresolvedAlertsCount = alerts.filter((a) => !a.resolved).length;

  // Helper: Append to Audit Log
  const logAction = (
    operation: string,
    operationAr: string,
    target: string,
    oldVal: string,
    newVal: string,
    source: 'Manual' | 'AI' = 'Manual'
  ) => {
    const newLog: AuditLogItem = {
      id: 'log_' + Date.now() + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour12: false }),
      userEmail: source === 'AI' ? 'ai-robot@myeloued.com' : currentUser.email,
      userRole: source === 'AI' ? 'system' : currentUser.role,
      roomName: currentRoom?.name || 'قاعة المؤتمرات',
      targetEntity: target,
      operation,
      operationAr,
      oldValue: oldVal,
      newValue: newVal,
      source,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Master Volume Controls
  const handleUpdateMasterVolume = (newVol: number) => {
    if (!currentRoom) return;
    const old = `${currentRoom.masterVolume}%`;
    setRooms((prev) =>
      prev.map((r) => (r.id === currentRoom.id ? { ...r, masterVolume: newVol } : r))
    );
    logAction('Set Master Volume', `تعديل الصوت الرئيسي إلى ${newVol}%`, 'Master Output', old, `${newVol}%`);
  };

  const handleToggleMasterMute = () => {
    if (!currentRoom) return;
    const nextMute = !currentRoom.isMuted;
    setRooms((prev) =>
      prev.map((r) => (r.id === currentRoom.id ? { ...r, isMuted: nextMute } : r))
    );
    logAction(
      nextMute ? 'Mute Master' : 'Unmute Master',
      nextMute ? 'كتم الخرج الصوتي الرئيسي' : 'إلغاء كتم الخرج الرئيسي',
      'Master Output',
      currentRoom.isMuted ? 'Muted' : 'Unmuted',
      nextMute ? 'Muted' : 'Unmuted'
    );
  };

  // Zone Volume Controls
  const handleUpdateZoneVolume = (zoneId: string, newVol: number) => {
    const targetZone = zones.find((z) => z.id === zoneId);
    if (!targetZone) return;
    const old = `${targetZone.volume}%`;
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, volume: newVol } : z))
    );
    logAction('Set Zone Volume', `تعديل مستوى صوت ${targetZone.name} إلى ${newVol}%`, targetZone.name, old, `${newVol}%`);
  };

  const handleToggleZoneMute = (zoneId: string) => {
    const targetZone = zones.find((z) => z.id === zoneId);
    if (!targetZone) return;
    const nextMute = !targetZone.isMuted;
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, isMuted: nextMute } : z))
    );
    logAction(
      nextMute ? 'Mute Zone' : 'Unmute Zone',
      nextMute ? `كتم المنطقة ${targetZone.name}` : `إلغاء كتم المنطقة ${targetZone.name}`,
      targetZone.name,
      targetZone.isMuted ? 'Muted' : 'Unmuted',
      nextMute ? 'Muted' : 'Unmuted'
    );
  };

  const handleToggleZoneAuto = (zoneId: string) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, autoMode: !z.autoMode } : z))
    );
  };

  // Microphone Volume & Mute Controls
  const handleUpdateMicVolume = (micId: string, newVol: number) => {
    const targetMic = microphones.find((m) => m.id === micId);
    if (!targetMic) return;
    const old = `${targetMic.volume}%`;
    setMicrophones((prev) =>
      prev.map((m) => (m.id === micId ? { ...m, volume: newVol } : m))
    );
    logAction('Set Mic Gain', `تعديل كسب ${targetMic.name} إلى ${newVol}%`, targetMic.name, old, `${newVol}%`);
  };

  const handleToggleMicMute = (micId: string) => {
    const targetMic = microphones.find((m) => m.id === micId);
    if (!targetMic) return;
    const nextMute = !targetMic.isMuted;
    setMicrophones((prev) =>
      prev.map((m) => (m.id === micId ? { ...m, isMuted: nextMute } : m))
    );
    logAction(
      nextMute ? 'Mute Mic' : 'Unmute Mic',
      nextMute ? `كتم الميكروفون ${targetMic.name}` : `تفعيل الميكروفون ${targetMic.name}`,
      targetMic.name,
      targetMic.isMuted ? 'Muted' : 'Unmuted',
      nextMute ? 'Muted' : 'Unmuted'
    );
  };

  // AI Recommendation Actions
  const handleApplyRecommendation = (rec: AIRecommendation) => {
    if (rec.targetType === 'zone' && typeof rec.proposedDelta === 'number') {
      const targetZone = zones.find((z) => z.id === rec.targetId);
      if (targetZone) {
        const oldVol = targetZone.volume;
        const newVol = Math.max(
          targetZone.safeMinVol,
          Math.min(targetZone.safeMaxVol, targetZone.volume + rec.proposedDelta)
        );
        setZones((prev) =>
          prev.map((z) => (z.id === rec.targetId ? { ...z, volume: newVol } : z))
        );
        logAction(
          'Apply AI Recommendation',
          `تطبيق توصية الذكاء الاصطناعي: تعديل ${targetZone.name} بمقدار ${rec.proposedDelta}%`,
          targetZone.name,
          `${oldVol}%`,
          `${newVol}%`,
          'AI'
        );
      }
    } else if (rec.targetType === 'microphone' && rec.proposedAction === 'mute') {
      const targetMic = microphones.find((m) => m.id === rec.targetId);
      if (targetMic) {
        setMicrophones((prev) =>
          prev.map((m) => (m.id === rec.targetId ? { ...m, isMuted: true } : m))
        );
        logAction(
          'AI Auto Mute',
          `كتم آلي للميكروفون المهمل ${targetMic.name}`,
          targetMic.name,
          'Active',
          'Muted',
          'AI'
        );
      }
    }

    // Auto-resolve any corresponding feedback or excessive volume alert
    setAlerts((prev) =>
      prev.map((a) => (a.category === 'feedback' || a.category === 'excessive_volume' ? { ...a, resolved: true } : a))
    );
  };

  const handleDismissRecommendation = (recId: string) => {
    // Dismissing is handled naturally in state or logging
    logAction('Dismiss AI Recommendation', 'تجاهل توصية الذكاء الاصطناعي', 'AI Audio Robot', 'Pending', 'Dismissed');
  };

  // Simulation Triggers
  const handleSimulateFeedback = () => {
    // Elevate Zone C to 88% and generate critical alert
    setZones((prev) =>
      prev.map((z) => (z.name === 'ZONE C' ? { ...z, volume: 86, peakLevelDb: +2.5 } : z))
    );

    const feedbackAlert: AlertItem = {
      id: 'alt_' + Date.now(),
      roomId: currentRoom?.id || '',
      roomName: currentRoom?.name || 'قاعة المؤتمرات',
      category: 'feedback',
      severity: 'critical',
      title: 'Feedback Resonance Loop Detected',
      titleAr: 'خطر حدوث Feedback في Zone C',
      message: 'Detected harmonic peak around 3.15 kHz. Lower zone volume by at least 4% to suppress feedback loop.',
      messageAr: 'تم رصد تردد رنين تصاعدي عند 3.15 kHz. ينصح بخفض صوت المنطقة C بـ 4% فوراً.',
      createdAt: new Date().toLocaleTimeString('ar-EG', { hour12: false }),
      resolved: false,
    };

    setAlerts((prev) => [feedbackAlert, ...prev]);
    logAction('Simulate Feedback', 'محاكاة حدوث رنين وتغذية عكسية في Zone C', 'ZONE C', '74%', '86%');
  };

  const handleSimulateSilence = () => {
    setMicrophones((prev) =>
      prev.map((m) => (m.name === 'MIC 03' ? { ...m, signalLevel: 0, isMuted: false } : m))
    );
    logAction('Simulate Inactive Mic', 'محاكاة ميكروفون صامت مفتوح (MIC 03)', 'MIC 03', 'Active', 'Silent');
  };

  const handleResetSimulation = () => {
    setRooms([INITIAL_SIM_ROOM]);
    setZones(INITIAL_SIM_ZONES);
    setMicrophones(INITIAL_SIM_MICS);
    setAlerts(INITIAL_SIM_ALERTS);
    setSystemMode('simulation');
    logAction('Reset Simulator', 'إعادة ضبط المحاكي الصوتي إلى المستويات الافتراضية', 'System', '--', 'Default');
  };

  // Switch between Production Mode and Simulation Mode
  const handleToggleMode = (newMode: SystemMode) => {
    setSystemMode(newMode);
    logAction(
      'Switch System Mode',
      `تبديل وضع التشغيل إلى ${newMode === 'production' ? 'الإنتاج الحقيقي' : 'وضع المحاكاة'}`,
      'System Environment',
      systemMode,
      newMode
    );
  };

  // Manage Rooms
  const handleAddRoom = (newRoomData: Partial<Room>) => {
    const id = 'rm_' + Date.now();
    const newRoom: Room = {
      id,
      name: newRoomData.name || 'قاعة جديدة',
      location: newRoomData.location || 'المبنى الرئيسي',
      masterVolume: newRoomData.masterVolume || 70,
      isMuted: false,
      status: 'online',
      targetSplDb: newRoomData.targetSplDb || 75,
      createdAt: new Date().toISOString(),
    };
    setRooms((prev) => [...prev, newRoom]);
    setSelectedRoomId(id);
    logAction('Create Room', `إنشاء قاعة جديدة: ${newRoom.name}`, newRoom.name, '--', 'Created');
  };

  const handleDeleteRoom = (roomId: string) => {
    const target = rooms.find((r) => r.id === roomId);
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    if (selectedRoomId === roomId && rooms.length > 1) {
      setSelectedRoomId(rooms[0].id);
    }
    if (target) {
      logAction('Delete Room', `حذف القاعة: ${target.name}`, target.name, 'Active', 'Deleted');
    }
  };

  // Manage Zones
  const handleAddZone = (newZoneData: Partial<Zone>) => {
    const newZone: Zone = {
      id: 'zn_' + Date.now(),
      roomId: newZoneData.roomId || selectedRoomId,
      name: newZoneData.name || 'ZONE E',
      label: newZoneData.label || 'منطقة إضافية',
      volume: newZoneData.volume || 60,
      isMuted: false,
      connectionStatus: 'online',
      currentLevelDb: -18,
      peakLevelDb: -8,
      autoMode: true,
      safeMinVol: 15,
      safeMaxVol: 85,
    };
    setZones((prev) => [...prev, newZone]);
    logAction('Create Zone', `إضافة منطقة صوتية جديدة: ${newZone.name}`, newZone.name, '--', 'Created');
  };

  const handleDeleteZone = (zoneId: string) => {
    const target = zones.find((z) => z.id === zoneId);
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
    if (target) {
      logAction('Delete Zone', `حذف المنطقة الصوتية: ${target.name}`, target.name, 'Active', 'Deleted');
    }
  };

  const handleUpdateZone = (zoneId: string, updates: Partial<Zone>) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, ...updates } : z))
    );
  };

  // Manage Microphones
  const handleAddMic = (newMicData: Partial<Microphone>) => {
    const newMic: Microphone = {
      id: 'mic_' + Date.now(),
      roomId: selectedRoomId,
      name: newMicData.name || `MIC 0${microphones.length + 1}`,
      description: newMicData.description || 'ميكروفون جديد',
      status: 'online',
      volume: newMicData.volume || 75,
      isMuted: false,
      signalLevel: 50,
      activity: 'active',
      batteryPercent: 95,
      frequencyMhz: newMicData.frequencyMhz || '580.000 MHz',
    };
    setMicrophones((prev) => [...prev, newMic]);
    logAction('Add Microphone', `إضافة ميكروفون جديد: ${newMic.name}`, newMic.name, '--', 'Created');
  };

  const handleDeleteMic = (micId: string) => {
    const target = microphones.find((m) => m.id === micId);
    setMicrophones((prev) => prev.filter((m) => m.id !== micId));
    if (target) {
      logAction('Delete Mic', `حذف ميكروفون: ${target.name}`, target.name, 'Active', 'Deleted');
    }
  };

  // Alerts Management
  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
    logAction('Resolve Alert', 'معالجة تنبيه صوتي', 'Alert System', 'Unresolved', 'Resolved');
  };

  const handleClearResolvedAlerts = () => {
    setAlerts((prev) => prev.filter((a) => !a.resolved));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-neutral-950">
      {/* Primary Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        systemMode={systemMode}
        onToggleMode={handleToggleMode}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        rooms={rooms}
        selectedRoomId={selectedRoomId}
        onSelectRoom={setSelectedRoomId}
        feedbackActive={feedbackActive}
        unresolvedAlertsCount={unresolvedAlertsCount}
      />

      {/* Navigation Sub-bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentLang={currentLang}
        unresolvedAlertsCount={unresolvedAlertsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentLang={currentLang}
            systemMode={systemMode}
            userRole={currentUser.role}
            room={currentRoom}
            zones={currentZones}
            microphones={currentMics}
            aiHealth={aiHealth}
            recommendations={recommendations}
            onUpdateMasterVolume={handleUpdateMasterVolume}
            onToggleMasterMute={handleToggleMasterMute}
            onUpdateZoneVolume={handleUpdateZoneVolume}
            onToggleZoneMute={handleToggleZoneMute}
            onToggleZoneAuto={handleToggleZoneAuto}
            onUpdateMicVolume={handleUpdateMicVolume}
            onToggleMicMute={handleToggleMicMute}
            onApplyRecommendation={handleApplyRecommendation}
            onDismissRecommendation={handleDismissRecommendation}
            onSimulateFeedback={handleSimulateFeedback}
            onSimulateSilence={handleSimulateSilence}
            onResetSimulation={handleResetSimulation}
            onNavigateToController={() => setActiveTab('controller')}
          />
        )}

        {activeTab === 'rooms' && (
          <RoomsManagementView
            currentLang={currentLang}
            userRole={currentUser.role}
            rooms={rooms}
            zones={zones}
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
            onAddRoom={handleAddRoom}
            onDeleteRoom={handleDeleteRoom}
            onAddZone={handleAddZone}
            onDeleteZone={handleDeleteZone}
            onUpdateZone={handleUpdateZone}
          />
        )}

        {activeTab === 'microphones' && (
          <MicrophonesView
            currentLang={currentLang}
            userRole={currentUser.role}
            microphones={currentMics}
            speakers={speakers}
            zones={currentZones}
            onUpdateMicVolume={handleUpdateMicVolume}
            onToggleMicMute={handleToggleMicMute}
            onAddMic={handleAddMic}
            onDeleteMic={handleDeleteMic}
          />
        )}

        {activeTab === 'ai_engine' && (
          <AiEngineView
            currentLang={currentLang}
            systemMode={systemMode}
            room={currentRoom}
            zones={currentZones}
            microphones={currentMics}
            aiHealth={aiHealth}
            recommendations={recommendations}
            decisions={decisions}
            onApplyRecommendation={handleApplyRecommendation}
          />
        )}

        {activeTab === 'controller' && (
          <ControllerArchitectureView
            currentLang={currentLang}
            userRole={currentUser.role}
            rooms={rooms}
            activeController={activeController}
            onRegisterControllerSuccess={(ctrl) => {
              setActiveController(ctrl);
              setSystemMode('production');
            }}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            currentLang={currentLang}
            userRole={currentUser.role}
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
            onClearResolvedAlerts={handleClearResolvedAlerts}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogView
            currentLang={currentLang}
            auditLogs={auditLogs}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            currentLang={currentLang}
            userRole={currentUser.role}
            onChangeUserRole={(role) => setCurrentUser((prev) => ({ ...prev, role }))}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-4 px-4 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>AI Audio Robot • audio.myeloued.com</span>
          <span>DSP Hall Sound Distribution & Acoustic Intelligence Engine</span>
        </div>
      </footer>

      {/* Supabase Authentication Dialog */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentLang={currentLang}
        currentUser={currentUser}
        onLoginSuccess={(user) => setCurrentUser(user)}
        onLogout={() =>
          setCurrentUser({
            id: 'demo_viewer',
            email: 'guest@myeloued.com',
            fullName: 'زائر (Viewer)',
            role: 'viewer',
          })
        }
      />
    </div>
  );
}
