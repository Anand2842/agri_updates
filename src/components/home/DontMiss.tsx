import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';
import { getPublicPostHref } from '@/lib/public-posts';

export default function DontMiss({ posts }: { posts: Post[] }) {
    if (!posts || posts.length === 0) {
        return (
            <section className="editorial-shell border-t border-stone-200 py-10 md:py-14">
                <div className="mb-6 border-b border-stone-200 pb-4">
                    <p className="eyebrow-label mb-2">Must Read</p>
                    <h3 className="text-3xl md:text-5xl font-semibold text-[var(--color-graphite)]">Stories worth your time.</h3>
                </div>
                <div className="py-12 text-center">
                    <p className="font-serif text-xl text-stone-400 mb-2">Deep dives are in the works.</p>
                    <p className="text-sm text-stone-400 mb-4">We&apos;re digging into the stories that matter most.</p>
                    <Link href="/updates" className="inline-block text-sm font-semibold text-[var(--color-forest)] hover:underline">
                        Browse all updates &rarr;
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="editorial-shell border-t border-stone-200 py-10 md:py-14">
            {/* Section Header */}
            <div className="mb-6 border-b border-stone-200 pb-4">
                <p className="eyebrow-label mb-2">Must Read</p>
                <h3 className="text-3xl md:text-5xl font-semibold text-[var(--color-graphite)]">Stories worth your time.</h3>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {posts.slice(0, 4).map((post) => (
                    <article key={post.id} className="group paper-panel flex flex-col overflow-hidden">
                        <Link href={getPublicPostHref(post)} className="block flex-1 flex flex-col h-full">
                            {/* Thumbnail */}
                            {post.image_url && (
                                <div className="relative aspect-[3/2] overflow-hidden bg-stone-100">
                                    <Image
                                        src={post.image_url}
                                        alt={post.title}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                                    />
                                </div>
                            )}

                            <div className="flex h-full flex-col p-4">
                                <div className="category-badge mb-2 text-[8px] md:text-[9px]">
                                    {post.category}
                                </div>

                                <h4 className="mb-2 max-w-full text-[0.95rem] font-semibold leading-snug text-[var(--color-graphite)] transition-colors group-hover:text-agri-green md:text-lg">
                                    {post.title}
                                </h4>

                                <p className="hidden text-xs leading-6 text-stone-500 md:block">
                                    {post.excerpt}
                                </p>
                            </div>
                        </Link>
                    </article>
                ))}
            </div>
        </section>
    );
}
