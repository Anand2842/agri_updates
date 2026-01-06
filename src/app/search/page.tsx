import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { Job, Post } from '@/types/database';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Search | Agri Updates',
    description: 'Search for jobs, companies, and agricultural content on Agri Updates.',
};

const MOCK_JOBS: Job[] = [
    {
        id: '1',
        title: 'Senior Agronomist - Sustainable Farming Initiative',
        company: 'GreenFields Agriculture',
        location: 'Denver, CO',
        type: 'Full-time',
        salary_range: '$85,000 - $110,000',
        application_link: 'mailto:careers@greenfields.com',
        description: 'Lead sustainable farming initiatives and optimize crop yields.',
        tags: ['Full-time', 'Senior', 'Agronomy'],
        is_active: true,
        status: 'published',
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        title: 'Precision Agriculture Specialist - Drone Operations',
        company: 'AgriTech Solutions',
        location: 'Austin, TX',
        type: 'Contract',
        salary_range: '$70,000 - $90,000',
        application_link: '/jobs/apply/precision-ag-specialist',
        description: 'Operate drones for precision agriculture and data collection.',
        tags: ['Contract', 'Drone', 'Technology'],
        is_active: true,
        status: 'published',
        created_at: new Date().toISOString()
    },
    {
        id: '3',
        title: 'Supply Chain Analyst - Global Food Logistics',
        company: 'Global Harvest Logistics',
        location: 'Rotterdam, Netherlands',
        type: 'Full-time',
        salary_range: '€55,000 - €75,000',
        application_link: '/jobs/apply/supply-chain-analyst',
        description: 'Analyze and optimize global food supply chain operations.',
        tags: ['Full-time', 'Logistics', 'Supply Chain'],
        is_active: true,
        status: 'published',
        created_at: new Date().toISOString()
    },
    {
        id: '4',
        title: 'Farm Manager - Organic Vegetable Production',
        company: 'Organic Valley Farms',
        location: 'Vermont, USA',
        type: 'Full-time',
        salary_range: '$65,000 - $85,000',
        application_link: '/jobs/apply/farm-manager-organic',
        description: 'Manage organic vegetable production and farm operations.',
        tags: ['Full-time', 'Management', 'Organic'],
        is_active: true,
        status: 'published',
        created_at: new Date().toISOString()
    },
    {
        id: '5',
        title: 'Backend Developer (Python) - Agricultural FinTech',
        company: 'AgriFinance Inc.',
        location: 'Remote',
        type: 'Full-time',
        salary_range: '$90,000 - $120,000',
        application_link: '/jobs/apply/backend-developer-agritech',
        description: 'Build backend systems for agricultural financial technology.',
        tags: ['Full-time', 'Technology', 'Python', 'FinTech'],
        is_active: true,
        status: 'published',
        created_at: new Date().toISOString()
    }
];

const MOCK_POSTS: Post[] = [
    {
        id: '1',
        title: 'New AI Model Predicts Crop Yield with 98% Accuracy',
        slug: 'ai-crop-yield',
        category: 'Research',
        author_name: 'Sarah Jenkins',
        excerpt: 'Researchers at MIT have developed a new machine learning algorithm that significantly improves yield predictions.',
        image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80',
        is_featured: true,
        status: 'published',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        content: ''
    },
    {
        id: '2',
        title: 'Vertical Farming Startup Raises $10M',
        slug: 'vertical-farming-greensky',
        category: 'Startups',
        author_name: 'Mark Doe',
        excerpt: 'The funding will accelerate their expansion into urban centers across Europe and Asia by 2025.',
        image_url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80',
        is_featured: true,
        status: 'published',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        content: ''
    }
];

async function searchContent(query: string, type: string = 'all') {
    if (!query || query.trim().length < 2) {
        return { jobs: [], posts: [] };
    }

    const searchTerm = query.toLowerCase().trim();

    try {
        let jobs: Job[] = [];
        let posts: Post[] = [];

        // Search jobs
        if (type === 'all' || type === 'jobs') {
            const { data: jobData, error: jobError } = await supabase
                .from('posts')
                .select('*')
                .eq('category', 'Jobs')
                .eq('is_active', true)
                .or(`title.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);

            if (!jobError && jobData) {
                jobs = jobData.map((post: any) => ({
                    id: post.id,
                    title: post.title,
                    company: post.company || 'Unknown Company',
                    location: post.location || 'Remote',
                    type: post.job_type || 'Full-time',
                    salary_range: post.salary_range,
                    application_link: post.application_link,
                    description: post.content || '',
                    tags: post.tags || [],
                    is_active: post.is_active ?? true,
                    status: post.status ?? 'published',
                    created_at: post.created_at
                }));
            } else {
                // Fallback to mock data search
                jobs = MOCK_JOBS.filter(job =>
                    job.title.toLowerCase().includes(searchTerm) ||
                    job.company.toLowerCase().includes(searchTerm) ||
                    (job.location && job.location.toLowerCase().includes(searchTerm)) ||
                    job.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
                );
            }
        }

        // Search posts
        if (type === 'all' || type === 'posts') {
            const { data: postData, error: postError } = await supabase
                .from('posts')
                .select('*')
                .neq('category', 'Jobs') // Exclude jobs from posts search
                .or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);

            if (!postError && postData) {
                posts = postData;
            } else {
                // Fallback to mock data search
                posts = MOCK_POSTS.filter(post =>
                    post.title.toLowerCase().includes(searchTerm) ||
                    (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm)) ||
                    post.category.toLowerCase().includes(searchTerm) ||
                    post.author_name.toLowerCase().includes(searchTerm)
                );
            }
        }

        return { jobs, posts };
    } catch {
        // Fallback search on mock data
        const jobs = MOCK_JOBS.filter(job =>
            job.title.toLowerCase().includes(searchTerm) ||
            job.company.toLowerCase().includes(searchTerm) ||
            (job.location && job.location.toLowerCase().includes(searchTerm)) ||
            job.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );

        const posts = MOCK_POSTS.filter(post =>
            post.title.toLowerCase().includes(searchTerm) ||
            (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm)) ||
            post.category.toLowerCase().includes(searchTerm) ||
            post.author_name.toLowerCase().includes(searchTerm)
        );

        return { jobs, posts };
    }
}

interface SearchPageProps {
    searchParams: Promise<{ q?: string; type?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const query = params.q || '';
    const type = params.type || 'all';

    const { jobs, posts } = await searchContent(query, type);

    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="bg-stone-50 border-b border-stone-200 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Search Results</h1>
                    <p className="text-stone-500 max-w-2xl mx-auto italic font-serif text-lg">
                        {query ? `"${query}"` : 'Enter a search term'}
                    </p>
                    <div className="h-1 w-20 bg-agri-green mx-auto mt-6"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Search Form */}
                <div className="max-w-2xl mx-auto mb-12">
                    <form action="/search" method="GET" className="flex gap-4">
                        <input
                            type="text"
                            name="q"
                            defaultValue={query}
                            placeholder="Search jobs, companies, articles..."
                            className="flex-1 px-4 py-3 border border-stone-300 focus:outline-none focus:border-agri-green text-sm"
                            required
                        />
                        <select
                            name="type"
                            defaultValue={type}
                            className="px-4 py-3 border border-stone-300 focus:outline-none focus:border-agri-green text-sm"
                        >
                            <option value="all">All Content</option>
                            <option value="jobs">Jobs Only</option>
                            <option value="posts">Articles Only</option>
                        </select>
                        <button
                            type="submit"
                            className="bg-agri-green text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-agri-dark transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Results */}
                {query && (
                    <div className="space-y-12">
                        {/* Jobs Results */}
                        {jobs.length > 0 && (
                            <div>
                                <h2 className="font-serif text-2xl font-bold mb-6">
                                    Job Results ({jobs.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {jobs.map((job) => (
                                        <div key={job.id} className="border border-stone-200 p-6 group hover:border-agri-green transition-colors bg-white">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex flex-col">
                                                    <h3 className="font-serif text-xl font-bold leading-tight group-hover:text-agri-dark transition-colors mb-1">
                                                        <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                                                    </h3>
                                                    <span className="text-stone-500 text-sm">{job.company}</span>
                                                </div>
                                                <span className="text-[10px] font-bold uppercase bg-stone-100 text-stone-600 px-2 py-1 rounded">
                                                    {job.type}
                                                </span>
                                            </div>

                                            <div className="text-sm text-stone-500 mb-4">
                                                {job.location || 'Location not specified'} {job.salary_range && `• ${job.salary_range}`}
                                            </div>

                                            <div className="flex justify-between items-center mt-auto">
                                                <div className="flex gap-2">
                                                    {job.tags?.slice(0, 3).map((tag: string) => (
                                                        <span key={tag} className="text-[10px] uppercase font-bold text-agri-green tracking-wider">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <Link href={`/jobs/${job.id}`} className="bg-black text-white text-xs font-bold uppercase px-4 py-2 hover:bg-agri-green transition-colors">
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Posts Results */}
                        {posts.length > 0 && (
                            <div>
                                <h2 className="font-serif text-2xl font-bold mb-6">
                                    Article Results ({posts.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {posts.map((post) => (
                                        <div key={post.id} className="border border-stone-200 group hover:border-agri-green transition-colors bg-white">
                                            {post.image_url && (
                                                <Link href={`/blog/${post.slug}`} className="block">
                                                    <div className="relative aspect-[4/3] overflow-hidden">
                                                        <img
                                                            src={post.image_url}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        />
                                                    </div>
                                                </Link>
                                            )}
                                            <div className="p-6">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-agri-green border border-agri-green px-2 py-0.5 rounded-full">
                                                        {post.category}
                                                    </span>
                                                </div>
                                                <h3 className="font-serif text-lg font-bold leading-tight group-hover:text-agri-dark transition-colors mb-3">
                                                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                                </h3>
                                                <p className="text-sm text-stone-500 line-clamp-3 leading-relaxed mb-4">
                                                    {post.excerpt || 'No description available'}
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-stone-400">
                                                    <span>By {post.author_name}</span>
                                                    <span>{new Date(post.published_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Results */}
                        {jobs.length === 0 && posts.length === 0 && query && (
                            <div className="text-center py-12">
                                <h3 className="font-serif text-xl font-bold mb-4">No results found</h3>
                                <p className="text-stone-500 mb-6">
                                    Try adjusting your search terms or search in a different category.
                                </p>
                                <div className="flex justify-center gap-4">
                                    <Link
                                        href="/jobs"
                                        className="bg-agri-green text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-agri-dark transition-colors"
                                    >
                                        Browse Jobs
                                    </Link>
                                    <Link
                                        href="/"
                                        className="border border-stone-300 text-stone-600 px-6 py-3 font-bold uppercase tracking-widest hover:border-agri-green hover:text-agri-green transition-colors"
                                    >
                                        Home
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Popular Searches */}
                {!query && (
                    <div className="text-center py-12">
                        <h3 className="font-serif text-xl font-bold mb-4">Popular Searches</h3>
                        <div className="flex flex-wrap justify-center gap-3">
                            {[
                                'Agronomist',
                                'Precision Agriculture',
                                'Farm Manager',
                                'Supply Chain',
                                'Remote Jobs',
                                'Organic Farming',
                                'Agricultural Technology'
                            ].map((term) => (
                                <Link
                                    key={term}
                                    href={`/search?q=${encodeURIComponent(term)}`}
                                    className="bg-stone-100 text-stone-700 px-4 py-2 text-sm hover:bg-agri-green hover:text-white transition-colors"
                                >
                                    {term}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
