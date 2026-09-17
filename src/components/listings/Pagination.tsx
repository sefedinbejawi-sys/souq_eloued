import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = { page: number; totalPages: number; onChange: (p: number) => void };

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return <div className="mt-6 flex items-center justify-center gap-1.5">
    <button disabled={page === 1} onClick={() => onChange(page - 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30"><ChevronRight size={16}/></button>
    {pages.map(p => <button key={p} onClick={() => onChange(p)} className={`h-9 min-w-9 rounded-lg px-2 text-xs font-black ${p === page ? 'bg-[#e7663c] text-white' : 'border border-slate-200 text-slate-500 hover:border-[#e7663c] hover:text-[#e7663c]'}`}>{p}</button>)}
    <button disabled={page === totalPages} onClick={() => onChange(page + 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30"><ChevronLeft size={16}/></button>
  </div>;
}
