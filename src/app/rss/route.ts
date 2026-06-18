import { supabase } from '@/lib/supabase';

export const revalidate = 3600;

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export async function GET() {
    const baseUrl = 'https://www.agriupdates.online';

    const { data: posts } = await supabase
        .from('posts')
        .select('slug, title, excerpt, published_at, updated_at, category, author_name, content')
        .eq('status', 'published')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(50);

    const items = (posts || []).map((post) => {
        const description = post.excerpt || (post.content || '').replace(/<[^>]*>/g, '').substring(0, 300);
        return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description>${escapeXml(description)}</description>
      <category>${escapeXml(post.category)}</category>
      <author>${escapeXml(post.author_name || 'Agri Updates')}</author>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
      ${post.updated_at ? `<lastBuildDate>${new Date(post.updated_at).toUTCString()}</lastBuildDate>` : ''}
    </item>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Agri Updates</title>
    <link>${baseUrl}</link>
    <description>India's trusted platform for agricultural jobs, grants &amp; funding, startup news, and agri-warnings.</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
    });
}
