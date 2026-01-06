import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    const baseUrl = 'https://agriupdates.com';

    // Google News sitemaps should only contain articles from the last 2 days
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: posts } = await supabase
        .from('posts')
        .select('slug, title, published_at, category')
        .gte('published_at', twoDaysAgo)
        .order('published_at', { ascending: false });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${posts?.map((post) => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Agri Updates</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${post.published_at}</news:publication_date>
      <news:title>${post.title.replace(/&/g, '&amp;')}</news:title>
    </news:news>
  </url>
  `).join('') || ''}
</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
