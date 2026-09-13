import React, { useState } from 'react';
import {
  X,
  Shield,
  Lock,
  Mail,
  User,
  CheckCircle,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { AppLanguage, UserProfile, UserRole } from '../types';
import { translations } from '../lib/i18n';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: AppLanguage;
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  if (!isOpen) return null;

  const t = translations[currentLang];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('operator');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (isSupabaseConfigured && supabase) {
      try {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName, role },
            },
          });
          if (error) throw error;
          if (data.user) {
            onLoginSuccess({
              id: data.user.id,
              email: data.user.email || email,
              fullName: fullName || 'مشغل الصوت',
              role,
            });
            onClose();
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          if (data.user) {
            onLoginSuccess({
              id: data.user.id,
              email: data.user.email || email,
              fullName: data.user.user_metadata?.full_name || 'مشغل الصوت',
              role: data.user.user_metadata?.role || 'operator',
            });
            onClose();
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Authentication error');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Local demo sign-in
      setTimeout(() => {
        onLoginSuccess({
          id: 'user_' + Math.random().toString(36).substring(2, 7),
          email: email || 'operator@myeloued.com',
          fullName: fullName || (role === 'admin' ? 'مدير النظام' : 'مشغل الصوت'),
          role,
        });
        setIsLoading(false);
        onClose();
      }, 300);
    }
  };

  const handleQuickDemoRole = (demoRole: UserRole) => {
    onLoginSuccess({
      id: 'demo_' + demoRole,
      email: `${demoRole}@myeloued.com`,
      fullName:
        demoRole === 'admin'
          ? 'المسؤول الصوتي (Admin)'
          : demoRole === 'operator'
          ? 'مشغل القاعة (Operator)'
          : 'مراقب الصوت (Viewer)',
      role: demoRole,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono">
              Supabase Authentication
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current logged-in user summary */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase font-mono">
              Current Session
            </span>
            <span className="text-white font-bold">{currentUser.fullName}</span>
            <span className="text-neutral-500 font-mono block">({currentUser.email})</span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1 text-rose-400 hover:text-rose-300 p-1.5 rounded-lg bg-neutral-900 border border-neutral-800"
            title={t.logout}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="الاسم الكامل"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-neutral-400 block mb-1">{t.email}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@myeloued.com"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-1">{t.password}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold rounded-lg text-xs transition"
            >
              {isLoading ? 'Connecting...' : isSignUp ? 'Sign Up' : t.login}
            </button>
          </div>
        </form>

        {/* Quick Demo Switcher */}
        <div className="pt-3 border-t border-neutral-800 space-y-2">
          <span className="text-[11px] font-mono text-neutral-400 uppercase block text-center">
            {currentLang === 'ar' ? 'تبديل دور سريع (Testing Sandbox)' : 'Quick Test Roles'}
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemoRole('admin')}
              className="py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-purple-900/50 text-purple-300 rounded-lg text-[11px] font-mono font-bold"
            >
              Admin
            </button>
            <button
              onClick={() => handleQuickDemoRole('operator')}
              className="py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-cyan-900/50 text-cyan-300 rounded-lg text-[11px] font-mono font-bold"
            >
              Operator
            </button>
            <button
              onClick={() => handleQuickDemoRole('viewer')}
              className="py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 rounded-lg text-[11px] font-mono font-bold"
            >
              Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
