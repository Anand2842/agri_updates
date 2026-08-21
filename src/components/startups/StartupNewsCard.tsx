import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types/database';
import { safeDateFormat } from '@/lib/utils/date';
import { ArrowRight } from 'lucide-react';

interface StartupNewsCardProps {
    post: Post;
    variant?: 'featured' | 'standard' | 'compact';
}

export default function StartupNewsCard({ post, variant = 'standard' }: StartupNewsCardProps) {
    const isFeatured = variant === 'featured';
    const isCompact = variant === 'compact';

    return (
        <article className={`bg-white group flex h-full overflow-hidden transition-all duration-200 border border-stone-200 hover:shadow-md hover:border-startup-emerald rounded-2xl ${isCompact ? 'flex-col' : isFeatured ? 'flex-col' : 'flex-col sm:flex-row'}`}>
            
            {!isCompact && post.image_url && (
                <Link 
                    href={`/blog/${post.slug}`} 
                    className={`block relative overflow-hidden bg-stone-100 flex-shrink-0 ${isFeatured ? 'aspect-[3/2] w-full' : 'w-full sm:w-1/3 aspect-video sm:aspect-auto'}`}
                >
                    <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                </Link>
            )}

            <div className={`flex flex-col flex-grow ${isFeatured ? 'p-6 md:p-8' : 'p-5 md:p-6'}`}>
                {/* Meta Row: Tag & Date */}
                <div className="flex items-center gap-2 mb-3">
                    {post.tags && post.tags.length > 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-startup-emerald bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-sm">
                            {post.tags[0]}
                        </span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                        {safeDateFormat(post.published_at)}
                    </span>
                </div>

                {/* Title */}
                <h3 className={`font-serif font-bold leading-tight mb-2 text-stone-900 group-hover:text-startup-emerald transition-colors ${isFeatured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'} ${isCompact ? 'text-[17px]' : ''}`}>
                    <Link href={`/blog/${post.slug}`} className="block">
                        <span className="transform transition-transform duration-200 inline-block group-hover:translate-x-1">
                            {post.title}
                        </span>
                    </Link>
                </h3>

                {/* Excerpt */}
                {!isCompact && post.excerpt && (
                    <p className={`text-sm text-stone-500 leading-relaxed mb-4 line-clamp-3 ${isFeatured ? 'md:text-base md:line-clamp-4' : ''}`}>
                        {post.excerpt}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            By {post.author_name || 'Agri Updates'}
                        </span>
                    </div>
                    {isFeatured && (
                        <ArrowRight size={16} className="text-startup-emerald opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                    )}
                </div>
            </div>
        </article>
    );
}
