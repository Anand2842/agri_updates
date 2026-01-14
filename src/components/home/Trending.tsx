import Link from 'next/link';
import { Post } from '@/types/database';

export default function Trending({ posts }: { posts: Post[] }) {
    if (!posts || posts.length === 0) return null;

    return (
        <div>
            {/* Section Header */}
            <h3 className="section-header-green mb-6">
                Trending
            </h3>

            {/* List */}
            <div className="flex flex-col">
                {posts.slice(0, 5).map((post, index) => (
                    <div key={post.id} className="newspaper-card-minimal group flex gap-4">
                        {/* Large Number */}
                        <span className="text-4xl font-serif font-black text-stone-200 group-hover:text-agri-green/30 transition-colors leading-none w-8 flex-shrink-0">
                            {index + 1}
                        </span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="category-badge mb-1 text-[9px]">
                                {post.category}
                            </div>
                            <Link href={`/blog/${post.slug}`} className="block">
                                <h4 className="font-serif text-base font-bold leading-snug group-hover:text-agri-green transition-colors line-clamp-2">
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
