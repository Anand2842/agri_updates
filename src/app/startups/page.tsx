import { supabase } from '@/lib/supabase';
import { Startup } from '@/types/database';
import { Metadata } from 'next';

export const revalidate = 0;

const MOCK_STARTUPS: Startup[] = [
    {
        id: '1',
        name: 'Carbon Robotics',
        description: 'Uses high-powered lasers to weed fields without chemicals, leveraging computer vision for precision targeting.',
        funding_stage: 'Series B',
        location: 'Seattle, USA',
        logo_url: null,
        website_url: 'https://carbonrobotics.com',
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Pivot Bio',
        description: 'Replacing synthetic nitrogen fertilizer with microbes that adhere to corn roots and produce nitrogen naturally.',
        funding_stage: 'Series D',
        location: 'Berkeley, USA',
        logo_url: null,
        website_url: 'https://pivotbio.com',
        created_at: new Date().toISOString()
    },
    {
        id: '3',
        name: 'DeHaat',
        description: 'Full-stack agricultural service provider offering end-to-end solutions for Indian farmers via AI-driven tech.',
        funding_stage: 'Series E',
        location: 'Patna, India',
        logo_url: null,
        website_url: 'https://dehaat.com',
        created_at: new Date().toISOString()
    },
    {
        id: '4',
        name: 'Kilimo',
        description: 'Big data solution for water management in agriculture, using satellite data to verify water savings.',
        funding_stage: 'Seed',
        location: 'Cordoba, ARG',
        logo_url: null,
        website_url: 'https://kilimo.com',
        created_at: new Date().toISOString()
    }
];

import Link from 'next/link';

interface StartupsPageProps {
    searchParams: Promise<{ stage?: string; page?: string }>;
}

async function getStartups(filters?: { stage?: string }) {
    const stage = filters?.stage;
    try {
        let query = supabase
            .from('startups')
            .select('*')
            .order('created_at', { ascending: false });

        if (stage) {
            query = query.ilike('funding_stage', stage);
        }

        const { data, error } = await query;

        if (error || !data || data.length === 0) {
            console.log('Using Mock Data for Startups Page');
            let filtered = [...MOCK_STARTUPS];
            if (stage) {
                if (stage === 'seed') {
                    filtered = filtered.filter(s => s.funding_stage && ['Seed', 'Pre-Seed', 'Angel'].includes(s.funding_stage));
                } else if (stage === 'series-a-plus') {
                    filtered = filtered.filter(s => s.funding_stage && s.funding_stage.startsWith('Series'));
                } else if (stage === 'exits') {
                    filtered = filtered.filter(s => s.funding_stage && ['Exit', 'Acquired', 'IPO'].includes(s.funding_stage));
                }
            }
            return filtered;
        }
        return data;
    } catch {
        // Fallback filtering
        let filtered = [...MOCK_STARTUPS];
        if (stage) {
            if (stage === 'seed') {
                filtered = filtered.filter(s => s.funding_stage && ['Seed', 'Pre-Seed', 'Angel'].includes(s.funding_stage));
            } else if (stage === 'series-a-plus') {
                filtered = filtered.filter(s => s.funding_stage && s.funding_stage.startsWith('Series'));
            } else if (stage === 'exits') {
                filtered = filtered.filter(s => s.funding_stage && ['Exit', 'Acquired', 'IPO'].includes(s.funding_stage));
            }
        }
        return filtered;
    }
}

const ITEMS_PER_PAGE = 8;

export async function generateMetadata({ searchParams }: StartupsPageProps): Promise<Metadata> {
    const params = await searchParams;
    const stage = params.stage;

    let title = 'AgriTech Startups';
    let description = 'Discover the most innovative startups in agriculture, from Seed stage to exits.';

    if (stage) {
        if (stage === 'seed') {
            title = 'Seed Stage AgriTech Startups';
            description = 'Browse promising early-stage agriculture startups.';
        } else if (stage === 'series-a-plus') {
            title = 'Series A+ AgriTech Companies';
            description = 'Explore growth-stage agricultural technology companies.';
        } else if (stage === 'exits') {
            title = 'AgriTech Exits & IPOs';
            description = 'Track successful exits and IPOs in the agritech sector.';
        }
    }

    return {
        title: title,
        description: description,
        openGraph: {
            title: `${title} | Agri Updates`,
            description: description,
        }
    };
}

export default async function StartupsPage({ searchParams }: StartupsPageProps) {
    const params = await searchParams;
    const stageFilter = params.stage;
    const page = parseInt(params.page || '1');

    const startups = await getStartups({ stage: stageFilter });
    const totalStartups = startups.length;
    const totalPages = Math.ceil(totalStartups / ITEMS_PER_PAGE);
    const paginatedStartups = startups.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="bg-stone-900 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">Startup Radar</h1>
                    <p className="text-stone-300 max-w-2xl mx-auto text-lg leading-relaxed">
                        Everything from Seed Stage to Exits. Tracking the next unicorns in AgriTech.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">

                <div className="flex justify-center gap-8 mb-16 text-xs font-bold uppercase tracking-widest text-stone-400 border-b border-stone-200 pb-4">
                    <Link
                        href="/startups"
                        className={`cursor-pointer transition-colors ${!stageFilter ? 'text-black border-b-2 border-black pb-4 -mb-4.5' : 'hover:text-black'}`}
                    >
                        All
                    </Link>
                    <Link
                        href="/startups?stage=seed"
                        className={`cursor-pointer transition-colors ${stageFilter === 'seed' ? 'text-black border-b-2 border-black pb-4 -mb-4.5' : 'hover:text-black'}`}
                    >
                        Seed Stage
                    </Link>
                    <Link
                        href="/startups?stage=series-a-plus"
                        className={`cursor-pointer transition-colors ${stageFilter === 'series-a-plus' ? 'text-black border-b-2 border-black pb-4 -mb-4.5' : 'hover:text-black'}`}
                    >
                        Series A+
                    </Link>
                    <Link
                        href="/startups?stage=exits"
                        className={`cursor-pointer transition-colors ${stageFilter === 'exits' ? 'text-black border-b-2 border-black pb-4 -mb-4.5' : 'hover:text-black'}`}
                    >
                        Exits
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {paginatedStartups.map((startup) => (
                        <div key={startup.id} className="bg-stone-50 p-8 flex flex-col items-center text-center group hover:shadow-lg transition-shadow h-full">
                            <div className="w-16 h-16 bg-stone-200 rounded-full mb-6 flex items-center justify-center text-stone-400">
                                {/* Placeholder Icon */}
                                <div className="w-8 h-8 bg-stone-300 rounded-sm"></div>
                            </div>

                            <div className="mb-4">
                                <span className="inline-block px-2 py-1 bg-stone-200 text-stone-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                                    {startup.tags?.[0] || 'AgTech'}
                                </span>
                                <h3 className="font-serif text-xl font-bold group-hover:text-agri-green transition-colors">
                                    {startup.name}
                                </h3>
                            </div>

                            <p className="text-sm text-stone-500 mb-6 leading-relaxed flex-grow">
                                {startup.description}
                            </p>

                            <div className="mt-auto w-full flex justify-between items-center text-[10px] uppercase font-bold text-stone-400 border-t border-stone-200 pt-4">
                                <span>{startup.funding_stage}</span>
                                <span>{startup.location}</span>
                            </div>
                        </div>
                    ))}

                    {startups.length === 0 && (
                        <div className="col-span-full text-center py-12 text-stone-500">
                            No startups found for this category.
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-4 mt-16">
                        {page > 1 && (
                            <Link
                                href={`/startups?page=${page - 1}${stageFilter ? `&stage=${stageFilter}` : ''}`}
                                className="border border-stone-300 px-6 py-3 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors"
                            >
                                Previous
                            </Link>
                        )}
                        <span className="flex items-center text-xs font-bold uppercase text-stone-500">
                            Page {page} of {totalPages}
                        </span>
                        {page < totalPages && (
                            <Link
                                href={`/startups?page=${page + 1}${stageFilter ? `&stage=${stageFilter}` : ''}`}
                                className="border border-stone-300 px-6 py-3 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors"
                            >
                                Next
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
