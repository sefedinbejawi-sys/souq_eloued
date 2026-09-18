import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export function Footer() {
  const { setModal } = useApp();
  return <footer className="border-t border-slate-200 bg-white">
    <div className="mx-auto grid max-w-[1360px] gap-6 px-5 py-8 sm:grid-cols-4 sm:px-6">
      <div>
        <b className="text-lg">سوق الوادي</b>
        <p className="mt-2 text-xs leading-6 text-slate-400">منصة محلية للشراء والبيع والخدمات في ولاية الوادي، تجمع البائعين والمشترين في مكان واحد.</p>
      </div>
      <div>
        <b className="text-sm">للمستخدمين</b>
        <div className="mt-3 grid gap-2 text-xs text-slate-500">
          <button className="text-right hover:text-[#e7663c]" onClick={() => setModal('sell')}>نشر إعلان</button>
          <button className="text-right hover:text-[#e7663c]" onClick={() => setModal('login')}>تسجيل الدخول</button>
          <button className="text-right hover:text-[#e7663c]" onClick={() => setModal('allCategories')}>كل التصنيفات</button>
        </div>
      </div>
      <div>
        <b className="text-sm">من نحن</b>
        <div className="mt-3 grid gap-2 text-xs text-slate-500">
          <Link className="hover:text-[#e7663c]" to="/about">عن سوق الوادي</Link>
          <Link className="hover:text-[#e7663c]" to="/contact">اتصل بنا</Link>
          <Link className="hover:text-[#e7663c]" to="/terms">الشروط والأحكام</Link>
          <Link className="hover:text-[#e7663c]" to="/privacy">سياسة الخصوصية</Link>
        </div>
      </div>
      <div>
        <b className="text-sm">الأمان</b>
        <p className="mt-3 text-xs leading-6 text-slate-400">عاين السلعة وتحقق من البائع قبل الدفع، ولا ترسل بياناتك الحساسة، وأبلغ عن أي إعلان مخالف.</p>
      </div>
    </div>
    <div className="border-t border-slate-100 py-4 text-center text-[10px] font-bold text-slate-400">سوق الوادي © 2026 · جميع الحقوق محفوظة</div>
  </footer>;
}
