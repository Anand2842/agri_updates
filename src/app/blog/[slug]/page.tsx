// ... imports
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import ViewCounter from '@/components/analytics/ViewCounter';
import CommentSection from '@/components/blog/CommentSection';
import RelatedPosts from '@/components/blog/RelatedPosts';
import PostContent from '@/components/PostContent';

// Neutralize branded/generated author names at render time
const BRANDED_AUTHOR_NAMES = /^(agri\s*updates?\s*(editor|desk|team|staff|bureau)|editorial\s*team|admin)$/i;
function neutralAuthorName(name?: string | null): string | null {
    if (!name) return null;
    return BRANDED_AUTHOR_NAMES.test(name.trim()) ? null : name;
}
import SocialShare from '@/components/blog/SocialShare';
import { safeDateFormat } from '@/lib/utils/date';
import ArticleHeader from '@/components/blog/ArticleHeader';
import { calculateReadingTime } from '@/lib/utils/article';
import EligibilityChecker from '@/components/blog/EligibilityChecker';
import ArticleSidebar from '@/components/blog/ArticleSidebar';
import AdBanner from '@/components/ads/AdBanner';

/**
 * Server-side content normalizer — runs in Node.js before the HTML reaches
 * the client PostContent component. Uses pure regex (no DOMParser needed).
 * Strips: <u> tags, underline inline styles, branded filler text, empty paragraphs.
 */
function serverNormalizeContent(html: string): string {
    if (!html) return '';
    let content = html;

    // 1. Strip <u> tags but keep their content (unwrap)
    content = content.replace(/<\/?u(?:\s[^>]*)?\s*>/gi, '');

    // 2. Strip text-decoration inline styles (underline, underline-offset, etc.)
    content = content.replace(
        /\s*text-decoration(?:-line|-style|-color|-thickness)?\s*:\s*[^;"]+;?/gi,
        ''
    );
    content = content.replace(
        /\s*text-underline-offset\s*:\s*[^;"]+;?/gi,
        ''
    );
    // Remove empty style attributes left behind
    content = content.replace(/\s+style\s*=\s*["']\s*["']/gi, '');

    // 3. Strip branded filler text (even when nested inside <em> or <a> tags)
    // First target the exact nested structure: <blockquote><em>Updated for <a href="...">Agri Updates</a> | Date</em></blockquote>
    content = content.replace(
        /<blockquote[^>]*>\s*<em[^>]*>\s*Updated\s+for\s*<[a-zA-Z]+[^>]*>\s*Agri\s+Updates\s*<\/[a-zA-Z]+>\s*\|\s*[a-zA-Z]+\s+\d{4}\s*<\/em>\s*<\/blockquote>/gi,
        ''
    );
    // Target generic instances allowing for inner HTML tags
    content = content.replace(
        /<(?:p|div|span|em|strong|i|blockquote)[^>]*>(?:[^<]|<(?!\/(?:p|div|span|em|strong|i|blockquote)>))*?Updated(?:\s|<[^>]+>)*for(?:\s|<[^>]+>)*Agri(?:\s|<[^>]+>)*Updates.*?(?:January|February|March|April|May|June|July|August|September|October|November|December)?\s*\d{0,4}.*?<\/(?:p|div|span|em|strong|i|blockquote)>/gi,
        ''
    );
    content = content.replace(
        /Updated(?:\s|<[^>]+>)*for(?:\s|<[^>]+>)*Agri(?:\s|<[^>]+>)*Updates(?:\s|<[^>]+>)*[\/\-–—|]?\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)?\s*\d{0,4}/gi,
        ''
    );
    content = content.replace(/Updated(?:\s|<[^>]+>)*for(?:\s|<[^>]+>)*Agri(?:\s|<[^>]+>)*Updates/gi, '');
    content = content.replace(/Agri(?:\s|<[^>]+>)*Updates?\s+Editor/gi, 'Editorial Desk');
    content = content.replace(/Agri(?:\s|<[^>]+>)*Updates?\s+Desk/gi, 'Editorial Desk');

    // 4. Strip empty paragraphs and blockquotes left behind
    content = content.replace(/<p[^>]*>\s*<\/p>/gi, '');
    content = content.replace(/<blockquote[^>]*>\s*<\/blockquote>/gi, '');

    return content;
}

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
        title: post.title,
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

    const readingTime = calculateReadingTime(post.content);

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
            name: post.authors?.name || post.author_name || 'Agri Updates Desk',
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
        <article className="min-h-screen bg-white pb-20 overflow-x-hidden pt-14 md:pt-16">
            <ArticleHeader title={post.title} />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            {post.id && <ViewCounter postId={post.id} />}

            {/* Two-column editorial grid */}
            <div className="container mx-auto px-4 max-w-[1200px] pt-12 md:pt-16">
                <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-12 xl:gap-16">

                    {/* ── LEFT: Main Article Content ── */}
                    <div className="min-w-0">
                        {/* Header Zone */}
                        <header className="mb-10">
                            {/* Category badge */}
                            <div className="mb-5 flex items-center gap-3">
                                <Link
                                    href={`/updates?category=${encodeURIComponent(post.category)}`}
                                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-agri-green bg-agri-green/8 hover:bg-agri-green/15 px-3 py-1.5 rounded-full transition-colors"
                                >
                                    {post.category}
                                </Link>
                                <span className="text-[11px] text-stone-400 font-medium">{readingTime} min read</span>
                            </div>

                            {/* Title */}
                            <h1 className="font-serif text-[38px] md:text-[48px] lg:text-[52px] font-bold text-[#111] leading-[1.08] mb-5 tracking-tight">
                                {post.title}
                            </h1>

                            {/* Excerpt / Dek */}
                            {post.excerpt && (
                                <p className="text-[18px] md:text-[20px] text-stone-500 leading-relaxed mb-7 font-light border-l-2 border-stone-200 pl-4">
                                    {post.excerpt}
                                </p>
                            )}

                            {/* Meta Row: Author, Date, Share */}
                            <div className="flex items-center justify-between gap-4 pt-5 border-t border-stone-100">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                                        <Image
                                            src={post.authors?.avatar_url || post.author_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(neutralAuthorName(post.authors?.name) || neutralAuthorName(post.author_name) || 'ED')}&background=1a1a1a&color=fff&size=40`}
                                            alt={neutralAuthorName(post.authors?.name) || neutralAuthorName(post.author_name) || 'Editorial Desk'}
                                            fill
                                            sizes="40px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[13px] font-semibold text-stone-800 block">
                                            {neutralAuthorName(post.authors?.name) || neutralAuthorName(post.author_name) ? (
                                                post.authors?.slug ? (
                                                    <Link href={`/author/${post.authors.slug}`} className="hover:text-agri-green transition-colors">
                                                        {neutralAuthorName(post.authors?.name) || neutralAuthorName(post.author_name)}
                                                    </Link>
                                                ) : (
                                                    neutralAuthorName(post.authors?.name) || neutralAuthorName(post.author_name)
                                                )
                                            ) : (
                                                'Editorial Desk'
                                            )}
                                        </span>
                                        <span className="text-[11px] text-stone-400">{safeDateFormat(post.published_at)}</span>
                                    </div>
                                </div>
                                {/* Inline share */}
                                <div className="flex-shrink-0">
                                    <SocialShare title={post.title} />
                                </div>
                            </div>
                        </header>

                        {/* Hero Image */}
                        {post.image_url && (
                            <div className="w-full mb-10">
                                <style>{`
                                    @media (max-width: 639px) { .hero-frame { aspect-ratio: 4/3 !important; min-height: 240px; max-height: 380px; } }
                                    @media (min-width: 640px) { .hero-frame { aspect-ratio: 16/9 !important; } }
                                `}</style>
                                <div className="hero-frame relative w-full bg-stone-900 overflow-hidden rounded-xl shadow-md">
                                    <Image src={post.image_url} alt="" fill priority className="object-cover opacity-40 blur-2xl scale-110" sizes="(max-width: 760px) 100vw, 800px" />
                                    <Image src={post.image_url} alt={post.title} fill priority className="object-contain relative z-10" sizes="(max-width: 760px) 100vw, 800px" />
                                </div>
                            </div>
                        )}

                        {/* Eligibility Checker Widget */}
                        {post.policy_rules && (
                            <div className="mb-10">
                                <EligibilityChecker rules={post.policy_rules} />
                            </div>
                        )}

                        {/* Main Content */}
                        <PostContent html={serverNormalizeContent(post.content || post.excerpt || '')} />

                        {/* Article Footer: Tags → Share → Author */}
                        <footer className="mt-16 border-t border-stone-100 pt-8">
                            {post.tags && post.tags.length > 0 && (
                                <div className="mb-8 flex flex-wrap gap-2">
                                    {post.tags.map((tag: string) => (
                                        <Link
                                            key={tag}
                                            href={`/search?q=${encodeURIComponent(tag)}`}
                                            className="inline-flex items-center px-3 py-1.5 border border-stone-200 rounded-full text-[12px] font-medium text-stone-500 hover:border-agri-green hover:text-agri-green transition-colors"
                                        >
                                            #{tag}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Author Bio Card — only for real authors */}
                            {(neutralAuthorName(post.authors?.name) || neutralAuthorName(post.author_name) || post.authors?.bio || post.author_bio) && (
                                <div className="mt-10 flex gap-5 items-start bg-stone-50 p-6 rounded-2xl border border-stone-100">
                                    <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden bg-white border border-stone-200">
                                        <Image
                                            src={post.authors?.avatar_url || post.author_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(neutralAuthorName(post.authors?.name) || neutralAuthorName(post.author_name) || 'ED')}&background=1a1a1a&color=fff`}
                                            alt={neutralAuthorName(post.authors?.name) || neutralAuthorName(post.author_name) || 'Editorial Desk'}
                                            fill sizes="64px" className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-stone-900 mb-1">
                                            {post.authors?.slug && neutralAuthorName(post.authors?.name) ? (
                                                <Link href={`/author/${post.authors.slug}`} className="hover:text-agri-green transition-colors">
                                                    {neutralAuthorName(post.authors.name)}
                                                </Link>
                                            ) : (
                                                neutralAuthorName(post.authors?.name) || neutralAuthorName(post.author_name) || 'Editorial Desk'
                                            )}
                                        </h4>
                                        <p className="text-stone-500 text-sm leading-relaxed">
                                            {post.authors?.bio || post.author_bio || 'The editorial desk covers agricultural news, market intelligence, and funding opportunities.'}
                                        </p>
                                        {(post.authors?.social_links?.linkedin || post.author_social_linkedin) && (
                                            <a href={post.authors?.social_links?.linkedin || post.author_social_linkedin} target="_blank" rel="noopener noreferrer" className="text-agri-green text-sm font-semibold hover:underline mt-2 inline-block">
                                                Follow on LinkedIn ↗
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </footer>
                    </div>

                    {/* ── RIGHT: Sidebar ── */}
                    {post.id && post.category && (
                        <ArticleSidebar currentPostId={post.id} category={post.category} />
                    )}

                </div>
            </div>

            {/* Optional Ad Banner below article body */}
            <div className="container mx-auto px-4 max-w-[1200px] mt-10">
                <AdBanner placement="banner" className="mb-0" />
            </div>

            {/* Related Posts — full width below the grid */}
            {post.id && post.category && (
                <RelatedPosts
                    currentPostId={post.id}
                    category={post.category}
                    offset={3}
                    className="mt-10 hidden lg:block"
                />
            )}

            {/* Comments — last */}
            <div className="container mx-auto px-4 max-w-[760px] py-8">
                {post.id && <CommentSection postId={post.id} />}
            </div>
        </article>
    );
}
