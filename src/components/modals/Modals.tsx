import { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { categories, municipalities } from '../../data';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

export function Modals() {
  const { modal, setModal, notify, session } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [authMessage, setAuthMessage] = useState('');
  const [email, setEmail] = useState(''); const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState(''); const [price, setPrice] = useState(''); const [description, setDescription] = useState(''); const [phone, setPhone] = useState(''); const [category, setCategory] = useState(''); const [municipality, setMunicipality] = useState(''); const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  useEffect(() => () => previews.forEach(url => URL.revokeObjectURL(url)), [previews]);

  if (!modal) return null;
  const titles: Record<string, string> = { login: mode === 'login' ? 'الدخول إلى حسابك' : 'إنشاء حساب جديد', sell: 'أضف إعلاناً جديداً', allCategories: 'كل التصنيفات' };

  const selectPhotos = (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files).filter(file => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024).slice(0, 6);
    if (picked.length < files.length) notify('يمكن رفع صور فقط بحجم أقصى 5 ميغابايت للصورة، وبحد أقصى 6 صور.');
    previews.forEach(url => URL.revokeObjectURL(url));
    setPhotos(picked); setPreviews(picked.map(file => URL.createObjectURL(file)));
  };

  const resetPhotos = () => { previews.forEach(url => URL.revokeObjectURL(url)); setPhotos([]); setPreviews([]); };

  const submitAuth = async () => {
    if (!supabase) { setAuthMessage('إعدادات Supabase غير متوفرة في النسخة المنشورة.'); return; }
    if (mode === 'signup' && (!fullName || !username || !email || !password)) { setAuthMessage('أدخل الاسم الكامل واسم المستخدم والبريد وكلمة المرور.'); return; }
    if (mode === 'login' && (!email || !password)) { setAuthMessage('أدخل البريد أو اسم المستخدم وكلمة المرور.'); return; }
    setSaving(true);
    let loginEmail = email.trim().toLowerCase();
    if (mode === 'login' && !loginEmail.includes('@')) {
      const lookup = await supabase.from('profiles').select('email').ilike('username', loginEmail).limit(1).maybeSingle();
      if (lookup.error || !lookup.data?.email) { setSaving(false); setAuthMessage('اسم المستخدم غير موجود.'); return; }
      loginEmail = lookup.data.email;
    }
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email: loginEmail, password })
      : await supabase.auth.signUp({ email: loginEmail, password, options: { data: { full_name: fullName, username: username.trim().toLowerCase() }, emailRedirectTo: 'https://souq.myeloued.com/auth/confirmed' } });
    setSaving(false);
    if (result.error) { const message = result.error.message.includes('Invalid login') ? 'البريد/اسم المستخدم أو كلمة المرور غير صحيحة.' : result.error.message; setAuthMessage(message); notify(message); return; }
    setPassword(''); setEmail(''); setUsername(''); setFullName('');
    if (mode === 'signup' && !result.data.session) { setAuthMessage('تم إنشاء الحساب. افتح رابط التفعيل من بريدك، وسيتم توجيهك إلى الموقع مباشرة.'); return; }
    setModal(null); setAuthMessage(''); notify(mode === 'login' ? 'تم تسجيل الدخول بنجاح.' : 'تم إنشاء الحساب وتسجيل الدخول.');
  };

  const signInGoogle = async () => { if (!supabase) return; const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'https://souq.myeloued.com/auth/confirmed' } }); if (error) { setAuthMessage(error.message); notify(error.message); } };

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

    const imageUrls: string[] = [];
    for (const file of photos) {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
      const path = `${session.user.id}/${crypto.randomUUID()}-${safeName}`;
      const upload = await supabase.storage.from('listing-images').upload(path, file, { upsert: false, contentType: file.type, cacheControl: '31536000' });
      if (upload.error) { setSaving(false); return notify(`تعذر رفع الصورة: ${upload.error.message}`); }
      imageUrls.push(supabase.storage.from('listing-images').getPublicUrl(path).data.publicUrl);
    }

    const { error } = await supabase.from('listings').insert({ seller_id: session.user.id, category_id: categoryRow.id, municipality_id: municipalityRow.id, title, price: Number(price), description, phone, whatsapp: phone, status: 'draft', image_urls: imageUrls });
    setSaving(false);
    if (error) return notify(error.message);
    setModal(null); setTitle(''); setPrice(''); setDescription(''); setPhone(''); setCategory(''); setMunicipality(''); resetPhotos();
    window.dispatchEvent(new Event('souq:listing-created')); notify('تم إرسال إعلانك للمراجعة مع الصور. سيظهر بعد موافقة الإدارة.');
  };

  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/55 p-3 backdrop-blur-sm" onMouseDown={() => setModal(null)}><div onMouseDown={e => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7"><div className="flex items-center justify-between"><h3 className="text-lg font-black">{titles[modal]}</h3><button onClick={() => setModal(null)} className="rounded-xl bg-slate-100 p-2 text-slate-500"><X size={18}/></button></div>
    {modal === 'login' && <div className="mt-6"><div className="rounded-2xl bg-[#fff3ef] p-4 text-sm font-bold text-slate-700">{mode === 'login' ? 'سجل دخولك بالبريد أو اسم المستخدم.' : 'أنشئ حساباً بالاسم واسم المستخدم والبريد وكلمة المرور.'}</div>{authMessage && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-6 text-amber-900">{authMessage}</div>}{mode === 'signup' && <><input value={fullName} onChange={e => setFullName(e.target.value)} className="mt-4 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none" placeholder="الاسم الكامل"/><input value={username} onChange={e => setUsername(e.target.value)} dir="ltr" className="mt-3 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none" placeholder="اسم المستخدم"/></>}<input type="email" value={email} onChange={e => setEmail(e.target.value)} dir="ltr" className="mt-3 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none" placeholder="البريد الإلكتروني أو اسم المستخدم"/><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-3 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none" placeholder="كلمة المرور"/><button disabled={saving} onClick={submitAuth} className="mt-3 h-12 w-full rounded-xl bg-[#e7663c] text-sm font-black text-white disabled:opacity-60">{saving ? 'جارٍ التنفيذ...' : mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}</button>{mode === 'login' && <button onClick={() => void signInGoogle()} className="mt-3 h-12 w-full rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-700">المتابعة عبر Google</button>}<button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setAuthMessage(''); }} className="mt-3 w-full text-xs font-bold text-[#e7663c]">{mode === 'login' ? 'ليس لديك حساب؟ أنشئ حساباً' : 'لديك حساب؟ سجل الدخول'}</button></div>}
    {modal === 'sell' && <div className="mt-5 grid gap-3"><div className="rounded-2xl border border-dashed border-[#f0ad96] bg-[#fff8f5] p-3"><label className="flex cursor-pointer items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#e7663c] shadow-sm"><ImagePlus size={21}/></span><span><b className="block text-sm">أضف صور المنتج</b><small className="text-[11px] text-slate-500">حتى 6 صور · 5 ميغابايت للصورة</small></span><input type="file" accept="image/*" multiple className="hidden" onChange={e => selectPhotos(e.target.files)}/></label>{previews.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2">{previews.map((src, index) => <div key={src} className="relative aspect-square overflow-hidden rounded-xl"><img src={src} alt={`معاينة ${index + 1}`} className="h-full w-full object-cover"/><button type="button" aria-label="حذف الصور" onClick={resetPhotos} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-slate-900/70 text-white"><X size={13}/></button></div>)}</div>}</div><input value={title} onChange={e => setTitle(e.target.value)} className="h-12 rounded-xl border border-slate-200 px-4 text-sm" placeholder="عنوان الإعلان"/><div className="grid grid-cols-2 gap-3"><input value={price} onChange={e => setPrice(e.target.value)} type="number" className="h-12 rounded-xl border border-slate-200 px-4 text-sm" placeholder="السعر بالدج"/><select value={category} onChange={e => setCategory(e.target.value)} className="h-12 rounded-xl border border-slate-200 px-3 text-sm"><option value="">اختر التصنيف</option>{categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select></div><select value={municipality} onChange={e => setMunicipality(e.target.value)} className="h-12 rounded-xl border border-slate-200 px-3 text-sm"><option value="">اختر البلدية</option>{municipalities.map(x => <option key={x} value={x}>{x}</option>)}</select><input value={phone} onChange={e => setPhone(e.target.value)} className="h-12 rounded-xl border border-slate-200 px-4 text-sm" placeholder="رقم الهاتف / واتساب"/><textarea value={description} onChange={e => setDescription(e.target.value)} className="min-h-28 rounded-xl border border-slate-200 p-4 text-sm" placeholder="اكتب وصفاً واضحاً للإعلان..."/><button disabled={saving} onClick={submitListing} className="h-12 rounded-xl bg-[#e7663c] text-sm font-black text-white disabled:opacity-60">{saving ? 'جارٍ رفع الصور ونشر الإعلان...' : 'نشر الإعلان الآن'}</button></div>}
    {modal === 'allCategories' && <div className="mt-5 grid grid-cols-2 gap-2">{categories.map(c => <button key={c.name} onClick={() => setModal(null)} className="rounded-2xl border border-slate-200 p-4 text-right hover:border-[#e7663c]"><span className="text-xl">{c.icon}</span><b className="mt-2 block text-xs">{c.name}</b><small className="text-[10px] text-slate-400">{c.description}</small></button>)}</div>}
  </div></div>;
}
