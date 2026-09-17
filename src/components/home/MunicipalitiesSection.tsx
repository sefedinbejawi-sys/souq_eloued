import { MapPin } from 'lucide-react';
import { municipalities } from '../../data';

export function MunicipalitiesSection({ onSelect }: { onSelect: (name: string) => void }) {
  return <section className="my-10 rounded-3xl bg-white p-5 shadow-sm sm:p-7">
    <div className="flex items-center justify-between">
      <div><p className="text-[11px] font-black text-[#e7663c]">المحلية أولاً</p><h2 className="mt-1 text-xl font-black">تصفح حسب البلدية</h2></div>
      <MapPin className="text-[#e7663c]"/>
    </div>
    <div className="mt-5 flex flex-wrap gap-2">
      {municipalities.map(x => <button key={x} onClick={() => onSelect(x)} className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-[11px] font-bold text-slate-600 hover:border-[#e7663c] hover:bg-[#fff3ef] hover:text-[#d65230]">{x}</button>)}
    </div>
  </section>;
}
