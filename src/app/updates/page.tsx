import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { safeDateFormat } from '@/lib/utils/date';
import AdBanner from '@/components/ads/AdBanner';

export const revalidate = 0;

interface UpdatesPageProps {
    searchParams: Promise<{ category?: string; page?: string; q?: string }>;
}

const CATEGORIES = [
    { value: '', label: 'All Updates', slug: '' },
    { value: 'Grants', label: 'Grants & Funding', slug: 'grants' },
    { value: 'Warnings', label: 'Warnings & Alerts', slug: 'warnings' },
];

async function getPosts(category?: string, q?: string) {
    try {
        let query = supabase
            .from('posts')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        if (q) {
            query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching posts:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

export async function generateMetadata({ searchParams }: UpdatesPageProps): Promise<Metadata> {
    const params = await searchParams;
    const category = params.category;
    const categoryInfo = CATEGORIES.find(c => c.value === category);

    const title = categoryInfo?.label || 'All Updates';
    const description = category
        ? `Browse the latest ${categoryInfo?.label.toLowerCase()} in agriculture and farming.`
        : 'Stay updated with the latest fellowships, scholarships, grants, exams, and more in agriculture.';

    return {
        title: title,
        description: description,
        openGraph: {
            title: `${title} | Agri Updates`,
            description: description,
        }
    };
}

const ITEMS_PER_PAGE = 12;

export default async function UpdatesPage({ searchParams }: UpdatesPageProps) {
    const params = await searchParams;
    const categoryFilter = params.category || '';
    const qFilter = params.q || '';
    const page = parseInt(params.page || '1');

    const posts = await getPosts(categoryFilter, qFilter);
    const totalPosts = posts.length;
    const totalPages = Math.ceil(totalPosts / ITEMS_PER_PAGE);
    const paginatedPosts = posts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const currentCategory = CATEGORIES.find(c => c.value === categoryFilter) || CATEGORIES[0];

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Compact Title Bar */}
            <div className="bg-white border-b border-stone-200 py-4 mb-8">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mb-1">
                            {currentCategory.label}
                        </h1>
                        <p className="text-sm text-stone-500">
                            {categoryFilter
                                ? `Browse the latest ${currentCategory.label.toLowerCase()} opportunities in agriculture.`
                                : 'Stay updated with fellowships, scholarships, grants, exams, events, and more.'}
                        </p>
                    </div>
                    <span className="text-sm font-medium text-stone-600 bg-stone-100 px-3 py-1 border border-stone-200 rounded-full shrink-0">
                        {totalPosts} result{totalPosts !== 1 ? 's' : ''}
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
                                    Search Updates
                                </h3>
                                <form className="flex flex-col gap-3">
                                    {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}

                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="q"
                                            defaultValue={qFilter}
                                            placeholder="Keywords..."
                                            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-md focus:ring-1 focus:ring-agri-green focus:border-agri-green outline-none text-stone-900 text-sm transition-all shadow-inner"
                                        />
                                    </div>
                                    <button type="submit" className="w-full px-4 py-2.5 bg-agri-green hover:bg-agri-dark text-white font-bold rounded-md transition-colors text-xs uppercase tracking-widest mt-1 shadow-sm">
                                        Apply Filters
                                    </button>
                                </form>
                            </div>

                            {/* Categories Filter */}
                            <div>
                                <h3 className="font-bold uppercase text-xs tracking-widest text-stone-900 mb-4 px-1">Categories</h3>
                                <div className="space-y-2 text-sm text-stone-600 px-1">
                                    {CATEGORIES.map(cat => (
                                        <Link
                                            key={cat.value}
                                            href={`/updates${cat.value ? `?category=${cat.value}` : ''}${cat.value && qFilter ? `&q=${qFilter}` : (!cat.value && qFilter ? `?q=${qFilter}` : '')}`}
                                            className={`flex items-center gap-2 cursor-pointer hover:text-black ${categoryFilter === cat.value ? 'text-agri-green font-bold' : ''}`}
                                        >
                                            <span className="w-4 h-4 border border-stone-300 flex items-center justify-center shrink-0">
                                                {categoryFilter === cat.value && <span className="text-xs">✓</span>}
                                            </span>
                                            {cat.label}
                                        </Link>
                                    ))}
                                </div>
                                
                                {categoryFilter && (
                                    <div className="mt-6 pt-4 border-t border-stone-200 px-1">
                                        <Link
                                            href={`/updates${qFilter ? `?q=${qFilter}` : ''}`}
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
                        {/* Posts Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                    {paginatedPosts.map((post) => (
                        <article key={post.id} className="border border-stone-200 group hover:border-agri-green transition-colors bg-white">
                            {post.image_url && (
                                <Link href={`/blog/${post.slug}`} className="block">
                                    <div className="relative aspect-[16/9] overflow-hidden">
                                        <Image
                                            src={post.image_url!}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                </Link>
                            )}
                            <div className="p-3 md:p-6 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-2 md:mb-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-agri-green border border-agri-green px-2 py-0.5 rounded-full">
                                        {post.category}
                                    </span>
                                    <span className="text-[10px] text-stone-400">
                                        {safeDateFormat(post.published_at)}
                                    </span>
                                </div>
                                <h2 className="font-serif text-sm md:text-xl font-bold leading-tight group-hover:text-agri-dark transition-colors mb-2 md:mb-3 line-clamp-3 md:line-clamp-2">
                                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                </h2>
                                <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed mb-3 hidden md:block">
                                    {post.excerpt || 'Click to read more...'}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-[10px] md:text-xs text-stone-400 truncate max-w-[100px]">By {post.author_name}</span>
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-agri-green hover:underline hidden md:block"
                                    >
                                        Read More →
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Empty State */}
                {posts.length === 0 && (
                    <div className="text-center py-16">
                        <h3 className="font-serif text-xl font-bold mb-4">No updates found</h3>
                        <p className="text-stone-500 mb-6">
                            {categoryFilter
                                ? `No ${currentCategory.label.toLowerCase()} available at the moment.`
                                : 'Check back soon for new updates.'}
                        </p>
                        {categoryFilter && (
                            <Link
                                href="/updates"
                                className="bg-agri-green text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-agri-dark transition-colors"
                            >
                                View All Updates
                            </Link>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-4 mt-12">
                        {page > 1 && (
                            <Link
                                href={`/updates?page=${page - 1}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
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
                                href={`/updates?page=${page + 1}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
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
