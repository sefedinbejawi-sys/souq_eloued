const siteUrl = 'https://souq.myeloued.com';
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qobfcfmnarkiaojvtwsc.supabase.co';
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[character] || character));

type SitemapResponse = { setHeader: (name: string, value: string) => SitemapResponse; send: (body: string) => void };
export default async function handler(request: { method?: string }, response: { status: (code: number) => SitemapResponse }) {
  if (request.method && request.method !== 'GET') return response.status(405).setHeader('Allow', 'GET').send('Method Not Allowed');
  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (publishableKey) { headers.apikey = publishableKey; headers.Authorization = `Bearer ${publishableKey}`; }
    const result = await fetch(`${supabaseUrl}/rest/v1/listings?select=id,updated_at,published_at&status=eq.active&order=published_at.desc&limit=50000`, { headers });
    const listings = result.ok ? await result.json() as Array<{ id: string; updated_at?: string; published_at?: string }> : [];
    const staticUrls = ['/', '/about', '/contact', '/terms', '/privacy', '/categories'];
    const urls = staticUrls.map(path => `<url><loc>${siteUrl}${path}</loc><changefreq>daily</changefreq><priority>${path === '/' ? '1.0' : '0.5'}</priority></url>`);
    for (const listing of listings) {
      const lastmod = listing.updated_at || listing.published_at;
      urls.push(`<url><loc>${siteUrl}/listing/${encodeURIComponent(listing.id)}</loc>${lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>0.8</priority></url>`);
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`;
    return response.status(200).setHeader('Content-Type', 'application/xml; charset=utf-8').setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600').send(xml);
  } catch {
    return response.status(200).setHeader('Content-Type', 'application/xml; charset=utf-8').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc><priority>1.0</priority></url></urlset>`);
  }
}
