import React from 'react';
import {
  Volume2,
  Radio,
  Globe,
  Shield,
  Sliders,
  AlertTriangle,
  Zap,
  RefreshCw,
  Server,
  Sparkles,
} from 'lucide-react';
import { AppLanguage, Room, SystemMode, UserProfile } from '../types';
import { translations } from '../lib/i18n';

interface HeaderProps {
  currentLang: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  systemMode: SystemMode;
  onToggleMode: (mode: SystemMode) => void;
  currentUser: UserProfile;
  onOpenAuth: () => void;
  rooms: Room[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  feedbackActive: boolean;
  unresolvedAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  systemMode,
  onToggleMode,
  currentUser,
  onOpenAuth,
  rooms,
  selectedRoomId,
  onSelectRoom,
  feedbackActive,
  unresolvedAlertsCount,
}) => {
  const t = translations[currentLang];
  const isRtl = currentLang === 'ar';

  return (
    <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur sticky top-0 z-40">
      {/* Subdomain & Simulation Warning Ribbon */}
      <div className="bg-neutral-950 border-b border-neutral-800/80 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-neutral-400">
          <span className="font-mono text-cyan-400 font-semibold bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
            audio.myeloued.com
          </span>
          <span className="hidden sm:inline text-neutral-500">•</span>
          <span className="text-neutral-400 hidden sm:inline">{t.tagline}</span>
        </div>

        <div className="flex items-center gap-3">
          {systemMode === 'simulation' ? (
            <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2.5 py-0.5 rounded-full font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>{t.simulationNotice}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-0.5 rounded-full font-medium">
              <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              <span>{t.productionNotice}</span>
            </div>
          )}

          {/* Mode Switcher Button */}
          <button
            onClick={() => onToggleMode(systemMode === 'simulation' ? 'production' : 'simulation')}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
            title={t.switchMode}
          >
            <RefreshCw className="w-3 h-3 text-cyan-400" />
            <span className="font-semibold">
              {systemMode === 'simulation' ? t.productionMode : t.simulationMode}
            </span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & System Status */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-neutral-950 font-black">
            <Volume2 className="w-6 h-6 text-neutral-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide font-mono">
                AI AUDIO ROBOT
              </h1>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                  systemMode === 'simulation'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    systemMode === 'simulation' ? 'bg-amber-400' : 'bg-emerald-400'
                  } animate-pulse`}
                />
                {systemMode === 'simulation' ? 'SIMULATION' : 'ONLINE'}
              </span>

              {feedbackActive && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  FEEDBACK!
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 font-medium">
              DSP Hall Controller & Acoustic Intelligence
            </p>
          </div>
        </div>

        {/* Room Switcher & Quick Metrics */}
        <div className="flex flex-wrap items-center gap-3">
          {rooms.length > 0 && (
            <div className="flex items-center gap-2 bg-neutral-950/80 border border-neutral-800 rounded-lg px-3 py-1.5">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-neutral-400 font-medium">{t.roomName}:</span>
              <select
                value={selectedRoomId}
                onChange={(e) => onSelectRoom(e.target.value)}
                aria-label={t.roomName}
                className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id} className="bg-neutral-900 text-white">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Language Switcher */}
          <div className="flex items-center bg-neutral-950/80 border border-neutral-800 rounded-lg p-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-neutral-400 ml-1.5 mr-1.5" />
            <button
              onClick={() => onLanguageChange('ar')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                currentLang === 'ar'
                  ? 'bg-cyan-500 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                currentLang === 'en'
                  ? 'bg-cyan-500 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('fr')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                currentLang === 'fr'
                  ? 'bg-cyan-500 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              FR
            </button>
          </div>

          {/* User Profile & Role Indicator */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs transition"
          >
            <Shield
              className={`w-3.5 h-3.5 ${
                currentUser.role === 'admin'
                  ? 'text-purple-400'
                  : currentUser.role === 'operator'
                  ? 'text-cyan-400'
                  : 'text-neutral-400'
              }`}
            />
            <div className="text-right">
              <span className="font-semibold text-white block leading-tight">
                {currentUser.fullName}
              </span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                {currentUser.role}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
