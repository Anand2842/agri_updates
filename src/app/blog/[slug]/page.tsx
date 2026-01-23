// ... imports
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
import MotionWrapper from '@/components/ui/MotionWrapper';
import BlogSidebar from '@/components/blog/BlogSidebar';
import ReadingProgress from '@/components/blog/ReadingProgress';
import StickySidebar from '@/components/blog/StickySidebar';
import TableOfContents from '@/components/blog/TableOfContents';
import BackToTop from '@/components/ui/BackToTop';

export const revalidate = 0;

async function getPost(slug: string) {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*, authors(*)')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error) {
            if (error.code !== 'PGRST116') {
                console.error('Supabase fetch error:', error);
            }
        }

        if (error || !data) {
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
        description: post.excerpt || (post.content || '').substring(0, 160) + '...',
        openGraph: {
            title: post.title,
            description: post.excerpt || (post.content || '').substring(0, 160) + '...',
            images: [post.image_url || '/placeholder.jpg'],
            type: 'article',
            publishedTime: post.published_at,
            authors: [post.authors?.name || post.author_name],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt || (post.content || '').substring(0, 160) + '...',
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
        <article className="min-h-screen bg-white pb-20 overflow-x-hidden">
            <ReadingProgress />
            <BackToTop />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            {post.id && <ViewCounter postId={post.id} />}

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 relative pt-8 md:pt-12">
                {/* Main Content Column - 9 cols */}
                <div className="lg:col-span-9 lg:col-start-1">
                    {/* Header Zone - Moved Inside for Alignment */}
                    <header className="max-w-[700px] mx-auto mb-8 text-center md:text-left">
                        {post.is_featured && (
                            <span className="inline-block bg-agri-gold/20 text-agri-dark text-[10px] font-black uppercase tracking-widest px-3 py-1 mb-4 rounded-full">
                                Featured Story
                            </span>
                        )}

                        <span className="block text-agri-green font-bold uppercase tracking-widest text-xs mb-3">
                            {post.category}
                        </span>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-charcoal leading-[1.05] mb-3 tracking-tight">
                            {post.title}
                        </h1>

                        {post.excerpt && (
                            <p className="text-xl md:text-2xl text-stone-500 font-serif leading-relaxed mb-4">
                                {post.excerpt}
                            </p>
                        )}

                        <div className="flex items-center gap-3 text-sm mt-4 justify-center md:justify-start">
                            {(post.authors?.avatar_url || post.author_image) && (
                                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-stone-200">
                                    <Image
                                        src={post.authors?.avatar_url || post.author_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authors?.name || post.author_name || 'Agri Updates')}&background=2D5016&color=fff`}
                                        alt={post.authors?.name || post.author_name || 'Agri Updates Team'}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex items-center text-stone-500 font-medium text-xs gap-2">
                                <span className="text-charcoal font-bold">{post.authors?.name || post.author_name || 'Agri Updates Team'}</span>
                                <span className="text-stone-300">•</span>
                                <span>{safeDateFormat(post.published_at)}</span>
                                <span className="text-stone-300">•</span>
                                <span>5 min read</span>
                            </div>
                        </div>
                    </header>

                    {/* Hero Image - Wider than text (Full 9-col width) but contained boundaries */}
                    <div className="w-full mb-10">
                        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-stone-100 overflow-hidden rounded-xl shadow-sm">
                            <Image
                                src={post.image_url || '/placeholder.jpg'}
                                alt={post.title}
                                fill
                                priority
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 900px"
                            />
                        </div>
                        <div className="mt-2 text-center md:text-left">
                            <p className="text-[10px] text-stone-400 uppercase tracking-widest">
                                Credit: Agri Updates
                            </p>
                        </div>
                    </div>

                    <div className="container-reading">
                        {/* Mobile TOC - Collapsible */}
                        <div className="mb-8 block lg:hidden">
                            <details className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                                <summary className="font-bold text-stone-700 cursor-pointer list-none flex justify-between items-center text-sm uppercase tracking-wide">
                                    In this guide
                                    <svg className="w-4 h-4 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </summary>
                                <div className="mt-4 pt-4 border-t border-stone-200">
                                    <TableOfContents />
                                </div>
                            </details>
                        </div>

                        <PostContent html={post.content || post.excerpt} />

                        {/* Interactive "Mid-Article" Elements */}
                        <div className="my-12">
                            <AdBanner placement="banner" />
                        </div>

                        <div className="mt-16 pt-8 border-t border-stone-200">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-6">About the Author</h3>
                            <div className="flex flex-col sm:flex-row gap-6 items-start bg-stone-50 p-6 rounded-xl">
                                <div className="relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden bg-white border border-stone-200">
                                    <Image
                                        src={post.authors?.avatar_url || post.author_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authors?.name || post.author_name || 'Agri Updates')}&background=2D5016&color=fff`}
                                        alt={post.authors?.name || post.author_name || 'Agri Updates Team'}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-charcoal mb-2">
                                        {post.authors?.name || post.author_name || 'Agri Updates Team'}
                                    </h4>
                                    <p className="text-stone-600 text-sm leading-relaxed mb-3">
                                        {post.authors?.bio || post.author_bio || "Reporting on the latest developments in Indian agriculture, technology, and policy."}
                                    </p>
                                    <div className="flex gap-4">
                                        {(post.authors?.social_links?.linkedin || post.author_social_linkedin) && (
                                            <a href={post.authors?.social_links?.linkedin || post.author_social_linkedin} target="_blank" rel="noopener noreferrer" className="text-agri-green text-sm font-bold hover:underline">
                                                Connect on LinkedIn
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-center">
                            <SocialShare title={post.title} />
                        </div>
                    </div>
                </div>

                {/* Sticky Sidebar - Added border-l divider */}
                <aside className="hidden lg:block lg:col-span-3 lg:col-start-10 relative pl-8 border-l border-stone-100">
                    <StickySidebar triggerId="article-header" offset={100}>
                        <div className="mb-8 p-0">
                            <h5 className="text-xs font-black uppercase tracking-widest text-stone-900 mb-4 pb-2">In this guide</h5>
                            <TableOfContents />
                        </div>

                        <div className="mb-8 pt-4">
                            <h5 className="text-xs font-black uppercase tracking-widest text-stone-900 mb-4 pb-2">Share</h5>
                            <SocialShare title={post.title} />
                        </div>
                    </StickySidebar>
                </aside>
            </div>

            {/* Related Posts */}
            <div className="bg-stone-50 py-16 mt-12 border-t border-stone-200">
                <div className="container mx-auto px-4">
                    {post.id && post.category && (
                        <RelatedPosts currentPostId={post.id} category={post.category} />
                    )}
                </div>
            </div>

            {post.id && <CommentSection postId={post.id} />}
        </article>
    );
}
