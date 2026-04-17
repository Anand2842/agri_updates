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
            <div className="flex flex-row overflow-x-auto snap-x snap-mandatory md:flex-col md:overflow-x-visible no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 gap-4 md:gap-0 pb-4 md:pb-0">
                {posts.slice(0, 5).map((post, index) => (
                    <div key={post.id} className="group flex gap-4 w-[75vw] flex-shrink-0 snap-center md:w-auto md:flex-shrink md:snap-align-none card-neu p-5 md:p-0 md:bg-transparent md:shadow-none md:border-none md:rounded-none md:border-b md:border-border-thin md:py-6 md:last:border-b-0">
                        {/* Large Number */}
                        <span className="text-4xl md:text-4xl font-serif font-black text-stone-300 md:text-stone-200 group-hover:text-agri-green/40 transition-colors leading-none w-8 flex-shrink-0">
                            {index + 1}
                        </span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="category-badge mb-1 text-[9px]">
                                {post.category}
                            </div>
                            <Link href={`/blog/${post.slug}`} className="block">
                                <h4 className="font-serif text-[1rem] md:text-base font-bold leading-snug group-hover:text-agri-green transition-colors line-clamp-3 md:line-clamp-2 break-words [overflow-wrap:anywhere]">
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
