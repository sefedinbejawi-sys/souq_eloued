import { MapPin, Search } from 'lucide-react';
import { municipalities, categories } from '../../data';

type Props = {
  search: string; municipality: string; category: string;
  onSearchChange: (v: string) => void; onMunicipalityChange: (v: string) => void; onCategoryChange: (v: string) => void;
  onSubmit: () => void;
};

export function Hero({ search, municipality, category, onSearchChange, onMunicipalityChange, onCategoryChange, onSubmit }: Props) {
  return <section
    className="hero-sahara relative mt-3 overflow-hidden rounded-3xl bg-[#18394c] px-5 py-8 sm:mt-5 sm:px-10 sm:py-12 lg:px-14"
    style={{ backgroundImage: 'url(/hero-eloued.webp)' }}
  >
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,57,76,.96)_0%,rgba(24,57,76,.82)_45%,rgba(24,57,76,.46)_100%)]" />
    <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full border-[45px] border-white/5" />
    <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-[#f2b84b]/10 blur-3xl" />
    <div className="relative z-10 grid animate-hero-in gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
      <div className="max-w-2xl text-white">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-[#f6ce70]"><MapPin size={13}/> الوادي والـ22 بلدية</div>
        <h1 className="text-[30px] font-black leading-[1.35] sm:text-5xl">سوقك المحلي،<br/><span className="text-[#f5c85e]">أقرب مما تتوقع.</span></h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">اكتشف منتجات وخدمات وعقارات ومركبات من البائعين في ولاية الوادي، وتواصل معهم مباشرة.</p>
        <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-bold text-white/70">
          <span className="rounded-full bg-white/10 px-3 py-2">✓ إعلانات محلية</span>
          <span className="rounded-full bg-white/10 px-3 py-2">✓ تواصل مباشر</span>
          <span className="rounded-full bg-white/10 px-3 py-2">✓ حسابات موثقة</span>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-3 shadow-2xl">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
          <Search className="text-[#e7663c]" size={20}/>
          <input value={search} onChange={e => onSearchChange(e.target.value)} placeholder="ماذا تبحث في سوق الوادي؟" className="h-12 w-full bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"/>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <select aria-label="اختيار البلدية" value={municipality} onChange={e => onMunicipalityChange(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold outline-none"><option value="">كل البلديات</option>{municipalities.map(x => <option key={x}>{x}</option>)}</select>
          <select aria-label="اختيار التصنيف" value={category} onChange={e => onCategoryChange(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold outline-none"><option value="">كل التصنيفات</option>{categories.map(x => <option key={x.name}>{x.name}</option>)}</select>
        </div>
        <button onClick={onSubmit} className="mt-2 h-11 w-full rounded-xl bg-[#e7663c] text-sm font-black text-white">ابدأ البحث</button>
      </div>
    </div>
  </section>;
}
