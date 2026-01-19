import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';

export default function MainHero({ post }: { post: Post }) {
    if (!post) return null;

    return (
        <div className="relative bg-white border border-stone-200">
            {/* Image */}
            <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden group">
                <Image
                    src={post.image_url || '/placeholder.jpg'}
                    alt={post.title}
                    fill
                    priority
                    sizes="(max-width: 1200px) 100vw, 800px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    {/* Category */}
                    <span className="inline-block bg-agri-green text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-3">
                        {post.category}
                    </span>

                    {/* Title */}
                    <h3 className="font-serif text-2xl md:text-3xl font-black leading-tight mb-2 break-words [overflow-wrap:anywhere]">
                        {post.title}
                    </h3>

                    {/* Meta */}
                    <div className="text-[10px] uppercase tracking-widest text-white/70">
                        By {post.author_name} • {new Date(post.published_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
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
