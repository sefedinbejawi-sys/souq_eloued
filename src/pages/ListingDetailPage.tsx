import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpDown, ChevronLeft, Heart, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { initialListings } from '../data/listings';
import { formatPrice } from '../lib/format';
import { useApp } from '../context/AppContext';
import { ListingCard } from '../components/listings/ListingCard';
import { NotFoundPage } from './NotFoundPage';

export function ListingDetailPage() {
  const { id } = useParams();
  const listing = initialListings.find(x => x.id === id);
  const { favorites, toggleFavorite, notify } = useApp();

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!listing) return <NotFoundPage />;

  const favorite = favorites.includes(listing.id);
  const whatsappUrl = `https://wa.me/${listing.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`السلام عليكم، أستفسر عن: ${listing.title}`)}`;
  const related = initialListings.filter(x => x.category === listing.category && x.id !== listing.id).slice(0, 3);

  return <main className="mx-auto max-w-[1360px] px-3 py-6 sm:px-6">
    <div className="mb-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
      <Link to="/" className="hover:text-[#e7663c]">الرئيسية</Link><ChevronLeft size={12}/>
      <span>{listing.category}</span><ChevronLeft size={12}/>
      <span className="truncate text-slate-600">{listing.title}</span>
    </div>

    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <img src={listing.image} alt={listing.title} className="aspect-video w-full rounded-2xl object-cover"/>
        <div className="mt-5 flex items-start justify-between gap-4">
          <div><h1 className="text-xl font-black leading-8">{listing.title}</h1><p className="mt-1 text-2xl font-black text-[#e15f39]">{formatPrice(listing.price)} <span className="text-xs">دج</span></p></div>
          <button onClick={() => toggleFavorite(listing.id)} className={`rounded-xl border p-3 ${favorite ? 'text-rose-500' : 'text-slate-500'}`}><Heart fill={favorite ? 'currentColor' : 'none'}/></button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-slate-500 sm:grid-cols-4">
          <span className="rounded-xl bg-slate-50 p-3"><MapPin className="mb-1 text-[#e7663c]" size={15}/>{listing.municipality}</span>
          <span className="rounded-xl bg-slate-50 p-3"><ArrowUpDown className="mb-1 text-[#e7663c]" size={15}/>{listing.views || 0} مشاهدة</span>
          {listing.condition && <span className="rounded-xl bg-slate-50 p-3">الحالة: {listing.condition}</span>}
          <span className="rounded-xl bg-slate-50 p-3">{listing.postedAt}</span>
        </div>
        {listing.description && <p className="mt-5 rounded-2xl border border-slate-100 bg-white p-4 text-sm leading-7 text-slate-600">{listing.description}</p>}
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 rounded-2xl bg-[#eaf2f5] p-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white font-black text-[#287f72]">{listing.sellerInitials}</span>
          <div><b className="block text-sm">{listing.seller}</b><span className="text-[10px] text-slate-500">{listing.verified ? 'حساب موثق' : 'بائع محلي'}</span>{listing.verified && <ShieldCheck size={13} className="mr-1 inline text-[#287f72]"/>}</div>
        </div>
        <div className="mt-4 grid gap-2">
          <a href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => notify(`جاري فتح واتساب مع ${listing.seller}`)} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#287f72] text-sm font-black text-white"><MessageCircle size={17}/> واتساب</a>
          <a href={`tel:${listing.phone}`} onClick={() => notify(`جاري الاتصال بـ ${listing.seller}`)} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-black text-[#287f72]"><Phone size={16}/> اتصال</a>
        </div>
        <p className="mt-4 text-[11px] leading-5 text-slate-400">عاين السلعة وتحقق من البائع قبل الدفع، ولا ترسل بياناتك الحساسة.</p>
      </aside>
    </div>

    {related.length > 0 && <section className="mt-10">
      <h2 className="mb-4 text-lg font-black">إعلانات مشابهة</h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {related.map(l => <ListingCard key={l.id} listing={l} />)}
      </div>
    </section>}
  </main>;
}
