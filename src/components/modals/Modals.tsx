import { useState } from 'react';
import { X } from 'lucide-react';
import { categories, municipalities } from '../../data';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

export function Modals() {
  const { modal, setModal, notify, session } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState(''); const [price, setPrice] = useState(''); const [description, setDescription] = useState(''); const [phone, setPhone] = useState(''); const [category, setCategory] = useState(''); const [municipality, setMunicipality] = useState(''); const [saving, setSaving] = useState(false);
  if (!modal) return null;
  const titles: Record<string, string> = { login: mode === 'login' ? 'الدخول إلى حسابك' : 'إنشاء حساب جديد', sell: 'أضف إعلاناً جديداً', allCategories: 'كل التصنيفات' };

  const submitAuth = async () => {
    if (!supabase) return notify('إعدادات Supabase غير متوفرة في هذه النسخة.');
    if (!email || !password) return notify('أدخل البريد الإلكتروني وكلمة المرور.');
    setSaving(true);
    const result = mode === 'login' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    setSaving(false);
    if (result.error) return notify(result.error.message.includes('Invalid login') ? 'البريد أو كلمة المرور غير صحيحة.' : result.error.message);
    setModal(null); setEmail(''); setPassword('');
    notify(mode === 'login' ? 'تم تسجيل الدخول بنجاح.' : 'تم إنشاء الحساب. تحقق من بريدك إذا طُلب ذلك.');
  };

  const submitListing = async () => {
    if (!supabase) return notify('إعدادات Supabase غير متوفرة.');
    if (!session) { setModal('login'); return notify('سجل الدخول أولاً حتى تتمكن من نشر إعلان.'); }
    if (!title || !price || !category || !municipality || !phone) return notify('أكمل العنوان والسعر والتصنيف والبلدية والهاتف.');
    setSaving(true);
    const databaseCategory = category === 'المركبات' ? 'المركبات والآليات' : category;
    const [{ data: categoryRow }, { data: municipalityRow }] = await Promise.all([
      supabase.from('categories').select('id').eq('name', databaseCategory).limit(1).maybeSingle(),
      supabase.from('municipalities').select('id').eq('name', municipality).limit(1).maybeSingle(),
    ]);
    if (!categoryRow?.id || !municipalityRow?.id) { setSaving(false); return notify('التصنيف أو البلدية غير متوفرين في قاعدة البيانات.'); }
    const { error } = await supabase.from('listings').insert({ seller_id: session.user.id, category_id: categoryRow.id, municipality_id: municipalityRow.id, title, price: Number(price), description, phone, whatsapp: phone, status: 'active', image_urls: [] });
    setSaving(false);
    if (error) return notify(error.message);
    setModal(null); setTitle(''); setPrice(''); setDescription(''); setPhone(''); setCategory(''); setMunicipality('');
    window.dispatchEvent(new Event('souq:listing-created')); notify('تم نشر إعلانك بنجاح.');
  };

  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/55 p-3 backdrop-blur-sm" onMouseDown={() => setModal(null)}><div onMouseDown={e => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7"><div className="flex items-center justify-between"><h3 className="text-lg font-black">{titles[modal]}</h3><button onClick={() => setModal(null)} className="rounded-xl bg-slate-100 p-2 text-slate-500"><X size={18}/></button></div>
    {modal === 'login' && <div className="mt-6"><div className="rounded-2xl bg-[#fff3ef] p-4 text-sm font-bold text-slate-700">{mode === 'login' ? 'سجل دخولك لإدارة إعلاناتك والمفضلة.' : 'أنشئ حساباً مجانياً وابدأ استقبال المشترين.'}</div>{mode === 'signup' && <input value={fullName} onChange={e => setFullName(e.target.value)} className="mt-4 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none" placeholder="الاسم الكامل"/>}<input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-3 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none" placeholder="البريد الإلكتروني"/><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-3 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none" placeholder="كلمة المرور (6 أحرف على الأقل)"/><button disabled={saving} onClick={submitAuth} className="mt-3 h-12 w-full rounded-xl bg-[#e7663c] text-sm font-black text-white disabled:opacity-60">{saving ? 'جارٍ التنفيذ...' : mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}</button><button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="mt-3 w-full text-xs font-bold text-[#e7663c]">{mode === 'login' ? 'ليس لديك حساب؟ أنشئ حساباً' : 'لديك حساب؟ سجل الدخول'}</button></div>}
    {modal === 'sell' && <div className="mt-5 grid gap-3"><input value={title} onChange={e => setTitle(e.target.value)} className="h-12 rounded-xl border border-slate-200 px-4 text-sm" placeholder="عنوان الإعلان"/><div className="grid grid-cols-2 gap-3"><input value={price} onChange={e => setPrice(e.target.value)} type="number" className="h-12 rounded-xl border border-slate-200 px-4 text-sm" placeholder="السعر بالدج"/><select value={category} onChange={e => setCategory(e.target.value)} className="h-12 rounded-xl border border-slate-200 px-3 text-sm"><option value="">اختر التصنيف</option>{categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select></div><select value={municipality} onChange={e => setMunicipality(e.target.value)} className="h-12 rounded-xl border border-slate-200 px-3 text-sm"><option value="">اختر البلدية</option>{municipalities.map(x => <option key={x} value={x}>{x}</option>)}</select><input value={phone} onChange={e => setPhone(e.target.value)} className="h-12 rounded-xl border border-slate-200 px-4 text-sm" placeholder="رقم الهاتف / واتساب"/><textarea value={description} onChange={e => setDescription(e.target.value)} className="min-h-28 rounded-xl border border-slate-200 p-4 text-sm" placeholder="اكتب وصفاً واضحاً للإعلان..."/><button disabled={saving} onClick={submitListing} className="h-12 rounded-xl bg-[#e7663c] text-sm font-black text-white disabled:opacity-60">{saving ? 'جارٍ نشر الإعلان...' : 'نشر الإعلان الآن'}</button></div>}
    {modal === 'allCategories' && <div className="mt-5 grid grid-cols-2 gap-2">{categories.map(c => <button key={c.name} onClick={() => setModal(null)} className="rounded-2xl border border-slate-200 p-4 text-right hover:border-[#e7663c]"><span className="text-xl">{c.icon}</span><b className="mt-2 block text-xs">{c.name}</b><small className="text-[10px] text-slate-400">{c.description}</small></button>)}</div>}
  </div></div>;
}
