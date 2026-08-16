import Link from 'next/link';
import { Post } from '@/types/database';
import { getPublicPostHref } from '@/lib/public-posts';
import { safeDateFormat } from '@/lib/utils/date';
import { TrendingUp } from 'lucide-react';

export default function Trending({ posts }: { posts: Post[] }) {
    if (!posts || posts.length === 0) {
        return (
            <div className="paper-panel p-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Trending Intelligence</h3>
                </div>
                <div className="py-8 text-center text-xs text-slate-400">
                    Trending stories are refreshing.
                </div>
            </div>
        );
    }

    return (
        <div className="paper-panel p-5 bg-white border border-slate-200/90 shadow-xs h-full flex flex-col justify-between">
            <div>
                {/* Section Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            Trending Reads
                        </h3>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Top 5</span>
                </div>

                {/* List */}
                <div className="divide-y divide-slate-100">
                    {posts.slice(0, 5).map((post, index) => (
                        <div key={post.id} className="group py-3.5 first:pt-2 last:pb-0 flex gap-3.5 items-start">
                            {/* Ranking Number */}
                            <span className="text-2xl font-black text-slate-200 group-hover:text-emerald-700 transition-colors leading-none w-5 flex-shrink-0 pt-0.5 text-center">
                                {index + 1}
                            </span>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                                        {post.category}
                                    </span>
                                    <span className="text-slate-300 text-[10px]">•</span>
                                    <span className="text-[10px] text-slate-400">
                                        {safeDateFormat(post.published_at, { month: 'short', day: 'numeric' }, 'en-IN')}
                                    </span>
                                </div>
                                <Link href={getPublicPostHref(post)} className="block">
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2">
                                        {post.title}
                                    </h4>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100">
                <Link
                    href="/updates"
                    className="block text-center text-xs font-semibold text-slate-600 hover:text-emerald-800 transition-colors"
                >
                    View Full Feed →
                </Link>
            </div>
        </div>
    );
}
