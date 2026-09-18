import { useEffect, type ReactNode } from 'react';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

type StaticPageProps = { title: string; description: string; eyebrow?: string; children: ReactNode };

export function StaticPage({ title, description, eyebrow = 'سوق الوادي', children }: StaticPageProps) {
  const location = useLocation();
  useEffect(() => {
    document.title = `${title} | سوق الوادي`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
    meta.setAttribute('content', description);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', `https://souq.myeloued.com${location.pathname}`);
    const schemaId = 'souq-page-schema';
    let schema = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!schema) { schema = document.createElement('script'); schema.id = schemaId; schema.type = 'application/ld+json'; document.head.appendChild(schema); }
    schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'Organization', name: 'سوق الوادي', url: 'https://souq.myeloued.com', areaServed: 'ولاية الوادي، الجزائر' }, { '@type': 'WebPage', name: title, description, url: `https://souq.myeloued.com${location.pathname}`, isPartOf: { '@type': 'WebSite', name: 'سوق الوادي', url: 'https://souq.myeloued.com' }, inLanguage: 'ar-DZ' }] });
    return () => { document.title = 'سوق الوادي — السوق المحلي في ولاية الوادي'; };
  }, [title, description, location.pathname]);

  return <main dir="rtl" className="mx-auto max-w-[1180px] px-3 py-7 sm:px-6 sm:py-12">
    <nav aria-label="مسار التنقل" className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-400"><Link to="/" className="transition hover:text-[#e7663c]">الرئيسية</Link><span>/</span><span className="text-[#18394c]">{title}</span></nav>
    <header className="relative overflow-hidden rounded-[2rem] bg-[#18394c] px-6 py-10 text-white shadow-xl shadow-[#18394c]/10 sm:px-12 sm:py-14">
      <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-[#e7663c]/25 blur-3xl"/><div className="absolute -bottom-28 right-1/3 h-56 w-56 rounded-full bg-[#f2c078]/15 blur-3xl"/>
      <div className="relative max-w-3xl"><div className="mb-5 flex items-center gap-2 text-xs font-black tracking-wide text-[#ffd4c6]"><Sparkles size={15}/> {eyebrow}</div><h1 className="text-3xl font-black leading-tight sm:text-5xl">{title}</h1><p className="mt-5 max-w-2xl text-sm font-semibold leading-8 text-white/75 sm:text-base">{description}</p></div>
    </header>
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start"><article className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-9"><div className="prose-souq">{children}</div></article><aside className="grid gap-4"><div className="rounded-3xl bg-[#fff4ef] p-5"><ShieldCheck className="text-[#e7663c]" size={24}/><h2 className="mt-3 text-sm font-black text-[#18394c]">تجربة محلية موثوقة</h2><p className="mt-2 text-xs font-bold leading-6 text-slate-500">نصمم سوق الوادي ليكون واضحاً، قريباً من المستخدم، وسهل الوصول على الهاتف.</p></div><Link to="/" className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 text-sm font-black text-[#18394c] transition hover:border-[#e7663c] hover:text-[#e7663c]">العودة إلى السوق <ArrowLeft size={17}/></Link></aside></div>
  </main>;
}
