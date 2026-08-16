import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';
import { safeDateFormat } from '@/lib/utils/date';
import { getPublicPostHref } from '@/lib/public-posts';
import { Sparkles, ArrowRight } from 'lucide-react';

type Props = {
    posts: Post[];
};

export default function FeaturedGrid({ posts }: Props) {
    if (!posts || posts.length === 0) {
        return (
            <section className="editorial-shell py-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
                    <p className="text-sm font-semibold text-slate-700 mb-1">Curated picks are updating</p>
                    <p className="text-xs text-slate-400 mb-3">Our editorial team is hand-picking featured stories.</p>
                    <Link href="/updates" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                        Browse all coverage &rarr;
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="editorial-shell py-6">
            <div className="flex items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-emerald-100 text-emerald-800">
                        <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Curated Editorial Focus
                    </h2>
                </div>
                <Link
                    href="/updates"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
                >
                    <span>View all</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {posts.slice(0, 3).map((post, idx) => (
                    <article
                        key={post.id}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden hover:-translate-y-0.5"
                    >
                        <Link href={getPublicPostHref(post)} className="block">
                            {/* Image with overlay badge */}
                            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                <Image
                                    src={post.image_url || '/placeholder.jpg'}
                                    alt={post.title}
                                    fill
                                    priority={idx === 0}
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-3 left-3">
                                    <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/60 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-2xs">
                                        {post.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold leading-snug text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 mb-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-xs leading-relaxed text-slate-600 line-clamp-2 mb-4">
                                        {post.excerpt || 'Read the full brief on policy, field trials, and market analysis.'}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                    <span className="font-medium text-slate-600 truncate max-w-[150px]">
                                        By {post.author_name || 'Agri Desk'}
                                    </span>
                                    <span>
                                        {safeDateFormat(post.published_at, { month: 'short', day: 'numeric' }, 'en-IN')}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </article>
                ))}
            </div>
        </section>
    );
}
