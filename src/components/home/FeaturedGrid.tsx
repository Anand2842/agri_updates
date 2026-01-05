import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';

type Props = {
    posts: Post[];
};

export default function FeaturedGrid({ posts }: Props) {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="container mx-auto px-4 py-8 md:py-12 border-b border-stone-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {posts.slice(0, 3).map((post) => (
                    <div key={post.id} className="group">
                        <Link href={`/blog/${post.slug}`} className="block">
                            <div className="relative aspect-[16/10] mb-4 overflow-hidden bg-stone-100 border border-stone-200">
                                <Image
                                    src={post.image_url || '/placeholder.jpg'}
                                    alt={post.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <h2 className="font-serif text-xl md:text-2xl font-bold leading-tight mb-3 group-hover:underline decoration-2 decoration-agri-green underline-offset-4">
                                    {post.title}
                                </h2>
                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-2">
                                    <span className="text-agri-green">[{post.category}]</span>
                                    <span>By {post.author_name}</span>
                                </div>
                                <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed font-serif text-stone-500">
                                    {post.excerpt}
                                </p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}
