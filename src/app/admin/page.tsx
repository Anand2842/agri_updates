import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { safeDateFormat } from '@/lib/utils/date';

export const revalidate = 0;

export default async function AdminDashboard() {
    const supabase = await createClient()

    // 1. Fetch Key Stats
    const { count: totalPostsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published')
    const { count: draftPostsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft')
    const { count: pendingReviewCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'pending_review')
    const { count: scheduledPostsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'scheduled')

    const totalPosts = totalPostsCount || 0
    const draftPosts = draftPostsCount || 0
    const pendingReview = pendingReviewCount || 0
    const scheduledPosts = scheduledPostsCount || 0

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
        <div className="max-w-7xl pb-12">
            {/* Header section */}
            <header className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stone-900 to-stone-500 tracking-tight mb-1">
                            Newsroom Engine
                        </h1>
                        <p className="text-stone-500 text-sm font-medium">Real-time intelligence and media engagement</p>
                    </div>
                    <div className="flex gap-3">
                        <Link 
                            href="/admin/posts/new"
                            className="group relative inline-flex items-center justify-center gap-2 bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-stone-900/20 active:scale-95"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                            <span className="relative z-10 flex items-center gap-2">✍️ Write Story</span>
                        </Link>
                        <Link 
                            href="/admin/posts/generate"
                            className="bg-gradient-to-b from-indigo-500 to-purple-600 p-[1px] rounded-xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25 active:scale-95 z-10"
                        >
                            <span className="flex items-center gap-2 bg-gradient-to-br from-indigo-50 to-purple-50 text-purple-900 px-6 py-2.5 rounded-[11px] font-bold text-sm h-full">
                                ✨ AI Generate
                            </span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 mb-8">
                
                {/* Master Stat: Views */}
                <div className="md:col-span-12 lg:col-span-8 group relative bg-white border border-stone-200/60 rounded-3xl p-6 lg:p-8 overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-stone-300">
                    <div className="absolute inset-0 bg-gradient-to-bl from-green-500/[0.03] to-transparent pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                                <span className="w-2 h-2 rounded-full bg-agri-green animate-pulse"></span>
                                Total Engagement
                            </h3>
                            <div className="flex items-end gap-3">
                                <p className="text-5xl lg:text-7xl font-serif font-bold text-stone-900 tracking-tighter">
                                    {totalViews.toLocaleString()}
                                </p>
                            </div>
                            <p className="text-sm text-stone-400 mt-2 font-medium">All-time views across {totalPosts} published stories</p>
                        </div>
                        
                        {/* Split stat for today */}
                        <div className="bg-stone-50/80 backdrop-blur rounded-2xl p-4 lg:p-6 border border-stone-100 min-w-[200px]">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1">Today's Traffic</h3>
                            <p className="text-3xl font-serif font-bold text-blue-600 mb-1">+{todayViews.toLocaleString()}</p>
                            <div className="w-full h-1.5 bg-blue-100 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full w-3/4"></div> {/* Decorative bar */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="md:col-span-6 lg:col-span-4 grid grid-cols-2 gap-4 lg:gap-6">
                    {/* Live Posts Card */}
                    <div className="col-span-1 bg-gradient-to-b from-stone-50 to-white border border-stone-200/60 rounded-3xl p-5 flex flex-col justify-between group transition-all hover:shadow-lg hover:border-agri-green/30">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-4">Live Stories</h3>
                        <div>
                            <p className="text-4xl font-serif font-bold text-stone-900 mb-1 group-hover:text-agri-green transition-colors">{totalPosts}</p>
                            <p className="text-xs text-stone-400 font-medium">Published</p>
                        </div>
                    </div>
                    {/* Scheduled Card */}
                    <div className="col-span-1 bg-gradient-to-b from-stone-50 to-white border border-stone-200/60 rounded-3xl p-5 flex flex-col justify-between group transition-all hover:shadow-lg hover:border-purple-300">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-4">Pipeline</h3>
                        <div>
                            <p className="text-4xl font-serif font-bold text-purple-600 mb-1">{scheduledPosts}</p>
                            <p className="text-xs text-stone-400 font-medium">Scheduled</p>
                        </div>
                    </div>
                    {/* Drafts Card (spanning full width of this sub-grid) */}
                    <div className="col-span-2 group bg-stone-900 border border-stone-800 rounded-3xl p-5 relative overflow-hidden transition-all hover:shadow-xl hover:shadow-stone-900/10">
                        <div className="absolute inset-0 bg-gradient-to-br from-stone-800/50 to-transparent"></div>
                        <div className="relative z-10 flex justify-between items-end">
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 block">Works in Progress</h3>
                                <p className="text-4xl font-serif font-bold text-white mb-1 drop-shadow-md">{draftPosts}</p>
                                <p className="text-xs text-stone-400 font-medium">Active Drafts</p>
                            </div>
                            {pendingReview > 0 && (
                                <Link href="/admin/posts?status=pending_review" className="bg-amber-500 hover:bg-amber-400 text-stone-900 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-amber-500/25 flex items-center gap-1.5 -mb-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-stone-900 animate-pulse"></span>
                                    {pendingReview} Review
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION REQUIRED BANNER */}
            {(pendingReview > 0 || scheduledPosts > 0) && (
                <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 border border-amber-200/60 p-5 mb-8 rounded-2xl md:rounded-[2rem] shadow-sm group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 blur-3xl rounded-full -mr-20 -mt-20"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200">
                                ⚡
                            </div>
                            <div>
                                <h3 className="font-bold text-amber-900 text-sm tracking-wide">Action Required</h3>
                                <p className="text-xs text-amber-700 mt-0.5">
                                    {pendingReview > 0 && `${pendingReview} post${pendingReview > 1 ? 's' : ''} waiting for review`}
                                    {pendingReview > 0 && scheduledPosts > 0 && ' • '}
                                    {scheduledPosts > 0 && `${scheduledPosts} scheduled post${scheduledPosts > 1 ? 's' : ''}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            {pendingReview > 0 && (
                                <Link 
                                    href="/admin/posts?status=pending_review"
                                    className="flex-1 md:flex-none text-center bg-amber-500 text-amber-950 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-amber-400 transition-colors shadow-sm"
                                >
                                    Review Queue
                                </Link>
                            )}
                            {scheduledPosts > 0 && (
                                <Link 
                                    href="/admin/posts?status=scheduled"
                                    className="flex-1 md:flex-none text-center bg-white/60 hover:bg-white text-stone-800 border border-stone-200 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm"
                                >
                                    View Schedule
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENT GRIDS (Stories & Incoming) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Trending Stories Column */}
                <section className="lg:col-span-7 xl:col-span-8 bg-white border border-stone-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] rounded-[2rem] overflow-hidden">
                    <div className="p-6 md:p-8 flex justify-between items-end border-b border-stone-100/80 bg-stone-50/30 backdrop-blur-md">
                        <div>
                            <h2 className="font-bold text-xl text-stone-900 tracking-tight">Trending Content</h2>
                            <p className="text-xs text-stone-500 mt-1 font-medium">Highest traction this period</p>
                        </div>
                        <Link 
                            href="/admin/posts?sort=views"
                            className="text-[10px] font-bold text-stone-400 hover:text-stone-800 uppercase tracking-widest transition-colors flex items-center gap-1 group"
                        >
                            View All <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                        </Link>
                    </div>
                    <div className="divide-y divide-stone-100/80">
                        {topStories?.map((post, i) => (
                            <Link
                                key={post.id}
                                href={`/admin/posts/${post.id}`}
                                className="flex items-center gap-4 lg:gap-6 p-4 md:p-6 hover:bg-stone-50/50 transition-colors group relative overflow-hidden"
                            >
                                <div className="absolute inset-y-0 left-0 w-1 bg-agri-green scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-300"></div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                    i === 0 ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-100/50' : 
                                    i === 1 ? 'bg-stone-100 text-stone-500' : 
                                    i === 2 ? 'bg-orange-50 text-orange-700' : 'bg-transparent text-stone-300 border border-stone-200'
                                }`}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-stone-900 text-base md:text-lg line-clamp-1 group-hover:text-agri-green transition-colors">{post.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-1.5 font-medium border-l border-transparent">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                                            {post.category}
                                        </span>
                                        <span className="text-stone-300">•</span>
                                        <span>{safeDateFormat(post.published_at)}</span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className="block font-serif font-bold text-xl md:text-2xl text-stone-900 group-hover:text-agri-green transition-colors">{(post.views || 0).toLocaleString()}</span>
                                    <span className="text-[10px] uppercase text-stone-400 tracking-widest font-bold">Views</span>
                                </div>
                            </Link>
                        ))}
                        {(!topStories || topStories.length === 0) && (
                            <div className="p-16 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4 text-2xl">📰</div>
                                <p className="text-stone-500 font-medium mb-2">No published stories yet</p>
                                <Link href="/admin/posts/new" className="text-sm font-bold text-stone-900 hover:text-agri-green transition-colors border-b border-transparent hover:border-agri-green">Publish your first post →</Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* Right Column: Feeds & Queues */}
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
                    
                    {/* Needs Review (Premium Glassy Card) */}
                    {reviewQueue && reviewQueue.length > 0 && (
                        <section className="relative overflow-hidden bg-white border border-stone-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] rounded-[2rem]">
                            <div className="p-5 border-b border-stone-100 flex items-center justify-between relative z-10 w-full mb-0">
                                <div className="flex items-center gap-2">
                                    <h2 className="font-bold text-sm text-stone-900 pl-1">Pending Review</h2>
                                </div>
                                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 flex items-center rounded-lg uppercase tracking-wider">{pendingReview} Queued</span>
                            </div>
                            <div className="divide-y divide-stone-100/50">
                                {reviewQueue.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/admin/posts/${post.id}`}
                                        className="block p-5 hover:bg-stone-50 transition-colors group"
                                    >
                                        <h4 className="font-bold text-sm text-stone-800 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">{post.title || "Untitled"}</h4>
                                        <div className="flex items-center justify-between mt-3">
                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">by {post.author_name}</p>
                                            <span className="text-[10px] text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded">Review →</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Inbox / Recent Drafts */}
                    <section className="bg-gradient-to-b from-stone-50/50 to-white border border-stone-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] rounded-[2rem] flex-1">
                        <div className="p-6 border-b border-stone-100/80 flex items-end justify-between">
                            <div>
                                <h2 className="font-bold text-sm text-stone-900">Inbox & Drafts</h2>
                                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mt-1">Latest Content</p>
                            </div>
                            <Link 
                                href="/admin/posts?status=draft"
                                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors"
                            >
                                <span className="text-xs">→</span>
                            </Link>
                        </div>
                        <div className="divide-y divide-stone-100">
                            {recentDrafts?.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/admin/posts/${post.id}`}
                                    className="block p-5 hover:bg-stone-50 transition-colors group relative"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md flex items-center ${
                                            post.source === 'whatsapp' 
                                                ? 'bg-green-50 text-green-700' 
                                                : 'bg-stone-100 text-stone-600'
                                        }`}>
                                            {post.source === 'whatsapp' ? '📱 WhatsApp' : '⌨️ Manual Draft'}
                                        </span>
                                        <span className="text-[10px] text-stone-400 font-bold">{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <h4 className="font-bold text-sm text-stone-800 line-clamp-2 leading-relaxed group-hover:text-stone-950 transition-colors">{post.title || "Untitled Draft"}</h4>
                                </Link>
                            ))}
                            {(!recentDrafts || recentDrafts.length === 0) && (
                                <div className="p-12 text-center">
                                    <div className="w-12 h-12 bg-white border border-dashed border-stone-300 rounded-full flex items-center justify-center mb-3 mx-auto text-stone-300">✏️</div>
                                    <p className="text-xs font-medium text-stone-500 mb-2">No pending drafts in inbox</p>
                                    <Link href="/admin/posts/new" className="text-[10px] font-bold uppercase tracking-widest text-stone-900 hover:text-agri-green transition-colors">Create Draft</Link>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
