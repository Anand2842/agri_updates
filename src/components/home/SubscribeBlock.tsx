import Link from 'next/link';

export default function SubscribeBlock() {
    return (
        <section className="container mx-auto px-4 py-10 border-b border-stone-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Text */}
                <div className="flex-1">
                    <h2 className="font-serif text-3xl md:text-4xl font-black text-black uppercase tracking-tight mb-2">
                        AGRI UPDATES
                    </h2>
                    <p className="text-stone-600 font-serif text-lg leading-relaxed max-w-xl">
                        Get notified about opportunities. Your premier source for agricultural jobs, research breakthroughs, and startup innovation.
                    </p>
                </div>

                {/* CTA */}
                <div className="flex-shrink-0">
                    <Link
                        href="/newsletter"
                        className="inline-flex items-center gap-2 bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-agri-green transition-colors"
                    >
                        Subscribe Now
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
