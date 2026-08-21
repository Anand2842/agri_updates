import { supabase } from '@/lib/supabase';
import { Post, Startup } from '@/types/database';
import { Metadata } from 'next';
import Link from 'next/link';

import StartupNewsHero from '@/components/startups/StartupNewsHero';
import StartupTagFilter from '@/components/startups/StartupTagFilter';
import StartupNewsCard from '@/components/startups/StartupNewsCard';
import DirectoryPreview from '@/components/startups/DirectoryPreview';
import StartupTrending from '@/components/startups/StartupTrending';
import { normalizePostRecord } from '@/lib/public-posts';

export const revalidate = 60;

interface StartupsHubProps {
    searchParams: Promise<{ tag?: string; page?: string }>;
}

const ITEMS_PER_PAGE = 10; // We can show 1 featured (2 col) + 8 standard (1 col each) = 9 cards, but 10 is fine.

// Fetch posts (news)
async function getStartupNews(tagFilter?: string, page: number = 1): Promise<{ posts: Post[], total: number }> {
    try {
        let query = supabase
            .from('posts')
            .select('*', { count: 'exact' })
            .eq('category', 'Startups')
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (tagFilter) {
            query = query.contains('tags', [tagFilter]);
        }

        const from = (page - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;
        
        if (error) {
            console.error('Supabase fetch error for startup news:', error);
            return { posts: [], total: 0 };
        }

        return { posts: (data || []).map((post) => normalizePostRecord(post)) as Post[], total: count || 0 };
    } catch (e) {
        console.error('Error in getStartupNews', e);
        return { posts: [], total: 0 };
    }
}

// Fetch startups for directory preview
async function getDirectoryPreview(): Promise<Startup[]> {
    try {
        const { data, error } = await supabase
            .from('startups')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(6);
            
        if (error) return [];
        return data || [];
    } catch {
        return [];
    }
}

// Get trending tags
async function getTrendingTags(): Promise<{tag: string, count: number}[]> {
     try {
        // Simple aggregate approximation (Supabase doesn't have native unnest group by out of the box in simple query)
        // We fetch the latest 50 posts and count tags locally for "trending"
        const { data, error } = await supabase
            .from('posts')
            .select('tags')
            .eq('category', 'Startups')
            .eq('status', 'published')
            .limit(100);
            
        if (error || !data) return [];
        
        const tagCounts: Record<string, number> = {};
        data.forEach(row => {
            if (row.tags && Array.isArray(row.tags)) {
                row.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });
        
        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
     } catch {
         return [];
     }
}

export async function generateMetadata({ searchParams }: StartupsHubProps): Promise<Metadata> {
    const params = await searchParams;
    const tag = params.tag;

    let title = 'Startup News & Ecosystem';
    let description = 'Stay informed on the latest movements in agritech funding, launches, and acquisitions.';

    if (tag) {
        title = `${tag} - Startup News`;
        description = `Latest updates on agritech startup ${tag.toLowerCase()}.`;
    }

    return {
        title: `${title} | Agri Updates`,
        description: description,
        alternates: {
            canonical: '/startups',
        },
    };
}

export default async function StartupsHubPage({ searchParams }: StartupsHubProps) {
    const params = await searchParams;
    const tagFilter = params.tag;
    const page = parseInt(params.page || '1');

    const [{ posts, total }, directoryPreview, trendingTags] = await Promise.all([
        getStartupNews(tagFilter, page),
        getDirectoryPreview(),
        getTrendingTags()
    ]);

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    // If page 1 and no filter, first post is Hero
    const isMainFeed = !tagFilter && page === 1;
    const heroPost = isMainFeed && posts.length > 0 ? posts[0] : null;
    const gridPosts = heroPost ? posts.slice(1) : posts;

    return (
        <div className="bg-white min-h-screen">
            {/* 1. DARK HERO SECTION */}
            {heroPost && (
                <StartupNewsHero post={heroPost} />
            )}

            {/* TAG FILTER BAR */}
            <StartupTagFilter currentTag={tagFilter || null} />

            {/* 2. LATEST STARTUP NEWS (Light Content) */}
            <div className="bg-[#F8FAF9] py-16 border-b border-stone-200">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between border-b border-stone-200 pb-4 gap-4">
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
                                {tagFilter ? `${tagFilter} News` : 'Latest Startup News'}
                            </h2>
                            {tagFilter && (
                                <p className="text-stone-500 mt-1 text-sm">
                                    Showing all updates tagged with "{tagFilter}"
                                </p>
                            )}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 shrink-0 mb-1">
                            {total} updates
                        </span>
                    </div>

                    {gridPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {gridPosts.map((post, idx) => {
                                // If we don't have a hero (e.g. on filtered pages or page 2), make the first card featured
                                const isFeatured = idx === 0 && !heroPost;
                                return (
                                    <div key={post.id} className={isFeatured ? 'md:col-span-2 lg:col-span-2' : ''}>
                                        <StartupNewsCard 
                                            post={post} 
                                            variant={isFeatured ? 'featured' : 'standard'} 
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-24 text-center bg-white border border-stone-200 rounded-[1.5rem] shadow-sm max-w-2xl mx-auto">
                            <h3 className="font-serif text-2xl font-bold mb-3 text-stone-900">No news found</h3>
                            <p className="text-stone-500 text-base">
                                {tagFilter 
                                    ? `We couldn't find any updates for "${tagFilter}".` 
                                    : "Check back later for the latest startup news."}
                            </p>
                            {tagFilter && (
                                <Link href="/startups" className="inline-block mt-6 px-6 py-2.5 bg-startup-forest text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-startup-emerald transition-colors">
                                    View All News
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-4 mt-16">
                            {page > 1 && (
                                <Link
                                    href={`/startups?page=${page - 1}${tagFilter ? `&tag=${encodeURIComponent(tagFilter)}` : ''}`}
                                    className="rounded-full px-8 py-3 bg-white border border-stone-200 shadow-sm hover:border-startup-emerald hover:text-startup-emerald transition-all font-bold text-xs uppercase tracking-wider"
                                >
                                    Previous
                                </Link>
                            )}
                            <span className="flex items-center text-xs font-bold uppercase text-stone-400 tracking-widest">
                                Page {page} of {totalPages}
                            </span>
                            {page < totalPages && (
                                <Link
                                    href={`/startups?page=${page + 1}${tagFilter ? `&tag=${encodeURIComponent(tagFilter)}` : ''}`}
                                    className="rounded-full px-8 py-3 bg-white border border-stone-200 shadow-sm hover:border-startup-emerald hover:text-startup-emerald transition-all font-bold text-xs uppercase tracking-wider"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. TRENDING NOW (Very Light Content) */}
            {trendingTags.length > 0 && !tagFilter && page === 1 && (
                <StartupTrending tags={trendingTags} />
            )}

            {/* 4. DIRECTORY PREVIEW (Tinted Background) */}
            <DirectoryPreview startups={directoryPreview} />

        </div>
    );
}
