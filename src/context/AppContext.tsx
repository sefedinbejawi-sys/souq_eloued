import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type Modal = 'login' | 'sell' | 'allCategories' | null;

type AppContextValue = {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  notice: string;
  notify: (message: string) => void;
  modal: Modal;
  setModal: (m: Modal) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('souq:favorites') || '[]'); } catch { return []; }
  });
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState<Modal>(null);

  useEffect(() => { localStorage.setItem('souq:favorites', JSON.stringify(favorites)); }, [favorites]);

  const toggleFavorite = (id: string) => setFavorites(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2600); };

  const value = useMemo(() => ({ favorites, toggleFavorite, notice, notify, modal, setModal }), [favorites, notice, modal]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
