import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';
import { safeDateFormat } from '@/lib/utils/date';
import { getPublicPostHref } from '@/lib/public-posts';

type Props = {
    posts: Post[];
};

export default function FeaturedGrid({ posts }: Props) {
    return (
        <section className="editorial-shell border-b border-stone-200 py-5 md:py-8">
            {(!posts || posts.length === 0) ? (
                <div className="py-12 text-center">
                    <p className="font-serif text-xl text-stone-400 mb-2">Curated picks are on their way.</p>
                    <p className="text-sm text-stone-400 mb-4">We&apos;re hand-picking the best stories in agri right now.</p>
                    <Link href="/updates" className="inline-block text-sm font-semibold text-[var(--color-forest)] hover:underline">
                        Browse all updates &rarr;
                    </Link>
                </div>
            ) : (
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-2 md:grid md:grid-cols-3 md:gap-5 md:pb-0 no-scrollbar">
                    {posts.slice(0, 3).map((post, idx) => (
                        <article key={post.id} className={`group paper-panel w-[85vw] flex-shrink-0 snap-center overflow-hidden md:w-auto`}>
                            <Link href={getPublicPostHref(post)} className="block">
                                {/* Image */}
                                <div className="relative aspect-[3/2] overflow-hidden bg-stone-100">
                                    <Image
                                        src={post.image_url || '/placeholder.jpg'}
                                        alt={post.title}
                                        fill
                                        priority={idx === 0}
                                        sizes="(max-width: 768px) 85vw, 33vw"
                                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                </div>

                                <div className="p-5">
                                    <div className="category-badge mb-2">
                                        {post.category}
                                    </div>

                                    <h3 className="mb-2 max-w-full text-[1.375rem] font-semibold leading-tight text-[var(--color-graphite)] transition-colors group-hover:text-agri-green md:text-2xl">
                                        {post.title}
                                    </h3>

                                    <div className="mb-3 text-[10px] uppercase tracking-[0.16em] text-stone-400">
                                        By {post.author_name} • {safeDateFormat(post.published_at, { month: 'short', day: 'numeric' }, 'en-IN')}
                                    </div>

                                    <p className="text-sm leading-7 text-stone-600">
                                        {post.excerpt}
                                    </p>
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
