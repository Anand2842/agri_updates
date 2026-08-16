import Link from 'next/link';
import { Post } from '@/types/database';
import { PublicCategoryDescriptor } from '@/lib/public-categories';
import { getPublicPostHref } from '@/lib/public-posts';
import { safeDateFormat } from '@/lib/utils/date';
import { Newspaper } from 'lucide-react';

type DeskSection = {
    descriptor: PublicCategoryDescriptor;
    posts: Post[];
};

type SectionsDeskProps = {
    sections: DeskSection[];
};

export default function SectionsDesk({ sections }: SectionsDeskProps) {
    const visibleSections = sections.filter((section) => section.posts.length > 0);
    if (visibleSections.length === 0) return null;

    return (
        <section className="editorial-shell py-8 border-t border-slate-200/80">
            <div className="flex items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-emerald-100 text-emerald-900">
                        <Newspaper className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Editorial Desks by Subject
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {visibleSections.map((section) => {
                    return (
                        <div
                            key={section.descriptor.href}
                            className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden flex flex-col justify-between"
                        >
                            <div>
                                {/* Header */}
                                <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            {section.descriptor.label}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                            {section.descriptor.description}
                                        </p>
                                    </div>
                                    <Link
                                        href={section.descriptor.href}
                                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                                    >
                                        Desk →
                                    </Link>
                                </div>

                                {/* Stories */}
                                <div className="divide-y divide-slate-100">
                                    {section.posts.slice(0, 3).map((post, index) => (
                                        <Link
                                            key={post.id}
                                            href={getPublicPostHref(post)}
                                            className="group block p-4 hover:bg-slate-50/60 transition-colors"
                                        >
                                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                                <span className="font-semibold uppercase tracking-wider text-emerald-700">
                                                    {index === 0 ? 'Lead Story' : `Brief 0${index + 1}`}
                                                </span>
                                                <span>
                                                    {safeDateFormat(post.published_at, { month: 'short', day: 'numeric' }, 'en-IN')}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug line-clamp-2 mb-1">
                                                {post.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 line-clamp-2">
                                                {post.excerpt || 'Open the story for complete editorial reporting.'}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="p-3 border-t border-slate-100 bg-slate-50/30 text-center">
                                <Link
                                    href={section.descriptor.href}
                                    className="text-xs font-semibold text-slate-600 hover:text-emerald-800"
                                >
                                    View all {section.descriptor.label} stories →
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
