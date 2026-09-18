import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { notify } = useApp();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!supabase) return;
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    return () => listener.subscription.unsubscribe();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (password.length < 6) return setMessage('كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل.');
    if (password !== confirm) return setMessage('كلمتا المرور غير متطابقتين.');
    setSaving(true); setMessage('');
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) return setMessage(error.message);
    notify('تم تغيير كلمة المرور بنجاح.');
    navigate('/account');
  };

  return <main dir="rtl" className="grid min-h-[75vh] place-items-center px-4 py-12">
    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="bg-gradient-to-br from-[#122b3b] via-[#18394c] to-[#e7663c] p-7 text-white">
        <ShieldCheck size={26}/><h1 className="mt-4 text-2xl font-black">استعادة كلمة المرور</h1>
        <p className="mt-1 text-sm font-bold text-white/75">أنشئ كلمة مرور جديدة وآمنة لحسابك.</p>
      </div>
      <div className="p-6 sm:p-7">
        {!ready ? <div className="rounded-2xl bg-amber-50 p-4 text-sm font-bold leading-7 text-amber-800">رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رابطاً جديداً من صفحة تسجيل الدخول.</div> : <form onSubmit={submit} className="grid gap-3">
          <div className="relative"><Lock size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"/><input autoFocus type="password" value={password} onChange={e=>setPassword(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-4 text-sm outline-none focus:border-[#e7663c] focus:bg-white" placeholder="كلمة المرور الجديدة"/></div>
          <div className="relative"><Lock size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"/><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-4 text-sm outline-none focus:border-[#e7663c] focus:bg-white" placeholder="تأكيد كلمة المرور"/></div>
          {message && <p className="rounded-xl bg-rose-50 p-3 text-xs font-bold leading-6 text-rose-700">{message}</p>}
          <button disabled={saving} className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#e7663c] text-sm font-black text-white disabled:opacity-60">{saving?'جارٍ الحفظ...':<><CheckCircle2 size={17}/> حفظ كلمة المرور</>}</button>
        </form>}
        <button onClick={()=>navigate('/')} className="mt-4 w-full rounded-xl bg-slate-50 py-3 text-xs font-black text-slate-600">العودة إلى الموقع</button>
      </div>
    </div>
  </main>;
}
