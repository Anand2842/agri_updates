import Link from 'next/link';
import { PublicCategoryDescriptor, getCategoryAccentClasses } from '@/lib/public-categories';

type CoverageMapItem = {
    descriptor: PublicCategoryDescriptor
    headline?: string
    href: string
    stat?: string
}

type CoverageMapProps = {
    items: CoverageMapItem[]
}

export default function CoverageMap({ items }: CoverageMapProps) {
    if (items.length === 0) return null

    return (
        <section className="editorial-shell py-10 md:py-14">
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                    <p className="eyebrow-label mb-2">Browse Topics</p>
                    <h2 className="text-3xl md:text-5xl font-semibold text-[var(--color-graphite)]">Explore by category.</h2>
                </div>
                <Link href="/updates" className="hidden md:inline-flex rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700 transition-colors hover:border-stone-500 hover:text-black">
                    Browse All
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => {
                    const accent = getCategoryAccentClasses(item.descriptor.accent)

                    return (
                        <Link
                            key={item.descriptor.href}
                            href={item.descriptor.href}
                            className={`paper-panel block p-5 transition-transform duration-300 hover:-translate-y-0.5 ${accent.panel}`}
                        >
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${accent.chip}`}>
                                    {item.descriptor.label}
                                </span>
                                {item.stat && (
                                    <span className="text-[11px] uppercase tracking-[0.16em] text-stone-500">
                                        {item.stat}
                                    </span>
                                )}
                            </div>
                            <p className="mb-4 text-sm leading-7 text-stone-600">
                                {item.descriptor.description}
                            </p>
                            <h3 className="max-w-full text-xl font-semibold text-[var(--color-graphite)]">
                                {item.headline || `Open the ${item.descriptor.label.toLowerCase()} desk`}
                            </h3>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}
