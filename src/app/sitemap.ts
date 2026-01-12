import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

// Helper to get all routes
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://agriupdates.com';

    // 1. Static Routes
    const routes = [
        '',
        '/jobs',
        '/updates',
        '/startups',
        '/newsletter',
        '/contact',
        '/about',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 2. Dynamic Routes: Jobs (from posts table)
    let jobRoutes: MetadataRoute.Sitemap = [];
    try {
        const { data: jobs } = await supabase
            .from('posts')
            .select('id, slug, created_at')
            .eq('category', 'Jobs')
            .eq('is_active', true);

        if (jobs) {
            jobRoutes = jobs.map((job) => ({
                url: `${baseUrl}/jobs/${job.slug}`,
                lastModified: job.created_at,
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            }));
        }
    } catch (e) {
        console.error('Sitemap Jobs Error:', e);
    }

    // 3. Dynamic Routes: Posts (Blog)
    let postRoutes: MetadataRoute.Sitemap = [];
    try {
        const { data: posts } = await supabase
            .from('posts')
            .select('slug, published_at');

        if (posts) {
            postRoutes = posts.map((post) => ({
                url: `${baseUrl}/blog/${post.slug}`,
                lastModified: post.published_at || new Date().toISOString(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }));
        }
    } catch (e) {
        console.error('Sitemap Posts Error:', e);
    }

    return [...routes, ...jobRoutes, ...postRoutes];
}
