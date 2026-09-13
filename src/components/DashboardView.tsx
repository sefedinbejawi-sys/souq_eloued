import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Sliders,
  Radio,
  Mic,
  MicOff,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  Layers,
  Activity,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import {
  AppLanguage,
  Room,
  Zone,
  Microphone,
  AIRecommendation,
  AIHealthStatus,
  SystemMode,
  UserRole,
} from '../types';
import { translations } from '../lib/i18n';

interface DashboardViewProps {
  currentLang: AppLanguage;
  systemMode: SystemMode;
  userRole: UserRole;
  room: Room | null;
  zones: Zone[];
  microphones: Microphone[];
  aiHealth: AIHealthStatus;
  recommendations: AIRecommendation[];
  onUpdateMasterVolume: (volume: number) => void;
  onToggleMasterMute: () => void;
  onUpdateZoneVolume: (zoneId: string, volume: number) => void;
  onToggleZoneMute: (zoneId: string) => void;
  onToggleZoneAuto: (zoneId: string) => void;
  onUpdateMicVolume: (micId: string, volume: number) => void;
  onToggleMicMute: (micId: string) => void;
  onApplyRecommendation: (rec: AIRecommendation) => void;
  onDismissRecommendation: (recId: string) => void;
  // Simulation triggers
  onSimulateFeedback?: () => void;
  onSimulateSilence?: () => void;
  onResetSimulation?: () => void;
  onNavigateToController?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentLang,
  systemMode,
  userRole,
  room,
  zones,
  microphones,
  aiHealth,
  recommendations,
  onUpdateMasterVolume,
  onToggleMasterMute,
  onUpdateZoneVolume,
  onToggleZoneMute,
  onToggleZoneAuto,
  onUpdateMicVolume,
  onToggleMicMute,
  onApplyRecommendation,
  onDismissRecommendation,
  onSimulateFeedback,
  onSimulateSilence,
  onResetSimulation,
  onNavigateToController,
}) => {
  const t = translations[currentLang];
  const isReadOnly = userRole === 'viewer';
  const [activeRecommendationIndex, setActiveRecommendationIndex] = useState(0);

  // If in production mode with no room or offline controller, display strict prompt requirement:
  // "لا توجد بيانات / الجهاز غير متصل بدل اختراع أرقام"
  if (systemMode === 'production' && (!room || room.status === 'offline')) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 sm:p-12 shadow-2xl">
          <div className="w-16 h-16 bg-neutral-800 border border-neutral-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-neutral-400">
            <Radio className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {t.noDataNotice}
          </h2>
          <p className="text-sm text-neutral-400 max-w-md mx-auto mb-8 leading-relaxed">
            {currentLang === 'ar'
              ? 'لم يتم الكشف عن وحدة تحكم DSP متصلة بهذه القاعة في بيئة الإنتاج. يمكنك تسجيل جهاز عبر معرف الـ Controller، أو التبديل فوراً إلى وضع المحاكاة لاختبار النظام بكامل وظائفه.'
              : 'No live DSP controller is currently streaming data for this room in Production. You can register physical hardware or switch to Simulation Mode.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onNavigateToController}
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-cyan-400 border border-cyan-800/40 rounded-xl text-sm font-semibold transition"
            >
              {t.deviceRegistration}
            </button>
            <button
              onClick={onResetSimulation}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition"
            >
              {t.simulationMode}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="py-12 text-center text-neutral-500">
        {t.noDataNotice}
      </div>
    );
  }

  const currentRec = recommendations[activeRecommendationIndex] || recommendations[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Simulation Playground Controls Bar (Only in Simulation Mode) */}
      {systemMode === 'simulation' && (
        <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-800/40 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-medium">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="font-bold">{currentLang === 'ar' ? 'أدوات اختبار المحاكي الصوتي:' : 'Simulation Test Lab:'}</span>
            <span className="text-neutral-400 hidden md:inline">
              {currentLang === 'ar'
                ? 'اختبر خوارزميات كشف الـ Feedback والصمت واستجابة الـ AI'
                : 'Inject real-time acoustic feedback and watch AI auto-responses'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSimulateFeedback}
              className="px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 rounded-lg font-semibold flex items-center gap-1.5 transition"
              title="Inject feedback frequency resonance"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>{currentLang === 'ar' ? 'محاكاة Feedback في Zone C' : 'Simulate Feedback (Zone C)'}</span>
            </button>

            <button
              onClick={onSimulateSilence}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 rounded-lg font-medium transition"
            >
              <span>{currentLang === 'ar' ? 'محاكاة صمت الميكروفون' : 'Simulate Silence'}</span>
            </button>

            <button
              onClick={onResetSimulation}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 border border-neutral-700 rounded-lg flex items-center gap-1 transition"
              title="Reset default simulation levels"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{currentLang === 'ar' ? 'إعادة ضبط' : 'Reset'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Column: Master & Audio Zones (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Room Header Banner */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
                <span>SYSTEM:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  ONLINE
                </span>
                <span className="text-neutral-600">|</span>
                <span className="text-neutral-400">{room.location}</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {room.name}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-neutral-950 border border-neutral-800 px-3.5 py-2 rounded-xl text-center">
                <span className="text-[10px] uppercase font-mono text-neutral-500 block">
                  Target SPL
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  {room.targetSplDb || 75} dBA
                </span>
              </div>
              <div className="bg-neutral-950 border border-neutral-800 px-3.5 py-2 rounded-xl text-center">
                <span className="text-[10px] uppercase font-mono text-neutral-500 block">
                  {t.zones}
                </span>
                <span className="text-sm font-bold text-cyan-400 font-mono">
                  {zones.length}
                </span>
              </div>
            </div>
          </div>

          {/* MASTER VOLUME FADER (Highlighted matching user layout) */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-mono tracking-widest">
                    MASTER
                  </h3>
                  <span className="text-xs text-neutral-400">
                    {currentLang === 'ar' ? 'التحكم بالخرج الصوتي العام للقاعة' : 'Main Hall Output Level'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-cyan-400 font-mono">
                  {room.isMuted ? 'MUTED' : `${room.masterVolume}%`}
                </span>
                <button
                  disabled={isReadOnly}
                  onClick={onToggleMasterMute}
                  className={`p-2.5 rounded-xl border transition ${
                    room.isMuted
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                  }`}
                  title={room.isMuted ? t.unmuted : t.muted}
                >
                  {room.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Visual Progress Bar (██████████ 72%) */}
            <div className="space-y-2">
              <div className="relative h-6 bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800 p-0.5 flex items-center">
                <div
                  className={`h-full rounded transition-all duration-150 ${
                    room.isMuted
                      ? 'bg-neutral-700'
                      : room.masterVolume > 85
                      ? 'bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-500'
                      : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                  }`}
                  style={{ width: `${room.isMuted ? 0 : room.masterVolume}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-3 text-[11px] font-mono font-bold text-white/90 pointer-events-none drop-shadow">
                  <span>-∞ dB</span>
                  <span>-18 dB</span>
                  <span>-6 dB</span>
                  <span>0 dB (0dBFS)</span>
                </div>
              </div>

              {/* Slider Input */}
              <input
                type="range"
                min="0"
                max="100"
                disabled={isReadOnly || room.isMuted}
                value={room.masterVolume}
                onChange={(e) => onUpdateMasterVolume(Number(e.target.value))}
                aria-label="Master Volume Slider"
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* AUDIO ZONES SECTION */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {t.zones} (Audio Zones)
                </h3>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {zones.length} Active Zones
              </span>
            </div>

            <div className="space-y-3">
              {zones.map((zone) => {
                const isHigh = zone.volume > zone.safeMaxVol;
                return (
                  <div
                    key={zone.id}
                    className={`bg-neutral-950 border ${
                      isHigh ? 'border-amber-800/60' : 'border-neutral-800/80'
                    } rounded-xl p-3.5 transition-all hover:border-neutral-700`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-black text-sm text-white px-2 py-0.5 bg-neutral-800 rounded">
                          {zone.name}
                        </span>
                        <span className="text-xs text-neutral-300 font-medium">
                          {zone.label}
                        </span>
                        {zone.autoMode && (
                          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800/50 px-1.5 py-0.2 rounded font-mono">
                            AUTO
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-cyan-300 w-12 text-right">
                          {zone.isMuted ? 'MUTED' : `${zone.volume}%`}
                        </span>
                        <button
                          disabled={isReadOnly}
                          onClick={() => onToggleZoneMute(zone.id)}
                          className={`p-1.5 rounded-lg border text-xs transition ${
                            zone.isMuted
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                              : 'bg-neutral-800 text-emerald-400 border-neutral-700 hover:bg-neutral-700'
                          }`}
                          title={zone.isMuted ? t.unmuted : t.muted}
                        >
                          {zone.isMuted ? (
                            <VolumeX className="w-4 h-4 text-rose-400" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-emerald-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Zone Slider & Live Level Meter */}
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-9 sm:col-span-10">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          disabled={isReadOnly || zone.isMuted}
                          value={zone.volume}
                          onChange={(e) => onUpdateZoneVolume(zone.id, Number(e.target.value))}
                          aria-label={`${zone.name} Volume Slider`}
                          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        {/* Peak LED Meter Bar */}
                        <div className="h-3 bg-neutral-900 border border-neutral-800 rounded overflow-hidden flex items-center p-0.5">
                          <div
                            className={`h-full rounded-xs transition-all duration-100 ${
                              zone.isMuted
                                ? 'w-0'
                                : zone.volume > 80
                                ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500'
                                : 'bg-emerald-400'
                            }`}
                            style={{
                              width: zone.isMuted ? '0%' : `${Math.min(100, zone.volume * 1.1)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Microphones & AI Audio Robot (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* MICROPHONES STATUS CARD (Matching requested wireframe) */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {t.microphones}
                </h3>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {microphones.filter((m) => m.status === 'online').length} Online
              </span>
            </div>

            <div className="space-y-2.5">
              {microphones.map((mic) => {
                const isMuted = mic.isMuted;
                const isOnline = mic.status === 'online';
                return (
                  <div
                    key={mic.id}
                    className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        disabled={isReadOnly || !isOnline}
                        onClick={() => onToggleMicMute(mic.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          !isOnline
                            ? 'bg-neutral-800/50 text-neutral-600 border-neutral-800'
                            : isMuted
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        }`}
                      >
                        {isMuted || !isOnline ? (
                          <MicOff className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-white">
                            {mic.name}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                              !isOnline
                                ? 'bg-neutral-800 text-neutral-500'
                                : isMuted
                                ? 'bg-rose-950/70 text-rose-400 border border-rose-800/50'
                                : 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50'
                            }`}
                          >
                            {!isOnline ? 'OFFLINE' : isMuted ? 'MUTED' : 'ACTIVE'}
                          </span>
                        </div>
                        {mic.description && (
                          <span className="text-[11px] text-neutral-400 block truncate max-w-[130px]">
                            {mic.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Live VU Meter indicator */}
                    <div className="w-16 space-y-1">
                      <div className="h-2 bg-neutral-900 rounded overflow-hidden flex items-center p-0.5">
                        <div
                          className={`h-full rounded-xs transition-all duration-75 ${
                            !isOnline || isMuted
                              ? 'w-0'
                              : mic.signalLevel > 75
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                          style={{
                            width: !isOnline || isMuted ? '0%' : `${mic.signalLevel}%`,
                          }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-neutral-500 block text-right">
                        {isOnline && !isMuted ? `${mic.signalLevel}%` : '--'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI AUDIO ROBOT WIDGET (Matching requested wireframe) */}
          <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-cyan-900/40 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  AI STATUS
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                ● AUTO
              </span>
            </div>

            {/* Feedback Detection Section */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-2">
              <span className="text-xs font-mono text-neutral-400 block uppercase">
                Feedback
              </span>
              {aiHealth.feedbackStatus === 'safe' ? (
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>✓ {t.noProblem}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>⚠️ {t.feedbackRisk} (3.15 kHz)</span>
                </div>
              )}
            </div>

            {/* AI Recommendation Card */}
            <div className="bg-neutral-950 border border-cyan-900/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 uppercase font-bold">
                  {t.aiRecommendation}
                </span>
                {recommendations.length > 1 && (
                  <span className="text-[10px] font-mono text-neutral-500">
                    1 / {recommendations.length}
                  </span>
                )}
              </div>

              {currentRec ? (
                <div className="space-y-3">
                  <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded-lg">
                    <p className="text-sm text-white font-medium leading-relaxed">
                      "{currentRec.recommendationAr || currentRec.recommendation}"
                    </p>
                    <span className="text-[11px] text-neutral-400 block mt-1">
                      {currentRec.reasonAr || currentRec.reason}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      disabled={isReadOnly}
                      onClick={() => onApplyRecommendation(currentRec)}
                      className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-black rounded-lg text-xs tracking-wider transition shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                    >
                      [ {t.apply} ]
                    </button>
                    <button
                      onClick={() => onDismissRecommendation(currentRec.id)}
                      className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-lg text-xs font-medium transition cursor-pointer"
                    >
                      {t.dismiss}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-neutral-500">
                  {currentLang === 'ar'
                    ? 'جميع الإشارات الصوتية متوازنة حالياً دون الحاجة لأي تدخل.'
                    : 'All audio signals are acoustically optimal.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
