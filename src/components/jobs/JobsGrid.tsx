'use client';

import { Post } from '@/types/database';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Building2, Clock, Briefcase, ChevronRight } from 'lucide-react';

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
            className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 mb-12"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {jobs.map((job) => {
                const isNew = new Date(job.created_at) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
                const isFeatured = job.is_featured;
                const formattedDate = new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                // Safe tag check
                const tags = Array.isArray(job.tags) ? job.tags : [];
                const isUrgent = tags.some(tag => tag.toLowerCase() === 'urgent');
                const isVerified = tags.some(tag => tag.toLowerCase() === 'verified');

                return (
                    <motion.div
                        key={job.id}
                        variants={item}
                        className={`
                            relative group flex flex-col h-full rounded-xl transition-all duration-300
                            bg-white border hover:-translate-y-1
                            ${isFeatured
                                ? 'border-[#C9A961]/40 shadow-md hover:shadow-xl hover:border-[#C9A961]'
                                : 'border-stone-100 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] hover:border-agri-green/30'
                            }
                        `}
                    >
                        {/* Badges - Absolute Positioned */}
                        <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10 items-end">
                            {isUrgent && (
                                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-rose-600 rounded-lg shadow-sm animate-pulse">
                                    Urgent
                                </span>
                            )}
                            {isNew && !isUrgent && (
                                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-emerald-600 rounded-lg shadow-sm">
                                    New
                                </span>
                            )}
                            {isFeatured && (
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#927329] border border-[#C9A961] rounded bg-[#FFFDF5]">
                                    Featured
                                </span>
                            )}
                        </div>

                        <div className="p-3 md:p-5 flex flex-col h-full">
                            {/* Top Section: Title (Uncluttered) */}
                            <div className="mb-4 pr-12">
                                <h2 className="font-sans text-sm md:text-xl font-bold leading-tight text-stone-900 group-hover:text-agri-green transition-colors line-clamp-3 md:line-clamp-2" title={job.title}>
                                    <Link href={`/jobs/${job.slug}`} className="focus:outline-none">
                                        <span className="absolute inset-0" aria-hidden="true" />
                                        {job.title}
                                    </Link>
                                </h2>
                            </div>

                            {/* Middle Section: 2x2 Metadata Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 md:gap-y-3 gap-x-2 mb-3 md:mb-5">
                                {/* Location */}
                                <div className="flex items-start gap-2 text-stone-600">
                                    <MapPin className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                                    <span className="text-sm font-medium leading-tight line-clamp-2">{job.location || 'Remote'}</span>
                                </div>

                                {/* Company */}
                                <div className="flex items-start gap-2 text-stone-600">
                                    <Building2 className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                                    <Link
                                        href={`/startups/${job.company?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                        className="text-sm font-medium leading-tight line-clamp-2 hover:text-agri-green hover:underline decoration-1 underline-offset-2 transition-colors z-20 relative"
                                        onClick={(e) => e.stopPropagation()} // Prevent triggering the card click
                                    >
                                        {job.company || 'Company'}
                                    </Link>
                                </div>

                                {/* Posted Date */}
                                <div className="flex items-center gap-2 text-stone-500">
                                    <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                                    <span className="text-xs font-semibold uppercase tracking-wide">{formattedDate}</span>
                                </div>

                                {/* Employment Type */}
                                <div className="flex items-center gap-2 text-stone-500">
                                    <Briefcase className="w-4 h-4 text-stone-400 shrink-0" />
                                    <span className="text-xs font-semibold uppercase tracking-wide line-clamp-1">{job.job_type || 'Full Time'}</span>
                                </div>
                            </div>

                            {/* Salary (Optional Row) */}
                            {job.salary_range && (
                                <div className="mb-5 px-3 py-2 bg-stone-50 rounded-lg border border-stone-100 flex items-center justify-center">
                                    <span className="text-xs font-bold text-stone-700">{job.salary_range}</span>
                                </div>
                            )}

                            {/* Bottom Section: Ghost Action */}
                            <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                                {isVerified ? (
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M10.641 21.014c.15.52.884.512 1.026-.008l1.79-6.533 6.307-2.618c.504-.209.435-1.002-.095-1.077l-6.685-.945-3.085-6.046c-.247-.484-.991-.476-1.229.013l-2.91 6.128-6.72.766c-.53.06-.615.845-.121 1.066l6.232 2.787 1.637 6.427c.075.293.364.63.853.04z" opacity="0"></path><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Verified
                                    </span>
                                ) : (
                                    <span />
                                )}

                                <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-agri-green group-hover:underline decoration-2 underline-offset-4">
                                    View Job <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
