import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Speaker,
  Volume2,
  Battery,
  BatteryCharging,
  Radio,
  Plus,
  Trash2,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { AppLanguage, Microphone, Speaker as SpeakerType, UserRole, Zone } from '../types';
import { translations } from '../lib/i18n';

interface MicrophonesViewProps {
  currentLang: AppLanguage;
  userRole: UserRole;
  microphones: Microphone[];
  speakers: SpeakerType[];
  zones: Zone[];
  onUpdateMicVolume: (micId: string, volume: number) => void;
  onToggleMicMute: (micId: string) => void;
  onAddMic: (mic: Partial<Microphone>) => void;
  onDeleteMic: (micId: string) => void;
}

export const MicrophonesView: React.FC<MicrophonesViewProps> = ({
  currentLang,
  userRole,
  microphones,
  speakers,
  zones,
  onUpdateMicVolume,
  onToggleMicMute,
  onAddMic,
  onDeleteMic,
}) => {
  const t = translations[currentLang];
  const isReadOnly = userRole === 'viewer';
  const isAdmin = userRole === 'admin';

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMicName, setNewMicName] = useState(`MIC 0${microphones.length + 1}`);
  const [newMicDesc, setNewMicDesc] = useState('');
  const [newMicFreq, setNewMicFreq] = useState('578.500 MHz');

  const handleCreateMic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMicName.trim()) return;

    onAddMic({
      name: newMicName.trim().toUpperCase(),
      description: newMicDesc.trim() || 'ميكروفون إضافي',
      status: 'online',
      volume: 75,
      isMuted: false,
      signalLevel: 50,
      activity: 'active',
      batteryPercent: 95,
      frequencyMhz: newMicFreq.trim(),
    });

    setNewMicName(`MIC 0${microphones.length + 2}`);
    setNewMicDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
            {t.tabMicrophones}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            {currentLang === 'ar'
              ? 'مراقبة إشارات الميكروفونات اللاسلكية، الترددات، والربط مع مكبرات الصوت والسماعات'
              : 'Monitor wireless RF channels, battery levels, live signal metering, and zone speaker arrays.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold rounded-xl text-xs transition shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addMic}</span>
          </button>
        )}
      </div>

      {/* Microphones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {microphones.map((mic) => {
          const isOnline = mic.status === 'online';
          const isMuted = mic.isMuted;
          const assignedZone = zones.find((z) => z.id === mic.zoneId);

          return (
            <div
              key={mic.id}
              className={`bg-neutral-900 border ${
                !isOnline ? 'border-neutral-800 opacity-70' : 'border-neutral-800'
              } rounded-2xl p-5 space-y-4`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      !isOnline
                        ? 'bg-neutral-800 border-neutral-700 text-neutral-500'
                        : isMuted
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    }`}
                  >
                    {isMuted || !isOnline ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white font-mono">{mic.name}</h3>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          !isOnline
                            ? 'bg-neutral-800 text-neutral-500'
                            : isMuted
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {!isOnline ? 'OFFLINE' : isMuted ? 'MUTED' : mic.activity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">{mic.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={isReadOnly || !isOnline}
                    onClick={() => onToggleMicMute(mic.id)}
                    className={`p-2 rounded-lg border text-xs transition ${
                      isMuted
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                    }`}
                    title={isMuted ? t.unmuted : t.muted}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => onDeleteMic(mic.id)}
                      className="text-neutral-500 hover:text-rose-400 p-1.5 transition"
                      title={t.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* RF & Battery Specs */}
              <div className="grid grid-cols-3 gap-2 text-xs bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80 font-mono">
                <div>
                  <span className="text-neutral-500 block text-[9px] uppercase">RF Frequency</span>
                  <span className="text-neutral-200">{mic.frequencyMhz || '542.000 MHz'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[9px] uppercase">Assigned Zone</span>
                  <span className="text-cyan-300 truncate block">
                    {assignedZone ? assignedZone.name : 'All Zones'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[9px] uppercase">Battery</span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold ${
                      (mic.batteryPercent || 100) < 20 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    <Battery className="w-3.5 h-3.5" />
                    {mic.batteryPercent ? `${mic.batteryPercent}%` : '--'}
                  </span>
                </div>
              </div>

              {/* Fader & Live Signal VU Meter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Gain Level:</span>
                  <span className="text-cyan-400 font-bold">{mic.volume}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  disabled={isReadOnly || !isOnline || isMuted}
                  value={mic.volume}
                  onChange={(e) => onUpdateMicVolume(mic.id, Number(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />

                {/* Multizone LED Peak Bar */}
                <div className="h-2.5 bg-neutral-950 border border-neutral-800 rounded overflow-hidden flex items-center p-0.5">
                  <div
                    className={`h-full rounded-xs transition-all duration-75 ${
                      !isOnline || isMuted
                        ? 'w-0'
                        : mic.signalLevel > 80
                        ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500'
                        : 'bg-emerald-400'
                    }`}
                    style={{
                      width: !isOnline || isMuted ? '0%' : `${mic.signalLevel}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Speakers Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Speaker className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white uppercase tracking-wide font-mono">
            {t.speakers} (Loudspeaker Arrays)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {speakers.map((spk) => (
            <div
              key={spk.id}
              className="bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-white font-bold">{spk.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {spk.status.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">{spk.model || 'Standard Line Array'}</p>
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-800/60">
                <span>{spk.impedanceOhm} Ω</span>
                <span className="text-cyan-400">{spk.currentWattage || 0}W / {spk.maxWattage || 250}W</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Mic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">{t.addMic}</h3>

            <form onSubmit={handleCreateMic} className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">
                  {currentLang === 'ar' ? 'رمز الميكروفون' : 'Microphone Code'}
                </label>
                <input
                  type="text"
                  required
                  value={newMicName}
                  onChange={(e) => setNewMicName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white font-mono uppercase focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">
                  {currentLang === 'ar' ? 'الوصف / مكان الاستخدام' : 'Description / Usage'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={currentLang === 'ar' ? 'مثال: ميكروفون رئيس الجلسة' : 'e.g. Chairman Microphone'}
                  value={newMicDesc}
                  onChange={(e) => setNewMicDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">
                  {currentLang === 'ar' ? 'التردد اللاسلكي (Frequency)' : 'RF Frequency'}
                </label>
                <input
                  type="text"
                  value={newMicFreq}
                  onChange={(e) => setNewMicFreq(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold rounded-lg text-xs"
                >
                  {t.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
