import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Home, LogIn, ShieldAlert, Store } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

/**
 * صفحة هبوط رابط تأكيد البريد الإلكتروني.
 * هذا هو الرابط "الافتراضي" الذي يفتحه المستخدم من الإيميل: يعمل تلقائياً على
 * أي نطاق يُنشر عليه الموقع (Vercel التجريبي الآن، souq.myeloued.com لاحقاً)
 * لأنه يُبنى من window.location.origin في Modals.tsx ولا يحتاج تعديلاً يدوياً.
 */
export function AuthConfirmedPage() {
  const { setModal } = useApp();
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  useEffect(() => {
    if (!supabase) { setStatus('error'); return; }
    supabase.auth.getSession().then(({ data }) => setStatus(data.session ? 'ok' : 'error'));
  }, []);

  return (
    <main dir="rtl" className="grid min-h-[70vh] place-items-center px-4 py-16">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white text-center shadow-lg">
        <div className="bg-gradient-to-br from-[#18394c] via-[#1c4257] to-[#e7663c] px-6 pb-8 pt-7 text-white">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><Store size={24}/></span>
          <h1 className="mt-4 text-lg font-black">سوق الوادي</h1>
        </div>
        <div className="px-6 py-8">
          {status === 'checking' && <p className="text-sm font-bold text-slate-500">جارٍ التحقق من الحساب...</p>}

          {status === 'ok' && <>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={30}/></span>
            <h2 className="mt-4 text-xl font-black text-[#18394c]">تم تفعيل حسابك بنجاح</h2>
            <p className="mt-2 text-sm font-bold leading-7 text-slate-500">يمكنك الآن نشر إعلاناتك والتواصل مع البائعين والمشترين في ولاية الوادي.</p>
            <Link to="/" className="mt-6 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#e7663c] text-sm font-black text-white"><Home size={16}/> العودة إلى الموقع</Link>
          </>}

          {status === 'error' && <>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-50 text-amber-600"><ShieldAlert size={30}/></span>
            <h2 className="mt-4 text-xl font-black text-[#18394c]">انتهت صلاحية الرابط أو استُخدم من قبل</h2>
            <p className="mt-2 text-sm font-bold leading-7 text-slate-500">سجّل الدخول ببريدك وكلمة المرور، وإن استمرت المشكلة اطلب رابط تفعيل جديداً.</p>
            <Link to="/" onClick={() => setModal('login')} className="mt-6 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#18394c] text-sm font-black text-white"><LogIn size={16}/> الذهاب لتسجيل الدخول</Link>
          </>}
        </div>
      </div>
    </main>
  );
}
