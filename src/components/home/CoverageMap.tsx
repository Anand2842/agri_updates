import Link from 'next/link';
import { PublicCategoryDescriptor } from '@/lib/public-categories';
import { Compass, ArrowRight } from 'lucide-react';

type CoverageMapItem = {
    descriptor: PublicCategoryDescriptor;
    headline?: string;
    href: string;
    stat?: string;
};

type CoverageMapProps = {
    items: CoverageMapItem[];
};

export default function CoverageMap({ items }: CoverageMapProps) {
    if (items.length === 0) return null;

    return (
        <section className="editorial-shell py-8 border-t border-slate-200/80">
            <div className="flex items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-teal-100 text-teal-900">
                        <Compass className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Category Desks & Coverage
                    </h2>
                </div>
                <Link
                    href="/updates"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
                >
                    <span>All desks</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => {
                    return (
                        <Link
                            key={item.descriptor.href}
                            href={item.descriptor.href}
                            className="group relative flex flex-col justify-between p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-wider">
                                        {item.descriptor.label}
                                    </span>
                                    {item.stat && (
                                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                            {item.stat}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug line-clamp-2 mb-2">
                                    {item.headline || `Open the ${item.descriptor.label.toLowerCase()} desk`}
                                </h3>

                                <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">
                                    {item.descriptor.description}
                                </p>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-emerald-800">
                                <span>Open Desk Coverage</span>
                                <span className="transition-transform group-hover:translate-x-1">→</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
