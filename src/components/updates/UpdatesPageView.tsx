import Image from 'next/image';
import Link from 'next/link';
import { safeDateFormat } from '@/lib/utils/date';
import { Post } from '@/types/database';
import { PublicCategoryDescriptor, getCategoryAccentClasses } from '@/lib/public-categories';
import { getPublicPostHref } from '@/lib/public-posts';

type UpdatesPageViewProps = {
    basePath: string
    categories: PublicCategoryDescriptor[]
    currentDescriptor: PublicCategoryDescriptor
    page: number
    posts: Post[]
    qFilter: string
    totalPages: number
    totalPosts: number
}

function buildPageHref(basePath: string, page: number, qFilter: string) {
    const params = new URLSearchParams()

    if (page > 1) {
        params.set('page', String(page))
    }

    if (qFilter) {
        params.set('q', qFilter)
    }

    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
}

export default function UpdatesPageView({
    basePath,
    categories,
    currentDescriptor,
    page,
    posts,
    qFilter,
    totalPages,
    totalPosts,
}: UpdatesPageViewProps) {
    const accent = getCategoryAccentClasses(currentDescriptor.accent)
    const leadPost = page === 1 ? posts[0] : null
    const gridPosts = leadPost ? posts.slice(1) : posts

    return (
        <div className="min-h-screen bg-[var(--color-paper-bg)]">
            <section className="border-b border-stone-200 bg-[var(--color-paper-elevated)]">
                <div className="editorial-shell py-10 md:py-14">
                    <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
                        <div>
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${accent.chip}`}>
                                {currentDescriptor.label}
                            </span>
                            <h1 className="mt-4 max-w-3xl text-4xl md:text-6xl font-semibold text-[var(--color-graphite)]">
                                {currentDescriptor.label}
                            </h1>
                            <p className="mt-4 max-w-2xl text-base leading-8 text-stone-600 md:text-lg">
                                {currentDescriptor.description}
                            </p>
                        </div>

                        <div className="paper-panel p-5">
                            <p className="eyebrow-label mb-3">Desk Snapshot</p>
                            <div className="mb-3 flex items-baseline gap-3">
                                <span className="text-4xl font-semibold text-[var(--color-graphite)]">{totalPosts}</span>
                                <span className="text-sm uppercase tracking-[0.16em] text-stone-500">published items</span>
                            </div>
                            <p className="text-sm leading-7 text-stone-600">
                                Browse the latest reporting, then pivot by section using the coverage rail.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="editorial-shell py-8 md:py-10">
                <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
                    <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
                        <div className="paper-panel p-5">
                            <p className="eyebrow-label mb-4">Coverage Rail</p>
                            <div className="space-y-3">
                                {categories.map((category) => {
                                    const theme = getCategoryAccentClasses(category.accent)
                                    const active = category.href === currentDescriptor.href

                                    return (
                                        <Link
                                            key={category.href}
                                            href={category.href}
                                            className={`block rounded-2xl border px-4 py-4 transition-colors ${active ? theme.panel : 'border-stone-200 bg-white hover:border-stone-400'}`}
                                        >
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${theme.chip}`}>
                                                    {category.label}
                                                </span>
                                            </div>
                                            <p className="text-sm leading-6 text-stone-600">{category.description}</p>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="paper-panel p-5">
                            <p className="eyebrow-label mb-4">Search This Desk</p>
                            <form action={basePath} className="space-y-3">
                                <input
                                    type="text"
                                    name="q"
                                    defaultValue={qFilter}
                                    placeholder="Keywords, company, subject..."
                                    className="w-full rounded-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-stone-500"
                                />
                                <button type="submit" className={`w-full rounded-full px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${accent.button}`}>
                                    Apply Search
                                </button>
                            </form>
                        </div>
                    </aside>

                    <div className="space-y-8">
                        {leadPost && (
                            <article className="paper-panel overflow-hidden">
                                <Link href={getPublicPostHref(leadPost)} className="block">
                                    {leadPost.image_url && (
                                        <div className="lead-image-stage m-4 aspect-[4/3] md:m-6 md:aspect-[16/10]">
                                            <Image
                                                src={leadPost.image_url}
                                                alt=""
                                                fill
                                                priority
                                                className="object-cover opacity-20 blur-3xl scale-110"
                                                sizes="(max-width: 768px) 100vw, 960px"
                                            />
                                            <Image
                                                src={leadPost.image_url}
                                                alt={leadPost.title}
                                                fill
                                                priority
                                                className="object-contain p-4 md:p-8"
                                                sizes="(max-width: 768px) 100vw, 960px"
                                            />
                                        </div>
                                    )}

                                    <div className="px-5 pb-6 md:px-8 md:pb-8">
                                        <div className="mb-4 flex flex-wrap items-center gap-3">
                                            <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${accent.chip}`}>
                                                Lead Story
                                            </span>
                                            <span className="text-xs uppercase tracking-[0.16em] text-stone-400">
                                                {leadPost.category} • {safeDateFormat(leadPost.published_at)}
                                            </span>
                                        </div>
                                        <h2 className="max-w-4xl text-3xl md:text-5xl font-semibold text-[var(--color-graphite)]">
                                            {leadPost.title}
                                        </h2>
                                        <p className="mt-4 max-w-3xl text-base leading-8 text-stone-600 md:text-lg">
                                            {leadPost.excerpt || 'Open the full story for the latest detail from the desk.'}
                                        </p>
                                    </div>
                                </Link>
                            </article>
                        )}

                        {gridPosts.length > 0 ? (
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {gridPosts.map((post) => (
                                    <article key={post.id} className="paper-panel overflow-hidden transition-transform duration-300 hover:-translate-y-0.5">
                                        <Link href={getPublicPostHref(post)} className="block h-full">
                                            {post.image_url && (
                                                <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
                                                    <Image
                                                        src={post.image_url}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover object-top transition-transform duration-500 hover:scale-[1.02]"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex h-full flex-col p-5">
                                                <div className="mb-3 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.16em] text-stone-400">
                                                    <span>{post.category}</span>
                                                    <span>{safeDateFormat(post.published_at)}</span>
                                                </div>
                                                <h3 className="mb-3 text-xl font-semibold text-[var(--color-graphite)]">
                                                    {post.title}
                                                </h3>
                                                <p className="mb-4 text-sm leading-7 text-stone-600">
                                                    {post.excerpt || 'Open the full story for reporting, context, and the latest desk update.'}
                                                </p>
                                                <div className="mt-auto flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-stone-500">
                                                    <span className="truncate">By {post.author_name}</span>
                                                    <span className="font-semibold text-[var(--color-forest)]">Open</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="paper-panel p-10 text-center">
                                <h2 className="text-2xl font-semibold text-[var(--color-graphite)]">No items found</h2>
                                <p className="mt-3 text-sm leading-7 text-stone-600">
                                    This desk does not have published items matching the current search yet.
                                </p>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 border-t border-stone-200 pt-8">
                                {page > 1 && (
                                    <Link
                                        href={buildPageHref(basePath, page - 1, qFilter)}
                                        className="rounded-full border border-stone-300 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 transition-colors hover:border-stone-500 hover:text-black"
                                    >
                                        Previous
                                    </Link>
                                )}
                                <span className="text-xs uppercase tracking-[0.16em] text-stone-500">
                                    Page {page} of {totalPages}
                                </span>
                                {page < totalPages && (
                                    <Link
                                        href={buildPageHref(basePath, page + 1, qFilter)}
                                        className="rounded-full border border-stone-300 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 transition-colors hover:border-stone-500 hover:text-black"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
