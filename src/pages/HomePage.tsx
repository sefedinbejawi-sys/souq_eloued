import { useEffect, useState } from 'react';
import type { Listing } from '../data/listings';
import { Hero } from '../components/home/Hero';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { MunicipalitiesSection } from '../components/home/MunicipalitiesSection';
import { TrustSection } from '../components/home/TrustSection';
import { ListingsSection } from '../components/listings/ListingsSection';
import { SearchFilters } from '../components/listings/SearchFilters';
import { categories, municipalities as fallbackMunicipalities } from '../data';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

function mapRemoteListing(row: any): Listing {
  const municipality = row.municipalities?.name || 'الوادي';
  const category = row.categories?.name || 'أخرى';
  const seller = row.profiles?.full_name || 'بائع سوق الوادي';
  const images = Array.isArray(row.image_urls) ? row.image_urls.filter(Boolean) : [];
  return {
    id: row.id,
    title: row.title,
    price: Number(row.price || 0),
    image: images[0] || '/hero-eloued.webp', images,
    municipality,
    category,
    seller,
    sellerInitials: seller.slice(0, 1),
    verified: Boolean(row.profiles?.is_verified),
    featured: Boolean(row.is_featured),
    whatsapp: row.whatsapp || row.phone || '',
    phone: row.phone || row.whatsapp || '',
    postedAt: row.published_at ? new Intl.DateTimeFormat('ar-DZ', { dateStyle: 'medium' }).format(new Date(row.published_at)) : 'حديثاً',
    condition: 'جديد',
    views: row.views_count || 0,
    description: row.description || '',
  };
}

export function HomePage() {
  const [search, setSearch] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [category, setCategory] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [municipalities, setMunicipalities] = useState(fallbackMunicipalities);
  const [loading, setLoading] = useState(Boolean(supabase));
  const { notify, setModal } = useApp();

  const loadMarketplace = async () => {
    if (!supabase) return;
    setLoading(true);
    const [listingResult, municipalityResult] = await Promise.all([
      supabase.from('listings').select('id,title,price,image_urls,whatsapp,phone,status,is_featured,views_count,published_at,description,municipalities(name),categories(name),profiles!listings_seller_id_fkey(full_name,is_verified)').eq('status', 'active').or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).order('published_at', { ascending: false }).limit(60),
      supabase.from('municipalities').select('name').eq('is_active', true).order('name').limit(50),
    ]);
    if (listingResult.error) {
      setListings([]);
      notify('تعذر تحميل الإعلانات من قاعدة البيانات.');
    } else {
      setListings((listingResult.data || []).map(mapRemoteListing));
    }
    if (!municipalityResult.error && municipalityResult.data?.length) setMunicipalities(municipalityResult.data.map(item => item.name));
    setLoading(false);
  };

  useEffect(() => {
    void loadMarketplace();
    const refresh = () => void loadMarketplace();
    window.addEventListener('souq:listing-created', refresh);
    return () => window.removeEventListener('souq:listing-created', refresh);
  }, []);

  const scroll = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const reset = () => { setSearch(''); setMunicipality(''); setCategory(''); };
  const categoryCounts = listings.reduce<Record<string, number>>((result, listing) => { result[listing.category] = (result[listing.category] || 0) + 1; return result; }, {});

  return <main id="home" className="mx-auto max-w-[1360px] px-3 sm:px-6">
    <Hero search={search} municipality={municipality} category={category} onSearchChange={setSearch} onMunicipalityChange={setMunicipality} onCategoryChange={setCategory} onSubmit={() => scroll('listings')} />
    <section className="relative z-10 -mt-5 mx-1 sm:-mt-6 sm:mx-2"><SearchFilters search={search} municipality={municipality} category={category} municipalities={municipalities} categories={categories.map(x => x.name)} onSearchChange={setSearch} onMunicipalityChange={setMunicipality} onCategoryChange={setCategory} /></section>
    <CategoryGrid active={category} counts={categoryCounts} onSelect={c => { setCategory(c); scroll('listings'); }} onShowAll={() => setModal('allCategories')} />
    {!loading && !listings.length && <div className="mb-5 rounded-2xl border border-dashed border-slate-200 bg-white p-7 text-center"><b className="block text-sm text-[#18394c]">لا توجد إعلانات منشورة حالياً</b><span className="mt-1 block text-xs font-semibold text-slate-400">الإعلانات تظهر هنا بعد مراجعتها والموافقة عليها من الإدارة.</span></div>}
    {loading && <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-center text-xs font-bold text-slate-500">جاري تحميل أحدث الإعلانات من سوق الوادي...</div>}
    <ListingsSection listings={listings} search={search} municipality={municipality} category={category} onNotify={notify} onReset={reset} />
    <MunicipalitiesSection onSelect={m => { setMunicipality(m); scroll('listings'); }} />
    <TrustSection />
  </main>;
}
