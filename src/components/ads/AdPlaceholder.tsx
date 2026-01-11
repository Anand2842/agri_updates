'use client';

export default function AdPlaceholder({ type = 'banner' }: { type?: 'banner' | 'sidebar' | 'in-content' }) {
    if (process.env.NODE_ENV === 'development') {
        const heightClass = type === 'sidebar' ? 'h-[600px]' : type === 'in-content' ? 'h-[250px]' : 'h-[90px]';

        return (
            <div className={`w-full ${heightClass} bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center rounded-lg my-8`}>
                <div className="text-center p-4">
                    <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-1">Advertisement Space</p>
                    <p className="text-stone-300 text-xs">({type})</p>
                </div>
            </div>
        );
    }

    // In production, this would inject Google AdSense or programmatic ad code
    return null;
}
