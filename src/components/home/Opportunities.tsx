import Link from 'next/link';
import { Job } from '@/types/database';

export default function Opportunities({ jobs }: { jobs: Job[] }) {
    return (
        <div className="bg-white">
            <h3 className="w-full bg-agri-green text-white text-center text-xs font-bold uppercase tracking-widest py-2 mb-8">
                Opportunities
            </h3>
            <div className="flex flex-col divide-y divide-stone-100">
                {jobs.slice(0, 6).map((job) => (
                    <div key={job.id} className="py-4 first:pt-0 group">
                        <Link href={`/jobs/${job.id}`} className="block">
                            <div className="text-[9px] uppercase font-bold text-agri-green mb-1 tracking-widest">
                                {job.type}
                            </div>
                            <h4 className="font-serif text-md font-bold leading-tight mb-1 group-hover:underline decoration-black underline-offset-2">
                                {job.title}
                            </h4>
                            <p className="text-xs text-stone-500 italic font-serif opacity-80">{job.company}</p>
                        </Link>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center">
                <Link href="/jobs" className="inline-block bg-black text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2 hover:bg-agri-green transition-colors">
                    View All Opportunities
                </Link>
            </div>
        </div>
    );
}
