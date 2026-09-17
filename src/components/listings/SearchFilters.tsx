import { useState } from 'react';
import { ChevronDown, Clock3, Search, Sparkles, X } from 'lucide-react';

type Props = { search: string; municipality: string; category: string; municipalities: string[]; categories: string[]; onSearchChange: (v: string) => void; onMunicipalityChange: (v: string) => void; onCategoryChange: (v: string) => void };
const popularSearches = ['دقلة نور', 'سيارات مستعملة', 'أرض فلاحية', 'مكيفات'];

export function SearchFilters({ search, municipality, category, municipalities, categories, onSearchChange, onMunicipalityChange, onCategoryChange }: Props) {
  const [focused, setFocused] = useState(false);
  const suggestions = [...new Set([...popularSearches, ...categories, ...municipalities])].filter(item => !search || item.includes(search)).slice(0, 6);
  return <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(20,40,55,.09)] sm:p-4">
    <div className="flex flex-col gap-2.5 lg:flex-row">
      <div className="relative flex-[1.6]">
        <label className="relative block">
          <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#e7663c]"/>
          <input value={search} onFocus={() => setFocused(true)} onChange={e => onSearchChange(e.target.value)} placeholder="ابحث عن سيارة، عقار، هاتف، خدمة..." className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-10 text-sm font-bold outline-none transition focus:border-[#e7663c] focus:bg-white focus:ring-4 focus:ring-[#e7663c]/10"/>
          {search && <button aria-label="مسح البحث" onClick={() => onSearchChange('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={16}/></button>}
        </label>
        {focused && <div onMouseLeave={() => setFocused(false)} className="absolute inset-x-0 top-[54px] z-30 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          <div className="mb-1 flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-black text-slate-400"><Sparkles size={13} className="text-[#e7663c]"/> اقتراحات سريعة</div>
          {suggestions.map(item => <button key={item} onClick={() => { onSearchChange(item); setFocused(false); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-right text-xs font-bold text-slate-600 hover:bg-[#fff3ef] hover:text-[#d65230]"><Clock3 size={13} className="text-slate-300"/>{item}</button>)}
        </div>}
      </div>
      <FilterSelect label="كل البلديات" value={municipality} options={municipalities} onChange={onMunicipalityChange}/>
      <FilterSelect label="كل التصنيفات" value={category} options={categories} onChange={onCategoryChange}/>
    </div>
    <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
      <span className="shrink-0 text-[10px] font-black text-slate-400">شائع:</span>
      {popularSearches.map(item => <button key={item} onClick={() => onSearchChange(item)} className="shrink-0 rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-600 transition hover:bg-[#fff3ef] hover:text-[#d65230]">{item}</button>)}
    </div>
  </section>;
}
function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return <label className="relative min-w-[165px] flex-1"><select value={value} onChange={e => onChange(e.target.value)} className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pl-9 text-xs font-bold outline-none transition focus:border-[#e7663d] focus:bg-white"><option value="">{label}</option>{options.map(x => <option key={x}>{x}</option>)}</select><ChevronDown size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/></label>;
}
