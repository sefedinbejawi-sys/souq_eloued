import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';

type SearchFiltersProps = {
  search: string;
  municipality: string;
  category: string;
  municipalities: string[];
  categories: string[];
  onSearchChange: (value: string) => void;
  onMunicipalityChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
};

export function SearchFilters({ search, municipality, category, municipalities, categories, onSearchChange, onMunicipalityChange, onCategoryChange }: SearchFiltersProps) {
  return (
    <section className="rounded-[22px] border border-stone-200 bg-white p-3 shadow-[0_10px_30px_rgba(87,65,40,0.07)] sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="relative min-w-0 flex-1">
          <Search size={19} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="ما الذي تبحث عنه؟" className="h-12 w-full rounded-xl border border-stone-200 bg-[#fcfaf7] pr-11 pl-4 text-sm font-semibold outline-none transition placeholder:text-stone-400 focus:border-[#d8784a] focus:ring-4 focus:ring-[#d8784a]/10" />
        </label>
        <FilterSelect label="كل البلديات" value={municipality} options={municipalities} onChange={onMunicipalityChange} />
        <FilterSelect label="كل التصنيفات" value={category} options={categories} onChange={onCategoryChange} />
        <button className="flex h-12 items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 text-sm font-bold text-stone-600 transition hover:border-[#d8784a] hover:text-[#bd6037]"><SlidersHorizontal size={17} /> فلاتر أكثر</button>
      </div>
    </section>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="relative min-w-[168px] flex-1"><select value={value} onChange={(e) => onChange(e.target.value)} className="h-12 w-full appearance-none rounded-xl border border-stone-200 bg-[#fcfaf7] px-4 pl-10 text-sm font-bold text-stone-700 outline-none transition focus:border-[#d8784a] focus:ring-4 focus:ring-[#d8784a]/10"><option value="">{label}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" /></label>;
}
