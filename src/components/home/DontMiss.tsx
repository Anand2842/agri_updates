import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';
import { getPublicPostHref } from '@/lib/public-posts';
import { safeDateFormat } from '@/lib/utils/date';
import { Bookmark, ArrowRight } from 'lucide-react';

export default function DontMiss({ posts }: { posts: Post[] }) {
    if (!posts || posts.length === 0) return null;

    const hero = posts[0];
    const secondary = posts.slice(1, 4);

    return (
        <section className="editorial-shell py-8 sm:py-12 border-t border-slate-200/80">
            {/* Section Header */}
            <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-slate-200/80">
                <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="p-1 sm:p-1.5 rounded-md bg-amber-100 text-amber-900">
                        <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                        <h2 className="text-xs sm:text-[13px] font-black uppercase tracking-widest text-slate-900">
                            Deep Dives & Editor&apos;s Picks
                        </h2>
                    </div>
                </div>
                <Link
                    href="/updates"
                    className="text-[10px] sm:text-[11px] font-bold text-emerald-700 hover:text-emerald-800 uppercase tracking-widest flex items-center gap-1 group"
                >
                    <span>Archives</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>

            {/* Asymmetrical Layout: Single column on mobile, 12 cols on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                
                {/* Hero Deep Dive (Full width on mobile, 7 cols on desktop) */}
                {hero && (
                    <article className="lg:col-span-7 group flex flex-col rounded-xl overflow-hidden bg-white">
                        <Link href={getPublicPostHref(hero)} className="block flex-1 flex flex-col">
                            {/* Thumbnail */}
                            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 rounded-xl mb-4 sm:mb-5">
                                <Image
                                    src={hero.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80'}
                                    alt={hero.title}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 60vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                                />
                                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                                    <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm border border-slate-200/50 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-emerald-800 shadow-2xs rounded">
                                        {hero.category}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <div>
                                    <h3 className="text-lg sm:text-2xl md:text-[26px] font-bold leading-snug text-slate-900 group-hover:text-emerald-700 transition-colors mb-2 sm:mb-3">
                                        {hero.title}
                                    </h3>
                                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4 font-serif">
                                        {hero.excerpt || 'In-depth coverage on agriculture policy, agronomy, and enterprise market trends.'}
                                    </p>
                                </div>

                                <div className="pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-auto">
                                    <span className="text-slate-600">
                                        {hero.author_name || 'Staff'}
                                    </span>
                                    <span>
                                        {safeDateFormat(hero.published_at, { month: 'short', day: 'numeric' }, 'en-IN')}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </article>
                )}

                {/* Secondary Deep Dives (Full width stack on mobile, 5 cols on desktop) */}
                {secondary.length > 0 && (
                    <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-5 lg:pl-4 lg:border-l lg:border-slate-100">
                        {secondary.map((post) => (
                            <article key={post.id} className="group flex gap-3.5 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100 last:border-0 last:pb-0">
                                <Link href={getPublicPostHref(post)} className="block w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 shrink-0 relative bg-slate-100 rounded-lg overflow-hidden border border-slate-200/50">
                                    <Image
                                        src={post.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80'}
                                        alt={post.title}
                                        fill
                                        sizes="(max-width: 640px) 80px, 128px"
                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                                    />
                                </Link>
                                <div className="flex flex-col justify-center min-w-0 flex-1">
                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-1 truncate">
                                        {post.category}
                                    </span>
                                    <Link href={getPublicPostHref(post)} className="block mb-1.5">
                                        <h3 className="text-xs sm:text-sm md:text-[15px] font-bold leading-snug text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 sm:line-clamp-3">
                                            {post.title}
                                        </h3>
                                    </Link>
                                    <div className="flex items-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        {safeDateFormat(post.published_at, { month: 'short', day: 'numeric' }, 'en-IN')}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
