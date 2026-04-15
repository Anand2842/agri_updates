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
        <div className="bg-red-50 border-y border-red-200 mb-12">
            <div className="max-w-7xl mx-auto px-6 py-3">
                <Link 
                    href={`/blog/${warning.slug}`}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 group"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center bg-red-100 rounded text-red-600 p-1.5 shrink-0">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded shrink-0 w-fit">
                                Important Notice
                            </span>
                            <h4 className="text-sm font-bold text-red-900 group-hover:underline line-clamp-1">
                                {warning.title}
                            </h4>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center text-xs font-bold text-red-600 gap-1 uppercase tracking-wider shrink-0 transition-transform group-hover:translate-x-1">
                        Read full alert <ChevronRight className="w-3 h-3" />
                    </div>
                </Link>
            </div>
        </div>
    );
}
