import { supabase } from '@/lib/supabase';
import { Post } from '@/types/database';
import Link from 'next/link';
import { Metadata } from 'next';
import AdBanner from '@/components/ads/AdBanner';
import JobsGrid from '@/components/jobs/JobsGrid';

export const revalidate = 0;

interface JobsPageProps {
    searchParams: Promise<{ type?: string; location?: string; q?: string; page?: string }>;
}

async function getJobs(filters?: { type?: string; location?: string; q?: string }, page: number = 1, limit: number = ITEMS_PER_PAGE) {
    try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from('posts')
            .select('*', { count: 'exact' })
            .eq('category', 'Jobs')
            .eq('is_active', true)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .range(from, to);

        if (filters?.type) {
            query = query.ilike('job_type', filters.type);
        }

        if (filters?.location) {
            if (filters.location.toLowerCase() === 'remote') {
                query = query.ilike('location', '%remote%');
            } else {
                query = query.ilike('location', `%${filters.location}%`);
            }
        }

        if (filters?.q) {
            query = query.or(`title.ilike.%${filters.q}%,company.ilike.%${filters.q}%`);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('Supabase jobs fetch error:', error);
            return { jobs: [], count: 0 };
        }

        return { jobs: data || [], count: count || 0 };
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return { jobs: [], count: 0 };
    }
}

const ITEMS_PER_PAGE = 10;

export async function generateMetadata({ searchParams }: JobsPageProps): Promise<Metadata> {
    const params = await searchParams;
    const type = params.type;
    const location = params.location;

    let title = 'Agricultural Jobs';
    let description = 'Find the latest agricultural jobs, internships, and career opportunities.';

    if (type && location) {
        title = `${type} Jobs in ${location}`;
        description = `Browse ${type} agricultural jobs in ${location}.`;
    } else if (type) {
        title = `${type} Agricultural Jobs`;
        description = `Browse ${type} jobs in the agriculture sector.`;
    } else if (location) {
        title = `Agricultural Jobs in ${location}`;
        description = `Find agriculture careers in ${location}.`;
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

export default async function JobsPage({ searchParams }: JobsPageProps) {
    const params = await searchParams;
    const typeFilter = params.type;
    const locationFilter = params.location;
    const qFilter = params.q;
    const page = parseInt(params.page || '1');

    const { jobs, count } = await getJobs({ type: typeFilter, location: locationFilter, q: qFilter }, page, ITEMS_PER_PAGE);

    const totalJobs = count;
    const totalPages = Math.ceil(totalJobs / ITEMS_PER_PAGE);
    const displayedJobs = jobs; // Already paginated by DB

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Light Header - YourStory Style */}
            <div className="bg-white border-b border-stone-200 pt-12 pb-8">
                <div className="container mx-auto px-4 text-center">
                    {/* Category Pill */}
                    <div className="flex justify-center mb-6">
                        <span className="inline-flex items-center gap-1 px-4 py-2 border border-stone-300 rounded-sm text-sm font-medium text-stone-800">
                            Jobs <span className="text-stone-400">›</span>
                        </span>
                    </div>

                    <h1 className="font-serif text-3xl md:text-5xl font-bold text-stone-900 mb-4">
                        Agriculture Job Openings
                    </h1>
                    <p className="text-stone-500 text-lg max-w-2xl mx-auto mb-8">
                        Verified listings from fertilizer, seed & agri companies. Updated daily.
                    </p>

                    {/* Search Bar - Simplified */}
                    <div className="max-w-3xl mx-auto">
                        <form className="flex flex-col md:flex-row gap-3 bg-stone-50 p-3 rounded-lg border border-stone-200">
                            {typeFilter && <input type="hidden" name="type" value={typeFilter} />}

                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <input
                                    type="text"
                                    name="q"
                                    defaultValue={qFilter}
                                    placeholder="Search by title, company..."
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-md focus:ring-2 focus:ring-agri-green focus:border-transparent outline-none text-stone-900 text-sm"
                                />
                            </div>
                            <select
                                name="location"
                                defaultValue={locationFilter}
                                className="px-4 py-3 bg-white border border-stone-200 rounded-md focus:ring-2 focus:ring-agri-green outline-none font-medium text-stone-700 cursor-pointer text-sm"
                            >
                                <option value="">All Locations</option>
                                <option value="Remote">Remote</option>
                                <option value="India">India</option>
                            </select>
                            <button type="submit" className="px-6 py-3 bg-agri-green hover:bg-agri-dark text-white font-bold rounded-md transition-colors text-sm uppercase tracking-wide">
                                Search
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Trust Signals Strip - Compressed */}
            <div className="bg-stone-50 border-b border-stone-200 pt-12 pb-6">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs font-bold text-stone-400 uppercase tracking-wider text-center">
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Verified Employers
                        </span>
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            Daily Updates
                        </span>
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            10k+ Community
                        </span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <AdBanner placement="banner" />
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="sticky top-24">
                            <h3 className="font-bold uppercase text-xs tracking-widest mb-4">Filter By Type</h3>
                            <div className="space-y-2 text-sm text-stone-600">
                                <Link
                                    href={`/jobs${qFilter ? `?q=${qFilter}` : ''}`}
                                    className={`flex items-center gap-2 cursor-pointer hover:text-black ${!typeFilter && !locationFilter ? 'text-agri-green font-bold' : ''}`}
                                >
                                    <span className="w-4 h-4 border border-stone-300 flex items-center justify-center">
                                        {!typeFilter && !locationFilter && <span className="text-xs">✓</span>}
                                    </span>
                                    All Jobs
                                </Link>
                                <Link
                                    href={`/jobs?type=full-time${locationFilter ? `&location=${locationFilter}` : ''}${qFilter ? `&q=${qFilter}` : ''}`}
                                    className={`flex items-center gap-2 cursor-pointer hover:text-black ${typeFilter && typeFilter.toLowerCase() === 'full-time' ? 'text-agri-green font-bold' : ''}`}
                                >
                                    <span className="w-4 h-4 border border-stone-300 flex items-center justify-center">
                                        {typeFilter && typeFilter.toLowerCase() === 'full-time' && <span className="text-xs">✓</span>}
                                    </span>
                                    Full-time
                                </Link>
                                <Link
                                    href={`/jobs?type=contract${locationFilter ? `&location=${locationFilter}` : ''}${qFilter ? `&q=${qFilter}` : ''}`}
                                    className={`flex items-center gap-2 cursor-pointer hover:text-black ${typeFilter && typeFilter.toLowerCase() === 'contract' ? 'text-agri-green font-bold' : ''}`}
                                >
                                    <span className="w-4 h-4 border border-stone-300 flex items-center justify-center">
                                        {typeFilter && typeFilter.toLowerCase() === 'contract' && <span className="text-xs">✓</span>}
                                    </span>
                                    Contract
                                </Link>
                                <Link
                                    href={`/jobs?location=remote${typeFilter ? `&type=${typeFilter}` : ''}${qFilter ? `&q=${qFilter}` : ''}`}
                                    className={`flex items-center gap-2 cursor-pointer hover:text-black ${locationFilter && locationFilter.toLowerCase() === 'remote' ? 'text-agri-green font-bold' : ''}`}
                                >
                                    <span className="w-4 h-4 border border-stone-300 flex items-center justify-center">
                                        {locationFilter && locationFilter.toLowerCase() === 'remote' && <span className="text-xs">✓</span>}
                                    </span>
                                    Remote
                                </Link>
                                <Link
                                    href={`/jobs?type=internship${locationFilter ? `&location=${locationFilter}` : ''}${qFilter ? `&q=${qFilter}` : ''}`}
                                    className={`flex items-center gap-2 cursor-pointer hover:text-black ${typeFilter && typeFilter.toLowerCase() === 'internship' ? 'text-agri-green font-bold' : ''}`}
                                >
                                    <span className="w-4 h-4 border border-stone-300 flex items-center justify-center">
                                        {typeFilter && typeFilter.toLowerCase() === 'internship' && <span className="text-xs">✓</span>}
                                    </span>
                                    Internship
                                </Link>
                            </div>

                            {(typeFilter || locationFilter) && (
                                <div className="mt-6 pt-4 border-t border-stone-200">
                                    <Link
                                        href={`/jobs${qFilter ? `?q=${qFilter}` : ''}`}
                                        className="text-xs text-stone-500 hover:text-agri-green underline"
                                    >
                                        Clear all filters
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Job List */}
                    <div className="flex-grow">
                        <JobsGrid jobs={displayedJobs} />

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-4 mt-8">
                                {page > 1 && (
                                    <Link
                                        href={`/jobs?page=${page - 1}${typeFilter ? `&type=${typeFilter}` : ''}${locationFilter ? `&location=${locationFilter}` : ''}`}
                                        className="border border-stone-300 px-4 py-2 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors"
                                    >
                                        Previous
                                    </Link>
                                )}
                                <span className="flex items-center text-xs font-bold uppercase text-stone-500">
                                    Page {page} of {totalPages}
                                </span>
                                {page < totalPages && (
                                    <Link
                                        href={`/jobs?page=${page + 1}${typeFilter ? `&type=${typeFilter}` : ''}${locationFilter ? `&location=${locationFilter}` : ''}`}
                                        className="border border-stone-300 px-4 py-2 text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors"
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
