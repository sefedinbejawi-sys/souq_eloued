import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

export function NotFoundPage() {
  return <main className="mx-auto flex max-w-[1360px] flex-col items-center px-3 py-24 text-center sm:px-6">
    <SearchX size={44} className="text-slate-300"/>
    <h1 className="mt-4 text-xl font-black">الصفحة غير موجودة</h1>
    <p className="mt-2 max-w-sm text-sm text-slate-500">الرابط الذي وصلت إليه غير صحيح، أو أن الإعلان لم يعد متاحاً.</p>
    <Link to="/" className="mt-6 rounded-xl bg-[#e7663c] px-5 py-3 text-sm font-black text-white">العودة إلى الرئيسية</Link>
  </main>;
}
