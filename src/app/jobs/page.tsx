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
            {/* Compact Title Bar */}
            <div className="bg-white border-b border-stone-200 py-4 mb-8">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mb-1">
                            Agriculture Job Openings
                        </h1>
                        <p className="text-sm text-stone-500">Verified listings updated daily</p>
                    </div>
                    <span className="text-sm font-medium text-stone-600 bg-stone-100 px-3 py-1 border border-stone-200 rounded-full shrink-0">
                        {totalJobs} result{totalJobs !== 1 ? 's' : ''}
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
                                    Search Jobs
                                </h3>
                                <form className="flex flex-col gap-3">
                                    {typeFilter && <input type="hidden" name="type" value={typeFilter} />}

                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="q"
                                            defaultValue={qFilter}
                                            placeholder="Title, company..."
                                            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-md focus:ring-1 focus:ring-agri-green focus:border-agri-green outline-none text-stone-900 text-sm transition-all shadow-inner"
                                        />
                                    </div>
                                    <select
                                        name="location"
                                        defaultValue={locationFilter}
                                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-md focus:ring-1 focus:ring-agri-green focus:border-agri-green outline-none font-medium text-stone-700 cursor-pointer text-sm shadow-inner"
                                    >
                                        <option value="">All Locations</option>
                                        <option value="Remote">Remote</option>
                                        <option value="India">India</option>
                                    </select>
                                    <button type="submit" className="w-full px-4 py-2.5 bg-agri-green hover:bg-agri-dark text-white font-bold rounded-md transition-colors text-xs uppercase tracking-widest mt-1 shadow-sm">
                                        Apply Filters
                                    </button>
                                </form>
                            </div>

                            {/* Filters */}
                            <div>
                                <h3 className="font-bold uppercase text-xs tracking-widest text-stone-900 mb-4 px-1">Filter By Type</h3>
                                <div className="space-y-2 text-sm text-stone-600 px-1">
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
                                <div className="mt-6 pt-4 border-t border-stone-200 px-1">
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
