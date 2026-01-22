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
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }
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
            {jobs.map((job) => (
                <motion.div
                    key={job.id}
                    variants={item}
                    className="border border-stone-200 p-6 group hover:border-agri-green transition-colors bg-white flex flex-col h-full rounded-xl hover:shadow-lg"
                >
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
                        <Link href={`/jobs/${job.slug}`} className="btn-primary whitespace-nowrap flex-shrink-0 mb-1">
                            View Details
                        </Link>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}
