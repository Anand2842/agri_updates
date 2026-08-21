import Link from 'next/link';
import { Startup } from '@/types/database';
import { ArrowRight, MapPin, Target } from 'lucide-react';

interface DirectoryPreviewProps {
    startups: Startup[];
}

const getCategoryColor = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes('ai') || t.includes('robotic')) return 'text-startup-emerald border-startup-emerald bg-startup-emerald/10';
    if (t.includes('bio')) return 'text-cyan-700 border-cyan-700 bg-cyan-700/10';
    if (t.includes('climate') || t.includes('sustain')) return 'text-blue-700 border-blue-700 bg-blue-700/10';
    if (t.includes('fin')) return 'text-startup-amber border-startup-amber bg-startup-amber/10';
    if (t.includes('food')) return 'text-orange-600 border-orange-600 bg-orange-600/10';
    if (t.includes('aqua')) return 'text-teal-700 border-teal-700 bg-teal-700/10';
    return 'text-stone-600 border-stone-600 bg-stone-600/10';
};

export default function DirectoryPreview({ startups }: DirectoryPreviewProps) {
    if (!startups || startups.length === 0) return null;

    return (
        <section className="bg-[#F2F7F4] py-20 border-t border-stone-200">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div className="max-w-2xl">
                        <h2 className="font-serif text-4xl font-bold text-stone-900 mb-4 tracking-tight">Startup Intelligence</h2>
                        <p className="text-stone-600 text-base leading-relaxed">
                            Research and discover innovative agritech companies mapped by sector, stage, and location. Not just news—real market intelligence.
                        </p>
                    </div>
                    <Link 
                        href="/startups/directory" 
                        className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-startup-emerald hover:text-startup-forest transition-colors group shrink-0 bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow border border-stone-200"
                    >
                        Search Directory <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Horizontal Scroll Grid */}
                <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x px-2">
                    {startups.map((startup) => (
                        <Link 
                            key={startup.id} 
                            href={`/startups/directory/${startup.slug || startup.id}`} 
                            className="bg-white p-6 flex flex-col group hover:border-startup-emerald border border-stone-200 transition-all duration-300 w-[300px] shrink-0 snap-start rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 relative"
                        >
                            {/* Logo Area & Tag */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-16 h-16 bg-white border border-stone-100 rounded-xl flex items-center justify-center text-stone-400 overflow-hidden shadow-sm shrink-0">
                                    {startup.logo_url ? (
                                        <img src={startup.logo_url} alt={startup.name} className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <div className="text-2xl font-serif font-bold text-stone-300">{startup.name.charAt(0)}</div>
                                    )}
                                </div>
                                {startup.tags && startup.tags.length > 0 && (
                                    <span className={`inline-block px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border ${getCategoryColor(startup.tags[0])}`}>
                                        {startup.tags[0]}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="mb-4 w-full">
                                <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-startup-emerald transition-colors truncate w-full">
                                    {startup.name}
                                </h3>
                            </div>

                            {/* Elevator Pitch */}
                            <p className="text-sm text-stone-500 mb-6 leading-relaxed flex-grow line-clamp-3">
                                {startup.elevator_pitch || startup.description}
                            </p>

                            {/* Intelligence Signals */}
                            <div className="mt-auto w-full pt-4 border-t border-stone-100">
                                <div className="flex flex-col gap-2">
                                    {startup.funding_stage && (
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-600">
                                            <Target size={12} className="text-startup-amber" />
                                            {startup.funding_stage}
                                        </div>
                                    )}
                                    {startup.location && (
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                                            <MapPin size={12} className="text-stone-400" />
                                            {startup.location}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
