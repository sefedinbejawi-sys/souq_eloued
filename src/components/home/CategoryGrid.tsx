import { ChevronLeft } from 'lucide-react';
import { categories } from '../../data';

type Props = { active: string; onSelect: (name: string) => void; onShowAll: () => void };

export function CategoryGrid({ active, onSelect, onShowAll }: Props) {
  return <section id="categories" className="mt-8 scroll-mt-24">
    <div className="mb-4 flex items-end justify-between">
      <div><p className="text-[11px] font-black text-[#e7663c]">اكتشف السوق</p><h2 className="mt-1 text-xl font-black sm:text-2xl">تصفح حسب التصنيف</h2></div>
      <button onClick={onShowAll} className="flex items-center gap-1 text-xs font-black text-[#e7663c]">كل التصنيفات <ChevronLeft size={15}/></button>
    </div>
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
      {categories.map(c => <button key={c.name} onClick={() => onSelect(c.name)} className={`rounded-2xl border p-3 text-right transition hover:-translate-y-0.5 ${active === c.name ? 'border-[#f0ad96] bg-[#fff3ef]' : 'border-slate-200 bg-white hover:border-[#f0ad96]'}`}>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-xl">{c.icon}</span>
        <b className="mt-2 block text-xs font-black">{c.name}</b>
        <span className="mt-1 block text-[10px] leading-4 text-slate-400">{c.description}</span>
      </button>)}
    </div>
  </section>;
}
