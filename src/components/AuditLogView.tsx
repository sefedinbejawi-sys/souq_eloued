import React, { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  Filter,
  User,
  Cpu,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { AppLanguage, AuditLogItem } from '../types';
import { translations } from '../lib/i18n';

interface AuditLogViewProps {
  currentLang: AppLanguage;
  auditLogs: AuditLogItem[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  currentLang,
  auditLogs,
}) => {
  const t = translations[currentLang];
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'Manual' | 'AI'>('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (sourceFilter !== 'all' && log.source !== sourceFilter) return false;
    if (
      searchTerm &&
      !log.operationAr.includes(searchTerm) &&
      !log.operation.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.targetEntity.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const exportAsCsv = () => {
    const headers = ['ID', 'Timestamp', 'Source', 'User', 'Role', 'Room', 'Target', 'Operation', 'Old Value', 'New Value'];
    const rows = filteredLogs.map((log) => [
      log.id,
      `"${log.timestamp}"`,
      log.source,
      log.userEmail,
      log.userRole,
      `"${log.roomName}"`,
      `"${log.targetEntity}"`,
      `"${log.operationAr || log.operation}"`,
      `"${log.oldValue}"`,
      `"${log.newValue}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ai_audio_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              {t.auditTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {t.auditDesc}
          </p>
        </div>

        <button
          onClick={exportAsCsv}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>{currentLang === 'ar' ? 'تصدير السجل CSV' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-3 rounded-2xl">
        <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={currentLang === 'ar' ? 'البحث بالعملية أو المستخدم أو المنطقة...' : 'Search logs by operation or user...'}
            className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              sourceFilter === 'all'
                ? 'bg-cyan-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {currentLang === 'ar' ? 'كل المصادر' : 'All Sources'} ({auditLogs.length})
          </button>
          <button
            onClick={() => setSourceFilter('Manual')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              sourceFilter === 'Manual'
                ? 'bg-cyan-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {currentLang === 'ar' ? 'يدوي (Operator)' : 'Manual (Operator)'}
          </button>
          <button
            onClick={() => setSourceFilter('AI')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              sourceFilter === 'AI'
                ? 'bg-cyan-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            AI Robot Auto
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 border-b border-neutral-800 text-[11px] font-mono text-neutral-400 uppercase">
              <tr>
                <th className="py-3 px-4">{t.time}</th>
                <th className="py-3 px-4">{t.source}</th>
                <th className="py-3 px-4">{t.user}</th>
                <th className="py-3 px-4">{t.roomName} / {t.target}</th>
                <th className="py-3 px-4">{t.operation}</th>
                <th className="py-3 px-4">{t.oldVal} <ArrowRight className="inline w-3 h-3 mx-1" /> {t.newVal}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-neutral-500">
                    {currentLang === 'ar' ? 'لا توجد سجلات مطابقة للبحث.' : 'No audit records match the query.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-800/40 transition">
                    <td className="py-3.5 px-4 font-mono text-neutral-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          log.source === 'AI'
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {log.source === 'AI' ? (
                          <Cpu className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {log.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-white font-medium block">{log.userEmail}</span>
                      <span className="text-[10px] text-neutral-500 font-mono uppercase">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-neutral-200 font-semibold block">{log.targetEntity}</span>
                      <span className="text-[11px] text-neutral-500">{log.roomName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-cyan-300 font-medium">
                      {log.operationAr || log.operation}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-300 whitespace-nowrap">
                      <span className="text-neutral-400 line-through mr-1.5">{log.oldValue}</span>
                      <span className="text-emerald-400 font-bold">{log.newValue}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
