import { supabase } from '@/lib/supabase';
import { Post } from '@/types/database';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const revalidate = 0;

interface JobPageProps {
    params: Promise<{ slug: string }>;
}

// Helper to fetch job by ID or slug from posts table
async function getJob(idOrSlug: string) {
    // Try UUID first
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    let query = supabase.from('posts').select('*').eq('category', 'Jobs');

    if (isUuid) {
        query = query.eq('id', idOrSlug);
    } else {
        // Try to match by slug
        query = query.eq('slug', idOrSlug);
    }

    const { data, error } = await query.single();

    if (error || !data) {
        console.error('Error fetching job:', error);
        return null;
    }
    return data as Post;
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
    const { slug } = await params;
    const job = await getJob(slug);

    if (!job) {
        return {
            title: 'Job Not Found',
        };
    }

    return {
        title: `${job.title} at ${job.company} | Agri Updates`,
        description: `Apply for the ${job.title} position at ${job.company}. Location: ${job.location}.`,
        openGraph: {
            title: `${job.title} - ${job.company}`,
            description: `We are hiring a ${job.title} in ${job.location}. Click to read more and apply.`,
        }
    };
}

export default async function JobPage({ params }: JobPageProps) {
    const { slug } = await params;
    const job = await getJob(slug);

    if (!job) {
        notFound();
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header */}
            <div className="bg-stone-50 border-b border-stone-200 py-16">
                <div className="container mx-auto px-4 text-center">
                    <span className="inline-block px-3 py-1 bg-agri-green text-white text-xs font-bold uppercase tracking-widest mb-4">
                        {job.job_type || 'Job Opportunity'}
                    </span>
                    <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4 max-w-4xl mx-auto leading-tight">
                        {job.title}
                    </h1>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-stone-500 font-serif italic text-lg">
                        <span>{job.company}</span>
                        <span className="hidden md:block">•</span>
                        <span>{job.location}</span>
                        {job.salary_range && (
                            <>
                                <span className="hidden md:block">•</span>
                                <span>{job.salary_range}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    {/* Job content / "News Article" Style */}
                    <div className="prose prose-stone prose-lg mx-auto mb-16">
                        {/* 
                          Since we don't have a 'content' field in the schema yet (only description string),
                          we will render the description. If it's plain text, we wrap in p.
                          Future improvement: Add rich text 'content' field to Jobs table.
                        */}
                        <div className="whitespace-pre-wrap font-serif leading-relaxed text-stone-700">
                            {/* Fallback layout mimicking a news post */}
                            <p className="font-bold text-xl mb-6">
                                📌 Opportunity at {job.company}
                            </p>

                            {job.content ? (
                                <div dangerouslySetInnerHTML={{ __html: job.content }} />
                            ) : job.excerpt ? (
                                <p>{job.excerpt}</p>
                            ) : (
                                <p>No detailed description available for this position.</p>
                            )}
                        </div>

                        <div className="mt-8 flex flex-wrap gap-2">
                            {job.tags?.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-stone-100 text-stone-600 text-xs uppercase font-bold">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* How to Apply Section */}
                    <div className="bg-stone-100 border border-stone-200 p-8 rounded-xl text-center">
                        <h3 className="font-serif text-2xl font-bold mb-4">How to Apply</h3>
                        <p className="text-stone-600 mb-8 max-w-lg mx-auto">
                            Interested in this role? This position is managed externally.
                            Please follow the instructions below or click the button to proceed to the application.
                        </p>

                        {job.application_link?.includes('@') ? (
                            // It's likely an email
                            <a
                                href={`mailto:${job.application_link}`}
                                className="inline-block bg-agri-green text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-agri-dark transition-colors"
                            >
                                Email Your Resume
                            </a>
                        ) : (
                            // It's likely a URL
                            <a
                                href={job.application_link || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-agri-green text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-agri-dark transition-colors"
                            >
                                Apply Now
                            </a>
                        )}

                        <p className="text-xs text-stone-500 mt-6">
                            Please mention <strong>Agri Updates</strong> when applying.
                        </p>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/jobs" className="text-sm font-bold uppercase tracking-widest text-stone-400 hover:text-black transition-colors">
                            ← Back to all Jobs
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
