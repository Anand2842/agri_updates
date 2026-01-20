import { notFound } from 'next/navigation';
import { getHubFromDB, getAllHubSlugs } from '@/lib/hubs.server';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Metadata } from 'next';
import { Post } from '@/types/database';
import { ArrowLeft } from 'lucide-react';
import { safeDateFormat } from '@/lib/utils/date';

// Revalidate every hour
export const revalidate = 3600;

// Allow dynamic params for new hubs created via admin
export const dynamicParams = true;

interface PageProps {
    params: Promise<{
        slug: string;
    }>
}

// Generate Metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const hub = await getHubFromDB(slug);
    if (!hub) return {};

    return {
        title: hub.title,
        description: hub.description,
        openGraph: {
            title: hub.title,
            description: hub.description,
            type: 'website',
        }
    };
}

// Generate static params from database
export async function generateStaticParams() {
    const slugs = await getAllHubSlugs();
    return slugs.map((slug) => ({
        slug: slug,
    }));
}

async function getHubJobs(tag: string, category: string = 'Jobs') {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('category', category)
            .eq('status', 'published')
            .contains('tags', [tag])
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Hub fetch error:', error);
            return [];
        }
        return data as Post[];
    } catch (e) {
        console.error('Hub fetch exception:', e);
        return [];
    }
}

// Fetch related hubs from database
async function getRelatedHubs(slugs: string[]) {
    if (!slugs || slugs.length === 0) return [];

    const relatedHubs = await Promise.all(
        slugs.map(async (s) => {
            const hub = await getHubFromDB(s);
            return hub ? { ...hub, slug: s } : null;
        })
    );

    return relatedHubs.filter(Boolean);
}

export default async function HubPage({ params }: PageProps) {
    const { slug } = await params;
    const hub = await getHubFromDB(slug);

    // If not a valid hub slug, return 404
    if (!hub) {
        notFound();
    }

    const jobs = await getHubJobs(hub.filter.tag, hub.filter.category);
    const relatedHubs = await getRelatedHubs(hub.relatedHubs || []);

    return (
        <main className="min-h-screen bg-stone-50">
            {/* Hero Section */}
            <section className="bg-stone-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <Link href="/" className="inline-flex items-center text-stone-400 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                    <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
                        {hub.h1}
                    </h1>
                    <p className="text-stone-300 text-lg md:text-xl max-w-2xl leading-relaxed">
                        {hub.intro}
                    </p>
                </div>
            </section>

            {/* Jobs Grid */}
            <section className="container mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Main Job Feed */}
                    <div className="md:w-2/3">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="font-bold text-xl md:text-2xl text-stone-800">
                                Latest {hub.filter.tag} Jobs
                            </h2>
                            <span className="bg-stone-200 text-stone-600 px-3 py-1 rounded-full text-sm font-bold">
                                {jobs.length} Active
                            </span>
                        </div>

                        {jobs.length > 0 ? (
                            <div className="space-y-4">
                                {jobs.map(post => (
                                    <Link key={post.id} href={`/jobs/${post.slug}`} className="block group">
                                        <article className="bg-white p-6 rounded-xl border border-stone-200 hover:border-black transition-colors shadow-sm hover:shadow-md">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg group-hover:text-agri-green transition-colors mb-1">
                                                        {post.title}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2 text-sm text-stone-500 mb-3">
                                                        {post.company && <span className="font-medium text-stone-900">{post.company}</span>}
                                                        {post.location && <span>• {post.location}</span>}
                                                        <span>• {safeDateFormat(post.published_at)}</span>
                                                    </div>
                                                </div>
                                                {post.job_type && (
                                                    <span className="bg-stone-100 text-stone-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                                                        {post.job_type}
                                                    </span>
                                                )}
                                            </div>
                                            {post.tags && post.tags.length > 0 && (
                                                <div className="flex gap-2 mt-3 pt-3 border-t border-stone-100">
                                                    {post.tags.map(tag => (
                                                        <span key={tag} className="text-xs text-stone-500 bg-stone-50 px-2 py-1 rounded">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-stone-200 border-dashed">
                                <p className="text-stone-500">No active jobs found for this category yet.</p>
                                <p className="text-sm text-stone-400 mt-2">Check back soon or browse all jobs.</p>
                                <Link href="/jobs" className="inline-block mt-4 text-agri-green font-bold hover:underline">
                                    View All Jobs
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Related Hubs */}
                    <div className="md:w-1/3">
                        <div className="bg-white p-6 rounded-xl border border-stone-200 sticky top-8">
                            <h3 className="font-serif font-bold text-xl mb-4">You might also like</h3>
                            <div className="space-y-3">
                                {relatedHubs.map(related => (
                                    <Link key={related!.slug} href={`/${related!.slug}`} className="block p-4 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors border border-transparent hover:border-stone-200">
                                        <h4 className="font-bold text-stone-900 mb-1">{related!.h1}</h4>
                                        <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">Browse Hub &rarr;</span>
                                    </Link>
                                ))}
                                <Link href="/jobs" className="block p-4 mt-4 text-center border border-stone-200 rounded-lg hover:border-black transition-colors font-bold text-sm uppercase tracking-widest">
                                    Browse All Jobs
                                </Link>
                            </div>

                            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <h4 className="font-bold text-blue-900 mb-2">Join our WhatsApp Group</h4>
                                <p className="text-sm text-blue-800 mb-4">
                                    Get these {hub.filter.tag} jobs delivered straight to your phone.
                                </p>
                                <button className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition-colors">
                                    Join Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
