import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types/database';
import { getPublicPostHref } from '@/lib/public-posts';

export default function Trending({ posts }: { posts: Post[] }) {
    if (!posts || posts.length === 0) return null;

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Section Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-5">
                <h3 className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-slate-900">
                    Trending Stories
                </h3>
            </div>

            <div className="flex flex-col gap-4 sm:gap-5">
                {posts.slice(0, 5).map((post, index) => (
                    <div key={post.id} className="group flex gap-3.5 sm:gap-4 items-start pb-4 sm:pb-5 border-b border-slate-100 last:border-0 last:pb-0">
                        {/* Ranking Number */}
                        <span className="text-2xl sm:text-[28px] font-black text-slate-200 group-hover:text-emerald-700 transition-colors leading-none w-5 sm:w-6 flex-shrink-0 text-center font-serif">
                            {index + 1}
                        </span>

                        {/* Thumbnail */}
                        <Link href={getPublicPostHref(post)} className="block w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/60 relative">
                            <Image 
                                src={post.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80'}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 640px) 56px, 64px"
                            />
                        </Link>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[3.5rem] sm:min-h-[4rem]">
                            <Link href={getPublicPostHref(post)} className="block">
                                <h4 className="text-[13px] sm:text-[14px] font-bold text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2 mb-1">
                                    {post.title}
                                </h4>
                            </Link>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                                    {post.category}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-3 sm:pt-4 mt-1 border-t border-slate-100">
                <Link
                    href="/updates"
                    className="text-[11px] sm:text-xs font-bold text-slate-400 hover:text-emerald-800 transition-colors uppercase tracking-wider flex items-center gap-1"
                >
                    Explore all updates →
                </Link>
            </div>
        </div>
    );
}
