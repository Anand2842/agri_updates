import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';
import { safeDateFormat } from '@/lib/utils/date';

export default function MainHero({ post }: { post: Post }) {
    if (!post) return null;

    return (
        <div className="relative bg-white border border-stone-200">
            {/* Image */}
            <Link href={`/blog/${post.slug}`} className="block relative aspect-[4/3] md:aspect-[16/10] overflow-hidden group">
                <Image
                    src={post.image_url || '/placeholder.jpg'}
                    alt={post.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 800px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-white pb-6 md:pb-6">
                    {/* Category */}
                    <span className="inline-block bg-agri-green text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-3">
                        {post.category}
                    </span>

                    {/* Title */}
                    <h3 className="font-serif text-3xl md:text-4xl font-black leading-[1.1] mb-3 break-words [overflow-wrap:anywhere] drop-shadow-sm">
                        {post.title}
                    </h3>

                    {/* Meta */}
                    <div className="text-[10px] uppercase tracking-widest text-white/80 font-medium">
                        By {post.author_name} • {safeDateFormat(post.published_at, { month: 'short', day: 'numeric', year: 'numeric' }, 'en-IN')}
                    </div>
                </div>
            </Link>

            {/* Excerpt below image */}
            <div className="p-6 border-t border-stone-200">
                <p className="font-serif text-stone-600 leading-relaxed text-sm line-clamp-3">
                    {post.excerpt}
                </p>
            </div>
        </div>
    );
}
