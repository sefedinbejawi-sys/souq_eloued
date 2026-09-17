import { X } from 'lucide-react';
import { categories, municipalities } from '../../data';
import { useApp } from '../../context/AppContext';

export function Modals() {
  const { modal, setModal, notify } = useApp();
  if (!modal) return null;

  const titles: Record<string, string> = { login: 'الدخول إلى حسابك', sell: 'أضف إعلاناً جديداً', allCategories: 'كل التصنيفات' };

  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/55 p-3 backdrop-blur-sm" onMouseDown={() => setModal(null)}>
    <div onMouseDown={e => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black">{titles[modal]}</h3>
        <button onClick={() => setModal(null)} className="rounded-xl bg-slate-100 p-2 text-slate-500"><X size={18}/></button>
      </div>

      {modal === 'login' && <div className="mt-6">
        <div className="rounded-2xl bg-[#fff3ef] p-4 text-sm font-bold text-slate-700">سجل دخولك لإدارة إعلاناتك، المفضلة والرسائل.</div>
        <input className="mt-4 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none" placeholder="رقم الهاتف"/>
        <button onClick={() => { setModal(null); notify('سيتم تفعيل تسجيل الدخول عند ربط Supabase'); }} className="mt-3 h-12 w-full rounded-xl bg-[#e7663c] text-sm font-black text-white">متابعة</button>
      </div>}

      {modal === 'sell' && <div className="mt-5 grid gap-3">
        <input className="h-12 rounded-xl border border-slate-200 px-4 text-sm" placeholder="عنوان الإعلان"/>
        <div className="grid grid-cols-2 gap-3">
          <input className="h-12 rounded-xl border border-slate-200 px-4 text-sm" placeholder="السعر بالدج"/>
          <select className="h-12 rounded-xl border border-slate-200 px-3 text-sm"><option>اختر التصنيف</option>{categories.map(c => <option key={c.name}>{c.name}</option>)}</select>
        </div>
        <select className="h-12 rounded-xl border border-slate-200 px-3 text-sm"><option>اختر البلدية</option>{municipalities.map(x => <option key={x}>{x}</option>)}</select>
        <textarea className="min-h-28 rounded-xl border border-slate-200 p-4 text-sm" placeholder="اكتب وصفاً واضحاً للإعلان..."/>
        <button onClick={() => { setModal(null); notify('تم حفظ النموذج محلياً — الربط بقاعدة البيانات في المرحلة التالية'); }} className="h-12 rounded-xl bg-[#e7663c] text-sm font-black text-white">متابعة نشر الإعلان</button>
      </div>}

      {modal === 'allCategories' && <div className="mt-5 grid grid-cols-2 gap-2">
        {categories.map(c => <button key={c.name} onClick={() => setModal(null)} className="rounded-2xl border border-slate-200 p-4 text-right hover:border-[#e7663c]">
          <span className="text-xl">{c.icon}</span><b className="mt-2 block text-xs">{c.name}</b><small className="text-[10px] text-slate-400">{c.description}</small>
        </button>)}
      </div>}
    </div>
  </div>;
}
