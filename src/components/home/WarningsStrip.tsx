import Link from 'next/link';
import { Post } from '@/types/database';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { getPublicPostHref } from '@/lib/public-posts';

type Props = {
    posts: Post[];
};

export default function WarningsStrip({ posts }: Props) {
    if (!posts || posts.length === 0) return null;

    const warning = posts[0];

    return (
        <section className="editorial-shell py-2 my-2">
            <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50/90 via-rose-50/50 to-white p-3.5 sm:p-4 shadow-xs">
                <Link
                    href={getPublicPostHref(warning)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                                Urgent Notice
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors line-clamp-1">
                                {warning.title}
                            </h4>
                        </div>
                    </div>

                    <div className="flex items-center text-xs font-bold text-rose-700 gap-1 uppercase tracking-wider shrink-0 pl-1">
                        <span>Read Advisory</span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                </Link>
            </div>
        </section>
    );
}
