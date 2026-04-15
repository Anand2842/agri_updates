import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AdBanner from '@/components/ads/AdBanner';

interface ArticleSidebarProps {
    currentPostId: string;
    category: string;
}

async function getTopPosts(targetCategory: string, currentPostId: string, limit: number = 3) {
    const { data } = await supabase
        .from('posts')
        .select('id, title, slug, category, published_at, image_url')
        .eq('category', targetCategory)
        .eq('status', 'published')
        .neq('id', currentPostId)
        .order('published_at', { ascending: false })
        .limit(limit);
    return data || [];
}

async function hasActiveSidebarAd() {
    const nowIso = new Date().toISOString();
    const { data } = await supabase
        .from('ads')
        .select('id')
        .eq('is_active', true)
        .eq('placement', 'sidebar')
        .lte('start_date', nowIso)
        .or(`end_date.is.null,end_date.gte.${nowIso}`)
        .limit(1);

    return Boolean(data && data.length > 0);
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
}

function NewsletterCard({ compact = false }: { compact?: boolean }) {
    return (
        <div className={`relative overflow-hidden rounded-2xl bg-[#1a3a2a] text-white ${compact ? 'p-5' : 'p-6'}`}>
            <div
                aria-hidden="true"
                className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-agri-green/20"
            />
            <div
                aria-hidden="true"
                className="absolute -bottom-6 -left-4 h-20 w-20 rounded-full bg-agri-green/10"
            />

            <div className="relative z-10">
                <span className="mb-2 block text-[9px] font-black uppercase tracking-[0.15em] text-agri-green/80">
                    Free Newsletter
                </span>
                <h3 className="font-serif text-xl font-bold leading-snug text-white">
                    The Agri Digest
                </h3>
                <p className={`text-[13px] leading-relaxed text-white/70 ${compact ? 'mb-4 mt-2' : 'mb-5 mt-2'}`}>
                    Curated agricultural intelligence delivered to your inbox every quarter.
                </p>
                <form action="#" method="post" className="flex flex-col gap-2">
                    <input
                        type="email"
                        placeholder="Email address"
                        required
                        id={compact ? 'mobile-sidebar-newsletter-email' : 'sidebar-newsletter-email'}
                        className="w-full rounded-lg bg-white/95 px-3 py-2.5 text-[13px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-agri-green"
                    />
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-agri-green px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-agri-dark"
                    >
                        Subscribe
                    </button>
                </form>
                <p className="mt-3 text-center text-[10px] text-white/40">
                    No spam. Unsubscribe anytime.
                </p>
            </div>
        </div>
    );
}

function RelatedPostsCard({
    category,
    posts,
    mobile = false,
    titleText,
}: {
    category: string;
    posts: Array<{
        id: string;
        title: string;
        slug: string;
        category: string;
        published_at: string;
        image_url?: string | null;
    }>;
    mobile?: boolean;
    titleText?: string;
}) {
    if (posts.length === 0) {
        return null;
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm">
            <div className="border-b border-stone-100 px-5 pb-3 pt-5">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-agri-green">
                    {titleText || `More in ${category}`}
                </span>
            </div>
            <ul className="divide-y divide-stone-50">
                {posts.map((post, idx) => (
                    <li key={post.id}>
                        <Link
                            href={`/blog/${post.slug}`}
                            className={`group flex gap-3 px-5 transition-colors hover:bg-stone-50 ${mobile ? 'py-4' : 'py-4'}`}
                        >
                            <span className="mt-0.5 w-6 flex-shrink-0 select-none text-[22px] font-black leading-none text-stone-200 transition-colors group-hover:text-agri-green/40">
                                {String(idx + 1).padStart(2, '0')}
                            </span>
                            <div className="min-w-0 flex-1">
                                <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-agri-green/80">
                                    {post.category}
                                </span>
                                <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-stone-800 transition-colors group-hover:text-agri-dark">
                                    {post.title}
                                </h3>
                                <span className="mt-1 block text-[11px] text-stone-400">
                                    {timeAgo(post.published_at)}
                                </span>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default async function ArticleSidebar({ currentPostId, category }: ArticleSidebarProps) {
    const [relatedPosts, latestJobs, hotStartups, sidebarAdIsActive] = await Promise.all([
        getTopPosts(category, currentPostId, 3),
        category !== 'Jobs' ? getTopPosts('Jobs', currentPostId, 3) : Promise.resolve([]),
        category !== 'Startups' ? getTopPosts('Startups', currentPostId, 2) : Promise.resolve([]),
        hasActiveSidebarAd(),
    ]);

    return (
        <>
            <section className="mt-12 space-y-6 lg:hidden">
                <RelatedPostsCard category={category} posts={relatedPosts} mobile />
                {sidebarAdIsActive && <AdBanner placement="sidebar" />}
                <NewsletterCard compact />
                <RelatedPostsCard category="Jobs" posts={latestJobs} mobile titleText="Trending Jobs" />
                <RelatedPostsCard category="Startups" posts={hotStartups} mobile titleText="Startup Spotlight" />
            </section>

            <aside className="sticky top-20 hidden self-start lg:flex lg:flex-col lg:gap-8">
                <RelatedPostsCard category={category} posts={relatedPosts} />
                {sidebarAdIsActive && <AdBanner placement="sidebar" />}
                <NewsletterCard />
                <RelatedPostsCard category="Jobs" posts={latestJobs} titleText="Trending Jobs" />
                <RelatedPostsCard category="Startups" posts={hotStartups} titleText="Startup Spotlight" />
            </aside>
        </>
    );
}
