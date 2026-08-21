import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { safeDateFormat } from '@/lib/utils/date';

export const revalidate = 0;

export default async function AdminHome() {
    const supabase = await createClient()

    // Get current user for greeting + "Your Work"
    const { data: { user } } = await supabase.auth.getUser()
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'

    // ─── Fetch key stats in parallel ───
    const [
        { count: publishedCount },
        { count: draftCount },
        { count: pendingReviewCount },
        { count: scheduledCount },
        { data: allPostViews },
        { data: todayPublished },
        { data: topStories },
        { data: recentDrafts },
        { data: reviewQueue },
        { data: scheduledToday },
    ] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
        supabase.from('posts').select('views'),
        (() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return supabase.from('posts').select('views').gte('published_at', today.toISOString());
        })(),
        supabase.from('posts').select('id, title, views, category, published_at').eq('status', 'published').order('views', { ascending: false }).limit(5),
        supabase.from('posts').select('id, title, category, created_at, source, excerpt, content').eq('status', 'draft').order('created_at', { ascending: false }).limit(5),
        supabase.from('posts').select('id, title, author_name, created_at').eq('status', 'pending_review').order('created_at', { ascending: false }).limit(5),
        (() => {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            return supabase.from('posts').select('id, title, category, scheduled_for').eq('status', 'scheduled').gte('scheduled_for', todayStart.toISOString()).lte('scheduled_for', todayEnd.toISOString()).order('scheduled_for', { ascending: true });
        })(),
    ])

    const totalPublished = publishedCount || 0
    const totalDrafts = draftCount || 0
    const totalPendingReview = pendingReviewCount || 0
    const totalScheduled = scheduledCount || 0
    const totalViews = allPostViews?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0
    const todayViews = todayPublished?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0

    // Greeting based on time
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

    // Estimate draft completeness from content length
    const estimateCompletion = (post: { title?: string; content?: string | null; excerpt?: string | null }) => {
        let score = 0
        if (post.title && post.title.length > 5) score += 30
        if (post.excerpt && post.excerpt.length > 10) score += 15
        if (post.content) {
            const len = post.content.replace(/<[^>]*>/g, '').length
            if (len > 500) score += 55
            else if (len > 200) score += 40
            else if (len > 50) score += 25
            else score += 10
        }
        return Math.min(score, 100)
    }

    const hasActions = totalPendingReview > 0 || (scheduledToday && scheduledToday.length > 0)

    return (
        <div className="max-w-4xl pb-12 space-y-8">

            {/* ─── Greeting ─── */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                        {greeting}, {userName}
                    </h1>
                    <p className="text-sm text-stone-400 mt-0.5">{dateStr}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/posts/new"
                        className="inline-flex items-center gap-1.5 bg-stone-900 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-stone-800 transition-colors active:scale-[0.97]"
                    >
                        + New Story
                    </Link>
                    <Link
                        href="/admin/posts/generate"
                        className="inline-flex items-center gap-1.5 text-stone-600 border px-4 py-2 rounded-lg font-semibold text-sm hover:bg-stone-50 transition-colors"
                        style={{ borderColor: 'var(--admin-border-strong)' }}
                    >
                        ✨ AI Assist
                    </Link>
                    <Link
                        href="/"
                        target="_blank"
                        className="hidden sm:inline-flex items-center gap-1 text-stone-400 text-sm font-medium hover:text-stone-700 transition-colors"
                    >
                        View Site →
                    </Link>
                </div>
            </header>

            {/* ─── Action Required ─── */}
            {hasActions && (
                <div className="space-y-2">
                    <h2 className="admin-section-label px-0">Action Required</h2>
                    <div className="space-y-1.5">
                        {totalPendingReview > 0 && (
                            <div className="admin-action-banner">
                                <span>{totalPendingReview} {totalPendingReview === 1 ? 'story' : 'stories'} awaiting review</span>
                                <Link href="/admin/review">Review →</Link>
                            </div>
                        )}
                        {scheduledToday && scheduledToday.length > 0 && (
                            <div className="admin-action-banner" style={{ background: 'var(--admin-ai-light)', borderColor: 'rgba(124,58,237,0.15)', color: '#5B21B6' }}>
                                <span>{scheduledToday.length} {scheduledToday.length === 1 ? 'story' : 'stories'} scheduled today</span>
                                <Link href="/admin/calendar" style={{ color: 'var(--admin-ai)' }}>View →</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── Today's Newsroom (horizontal stat row) ─── */}
            <div className="admin-card-flush">
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x" style={{ borderColor: 'var(--admin-border)' }}>
                    <Link href="/admin/posts?status=published" className="admin-stat p-4 sm:p-5 hover:bg-stone-50 transition-colors">
                        <span className="admin-stat-value" style={{ color: 'var(--admin-success)' }}>{totalPublished}</span>
                        <span className="admin-stat-label">Live Now</span>
                    </Link>
                    <Link href="/admin/review" className="admin-stat p-4 sm:p-5 hover:bg-stone-50 transition-colors">
                        <span className="admin-stat-value" style={{ color: totalPendingReview > 0 ? 'var(--admin-warning)' : 'var(--admin-text)' }}>{totalPendingReview}</span>
                        <span className="admin-stat-label">In Review</span>
                    </Link>
                    <Link href="/admin/posts?status=scheduled" className="admin-stat p-4 sm:p-5 hover:bg-stone-50 transition-colors">
                        <span className="admin-stat-value" style={{ color: 'var(--admin-ai)' }}>{totalScheduled}</span>
                        <span className="admin-stat-label">Scheduled</span>
                    </Link>
                    <Link href="/admin/posts?status=draft" className="admin-stat p-4 sm:p-5 hover:bg-stone-50 transition-colors">
                        <span className="admin-stat-value">{totalDrafts}</span>
                        <span className="admin-stat-label">Drafts</span>
                    </Link>
                </div>
            </div>

            {/* ─── Your Work ─── */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="admin-section-label px-0">Your Work</h2>
                    <Link href="/admin/posts?status=draft" className="text-xs font-semibold text-stone-400 hover:text-stone-700 transition-colors">
                        All drafts →
                    </Link>
                </div>
                {recentDrafts && recentDrafts.length > 0 ? (
                    <div className="admin-card-flush divide-y" style={{ borderColor: 'var(--admin-border)' }}>
                        {recentDrafts.map((post) => {
                            const completion = estimateCompletion(post)
                            return (
                                <Link
                                    key={post.id}
                                    href={`/admin/posts/${post.id}`}
                                    className="flex items-center gap-4 p-3.5 hover:bg-stone-50 transition-colors group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm text-stone-800 truncate group-hover:text-stone-950 transition-colors">
                                            {post.title || 'Untitled draft'}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-stone-400">
                                            <span>{post.category}</span>
                                            <span>·</span>
                                            <span>{post.source === 'whatsapp' ? '📱 WhatsApp' : 'Manual'}</span>
                                            <span>·</span>
                                            <span>{safeDateFormat(post.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="hidden sm:flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{
                                                        width: `${completion}%`,
                                                        background: completion >= 80 ? 'var(--admin-success)' : completion >= 40 ? 'var(--admin-warning)' : 'var(--admin-text-muted)',
                                                    }}
                                                />
                                            </div>
                                            <span className="text-[11px] font-semibold text-stone-400 w-8 text-right">{completion}%</span>
                                        </div>
                                        <span className="text-xs text-stone-400 group-hover:text-stone-600 transition-colors">Edit →</span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <div className="admin-card text-center py-8">
                        <p className="text-sm text-stone-400 mb-2">No drafts in progress</p>
                        <Link href="/admin/posts/new" className="text-sm font-semibold text-stone-900 hover:text-stone-600 transition-colors">
                            Start writing →
                        </Link>
                    </div>
                )}
            </div>

            {/* ─── Publishing Today ─── */}
            {scheduledToday && scheduledToday.length > 0 && (
                <div>
                    <h2 className="admin-section-label px-0 mb-3">Publishing Today</h2>
                    <div className="admin-card-flush divide-y" style={{ borderColor: 'var(--admin-border)' }}>
                        {scheduledToday.map((post) => (
                            <Link
                                key={post.id}
                                href={`/admin/posts/${post.id}`}
                                className="flex items-center gap-4 p-3.5 hover:bg-stone-50 transition-colors group"
                            >
                                <span className="text-xs font-mono font-semibold text-stone-400 shrink-0 w-12">
                                    {post.scheduled_for ? new Date(post.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                </span>
                                <span className="admin-badge admin-badge-scheduled shrink-0">{post.category}</span>
                                <h4 className="font-semibold text-sm text-stone-800 truncate group-hover:text-stone-950 transition-colors">
                                    {post.title || 'Untitled'}
                                </h4>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Performance ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Performance stats */}
                <div className="lg:col-span-2 space-y-3">
                    <h2 className="admin-section-label px-0">Performance</h2>
                    <div className="admin-card space-y-4">
                        <div className="admin-stat">
                            <span className="admin-stat-value">{totalViews.toLocaleString()}</span>
                            <span className="admin-stat-label">Total Views</span>
                        </div>
                        <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '12px' }}>
                            <div className="admin-stat">
                                <span className="admin-stat-value text-xl">+{todayViews.toLocaleString()}</span>
                                <span className="admin-stat-label">Today</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top stories compact */}
                <div className="lg:col-span-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="admin-section-label px-0">Top Stories</h2>
                        <Link href="/admin/posts?sort=views" className="text-xs font-semibold text-stone-400 hover:text-stone-700 transition-colors">
                            View all →
                        </Link>
                    </div>
                    {topStories && topStories.length > 0 ? (
                        <div className="admin-card-flush divide-y" style={{ borderColor: 'var(--admin-border)' }}>
                            {topStories.map((post, i) => (
                                <Link
                                    key={post.id}
                                    href={`/admin/posts/${post.id}`}
                                    className="flex items-center gap-3 p-3 hover:bg-stone-50 transition-colors group"
                                >
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                        i === 0 ? 'bg-amber-100 text-amber-700'
                                        : i === 1 ? 'bg-stone-100 text-stone-500'
                                        : i === 2 ? 'bg-orange-50 text-orange-600'
                                        : 'text-stone-300'
                                    }`}>
                                        {i + 1}
                                    </span>
                                    <h4 className="font-medium text-sm text-stone-700 truncate flex-1 group-hover:text-stone-950 transition-colors">
                                        {post.title}
                                    </h4>
                                    <span className="text-sm font-bold text-stone-500 shrink-0 tabular-nums">
                                        {(post.views || 0).toLocaleString()}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="admin-card text-center py-6">
                            <p className="text-sm text-stone-400">No published stories yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Pending Review (if any) ─── */}
            {reviewQueue && reviewQueue.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="admin-section-label px-0">Review Queue</h2>
                        <Link href="/admin/review" className="text-xs font-semibold text-stone-400 hover:text-stone-700 transition-colors">
                            Review all →
                        </Link>
                    </div>
                    <div className="admin-card-flush divide-y" style={{ borderColor: 'var(--admin-border)' }}>
                        {reviewQueue.map((post) => (
                            <Link
                                key={post.id}
                                href={`/admin/posts/${post.id}`}
                                className="flex items-center justify-between p-3.5 hover:bg-stone-50 transition-colors group"
                            >
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-sm text-stone-800 truncate group-hover:text-stone-950 transition-colors">
                                        {post.title || 'Untitled'}
                                    </h4>
                                    <p className="text-xs text-stone-400 mt-0.5">by {post.author_name} · {safeDateFormat(post.created_at)}</p>
                                </div>
                                <span className="admin-badge admin-badge-review shrink-0 ml-3">Review</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
