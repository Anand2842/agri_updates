import Link from 'next/link';
import { Post } from '@/types/database';
import { AlertTriangle, ChevronRight } from 'lucide-react';

type Props = {
    posts: Post[];
};

export default function WarningsStrip({ posts }: Props) {
    if (!posts || posts.length === 0) return null;

    // Show only the most recent warning
    const warning = posts[0];

    return (
        <div className="md:bg-red-50 md:border-y md:border-red-200 mb-2 md:mb-4 px-4 md:px-0">
            <div className="max-w-[1600px] mx-auto md:px-6 md:py-2 card-glass bg-rose-50/80 md:bg-transparent md:border-none md:shadow-none p-3 rounded-xl md:rounded-none border border-red-200 shadow-[inset_0px_2px_10px_rgba(255,0,0,0.05),_0px_4px_12px_rgba(255,0,0,0.1)] md:backdrop-blur-none">
                <Link 
                    href={`/blog/${warning.slug}`}
                    className="flex flex-row items-center justify-between gap-3 group"
                >
                    <div className="flex items-center gap-3 w-full border-r border-red-200/50 md:border-none pr-3 md:pr-0 min-w-0">
                        <div className="flex items-center justify-center bg-red-100 rounded-full text-red-600 p-2 shrink-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8),_1px_1px_3px_rgba(0,0,0,0.1)]">
                            <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-3 flex-1 min-w-0">
                            <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-red-600 md:bg-red-100 md:px-2 md:py-0.5 rounded shrink-0 w-fit">
                                Important Notice
                            </span>
                            <h4 className="text-xs md:text-sm font-bold text-red-900 group-hover:underline line-clamp-1 break-words">
                                {warning.title}
                            </h4>
                        </div>
                    </div>
                    <div className="flex items-center text-[9px] md:text-xs font-bold text-red-600 gap-1 uppercase tracking-wider shrink-0 transition-transform group-hover:translate-x-1 pl-1">
                        <span className="hidden md:inline">Read full alert</span>
                        <span className="md:hidden">Read</span>
                        <ChevronRight className="w-3.5 h-3.5 md:w-3 md:h-3" />
                    </div>
                </Link>
            </div>
        </div>
    );
}
