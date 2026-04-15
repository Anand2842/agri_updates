import Link from 'next/link';
import { Post } from '@/types/database';

type Props = {
    posts: Post[];
};

export default function GrantsSection({ posts }: Props) {
    if (!posts || posts.length === 0) return null;

    return (
        <div>
            {/* Section Header */}
            <h3 className="section-header mb-6 relative">
                Grants & Funding
                {/* Visual accent line purely for aesthetic */}
                <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-amber-500 rounded-full" />
            </h3>

            {/* List */}
            <div className="flex flex-col gap-4">
                {posts.slice(0, 4).map((post) => (
                    <div key={post.id} className="newspaper-card-minimal group relative pl-3 border-l-2 border-stone-100 hover:border-amber-400 transition-colors">
                        <Link href={`/blog/${post.slug}`} className="block">
                            <h4 className="font-serif text-base font-bold leading-snug mb-1 group-hover:text-amber-700 transition-colors">
                                {post.title}
                            </h4>
                            <p className="text-xs text-stone-500 font-serif line-clamp-2">
                                {post.excerpt}
                            </p>
                        </Link>
                    </div>
                ))}
            </div>

            {/* View All CTA */}
            <div className="mt-6 pt-4 border-t border-stone-200">
                <Link
                    href="/updates?category=Grants"
                    className="block text-center text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:text-black transition-colors"
                >
                    View All Funding →
                </Link>
            </div>
        </div>
    );
}
