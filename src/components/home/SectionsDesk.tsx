import Link from 'next/link';
import { Post } from '@/types/database';
import { PublicCategoryDescriptor } from '@/lib/public-categories';
import { getPublicPostHref } from '@/lib/public-posts';
import { safeDateFormat } from '@/lib/utils/date';
import { ArrowRight } from 'lucide-react';

type DeskSection = {
    descriptor: PublicCategoryDescriptor;
    posts: Post[];
};

type SectionsDeskProps = {
    sections: DeskSection[];
};

function getDeskSemanticColor(href: string) {
    if (href.includes('news')) return 'bg-emerald-600';
    if (href.includes('research')) return 'bg-cyan-600';
    if (href.includes('grants')) return 'bg-amber-500';
    if (href.includes('startups')) return 'bg-emerald-500';
    if (href.includes('jobs')) return 'bg-teal-600';
    if (href.includes('warnings')) return 'bg-red-600';
    return 'bg-emerald-700';
}

function getDeskTextColor(href: string) {
    if (href.includes('news')) return 'text-emerald-700 hover:text-emerald-800';
    if (href.includes('research')) return 'text-cyan-700 hover:text-cyan-800';
    if (href.includes('grants')) return 'text-amber-700 hover:text-amber-800';
    if (href.includes('startups')) return 'text-emerald-700 hover:text-emerald-800';
    if (href.includes('jobs')) return 'text-teal-700 hover:text-teal-800';
    if (href.includes('warnings')) return 'text-red-700 hover:text-red-800';
    return 'text-emerald-700 hover:text-emerald-800';
}

export default function SectionsDesk({ sections }: SectionsDeskProps) {
    const visibleSections = sections.filter((section) => section.posts.length > 0);
    if (visibleSections.length === 0) return null;

    return (
        <section className="editorial-shell py-8 sm:py-12 border-t border-slate-200/80">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-6 sm:mb-8">
                <h3 className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-slate-900">
                    Editorial Desks
                </h3>
            </div>

            {/* Grid: 1 column on mobile, 2 on tablet, 4 on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8 sm:gap-y-12">
                {visibleSections.slice(0, 4).map((section) => {
                    const semanticBg = getDeskSemanticColor(section.descriptor.href);
                    const semanticText = getDeskTextColor(section.descriptor.href);

                    return (
                        <div key={section.descriptor.href} className="flex flex-col border-b md:border-b-0 pb-6 md:pb-0 border-slate-100 last:border-0 last:pb-0">
                            {/* Semantic Top Accent */}
                            <div className={`h-1.5 w-10 sm:w-12 ${semanticBg} mb-3 sm:mb-4 rounded-full`}></div>
                            
                            {/* Header */}
                            <div className="mb-3 sm:mb-4">
                                <h4 className="text-base sm:text-lg font-bold text-slate-900 font-serif mb-0.5">
                                    {section.descriptor.label}
                                </h4>
                                <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 uppercase tracking-widest line-clamp-1">
                                    {section.descriptor.description}
                                </p>
                            </div>

                            {/* Stories */}
                            <div className="flex flex-col gap-3.5 sm:gap-4 flex-1">
                                {section.posts.slice(0, 3).map((post, index) => (
                                    <Link
                                        key={post.id}
                                        href={getPublicPostHref(post)}
                                        className="group block"
                                    >
                                        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                                            <span className={semanticText}>
                                                {index === 0 ? 'Lead Story' : `Brief 0${index + 1}`}
                                            </span>
                                            <span>
                                                {safeDateFormat(post.published_at, { month: 'short', day: 'numeric' }, 'en-IN')}
                                            </span>
                                        </div>
                                        <h5 className="text-[13px] sm:text-[14px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                                            {post.title}
                                        </h5>
                                    </Link>
                                ))}
                            </div>

                            <div className="pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-slate-100">
                                <Link
                                    href={section.descriptor.href}
                                    className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 group/link ${semanticText}`}
                                >
                                    <span>All {section.descriptor.label}</span>
                                    <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
