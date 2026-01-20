import Image from 'next/image';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import ViewCounter from '@/components/analytics/ViewCounter';
import CommentSection from '@/components/blog/CommentSection';
import RelatedPosts from '@/components/blog/RelatedPosts';
import AdBanner from '@/components/ads/AdBanner';
import PostContent from '@/components/PostContent';
import SocialShare from '@/components/blog/SocialShare';
import { safeDateFormat } from '@/lib/utils/date';

export const revalidate = 0;

async function getPost(slug: string) {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*, authors(*)')
            .eq('slug', slug)
            .eq('status', 'published')
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
    } catch {
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
        articleSection: post.category,
        about: {
            '@type': 'Thing',
            name: post.category,
        },
        keywords: post.tags?.join(', ') || post.category,
        author: [{
            '@type': 'Person',
            name: post.authors?.name || post.author_name,
            url: post.authors?.social_links?.linkedin || post.author_social_linkedin || undefined,
            sameAs: [
                post.authors?.social_links?.linkedin || post.author_social_linkedin,
                post.authors?.social_links?.twitter || post.author_social_twitter
            ].filter(Boolean) as string[],
        }],
        publisher: {
            '@type': 'Organization',
            name: 'Agri Updates',
            url: 'https://agriupdates.com',
            logo: {
                '@type': 'ImageObject',
                url: 'https://agriupdates.com/logo.png'
            }
        }
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
        <article className="min-h-screen bg-white pb-20 overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {post.id && <ViewCounter postId={post.id} />}
            {/* Hero Section with Background */}
            <div className="relative bg-stone-900">
                {/* Background Image - Absolute positioned */}
                <Image
                    src={post.image_url || '/placeholder.jpg'}
                    alt={post.title}
                    fill
                    sizes="100vw"
                    className="object-cover opacity-60"
                    priority
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/50 to-transparent" />

                {/* Content - Positioned relatively to push down content below */}
                <div className="relative z-10 container mx-auto px-4 py-12 md:py-24 lg:py-32">
                    <div className="max-w-3xl pt-8 md:pt-16">
                        {post.is_featured && (
                            <span className="inline-block bg-agri-green text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 mb-3 mr-2">
                                Featured
                            </span>
                        )}
                        <span className="inline-block bg-agri-green text-white text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 py-1 mb-3">
                            {post.category}
                        </span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 drop-shadow-md">
                            {post.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-white/90 text-[11px] md:text-sm font-bold uppercase tracking-wider">
                            {(post.authors?.avatar_url || post.author_image) && (
                                <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0">
                                    <Image
                                        src={post.authors?.avatar_url || post.author_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authors?.name || post.author_name)}&background=22c55e&color=fff`}
                                        alt={post.authors?.name || post.author_name}
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-4">
                                <span>By {post.authors?.name || post.author_name}</span>
                                <span className="hidden md:inline">•</span>
                                <span className="text-white/70 font-medium md:text-white/90 md:font-bold">{safeDateFormat(post.published_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 lg:col-start-3">
                    <AdBanner placement="banner" className="my-8" />
                    <div className="flex justify-between items-center mb-6">
                        <SocialShare title={post.title} />
                    </div>
                    <PostContent html={post.content || post.excerpt} />

                    <div className="mt-16 p-8 bg-stone-50 rounded-xl border border-stone-100 flex flex-col md:flex-row gap-8 items-start">
                        <div className="relative w-24 h-24 flex-shrink-0 rounded-full overflow-hidden bg-stone-200 border-2 border-white shadow-sm">
                            {(post.authors?.avatar_url || post.author_image) ? (
                                <Image
                                    src={post.authors?.avatar_url || post.author_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authors?.name || post.author_name)}&background=22c55e&color=fff`}
                                    alt={post.authors?.name || post.author_name}
                                    fill
                                    sizes="96px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400 text-2xl font-bold">
                                    {(post.authors?.name || post.author_name).charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">About {post.authors?.name || post.author_name}</h3>
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

                    <AdBanner placement="banner" />
                </div>
            </div>

            {/* Related Posts */}
            {post.id && post.category && (
                <RelatedPosts currentPostId={post.id} category={post.category} />
            )}

            {post.id && <CommentSection postId={post.id} />}
        </article>
    );
}
