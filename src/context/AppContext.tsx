import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type Modal = 'login' | 'sell' | 'allCategories' | null;

type AppContextValue = {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  notice: string;
  notify: (message: string) => void;
  modal: Modal;
  setModal: (m: Modal) => void;
  session: Session | null;
  logout: () => Promise<{ error: string | null }>;
  isSupabaseConfigured: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('souq:favorites') || '[]'); } catch { return []; }
  });
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState<Modal>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => { localStorage.setItem('souq:favorites', JSON.stringify(favorites)); }, [favorites]);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  const toggleFavorite = (id: string) => setFavorites(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2600); };
  const logout = async () => {
    if (!supabase) { setSession(null); return { error: null }; }
    const { error } = await supabase.auth.signOut();
    if (!error) setSession(null);
    return { error: error?.message || null };
  };

  const value = useMemo(() => ({ favorites, toggleFavorite, notice, notify, modal, setModal, session, logout, isSupabaseConfigured }), [favorites, notice, modal, session]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
