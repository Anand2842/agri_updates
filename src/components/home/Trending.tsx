import Link from 'next/link';
import { Post } from '@/types/database';
import { getPublicPostHref } from '@/lib/public-posts';

export default function Trending({ posts }: { posts: Post[] }) {
    if (!posts || posts.length === 0) {
        return (
            <div className="paper-panel p-5">
                <h3 className="section-header mb-6">Latest Updates</h3>
                <div className="py-12 text-center">
                    <p className="font-serif text-xl text-stone-400 mb-2">Fresh stories are brewing.</p>
                    <p className="text-sm text-stone-400 mb-4">Check back soon for the latest in agriculture.</p>
                    <Link href="/updates" className="inline-block text-sm font-semibold text-[var(--color-forest)] hover:underline">
                        Browse all updates &rarr;
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="paper-panel p-5">
            {/* Section Header */}
            <h3 className="section-header mb-6">
                Latest Updates
            </h3>

            {/* List */}
            <div className="flex flex-row overflow-x-auto snap-x snap-mandatory md:flex-col md:overflow-x-visible no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 gap-4 md:gap-0 pb-4 md:pb-0">
                {posts.slice(0, 5).map((post, index) => (
                    <div key={post.id} className="group flex gap-4 w-[75vw] flex-shrink-0 snap-center rounded-2xl border border-stone-200 bg-white p-5 md:w-auto md:flex-shrink md:rounded-none md:border-x-0 md:border-t-0 md:px-0 md:py-6 md:last:border-b-0">
                        {/* Large Number */}
                        <span className="text-4xl md:text-4xl font-serif font-black text-stone-300 md:text-stone-200 group-hover:text-agri-green/40 transition-colors leading-none w-8 flex-shrink-0">
                            {index + 1}
                        </span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="category-badge mb-1 text-[9px]">
                                {post.category}
                            </div>
                            <Link href={getPublicPostHref(post)} className="block">
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
