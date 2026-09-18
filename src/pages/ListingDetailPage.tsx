import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpDown, ChevronLeft, Heart, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import type { Listing } from '../data/listings';
import { formatPrice } from '../lib/format';
import { useApp } from '../context/AppContext';
import { ListingCard } from '../components/listings/ListingCard';
import { NotFoundPage } from './NotFoundPage';
import { supabase } from '../lib/supabase';
import { toWhatsAppNumber } from '../lib/phone';

function mapRow(row: any): Listing {
  const seller = row.profiles?.full_name || 'بائع سوق الوادي';
  const images = Array.isArray(row.image_urls) ? row.image_urls.filter(Boolean) : [];
  return { id: row.id, title: row.title, price: Number(row.price || 0), image: images[0] || '/hero-eloued.webp', images, municipality: row.municipalities?.name || 'الوادي', category: row.categories?.name || 'أخرى', seller, sellerInitials: seller.slice(0,1), verified: Boolean(row.profiles?.is_verified), featured: Boolean(row.is_featured), whatsapp: row.whatsapp || row.phone || '', phone: row.phone || row.whatsapp || '', postedAt: row.published_at ? new Intl.DateTimeFormat('ar-DZ',{dateStyle:'medium'}).format(new Date(row.published_at)) : 'حديثاً', condition: 'جديد', views: row.views_count || 0, description: row.description || '' };
}

export function ListingDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [related, setRelated] = useState<Listing[]>([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const { favorites, toggleFavorite, notify } = useApp();

  useEffect(() => { window.scrollTo(0,0); }, [id]);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!supabase || !id) { setLoading(false); return; }
      setLoading(true);
      const { data, error } = await supabase.from('listings').select('id,title,price,image_urls,whatsapp,phone,status,is_featured,views_count,published_at,description,category_id,municipalities(name),categories(name),profiles!listings_seller_id_fkey(full_name,is_verified)').eq('id', id).eq('status','active').maybeSingle();
      if (!alive) return;
      if (error || !data) { setListing(null); setLoading(false); return; }
      const current = mapRow(data); setListing(current); setSelectedImage(current.images?.[0] || current.image);
      const { data: relatedRows } = await supabase.from('listings').select('id,title,price,image_urls,whatsapp,phone,status,is_featured,views_count,published_at,description,category_id,municipalities(name),categories(name),profiles!listings_seller_id_fkey(full_name,is_verified)').eq('status','active').eq('category_id', data.category_id).neq('id', id).order('published_at',{ascending:false}).limit(3);
      if (alive) setRelated((relatedRows || []).map(mapRow));
      setLoading(false);
    };
    void load(); return () => { alive = false; };
  }, [id]);

  if (loading) return <main className="mx-auto max-w-xl px-4 py-20 text-center text-sm font-bold text-slate-500">جاري تحميل الإعلان...</main>;
  if (!listing) return <NotFoundPage />;
  const favorite = favorites.includes(listing.id);
  const images = listing.images?.length ? listing.images : [listing.image];
  const whatsappNumber = toWhatsAppNumber(listing.whatsapp || listing.phone);
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`السلام عليكم، أستفسر عن: ${listing.title}`)}` : '';

  return <main className="mx-auto max-w-[1360px] px-3 py-6 sm:px-6">
    <div className="mb-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-400"><Link to="/" className="hover:text-[#e7663c]">الرئيسية</Link><ChevronLeft size={12}/><span>{listing.category}</span><ChevronLeft size={12}/><span className="truncate text-slate-600">{listing.title}</span></div>
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div><img src={selectedImage || listing.image} alt={listing.title} className="aspect-video w-full rounded-2xl object-cover"/>{images.length > 1 && <div className="mt-3 grid grid-cols-5 gap-2">{images.map((src, index) => <button type="button" key={src} aria-label={`عرض الصورة ${index + 1}`} onClick={() => setSelectedImage(src)} className={`aspect-square overflow-hidden rounded-xl border-2 ${selectedImage === src ? 'border-[#e7663c]' : 'border-transparent'}`}><img src={src} alt="" className="h-full w-full object-cover"/></button>)}</div>}<div className="mt-5 flex items-start justify-between gap-4"><div><h1 className="text-xl font-black leading-8">{listing.title}</h1><p className="mt-1 text-2xl font-black text-[#e15f39]">{formatPrice(listing.price)} <span className="text-xs">دج</span></p></div><button onClick={() => toggleFavorite(listing.id)} className={`rounded-xl border p-3 ${favorite?'text-rose-500':'text-slate-500'}`}><Heart fill={favorite?'currentColor':'none'}/></button></div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-slate-500 sm:grid-cols-4"><span className="rounded-xl bg-slate-50 p-3"><MapPin className="mb-1 text-[#e7663c]" size={15}/>{listing.municipality}</span><span className="rounded-xl bg-slate-50 p-3"><ArrowUpDown className="mb-1 text-[#e7663c]" size={15}/>{listing.views||0} مشاهدة</span>{listing.condition&&<span className="rounded-xl bg-slate-50 p-3">الحالة: {listing.condition}</span>}<span className="rounded-xl bg-slate-50 p-3">{listing.postedAt}</span></div>
      {listing.description&&<p className="mt-5 rounded-2xl border border-slate-100 bg-white p-4 text-sm leading-7 text-slate-600">{listing.description}</p>}</div>
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 rounded-2xl bg-[#eaf2f5] p-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-white font-black text-[#287f72]">{listing.sellerInitials}</span><div><b className="block text-sm">{listing.seller}</b><span className="text-[10px] text-slate-500">{listing.verified?'حساب موثق':'بائع محلي'}</span>{listing.verified&&<ShieldCheck size={13} className="mr-1 inline text-[#287f72]"/>}</div></div><div className="mt-4 grid gap-2">{whatsappUrl&&<a href={whatsappUrl} target="_blank" rel="noreferrer" onClick={()=>notify(`جاري فتح واتساب مع ${listing.seller}`)} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#287f72] text-sm font-black text-white"><MessageCircle size={17}/> واتساب</a>}{listing.phone&&<a href={`tel:${listing.phone}`} onClick={()=>notify(`جاري الاتصال بـ ${listing.seller}`)} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-black text-[#287f72]"><Phone size={16}/> اتصال</a>}</div><p className="mt-4 text-[11px] leading-5 text-slate-400">هذا الإعلان منشور بعد المراجعة. عاين السلعة وتحقق من البائع قبل الدفع.</p></aside>
    </div>
    {related.length>0&&<section className="mt-10"><h2 className="mb-4 text-lg font-black">إعلانات مشابهة</h2><div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{related.map(l=><ListingCard key={l.id} listing={l}/>)}</div></section>}
  </main>;
}
