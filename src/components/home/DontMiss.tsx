import Link from 'next/link';
import { Post } from '@/types/database';

export default function DontMiss({ posts }: { posts: Post[] }) {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="container mx-auto px-4 py-12 border-t border-b double-border-stone-200 my-12">
            <div className="flex items-center justify-center gap-4 mb-10">
                <div className="h-px bg-stone-300 w-20"></div>
                <h3 className="font-serif italic text-3xl text-stone-900 px-4">Don't Miss</h3>
                <div className="h-px bg-stone-300 w-20"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {posts.map((post) => (
                    <div key={post.id} className="text-center group p-4 border border-transparent hover:border-stone-100 hover:bg-stone-50 transition-all">
                        <div className="text-[10px] uppercase font-bold text-agri-green tracking-widest mb-3">
                            {post.category}
                        </div>
                        <Link href={`/blog/${post.slug}`} className="block">
                            <h4 className="font-serif text-xl font-bold leading-tight mb-3 group-hover:underline decoration-2 decoration-agri-green underline-offset-4">
                                {post.title}
                            </h4>
                        </Link>
                        <p className="text-xs text-stone-500 mb-3 line-clamp-3 leading-relaxed font-serif">
                            {post.excerpt}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
