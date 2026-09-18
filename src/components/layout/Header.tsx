import { useState } from 'react';
import { Bell, Heart, LogIn, Menu, MapPin, Plus, Store, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export function Header() {
  const [menu, setMenu] = useState(false);
  const { favorites, notify, setModal } = useApp();
  const navigate = useNavigate();

  const scrollOrGo = (id: string) => {
    if (location.pathname !== '/') { navigate('/'); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return <>
    <div className="hidden bg-[#122b3b] text-[11px] text-white/75 md:block">
      <div className="mx-auto flex h-9 max-w-[1360px] items-center justify-between px-6">
        <span>سوق الوادي · منصة محلية للبيع والشراء والخدمات</span>
        <div className="flex gap-5"><span>دليل البلديات</span><span>مركز المساعدة</span><span className="flex items-center gap-1"><MapPin size={12}/> ولاية الوادي</span></div>
      </div>
    </div>
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center gap-2 px-3 sm:h-[72px] sm:px-6">
        <button className="rounded-xl p-2 text-slate-500 lg:hidden" onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e7663c] text-white shadow-sm"><Store size={21}/></span>
          <span className="text-right"><b className="block text-[17px] leading-5 text-[#122b3b]">سوق الوادي</b><small className="hidden text-[9px] font-black tracking-[.18em] text-[#e7663c] sm:block">SOUQ EL OUED</small></span>
        </Link>
        <nav className="mr-8 hidden items-center gap-7 text-sm font-extrabold text-slate-500 lg:flex">
          <button className="text-[#e7663c]" onClick={() => scrollOrGo('home')}>الرئيسية</button>
          <button onClick={() => scrollOrGo('listings')}>الإعلانات</button>
          <button onClick={() => scrollOrGo('categories')}>التصنيفات</button>
          <button onClick={() => notify('دليل المتاجر قيد التطوير')}>المتاجر</button>
        </nav>
        <div className="mr-auto flex items-center gap-1">
          <button className="hidden rounded-xl p-2.5 text-slate-500 hover:bg-slate-50 sm:block" onClick={() => notify(favorites.length ? `لديك ${favorites.length} إعلان محفوظ` : 'لا توجد إعلانات محفوظة')}><Heart size={19}/></button>
          <button className="hidden rounded-xl p-2.5 text-slate-500 hover:bg-slate-50 sm:block" onClick={() => notify('لا توجد إشعارات جديدة')}><Bell size={19}/></button>
          <button onClick={() => setModal('login')} className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 md:flex"><LogIn size={17}/> دخول</button>
          <button onClick={() => setModal('sell')} className="flex h-10 items-center gap-1.5 rounded-xl bg-[#e7663c] px-3 text-xs font-black text-white shadow-sm hover:bg-[#cf5732] sm:px-4 sm:text-sm"><Plus size={17}/> أضف إعلاناً</button>
        </div>
      </div>
      {menu && <div className="border-t border-slate-100 bg-white p-4 lg:hidden">
        <div className="grid gap-2 text-sm font-bold text-slate-600">
          <button className="rounded-lg p-3 text-right hover:bg-slate-50" onClick={() => { scrollOrGo('home'); setMenu(false); }}>الرئيسية</button>
          <button className="rounded-lg p-3 text-right hover:bg-slate-50" onClick={() => { scrollOrGo('listings'); setMenu(false); }}>الإعلانات</button>
          <button className="rounded-lg p-3 text-right hover:bg-slate-50" onClick={() => { scrollOrGo('categories'); setMenu(false); }}>التصنيفات</button>
          <button className="rounded-lg p-3 text-right hover:bg-slate-50" onClick={() => { setModal('login'); setMenu(false); }}>حسابي</button>
        </div>
      </div>}
    </header>
  </>;
}
