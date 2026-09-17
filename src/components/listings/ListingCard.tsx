import type { ComponentProps } from 'react';
import { MapPin, MessageCircle, Phone, ShieldCheck, Star } from 'lucide-react';

export type Listing = {
  id: string;
  title: string;
  price: number;
  image: string;
  municipality: string;
  category: string;
  seller: string;
  sellerInitials: string;
  verified?: boolean;
  featured?: boolean;
  whatsapp: string;
  phone: string;
  postedAt: string;
};

type ListingCardProps = ComponentProps<'article'> & {
  listing: Listing;
  onContact?: (listing: Listing, method: 'whatsapp' | 'phone') => void;
};

export function formatPrice(price: number) {
  return new Intl.NumberFormat('ar-DZ').format(price);
}

export function ListingCard({ listing, onContact }: ListingCardProps) {
  const whatsappUrl = `https://wa.me/${listing.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`السلام عليكم، أستفسر عن: ${listing.title}`)}`;

  return (
    <article className="group overflow-hidden rounded-[22px] border border-stone-200 bg-white shadow-[0_8px_30px_rgba(87,65,40,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(87,65,40,0.12)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <img src={listing.image} alt={listing.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          {listing.featured ? <span className="rounded-full bg-[#f4c95d] px-3 py-1 text-xs font-bold text-[#3b2b16]">إعلان مميز</span> : <span />}
          <button aria-label="حفظ الإعلان" className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-stone-600 backdrop-blur transition hover:text-[#db6b3f]"><Star size={16} /></button>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-[17px] font-extrabold leading-7 text-[#2e3c2b]">{listing.title}</h3>
          <span className="shrink-0 rounded-lg bg-[#fdf3e5] px-2 py-1 text-[11px] font-bold text-[#a65d2f]">جديد</span>
        </div>
        <p className="mb-3 text-xl font-black text-[#c85e34]">{formatPrice(listing.price)} <span className="text-sm font-bold">دج</span></p>
        <div className="mb-4 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1"><MapPin size={14} className="text-[#d8784a]" />{listing.municipality}</span>
          <span>{listing.postedAt}</span>
        </div>
        <div className="mb-4 flex items-center gap-2 border-t border-stone-100 pt-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e8f0e5] text-xs font-black text-[#55714b]">{listing.sellerInitials}</span>
          <span className="text-xs font-bold text-stone-600">{listing.seller}</span>
          {listing.verified && <ShieldCheck size={15} className="text-[#709a63]" />}
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <a href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => onContact?.(listing, 'whatsapp')} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#4e9a58] text-sm font-extrabold text-white transition hover:bg-[#3e8248] active:scale-[0.98]"><MessageCircle size={17} /> واتساب</a>
          <a href={`tel:${listing.phone}`} onClick={() => onContact?.(listing, 'phone')} aria-label="اتصال هاتفي" className="grid h-11 w-12 place-items-center rounded-xl border border-stone-200 bg-stone-50 text-[#55714b] transition hover:bg-[#e8f0e5] active:scale-[0.98]"><Phone size={17} /></a>
        </div>
      </div>
    </article>
  );
}
