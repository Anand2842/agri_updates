import Link from 'next/link';

interface TrendingTag {
    tag: string;
    count: number;
}

interface StartupTrendingProps {
    tags: TrendingTag[];
}

export default function StartupTrending({ tags }: StartupTrendingProps) {
    if (!tags || tags.length === 0) return null;

    return (
        <div className="w-full bg-white border-b border-stone-200 py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <h3 className="font-bold uppercase text-xs tracking-widest text-stone-900 flex items-center gap-2 shrink-0">
                        <span className="w-2 h-2 bg-startup-lime rounded-full shadow-[0_0_8px_rgba(183,243,74,0.6)] animate-pulse"></span>
                        Trending Now
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        {tags.map((t) => (
                            <Link 
                                key={t.tag}
                                href={`/startups?tag=${encodeURIComponent(t.tag)}`}
                                className="group flex items-center gap-2 px-3 py-1.5 bg-stone-50 border border-stone-200 hover:border-startup-emerald hover:bg-stone-100 transition-colors"
                            >
                                <span className="text-stone-700 text-[11px] font-bold uppercase tracking-wider group-hover:text-startup-emerald transition-colors">
                                    {t.tag}
                                </span>
                                <span className="text-stone-400 font-black text-[10px] bg-stone-200/50 px-1.5 py-0.5 rounded-sm">
                                    {t.count}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
