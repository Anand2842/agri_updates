import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { safeDateFormat } from '@/lib/utils/date'
import { CheckCircle2, Edit3, ArrowRight, User } from 'lucide-react'

export const revalidate = 0;

export default async function ReviewQueuePage() {
    const supabase = await createClient()

    // Fetch posts that are pending review
    const { data: posts } = await supabase
        .from('posts')
        .select('id, title, excerpt, content, category, author_name, updated_at, created_at, scheduled_for, image_url')
        .eq('status', 'pending_review')
        .order('updated_at', { ascending: false })

    const count = posts?.length || 0;

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">Review Queue</h1>
                        <span className="admin-badge admin-badge-review">
                            {count} {count === 1 ? 'Story' : 'Stories'} Pending
                        </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                        Review submissions from authors and staff before going live.
                    </p>
                </div>

                <Link
                    href="/admin/posts"
                    className="text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1 self-start sm:self-auto"
                >
                    <span>All Stories</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Queue Table */}
            <div className="admin-card-flush overflow-hidden">
                {count === 0 ? (
                    <div className="p-12 sm:p-16 text-center">
                        <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-stone-900 mb-1">Queue is clear!</h3>
                        <p className="text-xs text-stone-400 max-w-sm mx-auto mb-4">
                            All submitted articles have been reviewed and published.
                        </p>
                        <Link
                            href="/admin/posts/new"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
                        >
                            + Draft a New Story
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-stone-100">
                        {posts?.map((post) => {
                            const plainText = (post.content || '').replace(/<[^>]*>/g, ' ').trim();
                            const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;

                            return (
                                <div key={post.id} className="p-4 sm:p-5 hover:bg-stone-50/60 transition-colors group">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0 space-y-1.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="admin-badge admin-badge-review">
                                                    Pending Review
                                                </span>
                                                <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                                                    {post.category}
                                                </span>
                                                <span className="text-xs text-stone-400">
                                                    {words} words
                                                </span>
                                            </div>

                                            <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 group-hover:text-amber-900 transition-colors">
                                                <Link href={`/admin/posts/${post.id}`}>
                                                    {post.title || 'Untitled Submission'}
                                                </Link>
                                            </h3>

                                            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                                                {post.excerpt || plainText.substring(0, 160) || 'No excerpt provided.'}
                                            </p>

                                            <div className="flex items-center gap-3 pt-1 text-xs text-stone-400">
                                                <span className="flex items-center gap-1 font-medium text-stone-600">
                                                    <User className="w-3 h-3 text-stone-400" />
                                                    {post.author_name}
                                                </span>
                                                <span>·</span>
                                                <span>Submitted {safeDateFormat(post.updated_at || post.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                            <Link
                                                href={`/admin/posts/${post.id}`}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-all active:scale-[0.97] shadow-xs"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                                <span>Open in Writer</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
