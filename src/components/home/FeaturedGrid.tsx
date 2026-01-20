import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';
import { safeDateFormat } from '@/lib/utils/date';

type Props = {
    posts: Post[];
};

export default function FeaturedGrid({ posts }: Props) {
    return (
        <section className="container mx-auto px-4 py-8 border-b border-black">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x divide-stone-200">
                {(!posts || posts.length === 0) ? (
                    <div className="col-span-full py-12 text-center">
                        <p className="font-serif text-lg text-stone-500 mb-2">No featured listings at the moment.</p>
                        <Link href="/featured-listings" className="text-sm font-bold text-agri-green hover:underline">
                            Be the first to get featured &rarr;
                        </Link>
                    </div>
                ) : (
                    posts.slice(0, 3).map((post, idx) => (
                        <article key={post.id} className={`group px-6 py-4 ${idx === 0 ? 'pl-0' : ''} ${idx === 2 ? 'pr-0' : ''}`}>
                            <Link href={`/blog/${post.slug}`} className="block">
                                {/* Image */}
                                <div className="relative aspect-[16/10] mb-4 overflow-hidden bg-stone-100">
                                    <Image
                                        src={post.image_url || '/placeholder.jpg'}
                                        alt={post.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>

                                {/* Category Badge */}
                                <div className="category-badge mb-2">
                                    {post.category}
                                </div>

                                {/* Title */}
                                <h3 className="font-serif text-xl font-bold leading-tight mb-2 group-hover:text-agri-green transition-colors break-words [overflow-wrap:anywhere]">
                                    {post.title}
                                </h3>

                                {/* Meta */}
                                <div className="text-[10px] uppercase tracking-widest text-stone-400 mb-2">
                                    By {post.author_name} • {safeDateFormat(post.published_at, { month: 'short', day: 'numeric' }, 'en-IN')}
                                </div>

                                {/* Excerpt */}
                                <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed font-serif">
                                    {post.excerpt}
                                </p>
                            </Link>
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}
