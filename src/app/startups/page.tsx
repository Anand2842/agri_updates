import { supabase } from '@/lib/supabase';
import { Post, Startup } from '@/types/database';
import { Metadata } from 'next';
import Link from 'next/link';

import StartupNewsHero from '@/components/startups/StartupNewsHero';
import StartupTagFilter from '@/components/startups/StartupTagFilter';
import StartupNewsCard from '@/components/startups/StartupNewsCard';
import DirectoryPreview from '@/components/startups/DirectoryPreview';
import AdBanner from '@/components/ads/AdBanner';

export const revalidate = 0;

interface StartupsHubProps {
    searchParams: Promise<{ tag?: string; page?: string }>;
}

const ITEMS_PER_PAGE = 10;

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

        return { posts: data || [], total: count || 0 };
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
            {/* HERO SECTION */}
            {heroPost && (
                <div className="mb-0">
                    <StartupNewsHero post={heroPost} />
                </div>
            )}

            {/* TAG FILTER BAR */}
            <StartupTagFilter currentTag={tagFilter || null} />

            {/* MAIN CONTENT GRID */}
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* LEFT COLUMN: News Feed (8 cols) */}
                    <div className="lg:col-span-8">
                        
                        <div className="mb-8 flex items-end justify-between border-b border-ink-black pb-2">
                            <h2 className="text-xl font-serif font-bold text-stone-900">
                                {tagFilter ? `${tagFilter} News` : 'Latest News'}
                            </h2>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                {total} updates
                            </span>
                        </div>

                        {gridPosts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {gridPosts.map((post, idx) => (
                                    <div key={post.id} className={idx === 0 && !heroPost ? 'md:col-span-2' : ''}>
                                        <StartupNewsCard 
                                            post={post} 
                                            variant={idx === 0 && !heroPost ? 'featured' : 'compact'} 
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-stone-50 border border-stone-200">
                                <h3 className="font-serif text-xl font-bold mb-2">No news found</h3>
                                <p className="text-stone-500 text-sm">
                                    {tagFilter 
                                        ? `We couldn't find any updates for "${tagFilter}".` 
                                        : "Check back later for the latest startup news."}
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-4 mt-12 pt-8 border-t border-stone-200">
                                {page > 1 && (
                                    <Link
                                        href={`/startups?page=${page - 1}${tagFilter ? `&tag=${encodeURIComponent(tagFilter)}` : ''}`}
                                        className="border border-stone-300 px-6 py-3 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors"
                                    >
                                        Previous
                                    </Link>
                                )}
                                <span className="flex items-center text-xs font-bold uppercase text-stone-500">
                                    Page {page} of {totalPages}
                                </span>
                                {page < totalPages && (
                                    <Link
                                        href={`/startups?page=${page + 1}${tagFilter ? `&tag=${encodeURIComponent(tagFilter)}` : ''}`}
                                        className="border border-stone-300 px-6 py-3 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Sidebar (4 cols) */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Ad Banner */}
                        <div className="bg-stone-50 p-4 border border-stone-200">
                            <span className="text-[9px] uppercase font-bold text-stone-400 block mb-2 text-center tracking-widest">Advertisement</span>
                            <AdBanner placement="sidebar" />
                        </div>

                        {/* Trending Tags Cloud */}
                        {trendingTags.length > 0 && (
                            <div className="bg-white border border-stone-200 p-6 shadow-sm">
                                <h3 className="font-bold uppercase text-xs tracking-widest text-stone-900 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-agri-green rounded-full"></span>
                                    Trending Topics
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {trendingTags.map((t) => (
                                        <Link 
                                            key={t.tag}
                                            href={`/startups?tag=${encodeURIComponent(t.tag)}`}
                                            className="px-3 py-1.5 bg-stone-50 border border-stone-200 text-stone-600 text-xs font-bold uppercase hover:border-agri-green hover:text-agri-green transition-colors"
                                        >
                                            {t.tag} <span className="text-stone-400 font-normal ml-1">({t.count})</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Directory Widget */}
                        <div className="bg-black text-white p-8">
                            <h3 className="font-serif text-2xl font-bold mb-4">Startup Directory</h3>
                            <p className="text-stone-400 text-sm mb-8 leading-relaxed">
                                Research and discover hundreds of innovative agritech companies mapped by sector, stage, and location.
                            </p>
                            <Link 
                                href="/startups/directory"
                                className="block w-full py-3 bg-agri-green hover:bg-white hover:text-black transition-colors text-center font-bold uppercase text-xs tracking-widest"
                            >
                                Enter Directory
                            </Link>
                        </div>
                    </div>

                </div>
            </div>

            {/* DIRECTORY PREVIEW (Bottom) */}
            <DirectoryPreview startups={directoryPreview} />

        </div>
    );
}
