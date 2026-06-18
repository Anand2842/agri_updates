import Link from 'next/link';
import { Post } from '@/types/database';
import { PublicCategoryDescriptor, getCategoryAccentClasses } from '@/lib/public-categories';
import { getPublicPostHref } from '@/lib/public-posts';

type DeskSection = {
    descriptor: PublicCategoryDescriptor
    posts: Post[]
}

type SectionsDeskProps = {
    sections: DeskSection[]
}

export default function SectionsDesk({ sections }: SectionsDeskProps) {
    const visibleSections = sections.filter((section) => section.posts.length > 0)
    if (visibleSections.length === 0) return null

    return (
        <section className="editorial-shell py-10 md:py-14">
            <div className="mb-6 border-b border-stone-200 pb-4">
                <p className="eyebrow-label mb-2">Latest by Topic</p>
                <h2 className="text-3xl md:text-5xl font-semibold text-[var(--color-graphite)]">What&apos;s happening across agriculture.</h2>
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
                {visibleSections.map((section) => {
                    const accent = getCategoryAccentClasses(section.descriptor.accent)

                    return (
                        <div key={section.descriptor.href} className="paper-panel overflow-hidden">
                            <div className={`px-5 py-4 ${accent.panel}`}>
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${accent.chip}`}>
                                        {section.descriptor.label}
                                    </span>
                                    <Link href={section.descriptor.href} className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-600 transition-colors hover:text-black">
                                        Open desk
                                    </Link>
                                </div>
                                <p className="text-sm leading-7 text-stone-600">{section.descriptor.description}</p>
                            </div>

                            <div className="divide-y divide-stone-200">
                                {section.posts.slice(0, 3).map((post, index) => (
                                    <Link key={post.id} href={getPublicPostHref(post)} className="block px-5 py-5 transition-colors hover:bg-white/70">
                                        <div className="mb-2 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.16em] text-stone-400">
                                            <span>{index === 0 ? 'Lead' : `Note ${index}`}</span>
                                            <span>{post.category}</span>
                                        </div>
                                        <h3 className="max-w-full text-xl font-semibold text-[var(--color-graphite)]">
                                            {post.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-stone-600">
                                            {post.excerpt || 'Open the story for the latest desk reporting and context.'}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
