import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types/database';
import { safeDateFormat } from '@/lib/utils/date';

interface StartupNewsCardProps {
    post: Post;
    variant?: 'featured' | 'compact';
}

export default function StartupNewsCard({ post, variant = 'compact' }: StartupNewsCardProps) {
    const isFeatured = variant === 'featured';

    return (
        <article className="border border-stone-200 bg-white group hover:border-agri-green transition-colors flex flex-col h-full shadow-sm">
            {isFeatured && post.image_url && (
                <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/9] w-full overflow-hidden bg-stone-100">
                    <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                </Link>
            )}
            <div className={`flex flex-col flex-grow ${isFeatured ? 'p-6' : 'p-5'}`}>
                {/* Meta Row: Tag & Date */}
                <div className="flex items-center gap-2 mb-3">
                    {post.tags && post.tags.length > 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#2D5016] bg-stone-100 px-2 py-0.5 rounded-sm">
                            {post.tags[0]}
                        </span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                        {safeDateFormat(post.published_at)}
                    </span>
                </div>

                {/* Title */}
                <h3 className={`font-serif font-bold leading-tight mb-2 group-hover:text-[#2D5016] transition-colors ${isFeatured ? 'text-2xl' : 'text-lg'}`}>
                    <Link href={`/blog/${post.slug}`} className="block hover:underline decoration-2 underline-offset-4 decoration-[#2D5016]/30">
                        {post.title}
                    </Link>
                </h3>

                {/* Excerpt */}
                {post.excerpt && (
                    <p className="text-sm text-stone-500 leading-relaxed mb-4 line-clamp-3">
                        {post.excerpt}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                            By {post.author_name || 'Agri Updates'}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}
