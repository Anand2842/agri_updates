import Link from 'next/link';
import { Post } from '@/types/database';
import { getPublicPostHref } from '@/lib/public-posts';
import { ArrowRight } from 'lucide-react';

function formatTime(dateString: string | null) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function LatestNewsFeed({ posts }: { posts: Post[] }) {
    if (!posts || posts.length === 0) return null;

    return (
        <div className="flex flex-col h-full bg-[#F5F7F7] p-5 sm:p-6 md:p-8 rounded-xl sm:border sm:border-slate-200/70 shadow-2xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 mb-5 sm:mb-6 border-b border-slate-200">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Latest News
                </h3>
                <Link
                    href="/updates"
                    className="text-[10px] sm:text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors uppercase tracking-widest flex items-center gap-1 group"
                >
                    <span>View all</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>
            
            {/* Ticker Feed with Continuous Timeline */}
            <div className="relative pl-3.5 sm:pl-4 border-l-2 border-emerald-500/25 ml-1">
                <div className="flex flex-col gap-4 sm:gap-5">
                    {posts.slice(0, 8).map((post) => (
                        <article key={post.id} className="group relative flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-5 pb-4 sm:pb-5 border-b border-slate-200/60 last:border-0 last:pb-0">
                            {/* Node on the timeline */}
                            <div className="absolute -left-[19px] sm:-left-[21px] top-1 w-2 h-2 rounded-full bg-emerald-600 ring-4 ring-[#F5F7F7] group-hover:scale-125 transition-transform"></div>

                            {/* Time & Category */}
                            <div className="flex items-center gap-2.5 sm:w-36 shrink-0">
                                <time className="text-[11px] sm:text-xs font-black text-slate-700 font-mono">
                                    {formatTime(post.published_at)}
                                </time>
                                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-700 truncate px-1.5 py-0.5 rounded bg-emerald-50 sm:bg-transparent">
                                    {post.category}
                                </span>
                            </div>

                            {/* Headline */}
                            <div className="flex-1 min-w-0">
                                <Link href={getPublicPostHref(post)} className="block">
                                    <h4 className="text-[13px] sm:text-[15px] font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                                        {post.title}
                                    </h4>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}
