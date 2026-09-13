import React, { useState } from 'react';
import {
  Settings,
  Database,
  Shield,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { AppLanguage, UserRole } from '../types';
import { translations } from '../lib/i18n';
import { isSupabaseConfigured, SUPABASE_SCHEMA_SQL } from '../lib/supabase';

interface SettingsViewProps {
  currentLang: AppLanguage;
  userRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentLang,
  userRole,
  onChangeUserRole,
}) => {
  const t = translations[currentLang];
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedNginx, setCopiedNginx] = useState(false);

  const nginxSnippet = `# /etc/nginx/sites-available/audio.myeloued.com
server {
    listen 80;
    server_name audio.myeloued.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name audio.myeloued.com;

    ssl_certificate /etc/letsencrypt/live/audio.myeloued.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/audio.myeloued.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
    }
}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
            {t.settingsTitle}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          {t.settingsDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supabase Status & Setup */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white font-mono">
                Supabase Cloud Database
              </h3>
            </div>
            <span
              className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                isSupabaseConfigured
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              {isSupabaseConfigured ? 'CONNECTED' : 'STANDBY (SIMULATION)'}
            </span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            {currentLang === 'ar'
              ? 'تعتمد قاعدة بيانات الإنتاج على Supabase لإدارة الجلسات وصلاحيات الوصول الصارمة RLS (Row Level Security). يمكنك نسخ مخطط SQL أدناه لتنفيذه مباشرة في Supabase SQL Editor.'
              : 'Production storage utilizes Supabase PostgreSQL with strict Row Level Security (RLS) policies. Run the schema below in your Supabase project.'}
          </p>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between text-neutral-400">
              <span>SUPABASE_URL:</span>
              <span className="text-white">
                {isSupabaseConfigured ? 'Configured in .env' : 'https://[PROJECT].supabase.co'}
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>SUPABASE_ANON_KEY:</span>
              <span className="text-white">
                {isSupabaseConfigured ? '••••••••••••••••' : 'eyJhbGciOiJIUzI1NiIsIn...'}
              </span>
            </div>
          </div>

          {/* SQL Schema Viewer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400 uppercase font-bold">
                Supabase SQL Schema & RLS Policies
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2000);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied' : 'Copy SQL Schema'}</span>
              </button>
            </div>

            <pre className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3 text-[11px] font-mono text-neutral-300 max-h-48 overflow-y-auto whitespace-pre leading-relaxed">
              {SUPABASE_SCHEMA_SQL}
            </pre>
          </div>
        </div>

        {/* Subdomain & Hosting (audio.myeloued.com) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono">
              audio.myeloued.com Deployment
            </h3>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            {currentLang === 'ar'
              ? 'تم تهيئة التطبيق بالكامل للعمل كخادم كامل النطاق يدعم Reverse Proxy ومقابس WebSocket المتزامنة لأجهزة الصوت DSP.'
              : 'Production deployment configuration for audio.myeloued.com with reverse proxy headers.'}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400 uppercase font-bold">
                Nginx Reverse Proxy Config
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(nginxSnippet);
                  setCopiedNginx(true);
                  setTimeout(() => setCopiedNginx(false), 2000);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono cursor-pointer"
              >
                {copiedNginx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNginx ? 'Copied' : 'Copy Config'}</span>
              </button>
            </div>

            <pre className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3 text-[11px] font-mono text-neutral-300 max-h-44 overflow-y-auto whitespace-pre leading-relaxed">
              {nginxSnippet}
            </pre>
          </div>

          {/* Quick Role Permissions Switcher */}
          <div className="pt-3 border-t border-neutral-800 space-y-2">
            <span className="text-xs font-mono text-neutral-400 uppercase font-bold block">
              {currentLang === 'ar' ? 'تبديل دور المستخدم الحالي للتجربة:' : 'Current Role Privilege:'}
            </span>
            <div className="flex gap-2">
              {(['admin', 'operator', 'viewer'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onChangeUserRole(r)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition ${
                    userRole === r
                      ? 'bg-cyan-500 text-neutral-950'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Role Permissions Matrix */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
            RBAC Permissions Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 border-b border-neutral-800 text-[11px] font-mono text-neutral-400 uppercase">
              <tr>
                <th className="py-3 px-4">Feature / Permission</th>
                <th className="py-3 px-4 text-center">Admin</th>
                <th className="py-3 px-4 text-center">Operator</th>
                <th className="py-3 px-4 text-center">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              <tr>
                <td className="py-3 px-4 font-sans text-white">Live Audio Monitoring</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Full</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Full</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Read-only</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans text-white">Faders, Volume & Mutes</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Full</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Full</td>
                <td className="py-3 px-4 text-center text-neutral-600">✕ Blocked</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans text-white">Apply AI Recommendations</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Allowed</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Allowed</td>
                <td className="py-3 px-4 text-center text-neutral-600">✕ Blocked</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans text-white">Register Hardware DSP Controllers</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Allowed</td>
                <td className="py-3 px-4 text-center text-neutral-600">✕ Blocked</td>
                <td className="py-3 px-4 text-center text-neutral-600">✕ Blocked</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans text-white">Create/Delete Rooms & Zones</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Allowed</td>
                <td className="py-3 px-4 text-center text-neutral-600">✕ Blocked</td>
                <td className="py-3 px-4 text-center text-neutral-600">✕ Blocked</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
