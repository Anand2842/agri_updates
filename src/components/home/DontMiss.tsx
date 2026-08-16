import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';
import { getPublicPostHref } from '@/lib/public-posts';
import { safeDateFormat } from '@/lib/utils/date';
import { Bookmark, ArrowRight } from 'lucide-react';

export default function DontMiss({ posts }: { posts: Post[] }) {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="editorial-shell py-8 border-t border-slate-200/80">
            {/* Section Header */}
            <div className="flex items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-amber-100 text-amber-900">
                        <Bookmark className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Deep Dives & Editor&apos;s Picks
                        </h2>
                    </div>
                </div>
                <Link
                    href="/updates"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
                >
                    <span>Explore archives</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {posts.slice(0, 4).map((post) => (
                    <article
                        key={post.id}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden hover:-translate-y-0.5"
                    >
                        <Link href={getPublicPostHref(post)} className="block flex-1 flex flex-col">
                            {/* Thumbnail */}
                            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                <Image
                                    src={post.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80'}
                                    alt={post.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 25vw"
                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-2.5 left-2.5">
                                    <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/60 text-[9px] font-bold uppercase tracking-wider text-slate-800">
                                        {post.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 mb-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                                        {post.excerpt || 'In-depth coverage on agriculture policy, agronomy, and enterprise market trends.'}
                                    </p>
                                </div>

                                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                                    <span className="font-medium text-slate-600 truncate max-w-[100px]">
                                        {post.author_name || 'Staff'}
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
