import Link from 'next/link';
import { Startup } from '@/types/database';
import { ArrowRight, MapPin } from 'lucide-react';

interface DirectoryPreviewProps {
    startups: Startup[];
}

export default function DirectoryPreview({ startups }: DirectoryPreviewProps) {
    if (!startups || startups.length === 0) return null;

    return (
        <section className="bg-stone-50 py-16 border-t border-stone-200">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h2 className="font-serif text-3xl font-bold text-stone-900 mb-2">Startup Directory</h2>
                        <p className="text-stone-500 text-sm">Discover and connect with innovative agritech companies.</p>
                    </div>
                    <Link 
                        href="/startups/directory" 
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-agri-green hover:text-black transition-colors group shrink-0"
                    >
                        Explore Full Directory <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Horizontal Scroll Grid */}
                <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
                    {startups.map((startup) => (
                        <Link 
                            key={startup.id} 
                            href={`/startups/directory/${startup.slug || startup.id}`} 
                            className="bg-white p-6 flex flex-col items-center text-center group hover:border-agri-green border border-stone-200 transition-colors w-[280px] shrink-0 snap-start"
                        >
                            {/* Logo Area */}
                            <div className="w-16 h-16 bg-white border border-stone-100 rounded-full mb-6 flex items-center justify-center text-stone-400 overflow-hidden shadow-sm">
                                {startup.logo_url ? (
                                    <img src={startup.logo_url} alt={startup.name} className="w-full h-full object-contain p-2" />
                                ) : (
                                    <div className="text-2xl font-serif font-bold text-stone-300">{startup.name.charAt(0)}</div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="mb-4 w-full">
                                {startup.tags && startup.tags.length > 0 && (
                                    <span className="inline-block px-2 py-1 bg-stone-100 text-stone-500 text-[9px] font-bold uppercase tracking-widest mb-3 rounded-sm">
                                        {startup.tags[0]}
                                    </span>
                                )}
                                <h3 className="font-serif text-xl font-bold group-hover:text-agri-green transition-colors truncate w-full px-2">
                                    {startup.name}
                                </h3>
                            </div>

                            {/* Elevator Pitch */}
                            <p className="text-sm text-stone-500 mb-6 leading-relaxed flex-grow line-clamp-3">
                                {startup.elevator_pitch || startup.description}
                            </p>

                            {/* Footer Base Info */}
                            <div className="mt-auto w-full flex justify-between items-center text-[10px] uppercase font-bold text-stone-400 border-t border-stone-100 pt-4">
                                <span className="bg-stone-50 px-2 py-1">{startup.funding_stage || 'Unknown'}</span>
                                {startup.location && (
                                    <span className="flex items-center gap-1 max-w-[100px] truncate">
                                        <MapPin size={10} className="shrink-0" /> {startup.location}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
