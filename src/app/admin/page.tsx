import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { safeDateFormat } from '@/lib/utils/date';

export const revalidate = 0;

export default async function AdminDashboard() {
    const supabase = await createClient()

    // 1. Fetch Key Stats
    const { count: totalPosts } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published')
    const { count: draftPosts } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft')
    const { count: pendingReview } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'pending_review')
    const { count: scheduledPosts } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'scheduled')

    // Calculate Total Views
    const { data: allPosts } = await supabase.from('posts').select('views');
    const totalViews = allPosts?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;

    // Today's views (posts viewed today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: todayPosts } = await supabase
        .from('posts')
        .select('views')
        .gte('published_at', today.toISOString());
    const todayViews = todayPosts?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;

    // 2. Fetch Top Performing Stories (with time filter)
    const { data: topStories } = await supabase
        .from('posts')
        .select('id, title, views, category, published_at')
        .eq('status', 'published')
        .order('views', { ascending: false })
        .limit(5)

    // 3. Fetch Recent Drafts (WhatsApp Stream)
    const { data: recentDrafts } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(5)

    // 4. Fetch posts needing review
    const { data: reviewQueue } = await supabase
        .from('posts')
        .select('id, title, author_name, created_at')
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false })
        .limit(3)

    return (
        <div className="max-w-7xl">
            <header className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-stone-900">Newsroom Dashboard</h1>
                        <p className="text-stone-500">Real-time media engagement overview</p>
                    </div>
                    <div className="flex gap-3">
                        <Link 
                            href="/admin/posts/new"
                            className="bg-agri-green text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-agri-dark transition-colors shadow-sm"
                        >
                            ✍️ Write Story
                        </Link>
                        <Link 
                            href="/admin/posts/generate"
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-sm"
                        >
                            ✨ AI Generate
                        </Link>
                    </div>
                </div>
            </header>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-5 border-l-4 border-black shadow-sm rounded-r-lg">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">Total Views</h3>
                    <p className="text-3xl font-serif font-bold text-stone-900">{totalViews.toLocaleString()}</p>
                    <p className="text-xs text-stone-400 mt-1">All-time engagement</p>
                </div>
                <div className="bg-white p-5 border-l-4 border-blue-500 shadow-sm rounded-r-lg">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">Today</h3>
                    <p className="text-3xl font-serif font-bold text-blue-600">{todayViews.toLocaleString()}</p>
                    <p className="text-xs text-stone-400 mt-1">Views today</p>
                </div>
                <div className="bg-white p-5 border-l-4 border-agri-green shadow-sm rounded-r-lg">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">Published</h3>
                    <p className="text-3xl font-serif font-bold text-stone-900">{totalPosts}</p>
                    <p className="text-xs text-stone-400 mt-1">Live stories</p>
                </div>
                <div className="bg-white p-5 border-l-4 border-amber-500 shadow-sm rounded-r-lg">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">Pending</h3>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-serif font-bold text-stone-900">{draftPosts}</p>
                        {pendingReview > 0 && (
                            <span className="text-sm text-amber-600 font-bold">+{pendingReview} review</span>
                        )}
                    </div>
                    <p className="text-xs text-stone-400 mt-1">Drafts waiting</p>
                </div>
                <div className="bg-white p-5 border-l-4 border-purple-500 shadow-sm rounded-r-lg">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1">Scheduled</h3>
                    <p className="text-3xl font-serif font-bold text-purple-600">{scheduledPosts}</p>
                    <p className="text-xs text-stone-400 mt-1">Future posts</p>
                </div>
            </div>

            {/* Action Items Alert */}
            {(pendingReview > 0 || scheduledPosts > 0) && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-amber-900 mb-1">⚡ Action Required</h3>
                            <p className="text-sm text-amber-700">
                                {pendingReview > 0 && `${pendingReview} post${pendingReview > 1 ? 's' : ''} waiting for review`}
                                {pendingReview > 0 && scheduledPosts > 0 && ' • '}
                                {scheduledPosts > 0 && `${scheduledPosts} scheduled post${scheduledPosts > 1 ? 's' : ''}`}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {pendingReview > 0 && (
                                <Link 
                                    href="/admin/posts?status=pending_review"
                                    className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors"
                                >
                                    Review Now
                                </Link>
                            )}
                            {scheduledPosts > 0 && (
                                <Link 
                                    href="/admin/posts?status=scheduled"
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
                                >
                                    View Schedule
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Stories Column - 2 cols */}
                <section className="lg:col-span-2 bg-white border border-stone-200 shadow-sm rounded-lg overflow-hidden">
                    <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                        <div>
                            <h2 className="font-bold text-lg text-stone-800">🔥 Top Performing</h2>
                            <p className="text-xs text-stone-500 mt-0.5">Most viewed stories</p>
                        </div>
                        <Link 
                            href="/admin/posts?sort=views"
                            className="text-xs text-agri-green hover:text-agri-dark font-bold uppercase tracking-wider"
                        >
                            View All →
                        </Link>
                    </div>
                    <div>
                        {topStories?.map((post, i) => (
                            <Link
                                key={post.id}
                                href={`/admin/posts/${post.id}`}
                                className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors border-b last:border-0 border-stone-50 group"
                            >
                                <span className={`font-serif text-2xl font-bold w-8 text-center ${
                                    i === 0 ? 'text-amber-500' : 
                                    i === 1 ? 'text-stone-400' : 
                                    i === 2 ? 'text-amber-700' : 'text-stone-300'
                                }`}>
                                    {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-stone-800 line-clamp-1 group-hover:text-agri-green transition-colors">{post.title}</h4>
                                    <div className="flex gap-2 text-xs text-stone-500 mt-1">
                                        <span className="uppercase text-[10px] font-bold bg-stone-100 px-2 py-0.5 rounded">{post.category}</span>
                                        <span>• {safeDateFormat(post.published_at)}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-xl text-agri-green">{(post.views || 0).toLocaleString()}</span>
                                    <span className="text-[10px] uppercase text-stone-400 tracking-wider">Views</span>
                                </div>
                            </Link>
                        ))}
                        {topStories?.length === 0 && (
                            <div className="p-12 text-center text-stone-400">
                                <p className="mb-2">No published stories yet</p>
                                <Link href="/admin/posts/new" className="text-agri-green font-bold text-sm">Create your first post →</Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* Right Column - Incoming Feed + Review Queue */}
                <div className="space-y-6">
                    {/* Review Queue (if any) */}
                    {reviewQueue && reviewQueue.length > 0 && (
                        <section className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-sm rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-amber-200 bg-amber-100/50">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-bold text-sm text-amber-900">👀 Needs Review</h2>
                                    <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingReview}</span>
                                </div>
                            </div>
                            <div>
                                {reviewQueue.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/admin/posts/${post.id}`}
                                        className="block p-3 hover:bg-amber-100/50 transition-colors border-b last:border-0 border-amber-100 group"
                                    >
                                        <h4 className="font-bold text-sm text-stone-800 group-hover:text-amber-700 transition-colors line-clamp-2">{post.title || "Untitled"}</h4>
                                        <p className="text-xs text-stone-500 mt-1">by {post.author_name}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Recent Drafts / Incoming Feed */}
                    <section className="bg-white border border-stone-200 shadow-sm rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-stone-100 bg-stone-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-bold text-sm text-stone-800">📥 Recent Drafts</h2>
                                    <p className="text-xs text-stone-500 mt-0.5">Latest incoming content</p>
                                </div>
                                <Link 
                                    href="/admin/posts?status=draft"
                                    className="text-xs text-stone-600 hover:text-black font-bold"
                                >
                                    All →
                                </Link>
                            </div>
                        </div>
                        <div>
                            {recentDrafts?.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/admin/posts/${post.id}`}
                                    className="block p-3 hover:bg-yellow-50 transition-colors border-b last:border-0 border-stone-50 group"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">
                                            {post.source === 'whatsapp' ? '📱 WhatsApp' : '✏️ Draft'}
                                        </span>
                                        <span className="text-xs text-stone-400">{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <h4 className="font-bold text-sm text-stone-800 group-hover:text-yellow-700 transition-colors line-clamp-2">{post.title || "Untitled Draft"}</h4>
                                </Link>
                            ))}
                            {recentDrafts?.length === 0 && (
                                <div className="p-8 text-center text-stone-400">
                                    <p className="text-sm mb-2">No pending drafts</p>
                                    <Link href="/admin/posts/new" className="text-agri-green text-xs font-bold">Create one now →</Link>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
