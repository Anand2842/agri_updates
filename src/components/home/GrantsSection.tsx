import Image from 'next/image';
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
            <div className="flex flex-col gap-6">
                {posts.slice(0, 4).map((post) => (
                    <div key={post.id} className="group relative transition-all">
                        <Link href={`/blog/${post.slug}`} className="flex gap-4 items-start">
                            {/* Thumbnail */}
                            <div className="relative w-16 h-16 flex-shrink-0 bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                                <Image
                                    src={post.image_url || 'https://images.unsplash.com/photo-1550564880-7595d674df6b?auto=format&fit=crop&q=80'}
                                    alt={post.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h4 className="font-serif text-sm font-bold leading-tight mb-1 group-hover:text-amber-700 transition-colors line-clamp-2">
                                    {post.title}
                                </h4>
                                <p className="text-[11px] text-stone-500 font-serif line-clamp-1">
                                    {post.excerpt || 'Latest funding updates and grant alerts for agriculture.'}
                                </p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* View All CTA */}
            <div className="mt-3 pt-3 border-t border-stone-200">
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
