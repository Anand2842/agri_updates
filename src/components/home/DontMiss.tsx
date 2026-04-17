import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';

export default function DontMiss({ posts }: { posts: Post[] }) {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="max-w-[1600px] mx-auto px-4 py-2 border-t border-stone-200">
            {/* Section Header */}
            <div className="sticky top-14 z-20 md:static flex items-center justify-center gap-4 mb-2 md:mb-4 py-1 px-6 mx-auto w-fit card-glass rounded-full md:bg-transparent md:border-none md:shadow-none md:backdrop-blur-none">
                <div className="h-px bg-stone-400 flex-1 w-8 md:w-24 hidden md:block" />
                <h3 className="font-serif italic text-xl md:text-3xl font-bold text-stone-900">Don&apos;t Miss</h3>
                <div className="h-px bg-stone-400 flex-1 w-8 md:w-24 hidden md:block" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {posts.slice(0, 4).map((post) => (
                    <article key={post.id} className="group card-neu p-3 md:p-0 md:bg-transparent md:border-none md:shadow-none md:rounded-none flex flex-col">
                        <Link href={`/blog/${post.slug}`} className="block flex-1 flex flex-col h-full">
                            {/* Thumbnail */}
                            {post.image_url && (
                                <div className="relative aspect-square md:aspect-[16/10] mb-3 overflow-hidden rounded-md md:rounded-none bg-stone-100">
                                    <Image
                                        src={post.image_url}
                                        alt={post.title}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            )}

                            {/* Category */}
                            <div className="category-badge mb-1 md:mb-2 text-[8px] md:text-[9px]">
                                {post.category}
                            </div>

                            {/* Title */}
                            <h4 className="font-serif text-[0.875rem] md:text-lg font-bold leading-snug mb-1 md:mb-2 group-hover:text-agri-green transition-colors line-clamp-3 md:line-clamp-none">
                                {post.title}
                            </h4>

                            {/* Excerpt */}
                            <p className="hidden md:block text-xs text-stone-500 leading-relaxed font-serif line-clamp-2">
                                {post.excerpt}
                            </p>
                        </Link>
                    </article>
                ))}
            </div>
        </section>
    );
}
