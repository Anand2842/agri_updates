import Link from 'next/link';
import { Job } from '@/types/database';

export default function Opportunities({ jobs }: { jobs: Job[] }) {
    if (!jobs || jobs.length === 0) return null;

    return (
        <div>
            {/* Section Header */}
            <h3 className="section-header-green mb-6">
                Opportunities
            </h3>

            {/* List */}
            <div className="flex flex-col">
                {jobs.slice(0, 6).map((job) => (
                    <div key={job.id} className="newspaper-card-minimal group">
                        <Link href={`/jobs/${job.id}`} className="block">
                            {/* Type Badge */}
                            <div className="category-badge mb-1 text-[9px]">
                                {job.type || 'Job'}
                            </div>

                            {/* Title */}
                            <h4 className="font-serif text-base font-bold leading-snug mb-1 group-hover:text-agri-green transition-colors">
                                {job.title}
                            </h4>

                            {/* Company & Location */}
                            <p className="text-xs text-stone-500 font-serif">
                                {job.company} {job.location && `• ${job.location}`}
                            </p>
                        </Link>
                    </div>
                ))}
            </div>

            {/* View All CTA */}
            <div className="mt-6 pt-4 border-t border-stone-200">
                <Link
                    href="/jobs"
                    className="block text-center text-[10px] font-bold uppercase tracking-widest text-agri-green hover:text-black transition-colors"
                >
                    View All Opportunities →
                </Link>
            </div>
        </div>
    );
}
