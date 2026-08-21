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
    const now = new Date();

    // 1. Core High-Intent Static Routes
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
        { url: `${baseUrl}/jobs`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/updates`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/exams`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/scholarships`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/fellowships`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/internships`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/warnings`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
        { url: `${baseUrl}/conferences`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/startups`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/startups/directory`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/featured-listings`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/search`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/editorial-guidelines`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/corrections`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/newsletter`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/disclaimer`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ];

    // 2. Dynamic: All published articles & stories
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
                    url: `${baseUrl}/blog/${encodeURIComponent(post.slug)}`,
                    lastModified: post.updated_at || post.published_at || post.created_at || now.toISOString(),
                    changeFrequency: (post.category === 'Jobs' ? 'weekly' : 'daily') as 'weekly' | 'daily',
                    priority: post.category === 'Jobs' ? 0.7 : 0.8,
                }));
        }
    } catch (e) {
        console.error('Sitemap posts query error:', e);
    }

    // 3. Dynamic: E-E-A-T Author Profiles
    let authorRoutes: MetadataRoute.Sitemap = [];
    try {
        const { data: authors } = await supabase
            .from('authors')
            .select('slug, updated_at, created_at');

        if (authors) {
            authorRoutes = authors
                .filter((author) => isValidSlug(author.slug))
                .map((author) => ({
                    url: `${baseUrl}/author/${encodeURIComponent(author.slug)}`,
                    lastModified: author.updated_at || author.created_at || now.toISOString(),
                    changeFrequency: 'monthly' as const,
                    priority: 0.5,
                }));
        }
    } catch (e) {
        console.error('Sitemap authors query error:', e);
    }

    return [...staticRoutes, ...postRoutes, ...authorRoutes];
}
