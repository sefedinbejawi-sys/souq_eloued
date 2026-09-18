import { useEffect, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, ImagePlus, Lock, Mail, MailCheck, Phone, ShieldCheck, Store, User, X } from 'lucide-react';
import { categories, municipalities } from '../../data';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

export function Modals() {
  const { modal, setModal, notify, session } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [authMessage, setAuthMessage] = useState('');
  const [authStep, setAuthStep] = useState<'form' | 'sent'>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [fullName, setFullName] = useState(''); const [authPhone, setAuthPhone] = useState('');
  const [title, setTitle] = useState(''); const [price, setPrice] = useState(''); const [description, setDescription] = useState(''); const [phone, setPhone] = useState(''); const [category, setCategory] = useState(''); const [municipality, setMunicipality] = useState(''); const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [accountType, setAccountType] = useState<'buyer' | 'seller' | 'both'>('both');
  useEffect(() => () => previews.forEach(url => URL.revokeObjectURL(url)), [previews]);

  if (!modal) return null;
  const titles: Record<string, string> = { login: mode === 'reset' ? 'استعادة كلمة المرور' : mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد', sell: 'أضف إعلاناً جديداً', allCategories: 'كل التصنيفات' };

  const selectPhotos = (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files).filter(file => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024).slice(0, 6);
    if (picked.length < files.length) notify('يمكن رفع صور فقط بحجم أقصى 5 ميغابايت للصورة، وبحد أقصى 6 صور.');
    previews.forEach(url => URL.revokeObjectURL(url));
    setPhotos(picked); setPreviews(picked.map(file => URL.createObjectURL(file)));
  };

  const resetPhotos = () => { previews.forEach(url => URL.revokeObjectURL(url)); setPhotos([]); setPreviews([]); };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submitAuth = async () => {
    if (!supabase) { setAuthMessage('إعدادات Supabase غير متوفرة في النسخة المنشورة.'); return; }
    if (!emailValid || password.length < 6 || (mode === 'signup' && !fullName.trim())) {
      setAuthMessage(mode === 'signup' ? 'أدخل الاسم الكامل وبريداً إلكترونياً صحيحاً وكلمة مرور من 6 أحرف على الأقل.' : 'أدخل بريداً إلكترونياً صحيحاً وكلمة المرور.');
      return;
    }
    setSaving(true); setUnconfirmedEmail('');
    const normalizedEmail = email.trim().toLowerCase();
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
      : await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: fullName.trim(), phone: authPhone.trim() || null, account_type: accountType },
            // رابط تأكيد افتراضي: يتكيّف تلقائياً مع أي نطاق يُنشر عليه الموقع (تجريبي أو حقيقي) دون كتابة رابط ثابت.
            emailRedirectTo: `${window.location.origin}/auth/confirmed`,
          },
        });
    setSaving(false);
    if (result.error) {
      const raw = result.error.message;
      if (raw.toLowerCase().includes('email not confirmed')) {
        // الحساب موجود لكن لم يُفعَّل بعد — غالباً لأن رابط التفعيل السابق ذهب لرابط قديم/معطّل.
        setUnconfirmedEmail(normalizedEmail);
        setAuthMessage('هذا البريد مسجّل لكن لم يُفعَّل بعد. اضغط "إعادة إرسال رابط التفعيل" أدناه.');
        notify('الحساب غير مفعّل بعد.'); return;
      }
      const message = raw.includes('Invalid login')
        ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
        : raw.includes('already registered')
        ? 'هذا البريد الإلكتروني مسجّل مسبقاً، جرّب تسجيل الدخول.'
        : raw;
      setAuthMessage(message); notify(message); return;
    }
    if (mode === 'signup' && !result.data.session) { setAuthStep('sent'); return; }
    setPassword(''); setEmail(''); setFullName(''); setAuthPhone(''); setAccountType('both');
    setModal(null); setAuthMessage(''); setAuthStep('form'); notify(mode === 'login' ? 'تم تسجيل الدخول بنجاح.' : 'تم إنشاء الحساب وتسجيل الدخول.');
  };

  const resendConfirmation = async () => {
    if (!supabase || !unconfirmedEmail) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: unconfirmedEmail,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirmed` },
    });
    setResending(false);
    if (error) { setAuthMessage(error.message); notify(error.message); return; }
    setAuthStep('sent'); setEmail(unconfirmedEmail);
  };

  const closeAuth = () => { setModal(null); setAuthMessage(''); setAuthStep('form'); setShowPassword(false); setUnconfirmedEmail(''); };

  const signInWithGoogle = async () => {
    if (!supabase) { setAuthMessage('إعدادات Supabase غير متوفرة في النسخة المنشورة.'); return; }
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/confirmed` },
    });
    if (error) { setGoogleLoading(false); setAuthMessage(error.message); notify(error.message); }
    // عند النجاح يُعاد توجيه المتصفح فوراً إلى Google، فلا حاجة لإيقاف التحميل هنا.
  };

  const requestPasswordReset = async () => {
    if (!supabase) return setAuthMessage('إعدادات Supabase غير متوفرة في النسخة المنشورة.');
    if (!emailValid) return setAuthMessage('أدخل بريدك الإلكتروني بشكل صحيح.');
    setSaving(true); setAuthMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${window.location.origin}/auth/reset` });
    setSaving(false);
    if (error) return setAuthMessage(error.message);
    setAuthStep('sent');
    notify('تم إرسال رابط استعادة كلمة المرور إلى بريدك.');
  };

  const submitListing = async () => {
    if (!supabase) return notify('إعدادات Supabase غير متوفرة.');
    if (!session) { setModal('login'); return notify('سجل الدخول أولاً حتى تتمكن من نشر إعلان.'); }
    if (title.trim().length < 3 || title.trim().length > 120 || !price || !category || !municipality || !phone.trim()) return notify('أكمل العنوان (3–120 حرفاً) والسعر والتصنيف والبلدية والهاتف.');
    if (photos.length === 0) return notify('أضف صورة واحدة على الأقل للإعلان حتى تتم مراجعته.');
    if (!Number.isFinite(Number(price)) || Number(price) < 0) return notify('السعر غير صحيح.');
    setSaving(true);
    const databaseCategory = category === 'المركبات' ? 'المركبات والآليات' : category;
    const [{ data: categoryRow }, { data: municipalityRow }] = await Promise.all([
      supabase.from('categories').select('id').eq('name', databaseCategory).limit(1).maybeSingle(),
      supabase.from('municipalities').select('id').eq('name', municipality).limit(1).maybeSingle(),
    ]);
    if (!categoryRow?.id || !municipalityRow?.id) { setSaving(false); return notify('التصنيف أو البلدية غير متوفرين في قاعدة البيانات.'); }

    const imageUrls: string[] = [];
    const uploadedPaths: string[] = [];
    for (const file of photos) {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
      const path = `${session.user.id}/${crypto.randomUUID()}-${safeName}`;
      const upload = await supabase.storage.from('listing-images').upload(path, file, { upsert: false, contentType: file.type, cacheControl: '31536000' });
      if (upload.error) { if (uploadedPaths.length) await supabase.storage.from('listing-images').remove(uploadedPaths); setSaving(false); return notify(`تعذر رفع الصورة: ${upload.error.message}`); }
      uploadedPaths.push(path);
      imageUrls.push(supabase.storage.from('listing-images').getPublicUrl(path).data.publicUrl);
    }

    const { error } = await supabase.from('listings').insert({ seller_id: session.user.id, category_id: categoryRow.id, municipality_id: municipalityRow.id, title: title.trim(), price: Number(price), description: description.trim(), phone: phone.trim(), whatsapp: phone.trim(), status: 'draft', submitted_at: new Date().toISOString(), image_urls: imageUrls });
    setSaving(false);
    if (error) { if (uploadedPaths.length) await supabase.storage.from('listing-images').remove(uploadedPaths); return notify(error.message); }
    setModal(null); setTitle(''); setPrice(''); setDescription(''); setPhone(''); setCategory(''); setMunicipality(''); resetPhotos();
    window.dispatchEvent(new Event('souq:listing-created')); notify('تم إرسال إعلانك للمراجعة مع الصور. سيظهر بعد موافقة الإدارة.');
  };

  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/60 p-3 backdrop-blur-sm" onMouseDown={() => modal === 'login' ? closeAuth() : setModal(null)}>
    <div onMouseDown={e => e.stopPropagation()} className={`max-h-[92vh] w-full overflow-auto rounded-3xl bg-white shadow-2xl ${modal === 'login' ? 'max-w-md p-0' : 'max-w-lg p-5 sm:p-7'}`}>
    {modal !== 'login' && <div className="flex items-center justify-between"><h3 className="text-lg font-black">{titles[modal]}</h3><button onClick={() => setModal(null)} className="rounded-xl bg-slate-100 p-2 text-slate-500"><X size={18}/></button></div>}

    {modal === 'login' && <div>
      {/* رأس متدرّج احترافي */}
      <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-[#18394c] via-[#1c4257] to-[#e7663c] px-6 pb-7 pt-6 text-white">
        <button onClick={closeAuth} className="absolute left-4 top-4 rounded-xl bg-white/15 p-2 text-white hover:bg-white/25"><X size={17}/></button>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 shadow-inner backdrop-blur"><Store size={24}/></span>
        <h3 className="mt-4 text-xl font-black">{authStep === 'sent' ? 'تحقق من بريدك الإلكتروني' : mode === 'reset' ? 'استعادة حسابك' : mode === 'login' ? 'مرحباً بعودتك' : 'انضم إلى سوق الوادي'}</h3>
        <p className="mt-1 text-xs font-bold text-white/75">{authStep === 'sent' ? 'خطوة أخيرة صغيرة لتفعيل حسابك' : mode === 'reset' ? 'سنرسل لك رابطاً آمناً لتعيين كلمة مرور جديدة' : mode === 'login' ? 'سجّل دخولك لإدارة إعلاناتك ومفضلتك' : 'حساب واحد للبيع والشراء في ثوانٍ'}</p>
      </div>

      <div className="px-6 pb-7 pt-6 sm:px-7">
        {authStep === 'sent' ? (
          /* شاشة تأكيد البريد */
          <div className="grid place-items-center text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#fff3ef] text-[#e7663c]"><MailCheck size={30}/></span>
            <p className="mt-4 text-sm font-bold leading-7 text-slate-600">أرسلنا رابط تفعيل إلى<br/><b className="text-[#18394c]">{email}</b></p>
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-slate-50 p-4 text-right text-xs font-bold leading-6 text-slate-500">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#e7663c]"/>
              <span>افتح الرابط من بريدك لتفعيل الحساب. الرابط مؤقت لهذه النسخة التجريبية من الموقع وسيُحدَّث تلقائياً إلى نطاق الموقع الرسمي عند الإطلاق.</span>
            </div>
            <button onClick={() => { setAuthStep('form'); setMode('login'); }} className="mt-5 h-12 w-full rounded-xl bg-[#18394c] text-sm font-black text-white">العودة لتسجيل الدخول</button>
          </div>
        ) : (
          <>
            {/* تبديل دخول / إنشاء حساب */}
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
              <button onClick={() => { setMode('login'); setAuthMessage(''); }} className={`h-10 rounded-lg text-xs font-black transition ${mode === 'login' ? 'bg-white text-[#18394c] shadow-sm' : 'text-slate-400'}`}>تسجيل الدخول</button>
              <button onClick={() => { setMode('signup'); setAuthMessage(''); }} className={`h-10 rounded-lg text-xs font-black transition ${mode === 'signup' ? 'bg-white text-[#18394c] shadow-sm' : 'text-slate-400'}`}>حساب جديد</button>
            </div>

            {authMessage && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-6 text-amber-900">
              {authMessage}
              {unconfirmedEmail && <button type="button" disabled={resending} onClick={resendConfirmation} className="mt-2 block w-full rounded-lg bg-amber-900/90 py-2 text-center text-[11px] font-black text-white disabled:opacity-60">{resending ? 'جارٍ الإرسال...' : 'إعادة إرسال رابط التفعيل'}</button>}
            </div>}

            {mode === 'reset' ? <div>
              <div className="relative"><Mail size={17} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"/><input value={email} onChange={e=>setEmail(e.target.value)} type="email" dir="ltr" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-4 text-right text-sm outline-none focus:border-[#e7663c] focus:bg-white" placeholder="بريدك الإلكتروني"/></div>
              <button disabled={saving} onClick={()=>void requestPasswordReset()} className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[#e7663c] text-sm font-black text-white disabled:opacity-60">{saving?'جارٍ الإرسال...':'إرسال رابط الاستعادة'}</button>
              <button type="button" onClick={()=>{setMode('login');setAuthMessage('');}} className="mt-3 w-full rounded-xl bg-slate-50 py-3 text-xs font-black text-slate-600">العودة لتسجيل الدخول</button>
            </div> : <>
            {/* الدخول بواسطة Google */}
            <button type="button" disabled={googleLoading} onClick={signInWithGoogle} className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60">
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3c-7.3 0-13.6 4.1-16.7 10.1z"/><path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 36 26.9 37 24 37c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.4 40.8 16.1 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C41.5 36.4 45 30.9 45 24c0-1.2-.1-2.4-.4-3.5z"/></svg>
              {googleLoading ? 'جارٍ التحويل إلى Google...' : 'المتابعة بواسطة Google'}
            </button>
            <div className="my-4 flex items-center gap-3"><span className="h-px flex-1 bg-slate-200"/><span className="text-[11px] font-bold text-slate-400">أو</span><span className="h-px flex-1 bg-slate-200"/></div>

            <div className="grid gap-3">
              {mode === 'signup' && <div className="relative">
                <User size={17} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input value={fullName} onChange={e => setFullName(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-11 text-sm outline-none transition focus:border-[#e7663c] focus:bg-white focus:ring-2 focus:ring-[#e7663c]/15" placeholder="الاسم الكامل"/>
              </div>}
              <div className="relative">
                <Mail size={17} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" dir="ltr" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-4 text-right text-sm outline-none transition focus:border-[#e7663c] focus:bg-white focus:ring-2 focus:ring-[#e7663c]/15" placeholder="بريدك الإلكتروني"/>
              </div>
              {mode === 'signup' && <div className="grid grid-cols-3 gap-2">
                {([['buyer','مشتري'],['seller','بائع'],['both','مشتري وبائع']] as const).map(([value,label])=><button type="button" key={value} onClick={()=>setAccountType(value)} className={`rounded-xl border px-2 py-3 text-[11px] font-black ${accountType===value?'border-[#e7663c] bg-[#fff3ef] text-[#e7663c]':'border-slate-200 bg-slate-50 text-slate-500'}`}>{label}</button>)}
              </div>}
              {mode === 'signup' && <div className="relative">
                <Phone size={17} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input value={authPhone} onChange={e => setAuthPhone(e.target.value)} type="tel" dir="ltr" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-4 text-right text-sm outline-none transition focus:border-[#e7663c] focus:bg-white focus:ring-2 focus:ring-[#e7663c]/15" placeholder="رقم الهاتف (للتواصل فقط، اختياري)"/>
              </div>}
              <div className="relative">
                <Lock size={17} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm outline-none transition focus:border-[#e7663c] focus:bg-white focus:ring-2 focus:ring-[#e7663c]/15" placeholder="كلمة المرور (6 أحرف على الأقل)"/>
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button>
              </div>
            </div>

            <button disabled={saving} onClick={submitAuth} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e7663c] text-sm font-black text-white shadow-sm shadow-[#e7663c]/30 transition hover:bg-[#cf5732] disabled:opacity-60">
              {saving ? 'جارٍ التنفيذ...' : <>{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'} <CheckCircle2 size={16}/></>}
            </button>
            {mode === 'login' && <button type="button" onClick={()=>{setMode('reset');setAuthMessage('');setAuthStep('form');}} className="mt-3 w-full text-center text-xs font-black text-[#e7663c]">نسيت كلمة المرور؟</button>}

            <p className="mt-4 text-center text-[11px] font-bold leading-5 text-slate-400">حساب واحد يخوّلك الشراء والتواصل مع البائعين، وأيضاً نشر إعلاناتك الخاصة كبائع.</p>
            </>}
          </>
        )}
      </div>
    </div>}
    {modal === 'sell' && <div className="mt-5 grid gap-3"><div className="rounded-2xl border border-dashed border-[#f0ad96] bg-[#fff8f5] p-3"><label className="flex cursor-pointer items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#e7663c] shadow-sm"><ImagePlus size={21}/></span><span><b className="block text-sm">أضف صور المنتج</b><small className="text-[11px] text-slate-500">حتى 6 صور · 5 ميغابايت للصورة</small></span><input type="file" accept="image/*" multiple className="hidden" onChange={e => selectPhotos(e.target.files)}/></label>{previews.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2">{previews.map((src, index) => <div key={src} className="relative aspect-square overflow-hidden rounded-xl"><img src={src} alt={`معاينة ${index + 1}`} className="h-full w-full object-cover"/><button type="button" aria-label="حذف الصور" onClick={resetPhotos} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-slate-900/70 text-white"><X size={13}/></button></div>)}</div>}</div><input value={title} onChange={e => setTitle(e.target.value)} className="h-12 rounded-xl border border-slate-200 px-4 text-sm" placeholder="عنوان الإعلان"/><div className="grid grid-cols-2 gap-3"><input value={price} onChange={e => setPrice(e.target.value)} type="number" className="h-12 rounded-xl border border-slate-200 px-4 text-sm" placeholder="السعر بالدج"/><select value={category} onChange={e => setCategory(e.target.value)} className="h-12 rounded-xl border border-slate-200 px-3 text-sm"><option value="">اختر التصنيف</option>{categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select></div><select value={municipality} onChange={e => setMunicipality(e.target.value)} className="h-12 rounded-xl border border-slate-200 px-3 text-sm"><option value="">اختر البلدية</option>{municipalities.map(x => <option key={x} value={x}>{x}</option>)}</select><input value={phone} onChange={e => setPhone(e.target.value)} className="h-12 rounded-xl border border-slate-200 px-4 text-sm" placeholder="رقم الهاتف / واتساب"/><textarea value={description} onChange={e => setDescription(e.target.value)} className="min-h-28 rounded-xl border border-slate-200 p-4 text-sm" placeholder="اكتب وصفاً واضحاً للإعلان..."/><button disabled={saving} onClick={submitListing} className="h-12 rounded-xl bg-[#e7663c] text-sm font-black text-white disabled:opacity-60">{saving ? 'جارٍ رفع الصور وإرسال الإعلان للمراجعة...' : 'إرسال الإعلان للمراجعة'}</button></div>}
    {modal === 'allCategories' && <div className="mt-5 grid grid-cols-2 gap-2">{categories.map(c => <button key={c.name} onClick={() => setModal(null)} className="rounded-2xl border border-slate-200 p-4 text-right hover:border-[#e7663c]"><span className="text-xl">{c.icon}</span><b className="mt-2 block text-xs">{c.name}</b><small className="text-[10px] text-slate-400">{c.description}</small></button>)}</div>}
  </div></div>;
}
