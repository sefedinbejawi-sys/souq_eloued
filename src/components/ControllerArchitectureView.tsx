import React, { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  Radio,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Copy,
  Terminal,
  Layers,
  Volume2,
  ArrowDown,
  RefreshCw,
} from 'lucide-react';
import { AppLanguage, AudioController, Room, UserRole } from '../types';
import { translations } from '../lib/i18n';

interface ControllerArchitectureViewProps {
  currentLang: AppLanguage;
  userRole: UserRole;
  rooms: Room[];
  activeController: AudioController | null;
  onRegisterControllerSuccess?: (ctrl: AudioController) => void;
}

export const ControllerArchitectureView: React.FC<ControllerArchitectureViewProps> = ({
  currentLang,
  userRole,
  rooms,
  activeController,
  onRegisterControllerSuccess,
}) => {
  const t = translations[currentLang];
  const isAdmin = userRole === 'admin';

  const [deviceId, setDeviceId] = useState('CTRL-DSP-8800-ALGERIA');
  const [secretToken, setSecretToken] = useState('sec_token_' + Math.random().toString(36).substring(2, 10));
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || '');
  const [controllerName, setControllerName] = useState('قاعة المؤتمرات DSP 1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [registeredControllers, setRegisteredControllers] = useState<any[]>([]);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const fetchRegisteredControllers = async () => {
    try {
      const res = await fetch('/api/controller/list');
      const data = await res.json();
      if (data.controllers) {
        setRegisteredControllers(data.controllers);
      }
    } catch (e) {
      console.error('Failed to list controllers:', e);
    }
  };

  useEffect(() => {
    fetchRegisteredControllers();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRegistrationResult(null);

    try {
      const res = await fetch('/api/controller/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: deviceId.trim(),
          secretToken: secretToken.trim(),
          roomId: selectedRoomId,
          name: controllerName.trim(),
          firmwareVersion: 'v2.5.0-Release',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRegistrationResult({
          success: true,
          message:
            currentLang === 'ar'
              ? `تم تسجيل الجهاز ${data.controller.deviceId} بنجاح وربطه بالقاعة.`
              : `Device ${data.controller.deviceId} registered successfully.`,
        });
        fetchRegisteredControllers();
        if (onRegisterControllerSuccess) {
          onRegisterControllerSuccess(data.controller);
        }
      } else {
        setRegistrationResult({
          success: false,
          message: data.error || 'Failed to register controller.',
        });
      }
    } catch (err: any) {
      setRegistrationResult({
        success: false,
        message: err.message || 'Connection error with controller API.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleCurl = `curl -X POST https://audio.myeloued.com/api/controller/heartbeat \\
  -H "Content-Type: application/json" \\
  -d '{
    "deviceId": "${deviceId || 'CTRL-DSP-8800'}",
    "secretToken": "${secretToken || 'your_token'}",
    "dspLoadPercent": 28,
    "latencyMs": 1.45
  }'`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
          {t.controllerTitle}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          {t.controllerDesc}
        </p>
      </div>

      {/* Prominent Architectural Diagram */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-center">
          {currentLang === 'ar'
            ? 'المسار المعماري المعتمد لتوزيع ومعالجة الصوت (Signal Flow)'
            : 'Audio Controller Production Architecture & Signal Flow'}
        </h3>

        <div className="flex flex-col items-center justify-center space-y-2 max-w-lg mx-auto font-mono text-xs">
          {/* Node 1: Web Dashboard */}
          <div className="w-full bg-neutral-950 border border-cyan-500/40 rounded-xl p-3 text-center shadow-lg shadow-cyan-950/40">
            <span className="text-cyan-400 font-bold block">1. Web Dashboard (Operator / Mobile)</span>
            <span className="text-[11px] text-neutral-400 font-sans">واجهة تحكم تفاعلية للمشغل والمسؤولين</span>
          </div>

          <ArrowDown className="w-4 h-4 text-neutral-600" />

          {/* Node 2: Supabase / API */}
          <div className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-center">
            <span className="text-emerald-400 font-bold block">2. Supabase / REST API Engine</span>
            <span className="text-[11px] text-neutral-400 font-sans">قاعدة البيانات، المصادقة الآمنة، وسجل التدقيق RLS</span>
          </div>

          <ArrowDown className="w-4 h-4 text-neutral-600" />

          {/* Node 3: AI Audio Controller */}
          <div className="w-full bg-gradient-to-r from-cyan-950 via-neutral-950 to-cyan-950 border border-cyan-400 rounded-xl p-3 text-center ring-1 ring-cyan-500/20">
            <span className="text-cyan-300 font-bold block">3. AI Audio Controller (Embedded Edge Hardware)</span>
            <span className="text-[11px] text-neutral-300 font-sans">وحدة المعالجة الذكية في القاعة (Raspberry Pi / Microcontroller)</span>
          </div>

          <ArrowDown className="w-4 h-4 text-neutral-600" />

          {/* Node 4: Audio DSP */}
          <div className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-center">
            <span className="text-amber-400 font-bold block">4. Audio DSP (Digital Signal Processor)</span>
            <span className="text-[11px] text-neutral-400 font-sans">معالج الإشارة الرقمية، مصفوفة التوجيه (Dante / AES67 / Symetrix / Q-SYS)</span>
          </div>

          <ArrowDown className="w-4 h-4 text-neutral-600" />

          {/* Node 5: Power Amplifier */}
          <div className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-center">
            <span className="text-purple-400 font-bold block">5. Multi-Channel Amplifier</span>
            <span className="text-[11px] text-neutral-400 font-sans">مكبرات القدرة الصوتية وتغذية خطوط السماعات</span>
          </div>

          <ArrowDown className="w-4 h-4 text-neutral-600" />

          {/* Node 6: Speakers */}
          <div className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-center">
            <span className="text-white font-bold block">6. Speakers & Zone Transducers</span>
            <span className="text-[11px] text-neutral-400 font-sans">سماعات السقف، Line Arrays، وسماعات الشرفة</span>
          </div>
        </div>

        {/* Mandatory Hardware Statement */}
        <div className="bg-amber-950/50 border border-amber-800/60 rounded-xl p-4 text-xs text-amber-200 text-center leading-relaxed">
          <p className="font-bold mb-1">
            {currentLang === 'ar' ? 'معيار الشفافية الصارم للأجهزة:' : 'Hardware Transparency Standard:'}
          </p>
          <p>{t.noHardwareWarning}</p>
        </div>
      </div>

      {/* Device Registration & Hardware Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Registration Form (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
              {t.deviceRegistration}
            </h3>
          </div>

          {registrationResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                registrationResult.success
                  ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/70 border-rose-800 text-rose-300'
              }`}
            >
              {registrationResult.success ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{registrationResult.message}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="text-xs text-neutral-400 block mb-1 font-mono">
                {t.deviceId} (Unique Hardware ID)
              </label>
              <input
                type="text"
                required
                disabled={!isAdmin}
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder="e.g. CTRL-DSP-8800X"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1 font-mono">
                {t.secureToken} (Pre-shared Token)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={secretToken}
                  onChange={(e) => setSecretToken(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setSecretToken('sec_token_' + Math.random().toString(36).substring(2, 10))
                  }
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg font-mono transition"
                >
                  Regen
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">
                  {currentLang === 'ar' ? 'اسم وحدة التحكم' : 'Controller Name'}
                </label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={controllerName}
                  onChange={(e) => setControllerName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">
                  {currentLang === 'ar' ? 'القاعة المرتبطة' : 'Bound Room'}
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isAdmin ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-black rounded-lg text-xs tracking-wider transition shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Registering...' : t.registerDevice}
              </button>
            ) : (
              <p className="text-xs text-neutral-500 text-center pt-2">
                {currentLang === 'ar'
                  ? 'تسجيل الأجهزة يتطلب صلاحيات Admin.'
                  : 'Device registration requires Admin privilege.'}
              </p>
            )}
          </form>
        </div>

        {/* API Hardware Specs & cURL (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                Hardware Heartbeat API
              </h3>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sampleCurl);
                setCopiedCurl(true);
                setTimeout(() => setCopiedCurl(false), 2000);
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
            </button>
          </div>

          <pre className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3 text-[11px] font-mono text-neutral-300 overflow-x-auto whitespace-pre leading-relaxed">
            {sampleCurl}
          </pre>

          <div className="text-xs text-neutral-400 space-y-1.5 pt-2">
            <span className="font-bold text-white block">Embedded Integration Notes:</span>
            <p>
              • Periodic heartbeat every 5,000 ms keeps the connection state 'connected'.
            </p>
            <p>
              • Telemetry payload reports DSP Core CPU Load and round-trip AES67 / Dante latency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
