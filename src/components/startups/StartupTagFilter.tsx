'use client';

import Link from 'next/link';

interface StartupTagFilterProps {
    currentTag: string | null;
}

const TAGS = [
    { label: 'All News', value: null },
    { label: 'Funding', value: 'Funding' },
    { label: 'Launches', value: 'Launches' },
    { label: 'Acquisitions', value: 'Acquisitions' },
    { label: 'Partnerships', value: 'Partnerships' },
    { label: 'Interviews', value: 'Interviews' },
    { label: 'Analysis', value: 'Analysis' },
];

export default function StartupTagFilter({ currentTag }: StartupTagFilterProps) {
    return (
        <div className="w-full border-y border-stone-200 bg-white sticky top-0 z-30 md:relative md:top-auto md:z-auto">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex items-center overflow-x-auto no-scrollbar py-3 gap-2">
                    {TAGS.map((tag) => {
                        const isActive = currentTag === tag.value || (!currentTag && tag.value === null);
                        
                        return (
                            <Link
                                key={tag.label}
                                href={tag.value ? `/startups?tag=${encodeURIComponent(tag.value)}` : '/startups'}
                                className={`
                                    whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors flex-shrink-0
                                    ${isActive 
                                        ? 'bg-[#2D5016] text-white border border-[#2D5016] shadow-sm' 
                                        : 'bg-stone-50 text-stone-500 border border-stone-200 hover:bg-stone-100 hover:text-stone-800'}
                                `}
                            >
                                {tag.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
