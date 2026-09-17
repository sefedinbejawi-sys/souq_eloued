import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Listing } from '../../data/listings';
import { ListingCard } from './ListingCard';
import { ListingsSidebar, type PriceRange } from './ListingsSidebar';
import { Pagination } from './Pagination';

type Sort = 'new' | 'priceLow' | 'priceHigh' | 'views';
const PAGE_SIZE = 6;

type Props = {
  listings: Listing[]; search: string; municipality: string; category: string;
  onNotify: (m: string) => void; onReset: () => void;
};

export function ListingsSection({ listings, search, municipality, category, onNotify, onReset }: Props) {
  const [sort, setSort] = useState<Sort>('new');
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: '', max: '' });
  const [condition, setCondition] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const min = priceRange.min ? Number(priceRange.min) : -Infinity;
    const max = priceRange.max ? Number(priceRange.max) : Infinity;
    const data = listings.filter(x =>
      (!search || `${x.title} ${x.seller} ${x.category}`.toLowerCase().includes(search.toLowerCase())) &&
      (!municipality || x.municipality === municipality) &&
      (!category || x.category === category) &&
      (!condition || x.condition === condition) &&
      x.price >= min && x.price <= max
    );
    return [...data].sort((a, b) => sort === 'priceLow' ? a.price - b.price : sort === 'priceHigh' ? b.price - a.price : sort === 'views' ? (b.views || 0) - (a.views || 0) : 0);
  }, [listings, search, municipality, category, condition, priceRange, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetAll = () => { onReset(); setCondition(''); setPriceRange({ min: '', max: '' }); setPage(1); };

  return <section id="listings" className="mt-10 scroll-mt-24">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-black text-[#e7663c]"><span className="h-1.5 w-1.5 rounded-full bg-[#e7663c]"/> سوق الوادي الآن</div>
        <h2 className="mt-1 text-xl font-black sm:text-2xl">أحدث الإعلانات</h2>
        <p className="mt-1 text-xs font-semibold text-slate-400">نتائج محلية حسب بحثك وبلديتك</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden rounded-xl border border-slate-200 bg-white sm:flex">
          <button onClick={() => setSort('new')} className={`px-3 py-2 text-[11px] font-bold ${sort === 'new' ? 'text-[#e7663c]' : 'text-slate-500'}`}>الأحدث</button>
          <button onClick={() => setSort('priceLow')} className={`px-3 py-2 text-[11px] font-bold ${sort === 'priceLow' ? 'text-[#e7663c]' : 'text-slate-500'}`}>الأقل سعراً</button>
          <button onClick={() => setSort('views')} className={`px-3 py-2 text-[11px] font-bold ${sort === 'views' ? 'text-[#e7663c]' : 'text-slate-500'}`}>الأكثر مشاهدة</button>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-500">{filtered.length} إعلان</span>
      </div>
    </div>

    <div className="flex items-start gap-5">
      <ListingsSidebar priceRange={priceRange} onPriceRangeChange={r => { setPriceRange(r); setPage(1); }} condition={condition} onConditionChange={v => { setCondition(v); setPage(1); }} onReset={resetAll} />
      <div className="min-w-0 flex-1">
        {pageItems.length ? <>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {pageItems.map(x => <ListingCard key={x.id} listing={x} onContact={(l, m) => onNotify(m === 'whatsapp' ? `جاري فتح واتساب مع ${l.seller}` : `جاري الاتصال بـ ${l.seller}`)} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Search className="mx-auto text-slate-300"/>
          <p className="mt-3 text-sm font-black">لا توجد نتائج مطابقة</p>
          <button onClick={resetAll} className="mt-2 text-xs font-black text-[#e7663c]">إعادة ضبط البحث</button>
        </div>}
      </div>
    </div>
  </section>;
}
