import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/types/database';
import { safeDateFormat } from '@/lib/utils/date';
import { getPublicPostHref } from '@/lib/public-posts';

export default function MainHero({ post }: { post: Post }) {
    if (!post) return null;

    return (
        <article className="paper-panel overflow-hidden">
            <Link href={getPublicPostHref(post)} className="group block">
                <div className="w-full">
                    <Image
                        src={post.image_url || '/placeholder.jpg'}
                        alt={post.title}
                        width={820}
                        height={0}
                        priority
                        sizes="(max-width: 768px) 100vw, 820px"
                        className="w-full h-auto max-h-[520px] object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                </div>
            </Link>

            <div className="px-5 py-5 md:px-8 md:py-6">
                <div className="mb-3">
                    <span className="inline-flex rounded-full border border-stone-300 bg-stone-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-600">
                        {post.category}
                    </span>
                </div>
                <Link href={getPublicPostHref(post)} className="group block">
                    <h3 className="max-w-3xl text-2xl font-semibold leading-[1.1] text-stone-900 md:text-4xl">
                        {post.title}
                    </h3>
                </Link>
                <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-stone-400">
                    By {post.author_name} • {safeDateFormat(post.published_at, { month: 'short', day: 'numeric', year: 'numeric' }, 'en-IN')}
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                    <p className="text-sm leading-7 text-stone-600 md:text-base">
                        {post.excerpt}
                    </p>
                    <Link
                        href={getPublicPostHref(post)}
                        className="self-start rounded-full border border-stone-300 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-700 transition-colors hover:border-stone-500 hover:text-black"
                    >
                        Open story
                    </Link>
                </div>
            </div>
        </article>
    );
}
