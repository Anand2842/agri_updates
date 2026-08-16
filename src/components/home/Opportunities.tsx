import Link from 'next/link';
import { Job } from '@/types/database';
import { Briefcase, MapPin, Building2, ArrowRight } from 'lucide-react';

export default function Opportunities({ jobs }: { jobs: Job[] }) {
    if (!jobs || jobs.length === 0) return null;

    return (
        <div className="paper-panel p-5 bg-white border border-slate-200/90 shadow-xs h-full flex flex-col justify-between">
            <div>
                {/* Section Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <Briefcase className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            Verified Careers
                        </h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Live
                    </span>
                </div>

                {/* List */}
                <div className="divide-y divide-slate-100">
                    {jobs.slice(0, 5).map((job) => (
                        <div key={job.id} className="group py-3.5 first:pt-2 last:pb-0">
                            <Link href={`/jobs/${job.slug || job.id}`} className="block">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                        {job.type || 'Full-time'}
                                    </span>
                                    {job.salary_range && (
                                        <span className="text-[10px] font-semibold text-emerald-700">
                                            {job.salary_range}
                                        </span>
                                    )}
                                </div>

                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors line-clamp-1 mb-1">
                                    {job.title}
                                </h4>

                                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                    <span className="flex items-center gap-1 truncate max-w-[120px]">
                                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                        {job.company || 'Agri Organization'}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 truncate">
                                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                        {job.location || 'India'}
                                    </span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* View All CTA */}
            <div className="pt-4 mt-2 border-t border-slate-100">
                <Link
                    href="/jobs"
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-xs font-bold text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 transition-all"
                >
                    <span>Browse All {jobs.length}+ Openings</span>
                    <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
}
