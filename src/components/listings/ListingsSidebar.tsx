import { SlidersHorizontal } from 'lucide-react';

export type PriceRange = { min: string; max: string };

type Props = {
  priceRange: PriceRange; onPriceRangeChange: (r: PriceRange) => void;
  condition: string; onConditionChange: (v: string) => void;
  onReset: () => void;
};

const conditions = ['جديد', 'مستعمل', 'خدمة'];

export function ListingsSidebar({ priceRange, onPriceRangeChange, condition, onConditionChange, onReset }: Props) {
  return <aside className="hidden h-fit w-[220px] shrink-0 rounded-2xl border border-slate-200 bg-white p-4 lg:block">
    <div className="mb-4 flex items-center gap-2 text-sm font-black text-[#122b3b]"><SlidersHorizontal size={16} className="text-[#e7663c]"/> فلترة متقدمة</div>

    <div className="border-t border-slate-100 pt-4">
      <p className="mb-2 text-xs font-black text-slate-600">السعر (دج)</p>
      <div className="flex items-center gap-2">
        <input value={priceRange.min} onChange={e => onPriceRangeChange({ ...priceRange, min: e.target.value })} type="number" placeholder="من" className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs outline-none focus:border-[#e7663c]"/>
        <span className="text-slate-300">—</span>
        <input value={priceRange.max} onChange={e => onPriceRangeChange({ ...priceRange, max: e.target.value })} type="number" placeholder="إلى" className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs outline-none focus:border-[#e7663c]"/>
      </div>
    </div>

    <div className="mt-5 border-t border-slate-100 pt-4">
      <p className="mb-2 text-xs font-black text-slate-600">الحالة</p>
      <div className="grid gap-1.5">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <input type="radio" name="condition" checked={condition === ''} onChange={() => onConditionChange('')} className="accent-[#e7663c]"/> الكل
        </label>
        {conditions.map(c => <label key={c} className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <input type="radio" name="condition" checked={condition === c} onChange={() => onConditionChange(c)} className="accent-[#e7663c]"/> {c}
        </label>)}
      </div>
    </div>

    <button onClick={onReset} className="mt-5 h-9 w-full rounded-lg border border-slate-200 text-xs font-black text-slate-500 hover:border-[#e7663c] hover:text-[#e7663c]">إعادة ضبط الفلاتر</button>
  </aside>;
}
