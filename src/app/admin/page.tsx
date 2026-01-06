import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export const revalidate = 0;

export default async function AdminDashboard() {
    const supabase = await createClient()

    // 1. Fetch Key Stats
    const { count: totalPosts } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published')
    const { count: draftPosts } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft')

    // Calculate Total Views
    const { data: allPosts } = await supabase.from('posts').select('views');
    const totalViews = allPosts?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;

    // 2. Fetch Top Performing Stories
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

    return (
        <div className="max-w-6xl">
            <header className="mb-10">
                <h1 className="font-serif text-3xl font-bold text-stone-900">Newsroom Dashboard</h1>
                <p className="text-stone-500">Real-time media engagement overview.</p>
            </header>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-6 border-l-4 border-black shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Total Engagement</h3>
                    <p className="text-4xl font-serif font-bold text-stone-900">{totalViews.toLocaleString()}</p>
                    <p className="text-xs text-stone-400 mt-2">All-time article views</p>
                </div>
                <div className="bg-white p-6 border-l-4 border-agri-green shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Published Stories</h3>
                    <p className="text-4xl font-serif font-bold text-stone-900">{totalPosts}</p>
                    <p className="text-xs text-stone-400 mt-2">Live on website</p>
                </div>
                <div className="bg-white p-6 border-l-4 border-yellow-500 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Pending Drafts</h3>
                    <p className="text-4xl font-serif font-bold text-stone-900">{draftPosts}</p>
                    <p className="text-xs text-stone-400 mt-2">Waiting for review</p>
                </div>
                <div className="bg-stone-900 text-white p-6 shadow-sm flex flex-col justify-center items-center text-center">
                    <Link href="/admin/posts/new" className="hover:scale-105 transition-transform">
                        <span className="text-3xl mb-2 block">✍️</span>
                        <span className="font-bold uppercase tracking-widest text-sm">Write New Story</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Top Stories Column */}
                <section className="bg-white border border-stone-200 shadow-sm">
                    <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                        <h2 className="font-bold text-lg text-stone-800">🔥 Top Stories</h2>
                        <span className="text-xs text-stone-400 uppercase tracking-widest">Most Viewed</span>
                    </div>
                    <div>
                        {topStories?.map((post, i) => (
                            <Link
                                key={post.id}
                                href={`/admin/posts/${post.id}`}
                                className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors border-b last:border-0 border-stone-50"
                            >
                                <span className="font-serif text-2xl text-stone-300 font-bold w-8 text-center">{i + 1}</span>
                                <div className="flex-1">
                                    <h4 className="font-bold text-stone-800 line-clamp-1">{post.title}</h4>
                                    <div className="flex gap-2 text-xs text-stone-500 mt-1">
                                        <span className="uppercase text-[10px] font-bold bg-stone-100 px-1 rounded">{post.category}</span>
                                        <span>• {new Date(post.published_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-agri-green">{post.views || 0}</span>
                                    <span className="text-[10px] uppercase text-stone-400">Views</span>
                                </div>
                            </Link>
                        ))}
                        {topStories?.length === 0 && (
                            <div className="p-8 text-center text-stone-400">No data available yet.</div>
                        )}
                    </div>
                </section>

                {/* Recent Drafts / Incoming Feed */}
                <section className="bg-white border border-stone-200 shadow-sm">
                    <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                        <h2 className="font-bold text-lg text-stone-800">📥 Incoming Feed</h2>
                        <span className="text-xs text-stone-400 uppercase tracking-widest">Recent Drafts</span>
                    </div>
                    <div>
                        {recentDrafts?.map((post) => (
                            <Link
                                key={post.id}
                                href={`/admin/posts/${post.id}`}
                                className="block p-4 hover:bg-yellow-50 transition-colors border-b last:border-0 border-stone-50 group"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">
                                        {post.source === 'whatsapp' ? 'WhatsApp Bot' : 'Draft'}
                                    </span>
                                    <span className="text-xs text-stone-400">{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <h4 className="font-bold text-stone-800 group-hover:text-yellow-700 transition-colors">{post.title || "Untitled Draft"}</h4>
                            </Link>
                        ))}
                        {recentDrafts?.length === 0 && (
                            <div className="p-8 text-center text-stone-400">
                                <p>No pending drafts.</p>
                                <Link href="/admin/posts/new" className="text-indigo-600 text-sm font-bold mt-2 inline-block">Create One now</Link>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}
