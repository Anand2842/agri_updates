import Link from 'next/link';
import { Post } from '@/types/database';

export default function Trending({ posts }: { posts: Post[] }) {
    return (
        <div className="bg-white">
            <h3 className="w-full bg-agri-green text-white text-center text-xs font-bold uppercase tracking-widest py-2 mb-8">
                Trending
            </h3>
            <div className="flex flex-col divide-y divide-stone-100">
                {posts.slice(0, 5).map((post, index) => (
                    <div key={post.id} className="py-4 first:pt-0 group relative">
                        <span className="absolute -left-4 top-4 text-6xl font-serif font-black text-stone-100/80 -z-10 group-hover:text-agri-green/10 transition-colors select-none">
                            {index + 1}
                        </span>
                        <div className="pl-4">
                            <div className="text-[9px] uppercase font-bold text-stone-400 mb-1 tracking-widest">
                                {post.category}
                            </div>
                            <Link key={post.id} href={`/blog/${post.slug}`} className="block">
                                <h4 className="font-serif text-lg font-bold leading-tight group-hover:underline decoration-agri-green underline-offset-2">
                                    {post.title}
                                </h4>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
