import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';
import { safeDateFormat } from '@/lib/utils/date';
import { getPublicPostHref } from '@/lib/public-posts';
import { ArrowRight } from 'lucide-react';

export default function MainHero({ post }: { post: Post }) {
    if (!post) return null;

    return (
        <article className="group flex flex-col h-full bg-white border border-slate-200/90 rounded-xl overflow-hidden hover:border-emerald-600/40 transition-colors duration-300 shadow-2xs">
            {/* Lead Image Container - Fixed 16:9 Aspect Ratio with object-cover */}
            <Link href={getPublicPostHref(post)} className="relative aspect-[16/9] w-full bg-slate-100 block overflow-hidden border-b border-slate-100">
                <Image
                    src={post.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80'}
                    alt={post.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
            </Link>

            {/* Content Area */}
            <div className="p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col flex-1 justify-between gap-5 sm:gap-6">
                <div>
                    <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                            {post.category}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-medium">{safeDateFormat(post.published_at, { month: 'short', day: 'numeric', year: 'numeric' }, 'en-IN')}</span>
                    </div>

                    <Link href={getPublicPostHref(post)} className="block group-hover:text-emerald-800 transition-colors">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[38px] font-bold text-slate-900 leading-[1.2] tracking-tight mb-3">
                            {post.title}
                        </h2>
                    </Link>

                    {post.excerpt && (
                        <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed line-clamp-2 sm:line-clamp-3 font-serif">
                            {post.excerpt}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-slate-100 mt-auto">
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
                        {post.author_name || 'Agri Updates Desk'}
                    </span>
                    <Link 
                        href={getPublicPostHref(post)}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors group/link shrink-0"
                    >
                        <span>Read story</span>
                        <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-1" />
                    </Link>
                </div>
            </div>
        </article>
    );
}
