import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // Cache for 1 hour

function escapeXml(str: string): string {
    return (str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export async function GET() {
    const baseUrl = 'https://www.agriupdates.online';

    // Google News sitemaps should only contain published articles from the last 2 days
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: posts } = await supabase
        .from('posts')
        .select('slug, title, published_at, category')
        .eq('status', 'published')
        .eq('is_active', true)
        .gte('published_at', twoDaysAgo)
        .order('published_at', { ascending: false });

    const items = (posts || []).map((post) => `  <url>
    <loc>${baseUrl}/blog/${encodeURIComponent(post.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>Agri Updates</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(post.published_at).toISOString()}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>`).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
    });
}
