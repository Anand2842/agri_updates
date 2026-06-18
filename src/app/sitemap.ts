import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

function isValidSlug(slug: string): boolean {
    if (!slug || slug.length < 3) return false;
    if (/\s/.test(slug)) return false;
    if (/%[0-9A-Fa-f]{2}/.test(slug)) return false;
    if (/\+/.test(slug)) return false;
    return true;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.agriupdates.online';

    // Static routes — only include pages that actually exist
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/jobs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/updates`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/startups`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/newsletter`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/disclaimer`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ];

    // Dynamic: All published posts — ONE entry per post, using the canonical /blog/ path
    let postRoutes: MetadataRoute.Sitemap = [];
    try {
        const { data: posts } = await supabase
            .from('posts')
            .select('slug, category, published_at, updated_at, created_at, is_active')
            .eq('status', 'published')
            .eq('is_active', true);

        if (posts) {
            postRoutes = posts
                .filter((post) => isValidSlug(post.slug))
                .map((post) => ({
                    url: `${baseUrl}/blog/${post.slug}`,
                    lastModified: post.updated_at || post.published_at || post.created_at || new Date().toISOString(),
                    changeFrequency: (post.category === 'Jobs' ? 'weekly' : 'daily') as 'weekly' | 'daily',
                    priority: post.category === 'Jobs' ? 0.6 : 0.7,
                }));
        }
    } catch (e) {
        console.error('Sitemap posts query error:', e);
    }

    return [...staticRoutes, ...postRoutes];
}
