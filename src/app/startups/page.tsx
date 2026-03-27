import { supabase } from '@/lib/supabase';
import { Startup } from '@/types/database';
import { Metadata } from 'next';
import AdBanner from '@/components/ads/AdBanner';

export const revalidate = 0;

const MOCK_STARTUPS: Startup[] = [
    {
        id: '1',
        name: 'Carbon Robotics',
        slug: 'carbon-robotics',
        logo_url: null,
        description: 'Uses high-powered lasers to weed fields without chemicals.',
        elevator_pitch: 'Laser weeding robots for autonomous agriculture.',
        long_description: 'Carbon Robotics is pioneering the next revolution in agriculture...',
        funding_stage: 'Series B',
        funding_amount: '$85M',
        investors: ['Founders Fund', 'Ignition Partners'],
        location: 'Seattle, USA',
        founded_year: 2018,
        team_size: '51-200',
        founder_names: 'Paul Mikesell',
        website_url: 'https://carbonrobotics.com',
        social_links: { twitter: 'https://twitter.com/carbonrobotics' },
        tags: ['Robotics', 'AI', 'Sustainable'],
        success_highlights: [],
        challenges: [],
        milestones: [],
        is_featured: true,
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Pivot Bio',
        slug: 'pivot-bio',
        logo_url: null,
        description: 'Replacing synthetic nitrogen fertilizer with microbes.',
        elevator_pitch: 'Microbes that produce nitrogen naturally for corn.',
        long_description: 'Pivot Bio extracts nitrogen from the air...',
        funding_stage: 'Series D',
        funding_amount: '$600M',
        investors: ['Breakthrough Energy', 'Temasek'],
        location: 'Berkeley, USA',
        founded_year: 2011,
        team_size: '200+',
        founder_names: 'Karsten Temme, Alvin Tamsir',
        website_url: 'https://pivotbio.com',
        social_links: {},
        tags: ['Biotech', 'Sustainable'],
        success_highlights: [],
        challenges: [],
        milestones: [],
        is_featured: true,
        created_at: new Date().toISOString()
    },
    {
        id: '3',
        name: 'DeHaat',
        slug: 'dehaat',
        logo_url: null,
        description: 'Full-stack agricultural service provider for Indian farmers.',
        elevator_pitch: 'End-to-end solutions for Indian farmers via AI-driven tech.',
        long_description: 'DeHaat is one of the fastest growing Agri Tech start-ups in India...',
        funding_stage: 'Series E',
        funding_amount: '$221M',
        investors: ['Sequoia India', 'Sofina'],
        location: 'Patna, India',
        founded_year: 2012,
        team_size: '500+',
        founder_names: 'Shashank Kumar',
        website_url: 'https://dehaat.com',
        social_links: {},
        tags: ['Marketplace', 'Services'],
        success_highlights: [],
        challenges: [],
        milestones: [],
        is_featured: false,
        created_at: new Date().toISOString()
    },
    {
        id: '4',
        name: 'Kilimo',
        slug: 'kilimo',
        logo_url: null,
        description: 'Big data solution for water management in agriculture.',
        elevator_pitch: 'Using satellite data to verify water savings.',
        long_description: 'Kilimo verifies, improves, and offsets water consumption...',
        funding_stage: 'Seed',
        funding_amount: '$3M',
        investors: ['The Yield Lab'],
        location: 'Cordoba, ARG',
        founded_year: 2014,
        team_size: '11-50',
        founder_names: 'Jairo Trad',
        website_url: 'https://kilimo.com',
        social_links: {},
        tags: ['Water', 'Big Data'],
        success_highlights: [],
        challenges: [],
        milestones: [],
        is_featured: false,
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
            {/* Compact Title Bar */}
            <div className="bg-white border-b border-stone-200 py-4 mb-8">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mb-1">
                            Startup Radar
                        </h1>
                        <p className="text-sm text-stone-500">Tracking the next unicorns in AgriTech</p>
                    </div>
                    <span className="text-sm font-medium text-stone-600 bg-stone-100 px-3 py-1 border border-stone-200 rounded-full shrink-0">
                        {totalStartups} result{totalStartups !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 lg:w-72 flex-shrink-0">
                        <div className="sticky top-24 space-y-8">
                            {/* Search */}
                            <div className="bg-white p-5 border border-stone-200 rounded-xl shadow-sm">
                                <h3 className="font-bold uppercase text-xs tracking-widest text-stone-900 mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    Search Startups
                                </h3>
                                <form className="flex flex-col gap-3">
                                    {stageFilter && <input type="hidden" name="stage" value={stageFilter} />}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="q"
                                            placeholder="Company name..."
                                            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-md focus:ring-1 focus:ring-agri-green focus:border-agri-green outline-none text-stone-900 text-sm transition-all shadow-inner"
                                        />
                                    </div>
                                    <button type="submit" className="w-full px-4 py-2.5 bg-agri-green hover:bg-agri-dark text-white font-bold rounded-md transition-colors text-xs uppercase tracking-widest mt-1 shadow-sm">
                                        Apply Filters
                                    </button>
                                </form>
                            </div>

                            {/* Filters */}
                            <div>
                                <h3 className="font-bold uppercase text-xs tracking-widest text-stone-900 mb-4 px-1">Filter By Stage</h3>
                                <div className="space-y-2 text-sm text-stone-600 px-1">
                                    <Link
                                        href="/startups"
                                        className={`flex items-center gap-2 cursor-pointer hover:text-black ${!stageFilter ? 'text-agri-green font-bold' : ''}`}
                                    >
                                        <span className="w-4 h-4 border border-stone-300 flex items-center justify-center">
                                            {!stageFilter && <span className="text-xs">✓</span>}
                                        </span>
                                        All Stages
                                    </Link>
                                    <Link
                                        href="/startups?stage=seed"
                                        className={`flex items-center gap-2 cursor-pointer hover:text-black ${stageFilter === 'seed' ? 'text-agri-green font-bold' : ''}`}
                                    >
                                        <span className="w-4 h-4 border border-stone-300 flex items-center justify-center">
                                            {stageFilter === 'seed' && <span className="text-xs">✓</span>}
                                        </span>
                                        Seed Stage
                                    </Link>
                                    <Link
                                        href="/startups?stage=series-a-plus"
                                        className={`flex items-center gap-2 cursor-pointer hover:text-black ${stageFilter === 'series-a-plus' ? 'text-agri-green font-bold' : ''}`}
                                    >
                                        <span className="w-4 h-4 border border-stone-300 flex items-center justify-center">
                                            {stageFilter === 'series-a-plus' && <span className="text-xs">✓</span>}
                                        </span>
                                        Series A+
                                    </Link>
                                    <Link
                                        href="/startups?stage=exits"
                                        className={`flex items-center gap-2 cursor-pointer hover:text-black ${stageFilter === 'exits' ? 'text-agri-green font-bold' : ''}`}
                                    >
                                        <span className="w-4 h-4 border border-stone-300 flex items-center justify-center">
                                            {stageFilter === 'exits' && <span className="text-xs">✓</span>}
                                        </span>
                                        Exits
                                    </Link>
                                </div>
                                
                                {stageFilter && (
                                    <div className="mt-6 pt-4 border-t border-stone-200 px-1">
                                        <Link
                                            href="/startups"
                                            className="text-xs text-stone-500 hover:text-agri-green underline"
                                        >
                                            Clear all filters
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedStartups.map((startup) => (
                        <Link href={`/startups/${startup.slug || startup.id}`} key={startup.id} className="bg-stone-50 p-8 flex flex-col items-center text-center group hover:shadow-lg transition-shadow h-full block">
                            <div className="w-16 h-16 bg-white border border-stone-100 rounded-full mb-6 flex items-center justify-center text-stone-400 overflow-hidden relative">
                                {startup.logo_url ? (
                                    <img src={startup.logo_url} alt={startup.name} className="w-full h-full object-contain p-2" />
                                ) : (
                                    <div className="text-2xl font-serif font-bold text-stone-300">{startup.name.charAt(0)}</div>
                                )}
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
                        </Link>
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
            </div>
        </div>
    );
}
