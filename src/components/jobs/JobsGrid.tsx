'use client';

import { Post } from '@/types/database';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface JobsGridProps {
    jobs: Post[];
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 50,
            damping: 20
        } as const
    }
};

export default function JobsGrid({ jobs }: JobsGridProps) {
    if (jobs.length === 0) {
        return (
            <div className="text-center py-12 text-stone-500">
                No jobs found matching your criteria.
            </div>
        );
    }

    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {jobs.map((job) => {
                const isNew = new Date(job.created_at) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
                const isFeatured = job.is_featured;
                // Safe tag check
                const tags = Array.isArray(job.tags) ? job.tags : [];
                const isUrgent = tags.some(tag => tag.toLowerCase() === 'urgent');
                const isVerified = tags.some(tag => tag.toLowerCase() === 'verified');

                return (
                    <motion.div
                        key={job.id}
                        variants={item}
                        className={`
                            relative group flex flex-col h-full rounded-2xl transition-all duration-300
                            ${isFeatured
                                ? 'bg-amber-50/50 border border-[#C9A961]/40 hover:border-[#C9A961] shadow-md hover:shadow-xl hover:-translate-y-1'
                                : 'bg-white border border-stone-200 hover:border-agri-green/40 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1'
                            }
                        `}
                    >
                        {/* Badges - Absolute Positioned */}
                        <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10 items-end">
                            {isUrgent && (
                                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-rose-600 rounded-full shadow-sm animate-pulse">
                                    Urgent Only
                                </span>
                            )}
                            {isNew && !isUrgent && (
                                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-emerald-600 rounded-full shadow-sm">
                                    Fresh
                                </span>
                            )}
                            {isFeatured && (
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#927329] border border-[#C9A961] rounded">
                                    Featured
                                </span>
                            )}
                        </div>

                        <div className="p-6 flex flex-col h-full">
                            {/* Top Section: Company & Meta */}
                            <div className="mb-3 pr-8">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-xs font-bold uppercase tracking-widest text-stone-500 line-clamp-1">
                                        {job.company || 'Company'}
                                    </span>
                                    {isVerified && (
                                        <div className="group/verified relative cursor-help">
                                            <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M10.641 21.014c.15.52.884.512 1.026-.008l1.79-6.533 6.307-2.618c.504-.209.435-1.002-.095-1.077l-6.685-.945-3.085-6.046c-.247-.484-.991-.476-1.229.013l-2.91 6.128-6.72.766c-.53.06-.615.845-.121 1.066l6.232 2.787 1.637 6.427c.075.293.364.63.853.04z" opacity="0"></path><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover/verified:opacity-100 transition-opacity whitespace-nowrap">Verified Employer</span>
                                        </div>
                                    )}
                                </div>
                                <h2 className="font-serif text-xl md:text-2xl font-bold leading-tight text-stone-900 group-hover:text-agri-green transition-colors line-clamp-2" title={job.title}>
                                    <Link href={`/jobs/${job.slug}`} className="focus:outline-none">
                                        <span className="absolute inset-0" aria-hidden="true" />
                                        {job.title}
                                    </Link>
                                </h2>
                            </div>

                            {/* Middle Section: Details Grid */}
                            <div className="flex flex-wrap gap-y-2 gap-x-4 mb-5 text-sm">
                                <div className="flex items-center gap-1.5 text-stone-600">
                                    <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <span className="truncate max-w-[120px]">{job.location || 'Remote'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-stone-600">
                                    <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    <span className="truncate">{job.job_type || 'Full-time'}</span>
                                </div>
                                {job.salary_range && (
                                    <div className="flex items-center gap-1.5 text-stone-600 w-full mt-1">
                                        <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <span className="font-bold text-green-700 text-xs tracking-wide">{job.salary_range}</span>
                                    </div>
                                )}
                            </div>

                            {/* Bottom Section: Actions */}
                            <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                    Posted {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>

                                <button className={`
                                    flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all
                                    ${isFeatured
                                        ? 'bg-[#C9A961] text-white hover:bg-[#b09351] shadow-md hover:shadow-lg'
                                        : 'bg-stone-900 text-white group-hover:bg-agri-green shadow hover:shadow-md'
                                    }
                                `}>
                                    Apply
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
