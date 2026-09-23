import { MessageCircle, ShieldCheck, Store } from 'lucide-react';

export function TrustSection() {
  return <section className="mb-10 grid gap-3 sm:grid-cols-3">
    <div className="rounded-2xl bg-[#eaf2f5] p-5"><ShieldCheck className="text-[#287f72]"/><b className="mt-3 block text-sm">بائعون موثوقون</b><p className="mt-1 text-xs leading-5 text-slate-500">تظهر شارة التوثيق للحسابات التي تم توثيقها فعليًا.</p></div>
    <div className="rounded-2xl bg-[#fff2ed] p-5"><MessageCircle className="text-[#e7663c]"/><b className="mt-3 block text-sm">تواصل مباشر</b><p className="mt-1 text-xs leading-5 text-slate-500">اتصال وواتساب بدون وسيط.</p></div>
    <div className="rounded-2xl bg-[#f4f0ff] p-5"><Store className="text-violet-600"/><b className="mt-3 block text-sm">متاجر محلية</b><p className="mt-1 text-xs leading-5 text-slate-500">تصفح المتاجر التي لديها إعلانات منشورة وتواصل مع البائع مباشرة.</p></div>
  </section>;
}
