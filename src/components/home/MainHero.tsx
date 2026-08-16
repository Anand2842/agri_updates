import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';
import { safeDateFormat } from '@/lib/utils/date';
import { getPublicPostHref } from '@/lib/public-posts';
import { ArrowRight, Clock } from 'lucide-react';

export default function MainHero({ post }: { post: Post }) {
    if (!post) return null;

    return (
        <article className="paper-panel overflow-hidden group flex flex-col h-full bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Lead Image Container */}
            <Link href={getPublicPostHref(post)} className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 block">
                <Image
                    src={post.image_url || '/placeholder.jpg'}
                    alt={post.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 750px"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                
                {/* Floating category & lead badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md backdrop-blur-sm">
                        Lead Story
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-900/80 text-slate-200 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md border border-white/10">
                        {post.category}
                    </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-3 text-xs text-slate-300 mb-1">
                        <span>{safeDateFormat(post.published_at, { month: 'short', day: 'numeric', year: 'numeric' }, 'en-IN')}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            3 min read
                        </span>
                    </div>
                </div>
            </Link>

            {/* Content Area */}
            <div className="p-6 md:p-7 flex flex-col flex-1 justify-between gap-4">
                <div>
                    <Link href={getPublicPostHref(post)} className="block group-hover:text-emerald-800 transition-colors">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight mb-3">
                            {post.title}
                        </h2>
                    </Link>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed line-clamp-3">
                        {post.excerpt || 'Comprehensive field reporting, policy analysis, and industry perspective from the Agri Updates intelligence desk.'}
                    </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200">
                            {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                            <span className="block text-xs font-semibold text-slate-900">
                                {post.author_name || 'Editorial Staff'}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                                Desk Reporter
                            </span>
                        </div>
                    </div>

                    <Link
                        href={getPublicPostHref(post)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-emerald-700 transition-all shadow-xs group/btn"
                    >
                        <span>Read Story</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                </div>
            </div>
        </article>
    );
}
