import { useEffect, useState } from 'react';
import { CheckCircle2, Home, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthConfirmedPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  useEffect(() => {
    let active = true;
    const finish = async () => {
      if (!supabase) return setStatus('error');
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) await supabase.auth.exchangeCodeForSession(code);
      const { data } = await supabase.auth.getSession();
      if (active) setStatus(data.session ? 'success' : 'error');
    };
    void finish();
    return () => { active = false; };
  }, []);
  return <main dir="rtl" className="mx-auto grid min-h-[65vh] max-w-xl place-items-center px-4 py-16 text-center"><div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">{status === 'loading' && <><div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-[#fff0eb]"/><h1 className="mt-5 text-2xl font-black text-[#18394c]">جارٍ تأكيد الحساب...</h1></>}{status === 'success' && <><CheckCircle2 className="mx-auto text-emerald-500" size={58}/><h1 className="mt-5 text-2xl font-black text-[#18394c]">تم تأكيد حسابك بنجاح</h1><p className="mt-3 text-sm font-semibold leading-7 text-slate-500">أصبح حسابك جاهزاً. يمكنك الآن تصفح الإعلانات أو إضافة إعلان جديد.</p><div className="mt-6 flex gap-3"><button onClick={() => navigate('/')} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#e7663c] px-4 py-3 text-sm font-black text-white"><Home size={17}/> الرئيسية</button><button onClick={() => navigate('/admin')} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#18394c] px-4 py-3 text-sm font-black text-white"><LogIn size={17}/> لوحة الإدارة</button></div></>}{status === 'error' && <><h1 className="text-2xl font-black text-[#18394c]">تعذر تأكيد الرابط</h1><p className="mt-3 text-sm font-semibold leading-7 text-slate-500">الرابط منتهي أو غير صالح. اطلب رسالة تأكيد جديدة ثم افتحها من نفس الموقع.</p><button onClick={() => navigate('/')} className="mt-6 rounded-xl bg-[#e7663c] px-5 py-3 text-sm font-black text-white">العودة للموقع</button></>}</div></main>;
}
