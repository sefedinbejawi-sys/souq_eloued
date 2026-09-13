import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ShieldAlert,
  Volume2,
  MicOff,
  Radio,
  Check,
} from 'lucide-react';
import { AlertCategory, AlertItem, AppLanguage, UserRole } from '../types';
import { translations } from '../lib/i18n';

interface AlertsViewProps {
  currentLang: AppLanguage;
  userRole: UserRole;
  alerts: AlertItem[];
  onResolveAlert: (alertId: string) => void;
  onClearResolvedAlerts: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  currentLang,
  userRole,
  alerts,
  onResolveAlert,
  onClearResolvedAlerts,
}) => {
  const t = translations[currentLang];
  const isReadOnly = userRole === 'viewer';

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showResolved, setShowResolved] = useState(true);

  const filteredAlerts = alerts.filter((alert) => {
    if (!showResolved && alert.resolved) return false;
    if (categoryFilter !== 'all' && alert.category !== categoryFilter) return false;
    return true;
  });

  const getCategoryIcon = (category: AlertCategory) => {
    switch (category) {
      case 'feedback':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'excessive_volume':
        return <Volume2 className="w-4 h-4 text-amber-400" />;
      case 'mic_inactive':
        return <MicOff className="w-4 h-4 text-cyan-400" />;
      case 'controller_disconnected':
      case 'offline':
        return <Radio className="w-4 h-4 text-rose-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              {t.tabAlerts}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {currentLang === 'ar'
              ? 'تنبيهات جودة الصوت المباشرة، كشف التغذية العكسية، وانقطاع أجهزة المعالجة'
              : 'Realtime acoustic alerts, feedback mitigation events, and DSP hardware telemetry status.'}
          </p>
        </div>

        <button
          disabled={isReadOnly}
          onClick={onClearResolvedAlerts}
          className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50"
        >
          {currentLang === 'ar' ? 'مسح المنتهية' : 'Clear Resolved'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-2.5 rounded-2xl">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              categoryFilter === 'all'
                ? 'bg-cyan-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {currentLang === 'ar' ? 'الكل' : 'All'} ({alerts.length})
          </button>
          <button
            onClick={() => setCategoryFilter('feedback')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              categoryFilter === 'feedback'
                ? 'bg-cyan-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Feedback
          </button>
          <button
            onClick={() => setCategoryFilter('excessive_volume')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              categoryFilter === 'excessive_volume'
                ? 'bg-cyan-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Excessive Volume
          </button>
          <button
            onClick={() => setCategoryFilter('offline')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              categoryFilter === 'offline'
                ? 'bg-cyan-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Offline / Mics
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="accent-cyan-400 rounded"
          />
          <span>{currentLang === 'ar' ? 'إظهار التنبيهات المعالجة' : 'Show Resolved'}</span>
        </label>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-white mb-1">
              {currentLang === 'ar' ? 'لا توجد تنبيهات حالياً' : 'No alerts in queue'}
            </h4>
            <p className="text-xs text-neutral-500">
              {currentLang === 'ar'
                ? 'النظام الصوتي يعمل بكفاءة ودون أي مشاكل معلقة.'
                : 'Audio distribution operates within acoustic tolerances.'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-neutral-900 border ${
                alert.resolved
                  ? 'border-neutral-800/60 opacity-60'
                  : alert.severity === 'critical'
                  ? 'border-rose-700/60 bg-gradient-to-r from-rose-950/20 to-neutral-900'
                  : 'border-amber-700/50 bg-gradient-to-r from-amber-950/15 to-neutral-900'
              } rounded-2xl p-4 transition-all`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 mt-0.5">
                    {getCategoryIcon(alert.category)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white font-mono">
                        {alert.titleAr || alert.title}
                      </h4>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          alert.severity === 'critical'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : alert.severity === 'warning'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      {alert.resolved && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                          RESOLVED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      {alert.messageAr || alert.message}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-500 mt-2">
                      <span>{alert.roomName}</span>
                      <span>•</span>
                      <span>{alert.createdAt}</span>
                    </div>
                  </div>
                </div>

                {!alert.resolved && !isReadOnly && (
                  <button
                    onClick={() => onResolveAlert(alert.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{currentLang === 'ar' ? 'تمت المعالجة' : 'Resolve'}</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
