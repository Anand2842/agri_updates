import Image from 'next/image';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types/database';
import { Metadata } from 'next';

export const revalidate = 0;

async function getPost(slug: string) {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*, authors(*)')
            .eq('slug', slug)
            .single();

        if (error || !data) {
            // Fallback Mock Check
            console.log(`Supabase fetch failed or empty for slug: ${slug}, checking mock/fallback logic.`);
            // Quick Mock Match for Demo Purposes
            if (slug === 'ai-crop-yield-model') return {
                id: 'mock-id-1', // Added mock ID for comments
                title: 'New AI Model Predicts Crop Yield with 98% Accuracy',
                category: 'Research',
                author_name: 'Dr. Sarah Jenkins',
                published_at: new Date().toISOString(),
                image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80',
                excerpt: 'Researchers at MIT have developed a new machine learning algorithm that significantly improves yield predictions.',
                content: `
              <p class="mb-4">Researchers at MIT have developed a new machine learning algorithm that significantly improves yield predictions.</p>
              <p class="mb-4">The model analyzes satellite imagery, weather patterns, and soil data to predict crop yields with unprecedented accuracy. This breakthrough could help farmers optimize their harvest schedules and reduce waste.</p>
              <h3 class="text-xl font-serif font-bold mt-6 mb-3">The Methodology</h3>
              <p class="mb-4">Using a convolutional neural network (CNN), the team trained the model on over 10,000 hours of aerial footage. The results showed a 15% improvement over traditional statistical models.</p>
            `
            };
            if (slug === 'autonomous-drones') return {
                id: 'mock-id-2',
                title: 'The Rise of Autonomous Drones in Precision Agriculture',
                category: 'Technology',
                author_name: 'Dr. Arjun Singh',
                published_at: new Date().toISOString(),
                image_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80',
                excerpt: 'Startup swarms are deploying AI-powered drones to plant, monitor, and harvest.',
                content: `
               <p class="mb-4">Amid growing concerns over labor shortages and climate change, startups are deploying swarms of AI-powered drones to plant, monitor, and harvest crops with unprecedented efficiency.</p>
               <p class="mb-4">These drones act as autonomous agents, communicating with each other to cover vast areas of farmland without human intervention.</p>
             `
            };

            return null;
        }

        return data;
    } catch (e) {
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        return {
            title: 'Article Not Found | Agri Updates',
        };
    }

    return {
        title: `${post.title} | Agri Updates`,
        description: post.excerpt || post.content.substring(0, 160) + '...',
        openGraph: {
            title: post.title,
            description: post.excerpt || post.content.substring(0, 160) + '...',
            images: [post.image_url || '/placeholder.jpg'],
            type: 'article',
            publishedTime: post.published_at,
            authors: [post.authors?.name || post.author_name],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt || post.content.substring(0, 160) + '...',
            images: [post.image_url || '/placeholder.jpg'],
        },
        alternates: {
            canonical: `/blog/${slug}`,
        },
    };
}

// Helper to format plain text content into paragraphs if no HTML tags are found
function formatContent(content: string) {
    if (!content) return '';
    // If it already contains HTML tags like <p>, <div>, <br>, assume it's formatted
    if (/<[a-z][\s\S]*>/i.test(content)) return content;

    // Otherwise, split by newlines and wrap in <p>
    return content
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => `<p class="mb-4">${line.trim()}</p>`)
        .join('');
}

import ViewCounter from '@/components/analytics/ViewCounter';
import CommentSection from '@/components/blog/CommentSection';
import AdPlaceholder from '@/components/ads/AdPlaceholder';

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: post.title,
        description: post.excerpt || post.content?.substring(0, 160),
        image: [post.image_url || 'https://agriupdates.com/og-image.png'],
        datePublished: post.published_at,
        dateModified: post.updated_at || post.published_at,
        author: [{
            '@type': 'Person',
            name: post.authors?.name || post.author_name,
            url: post.authors?.social_links?.linkedin || post.author_social_linkedin || undefined, // Publisher Trust Graph: Link to profile
            sameAs: [
                post.authors?.social_links?.linkedin || post.author_social_linkedin,
                post.authors?.social_links?.twitter || post.author_social_twitter
            ].filter(Boolean) as string[],
        }],
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://agriupdates.com'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://agriupdates.com/blog'
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: `https://agriupdates.com/blog/${slug}`
            }
        ]
    };

    return (
        <article className="min-h-screen bg-white pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {post.id && <ViewCounter postId={post.id} />}
            <div className="relative h-[60vh] w-full">
                <Image
                    src={post.image_url || '/placeholder.jpg'}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-x-0 bottom-0 container mx-auto px-4 pb-12">
                    {post.is_featured && (
                        <span className="inline-block bg-agri-green text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 mb-4 mr-2">
                            Featured
                        </span>
                    )}
                    <span className="inline-block bg-agri-green text-white text-xs font-bold uppercase tracking-widest px-3 py-1 mb-4">
                        {post.category}
                    </span>
                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-tight mb-4">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-4 text-white/80 text-sm font-bold uppercase tracking-widest">
                        {(post.authors?.avatar_url || post.author_image) && (
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                                <Image
                                    src={post.authors?.avatar_url || post.author_image || '/placeholder-avatar.jpg'}
                                    alt={post.authors?.name || post.author_name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <span>By {post.authors?.name || post.author_name}</span>
                        <span>•</span>
                        <span>{new Date(post.published_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 lg:col-start-3">
                    <AdPlaceholder type="banner" />
                    <div
                        className="prose prose-lg prose-stone max-w-none font-serif prose-headings:font-bold prose-a:text-agri-green hover:prose-a:text-agri-dark"
                        dangerouslySetInnerHTML={{ __html: formatContent(post.content || post.excerpt) }}
                    />

                    <div className="mt-16 p-8 bg-stone-50 rounded-xl border border-stone-100 flex flex-col md:flex-row gap-8 items-start">
                        <div className="relative w-24 h-24 flex-shrink-0 rounded-full overflow-hidden bg-stone-200 border-2 border-white shadow-sm">
                            {(post.authors?.avatar_url || post.author_image) ? (
                                <Image
                                    src={post.authors?.avatar_url || post.author_image || '/placeholder-avatar.jpg'}
                                    alt={post.authors?.name || post.author_name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400 font-serif text-2xl font-bold">
                                    {(post.authors?.name || post.author_name).charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-serif font-bold mb-2">About {post.authors?.name || post.author_name}</h3>
                            <p className="text-stone-600 mb-4 leading-relaxed">
                                {post.authors?.bio || post.author_bio || `${post.authors?.name || post.author_name} is a regular contributor to Agri Updates, covering the latest in agricultural research and innovation.`}
                            </p>
                            <div className="flex gap-4">
                                {(post.authors?.social_links?.linkedin || post.author_social_linkedin) && (
                                    <a href={post.authors?.social_links?.linkedin || post.author_social_linkedin} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-blue-700 transition-colors">
                                        Linkedin
                                    </a>
                                )}
                                {(post.authors?.social_links?.twitter || post.author_social_twitter) && (
                                    <a href={post.authors?.social_links?.twitter || post.author_social_twitter} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-black transition-colors">
                                        Twitter
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <AdPlaceholder type="banner" />
                </div>
            </div>

            {post.id && <CommentSection postId={post.id} />}
        </article>
    );
}
