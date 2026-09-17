import { Grid2X2, Heart, Home, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export function BottomNav() {
  const { favorites, notify, setModal } = useApp();
  const navigate = useNavigate();
  const scroll = (id: string) => {
    if (location.pathname !== '/') { navigate('/'); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  return <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[62px] grid-cols-4 border-t border-slate-200 bg-white/95 shadow-[0_-5px_20px_rgba(20,40,55,.08)] backdrop-blur md:hidden">
    <button onClick={() => scroll('home')} className="flex flex-col items-center justify-center gap-0.5 text-[#e7663c]"><Home size={19}/><span className="text-[10px] font-bold">الرئيسية</span></button>
    <button onClick={() => scroll('categories')} className="flex flex-col items-center justify-center gap-0.5 text-slate-500"><Grid2X2 size={19}/><span className="text-[10px] font-bold">التصنيفات</span></button>
    <button onClick={() => notify(favorites.length ? `${favorites.length} إعلان محفوظ` : 'لا توجد محفوظات')} className="flex flex-col items-center justify-center gap-0.5 text-slate-500"><Heart size={19}/><span className="text-[10px] font-bold">المفضلة</span></button>
    <button onClick={() => setModal('login')} className="flex flex-col items-center justify-center gap-0.5 text-slate-500"><UserRound size={19}/><span className="text-[10px] font-bold">حسابي</span></button>
  </nav>;
}
