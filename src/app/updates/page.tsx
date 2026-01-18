import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export const revalidate = 0;

interface UpdatesPageProps {
    searchParams: Promise<{ category?: string; page?: string }>;
}

const CATEGORIES = [
    { value: '', label: 'All Updates', slug: '' },
    { value: 'Fellowships', label: 'Fellowships', slug: 'fellowships' },
    { value: 'Scholarships', label: 'Scholarships', slug: 'scholarships' },
    { value: 'Grants', label: 'Grants & Funding', slug: 'grants' },
    { value: 'Exams', label: 'Exams & Admissions', slug: 'exams' },
    { value: 'Events', label: 'Conferences & Events', slug: 'events' },
    { value: 'Guidance', label: 'Application Guidance', slug: 'guidance' },
    { value: 'Warnings', label: 'Warnings & Awareness', slug: 'warnings' },
    { value: 'Research', label: 'Research & News', slug: 'research' },
];

async function getPosts(category?: string) {
    try {
        let query = supabase
            .from('posts')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
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
    const page = parseInt(params.page || '1');

    const posts = await getPosts(categoryFilter);
    const totalPosts = posts.length;
    const totalPages = Math.ceil(totalPosts / ITEMS_PER_PAGE);
    const paginatedPosts = posts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const currentCategory = CATEGORIES.find(c => c.value === categoryFilter) || CATEGORIES[0];

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header */}
            <div className="bg-stone-900 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{currentCategory.label}</h1>
                    <p className="text-stone-300 max-w-2xl mx-auto">
                        {categoryFilter
                            ? `Browse the latest ${currentCategory.label.toLowerCase()} opportunities in agriculture.`
                            : 'Stay updated with fellowships, scholarships, grants, exams, events, and more.'}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-agri-green border border-agri-green px-2 py-0.5 rounded-full">
                                        {post.category}
                                    </span>
                                    <span className="text-[10px] text-stone-400">
                                        {new Date(post.published_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h2 className="font-serif text-xl font-bold leading-tight group-hover:text-agri-dark transition-colors mb-3">
                                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                </h2>
                                <p className="text-sm text-stone-500 line-clamp-3 leading-relaxed mb-4">
                                    {post.excerpt || 'Click to read more...'}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-stone-400">By {post.author_name}</span>
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="text-xs font-bold uppercase tracking-widest text-agri-green hover:underline"
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
    );
}
