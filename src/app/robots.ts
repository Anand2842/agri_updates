import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/'],
        },
        sitemap: [
            'https://www.agriupdates.online/sitemap.xml',
            'https://www.agriupdates.online/sitemap-news.xml',
        ],
    };
}
