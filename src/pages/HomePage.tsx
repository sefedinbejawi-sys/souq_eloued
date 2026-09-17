import { useState } from 'react';
import { initialListings } from '../data/listings';
import { Hero } from '../components/home/Hero';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { MunicipalitiesSection } from '../components/home/MunicipalitiesSection';
import { TrustSection } from '../components/home/TrustSection';
import { ListingsSection } from '../components/listings/ListingsSection';
import { SearchFilters } from '../components/listings/SearchFilters';
import { categories, municipalities } from '../data';
import { useApp } from '../context/AppContext';

export function HomePage() {
  const [search, setSearch] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [category, setCategory] = useState('');
  const { notify, setModal } = useApp();

  const scroll = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const reset = () => { setSearch(''); setMunicipality(''); setCategory(''); };

  return <main id="home" className="mx-auto max-w-[1360px] px-3 sm:px-6">
    <Hero search={search} municipality={municipality} category={category} onSearchChange={setSearch} onMunicipalityChange={setMunicipality} onCategoryChange={setCategory} onSubmit={() => scroll('listings')} />

    <section className="relative z-10 -mt-5 mx-1 sm:-mt-6 sm:mx-2">
      <SearchFilters search={search} municipality={municipality} category={category} municipalities={municipalities} categories={categories.map(x => x.name)} onSearchChange={setSearch} onMunicipalityChange={setMunicipality} onCategoryChange={setCategory} />
    </section>

    <CategoryGrid active={category} onSelect={c => { setCategory(c); scroll('listings'); }} onShowAll={() => setModal('allCategories')} />

    <ListingsSection listings={initialListings} search={search} municipality={municipality} category={category} onNotify={notify} onReset={reset} />

    <MunicipalitiesSection onSelect={m => { setMunicipality(m); scroll('listings'); }} />
    <TrustSection />
  </main>;
}
