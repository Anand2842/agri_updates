import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';

export default function DontMiss({ posts }: { posts: Post[] }) {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="container mx-auto px-4 py-12 border-t border-black">
            {/* Section Header */}
            <div className="flex items-center justify-center gap-4 mb-10">
                <div className="h-px bg-stone-300 flex-1 max-w-[100px]" />
                <h3 className="font-serif italic text-2xl md:text-3xl text-stone-900">Don&apos;t Miss</h3>
                <div className="h-px bg-stone-300 flex-1 max-w-[100px]" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {posts.slice(0, 4).map((post) => (
                    <article key={post.id} className="group">
                        <Link href={`/blog/${post.slug}`} className="block">
                            {/* Thumbnail */}
                            {post.image_url && (
                                <div className="relative aspect-[16/10] mb-3 overflow-hidden bg-stone-100">
                                    <Image
                                        src={post.image_url}
                                        alt={post.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 25vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            )}

                            {/* Category */}
                            <div className="category-badge mb-2 text-[9px]">
                                {post.category}
                            </div>

                            {/* Title */}
                            <h4 className="font-serif text-lg font-bold leading-snug mb-2 group-hover:text-agri-green transition-colors">
                                {post.title}
                            </h4>

                            {/* Excerpt */}
                            <p className="text-xs text-stone-500 leading-relaxed font-serif line-clamp-2">
                                {post.excerpt}
                            </p>
                        </Link>
                    </article>
                ))}
            </div>
        </section>
    );
}
