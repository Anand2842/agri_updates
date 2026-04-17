import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';
import { safeDateFormat } from '@/lib/utils/date';

type Props = {
    posts: Post[];
};

export default function FeaturedGrid({ posts }: Props) {
    return (
        <section className="max-w-[1700px] mx-auto px-4 py-0.5 border-b border-stone-200">
            {(!posts || posts.length === 0) ? (
                <div className="py-12 text-center">
                    <p className="font-serif text-lg text-stone-500 mb-2">No featured listings at the moment.</p>
                    <Link href="/featured-listings" className="text-sm font-bold text-agri-green hover:underline">
                        Be the first to get featured &rarr;
                    </Link>
                </div>
            ) : (
                <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-6 md:gap-0 pb-6 md:pb-0 md:divide-x divide-stone-200 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    {posts.slice(0, 3).map((post, idx) => (
                        <article key={post.id} className={`group py-5 px-5 md:py-4 md:px-6 w-[85vw] flex-shrink-0 snap-center md:w-auto md:flex-shrink md:snap-align-none card-neu md:border-none md:shadow-none md:bg-transparent md:rounded-none ${idx === 0 ? 'md:pl-0' : ''} ${idx === 2 ? 'md:pr-0' : ''} border border-white/20 last:border-b-0`}>
                            <Link href={`/blog/${post.slug}`} className="block">
                                {/* Image */}
                                <div className="relative aspect-[16/10] mb-4 overflow-hidden rounded-lg md:rounded-none bg-stone-100">
                                    <Image
                                        src={post.image_url || '/placeholder.jpg'}
                                        alt={post.title}
                                        fill
                                        priority={idx === 0}
                                        sizes="(max-width: 768px) 85vw, 33vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>

                                {/* Category Badge */}
                                <div className="category-badge mb-2">
                                    {post.category}
                                </div>

                                {/* Title */}
                                <h3 className="font-serif text-[1.375rem] md:text-xl font-bold leading-tight mb-2 group-hover:text-agri-green transition-colors break-words [overflow-wrap:anywhere]">
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
                    ))}
                </div>
            )}
        </section>
    );
}
