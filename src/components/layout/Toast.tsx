import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Toast() {
  const { notice } = useApp();
  if (!notice) return null;
  return <div className="fixed bottom-[76px] left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-[#122b3b] px-4 py-3 text-xs font-bold text-white shadow-2xl md:bottom-6">
    <CheckCircle2 size={16} className="text-[#f5c85e]"/>{notice}
  </div>;
}
