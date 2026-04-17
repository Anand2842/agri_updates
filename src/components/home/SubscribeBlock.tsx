import Link from 'next/link';

export default function SubscribeBlock() {
    return (
        <section className="max-w-[1600px] mx-auto px-4 py-2 border-b border-stone-200">
            <div className="flex flex-row items-center justify-between gap-4 md:gap-6 card-glass md:bg-transparent md:border-none md:shadow-none md:backdrop-blur-none p-4 md:p-0 rounded-2xl md:rounded-none">
                <div className="flex-1">
                    <span className="block font-serif text-lg md:text-4xl font-black text-black uppercase tracking-tight mb-0 md:mb-2 leading-tight">
                        AGRI UPDATES
                    </span>
                    <p className="hidden md:block text-stone-600 font-serif text-lg leading-relaxed max-w-xl">
                        Get notified about opportunities. Your premier source for agricultural jobs, research breakthroughs, and startup innovation.
                    </p>
                    <p className="block md:hidden text-stone-600 font-sans text-[10px] leading-snug mt-1 max-w-[160px]">
                        Join for daily jobs & startup alerts.
                    </p>
                </div>

                {/* CTA */}
                <div className="flex-shrink-0">
                    <Link
                        href="/newsletter"
                        className="inline-flex items-center gap-1 md:gap-2 bg-agri-green text-white text-[10px] md:text-xs font-bold uppercase tracking-widest px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-none transition-colors border border-white/20 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.3),_4px_4px_10px_rgba(0,0,0,0.15)] md:shadow-none active:scale-95"
                    >
                        Subscribe
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
