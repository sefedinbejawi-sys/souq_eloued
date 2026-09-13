import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Mic,
  Cpu,
  Server,
  Bell,
  FileText,
  Settings,
} from 'lucide-react';
import { ActiveTab, AppLanguage } from '../types';
import { translations } from '../lib/i18n';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentLang: AppLanguage;
  unresolvedAlertsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  currentLang,
  unresolvedAlertsCount,
}) => {
  const t = translations[currentLang];

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: t.tabDashboard,
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'rooms',
      label: t.tabRooms,
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'microphones',
      label: t.tabMicrophones,
      icon: <Mic className="w-4 h-4" />,
    },
    {
      id: 'ai_engine',
      label: t.tabAiEngine,
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      id: 'controller',
      label: t.tabController,
      icon: <Server className="w-4 h-4" />,
    },
    {
      id: 'alerts',
      label: t.tabAlerts,
      icon: <Bell className="w-4 h-4" />,
      badge: unresolvedAlertsCount,
    },
    {
      id: 'audit',
      label: t.tabAudit,
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: t.tabSettings,
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <nav className="border-b border-neutral-800 bg-neutral-900/60 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 min-w-max">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
