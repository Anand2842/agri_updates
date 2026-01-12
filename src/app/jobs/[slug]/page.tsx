import { supabase } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { Share2, MapPin, Building, Calendar, ArrowLeft, ExternalLink } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils/date';
import PostContent from '@/components/PostContent';

export const revalidate = 3600;

interface JobPageProps {
    params: Promise<{ slug: string }>;
}

function isUUID(str: string) {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(str);
}

async function getJob(slugOrId: string) {
    let query = supabase
        .from('posts')
        .select('*')
        .eq('category', 'Jobs');

    if (isUUID(slugOrId)) {
        query = query.eq('id', slugOrId);
    } else {
        query = query.eq('slug', slugOrId);
    }

    const { data, error } = await query.single();

    if (error || !data) return null;
    return data;
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
        description: `Apply for the ${job.title} position at ${job.company} in ${job.location}.`,
        openGraph: {
            title: `${job.title} at ${job.company}`,
            description: `Apply for the ${job.title} position at ${job.company} in ${job.location}.`,
            type: 'article',
            publishedTime: job.created_at,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${job.title} at ${job.company}`,
            description: `Apply for the ${job.title} position at ${job.company} in ${job.location}.`,
        },
        alternates: {
            canonical: `/jobs/${job.slug}`,
        },
    };
}

export default async function JobPage({ params }: JobPageProps) {
    const { slug } = await params;
    const job = await getJob(slug);

    if (!job) {
        notFound();
    }

    // Redirect legacy ID URLs to new key-rich Slug URLs
    if (isUUID(slug) && job.slug) {
        redirect(`/jobs/${job.slug}`);
    }

    // Schema.org JSON-LD
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        hiringOrganization: {
            '@type': 'Organization',
            name: job.company,
            sameAs: job.application_link
        },
        datePosted: job.created_at,
        jobLocation: {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressLocality: job.location, // Simplified for now
                addressCountry: 'IN'
            }
        },
        description: job.content || job.excerpt || `Job opportunity for ${job.title} at ${job.company}.`,
        employmentType: job.job_type,
    };

    return (
        <div className="bg-stone-50 min-h-screen pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            {
                                '@type': 'ListItem',
                                position: 1,
                                name: 'Home',
                                item: 'https://agriupdates.com'
                            },
                            {
                                '@type': 'ListItem',
                                position: 2,
                                name: 'Jobs',
                                item: 'https://agriupdates.com/jobs'
                            },
                            {
                                '@type': 'ListItem',
                                position: 3,
                                name: job.title,
                                item: `https://agriupdates.com/jobs/${slug}`
                            }
                        ]
                    })
                }}
            />

            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-stone-200">
                <div className="container mx-auto px-4 py-8">
                    <Link href="/jobs" className="inline-flex items-center text-stone-500 hover:text-agri-green mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Jobs
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-agri-green/10 text-agri-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {job.job_type || 'Not Specified'}
                                </span>
                                <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">
                                    Posted {formatRelativeDate(job.created_at)}
                                </span>
                            </div>
                            <h1 className="font-serif text-3xl md:text-5xl font-bold text-stone-900 mb-2">
                                {job.title}
                            </h1>
                            <div className="flex items-center gap-2 text-lg text-stone-600 font-serif">
                                <Building className="w-5 h-5" />
                                <span>{job.company}</span>
                            </div>
                        </div>

                        <a
                            href={job.application_link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-agri-green text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-agri-dark transition-all rounded shadow-lg flex items-center gap-2"
                        >
                            Apply Now
                            <ExternalLink className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 md:p-12 rounded-xl border border-stone-200 shadow-sm">
                            <h2 className="font-serif text-2xl font-bold mb-6">Job Description</h2>
                            <div className="w-full">
                                <PostContent html={job.content || `<p>${job.excerpt}</p>`} />
                            </div>
                        </div>

                        {/* Security & Disclaimer for Trust */}
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex items-start gap-4">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1">
                                <Share2 className="w-5 h-5" />
                            </div>
                            <div className="text-sm text-blue-900">
                                <p className="font-bold mb-1">Safety Tip</p>
                                <p>Agri Updates never charges fees for job applications. If you are asked to pay for an interview or offer letter, please report it immediately.</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                            <h3 className="font-bold uppercase text-xs tracking-widest text-stone-500 mb-6">Job Overview</h3>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <MapPin className="w-5 h-5 text-agri-green flex-shrink-0" />
                                    <div>
                                        <div className="text-xs font-bold text-stone-400 uppercase">Location</div>
                                        <div className="font-serif text-lg">{job.location || 'Remote'}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Calendar className="w-5 h-5 text-agri-green flex-shrink-0" />
                                    <div>
                                        <div className="text-xs font-bold text-stone-400 uppercase">Employment Type</div>
                                        <div className="font-serif text-lg">{job.job_type || 'Not Specified'}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Building className="w-5 h-5 text-agri-green flex-shrink-0" />
                                    <div>
                                        <div className="text-xs font-bold text-stone-400 uppercase">Company</div>
                                        <div className="font-serif text-lg">{job.company}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-stone-100">
                                <a
                                    href={job.application_link || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center bg-black text-white px-6 py-3 font-bold uppercase text-sm hover:bg-stone-800 transition-all rounded"
                                >
                                    Apply on Company Site
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
