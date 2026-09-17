import { Heart, MapPin, MessageCircle, Phone, ShieldCheck, Star } from 'lucide-react';
import type { ComponentProps } from 'react';

export type Listing = {
  id: string; title: string; price: number; image: string; municipality: string; category: string;
  seller: string; sellerInitials: string; verified?: boolean; featured?: boolean; whatsapp: string; phone: string;
  postedAt: string; condition?: 'جديد' | 'مستعمل' | 'خدمة'; views?: number;
};

type Props = ComponentProps<'article'> & { listing: Listing; favorite?: boolean; onFavorite?: (id:string)=>void; onOpen?: (listing:Listing)=>void; onContact?: (listing:Listing, method:'whatsapp'|'phone')=>void };
export const formatPrice = (price:number) => new Intl.NumberFormat('ar-DZ').format(price);

export function ListingCard({ listing, favorite=false, onFavorite, onOpen, onContact }: Props) {
  const whatsappUrl = `https://wa.me/${listing.whatsapp.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(`السلام عليكم، أستفسر عن: ${listing.title}`)}`;
  return <article className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_5px_22px_rgba(15,32,45,.045)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,32,45,.10)]">
    <button className="block w-full text-right" onClick={()=>onOpen?.(listing)}>
      <div className="relative aspect-[1.18] overflow-hidden bg-slate-100"><img src={listing.image} alt={listing.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-3 top-3 flex justify-between"><div className="flex gap-1.5">{listing.featured && <span className="rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-black text-amber-950"><Star size={11} className="inline -mt-0.5"/> مميز</span>}{listing.condition && <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black text-slate-700">{listing.condition}</span>}</div>
          <span onClick={(e)=>{e.preventDefault();e.stopPropagation();onFavorite?.(listing.id)}} className={`grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-sm ${favorite?'text-rose-500':'text-slate-500'}`}><Heart size={16} fill={favorite?'currentColor':'none'}/></span>
        </div>
      </div>
      <div className="p-4"><h3 className="line-clamp-2 min-h-[48px] text-[14px] font-extrabold leading-6 text-slate-900">{listing.title}</h3>
        <p className="mt-2 text-xl font-black text-[#e15f39]">{formatPrice(listing.price)} <span className="text-xs">دج</span></p>
        <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-slate-400"><span className="flex items-center gap-1"><MapPin size={13} className="text-[#e8663d]"/>{listing.municipality}</span><span>{listing.postedAt}</span></div>
        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#eaf2f5] text-[10px] font-black text-[#287f72]">{listing.sellerInitials}</span><span className="truncate text-xs font-bold text-slate-600">{listing.seller}</span>{listing.verified&&<ShieldCheck size={14} className="text-[#287f72]"/>}</div>
      </div>
    </button>
    <div className="grid grid-cols-[1fr_auto] gap-2 px-4 pb-4"><a href={whatsappUrl} target="_blank" rel="noreferrer" onClick={()=>onContact?.(listing,'whatsapp')} className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#287f72] text-xs font-extrabold text-white hover:bg-[#216a60]"><MessageCircle size={15}/> واتساب</a><a href={`tel:${listing.phone}`} onClick={()=>onContact?.(listing,'phone')} className="grid h-10 w-11 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-[#287f72]"><Phone size={15}/></a></div>
  </article>;
}
