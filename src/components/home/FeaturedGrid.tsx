import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';
import { getPublicPostHref } from '@/lib/public-posts';
import { safeDateFormat } from '@/lib/utils/date';

export default function FeaturedGrid({ posts }: { posts: Post[] }) {
    if (!posts || posts.length === 0) return null;

    const featured = posts[0];
    const secondary = posts.slice(1, 3);

    return (
        <section className="editorial-shell py-8 sm:py-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mb-6 sm:mb-8 pb-3 sm:pb-4 border-b-2 border-slate-900">
                <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                        Curated Editorial Focus
                    </h2>
                    <p className="text-slate-500 mt-1 sm:mt-1.5 text-xs sm:text-sm max-w-xl">
                        Stories worth your attention. Deep analysis and exclusive reporting from the Agri Updates newsroom.
                    </p>
                </div>
                <Link
                    href="/updates"
                    className="text-[11px] sm:text-xs font-bold text-emerald-700 hover:text-emerald-800 uppercase tracking-widest transition-colors shrink-0"
                >
                    View all stories →
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* DOMINANT CARD (Full width on mobile, 8 cols on desktop) */}
                {featured && (
                    <article className="lg:col-span-8 group flex flex-col rounded-xl overflow-hidden border border-slate-200/80 bg-white shadow-2xs hover:shadow-md transition-shadow">
                        <Link href={getPublicPostHref(featured)} className="block relative aspect-[16/9] bg-slate-100 overflow-hidden">
                            <Image
                                src={featured.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80'}
                                alt={featured.title}
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 66vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                            />
                            <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                                <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm border border-slate-200/50 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-emerald-800 shadow-2xs rounded">
                                    {featured.category}
                                </span>
                            </div>
                        </Link>
                        <div className="p-5 sm:p-6 md:p-8 flex flex-col flex-1">
                            <Link href={getPublicPostHref(featured)} className="block mb-3">
                                <h3 className="text-lg sm:text-2xl md:text-3xl font-bold leading-snug text-slate-900 group-hover:text-emerald-700 transition-colors">
                                    {featured.title}
                                </h3>
                            </Link>
                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-3 mb-4 sm:mb-6 font-serif">
                                {featured.excerpt || 'Read the full brief on policy, field trials, and market analysis.'}
                            </p>
                            <div className="mt-auto pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                                <span>By {featured.author_name || 'Agri Desk'}</span>
                                <span>{safeDateFormat(featured.published_at, { month: 'short', day: 'numeric' }, 'en-IN')}</span>
                            </div>
                        </div>
                    </article>
                )}

                {/* SECONDARY CARDS (Stacked) */}
                {secondary.length > 0 && (
                    <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8">
                        {secondary.map((post) => (
                            <article key={post.id} className="group flex flex-col flex-1 rounded-xl overflow-hidden border border-slate-200/80 bg-white shadow-2xs hover:shadow-md transition-shadow">
                                <Link href={getPublicPostHref(post)} className="block relative aspect-video bg-slate-100 overflow-hidden">
                                    <Image
                                        src={post.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80'}
                                        alt={post.title}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 33vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                    <div className="absolute top-2.5 left-2.5">
                                        <span className="px-2 py-0.5 bg-white/95 backdrop-blur-sm border border-slate-200/50 text-[9px] font-bold uppercase tracking-widest text-emerald-800 shadow-2xs rounded">
                                            {post.category}
                                        </span>
                                    </div>
                                </Link>
                                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                                    <div>
                                        <Link href={getPublicPostHref(post)} className="block mb-2">
                                            <h3 className="text-sm sm:text-base md:text-lg font-bold leading-snug text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 sm:line-clamp-3">
                                                {post.title}
                                            </h3>
                                        </Link>
                                    </div>
                                    <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-2">
                                        <span>{post.author_name || 'Agri Desk'}</span>
                                        <span>{safeDateFormat(post.published_at, { month: 'short', day: 'numeric' }, 'en-IN')}</span>
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
