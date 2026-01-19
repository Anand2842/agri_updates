import { supabase } from '@/lib/supabase';
import { Post } from '@/types/database';
import Link from 'next/link';
import { Metadata } from 'next';

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
            {/* Header */}
            <div className="bg-stone-50 border-b border-stone-200 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Agricultural Jobs</h1>
                    <p className="text-stone-500 max-w-2xl mx-auto italic font-serif text-lg">
                        &quot;Find your next career move in the world of agriculture&quot;
                    </p>
                    <div className="h-1 w-20 bg-agri-green mx-auto mt-6"></div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-stone-100 shadow-sm py-4">
                <div className="container mx-auto px-4">
                    <form className="flex flex-col md:flex-row gap-4 items-center justify-center">
                        <div className="relative w-full md:w-96">
                            <input
                                type="text"
                                name="q"
                                defaultValue={qFilter}
                                placeholder="Search jobs, companies..."
                                className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:bg-white focus:border-agri-green outline-none transition-all"
                            />
                            <svg className="w-4 h-4 text-stone-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <select
                                name="type"
                                defaultValue={typeFilter}
                                className="px-4 py-2 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:bg-white outline-none cursor-pointer"
                            >
                                <option value="">All Types</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                            </select>

                            <select
                                name="location"
                                defaultValue={locationFilter}
                                className="px-4 py-2 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:bg-white outline-none cursor-pointer"
                            >
                                <option value="">All Locations</option>
                                <option value="Remote">Remote</option>
                                <option value="India">India</option>
                                <option value="USA">USA</option>
                            </select>

                            <button type="submit" className="px-4 py-2 bg-agri-green text-white text-sm font-bold rounded-lg hover:bg-agri-dark transition-colors">Filter</button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="sticky top-24">
                            <h3 className="font-bold uppercase text-xs tracking-widest mb-4">Filter By Type</h3>
                            <div className="space-y-2 text-sm text-stone-600">
                                <Link
                                    href="/jobs"
                                    className={`flex items-center gap-2 cursor-pointer hover:text-black ${!typeFilter && !locationFilter ? 'text-agri-green font-bold' : ''}`}
                                >
                                    <span className="w-4 h-4 border border-stone-300 flex items-center justify-center">
                                        {!typeFilter && !locationFilter && <span className="text-xs">✓</span>}
                                    </span>
                                    All Jobs
                                </Link>
                                <Link
                                    href={`/jobs?type=full-time${locationFilter ? `&location=${locationFilter}` : ''}`}
                                    className={`flex items-center gap-2 cursor-pointer hover:text-black ${typeFilter && typeFilter.toLowerCase() === 'full-time' ? 'text-agri-green font-bold' : ''}`}
                                >
                                    <span className="w-4 h-4 border border-stone-300 flex items-center justify-center">
                                        {typeFilter && typeFilter.toLowerCase() === 'full-time' && <span className="text-xs">✓</span>}
                                    </span>
                                    Full-time
                                </Link>
                                <Link
                                    href={`/jobs?type=contract${locationFilter ? `&location=${locationFilter}` : ''}`}
                                    className={`flex items-center gap-2 cursor-pointer hover:text-black ${typeFilter && typeFilter.toLowerCase() === 'contract' ? 'text-agri-green font-bold' : ''}`}
                                >
                                    <span className="w-4 h-4 border border-stone-300 flex items-center justify-center">
                                        {typeFilter && typeFilter.toLowerCase() === 'contract' && <span className="text-xs">✓</span>}
                                    </span>
                                    Contract
                                </Link>
                                <Link
                                    href={`/jobs?location=remote${typeFilter ? `&type=${typeFilter}` : ''}`}
                                    className={`flex items-center gap-2 cursor-pointer hover:text-black ${locationFilter && locationFilter.toLowerCase() === 'remote' ? 'text-agri-green font-bold' : ''}`}
                                >
                                    <span className="w-4 h-4 border border-stone-300 flex items-center justify-center">
                                        {locationFilter && locationFilter.toLowerCase() === 'remote' && <span className="text-xs">✓</span>}
                                    </span>
                                    Remote
                                </Link>
                                <Link
                                    href={`/jobs?type=internship${locationFilter ? `&location=${locationFilter}` : ''}`}
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
                                        href="/jobs"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            {displayedJobs.map((job: Post) => (
                                <div key={job.id} className="border border-stone-200 p-6 group hover:border-agri-green transition-colors bg-white flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col">
                                            <h2 className="font-serif text-xl font-bold leading-tight group-hover:text-agri-dark transition-colors mb-1">
                                                <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
                                            </h2>
                                            <span className="text-stone-500 text-sm">{job.company}</span>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase bg-stone-100 text-stone-600 px-2 py-1 rounded">
                                            {job.job_type || 'Not Specified'}
                                        </span>
                                    </div>

                                    <div className="text-sm text-stone-500 mb-6 line-clamp-2">
                                        {job.excerpt || job.content ? (job.excerpt || job.content)!.substring(0, 150) + '...' : 'Click to view full job details and application instructions.'}
                                    </div>

                                    <div className="flex justify-between items-end mt-auto gap-4">
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(job.tags) && job.tags.slice(0, 4).map((tag: string) => (
                                                <span key={tag} className="text-[10px] uppercase font-bold text-agri-green tracking-wider whitespace-nowrap">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                        <Link href={`/jobs/${job.slug}`} className="bg-black text-white text-[10px] font-bold uppercase px-4 py-2 hover:bg-agri-green transition-colors whitespace-nowrap flex-shrink-0 mb-1">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

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

                        {jobs.length === 0 && (
                            <div className="text-center py-12 text-stone-500">
                                No jobs found matching your criteria.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
