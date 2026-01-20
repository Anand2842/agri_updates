import { createClient } from '@/utils/supabase/server';
import { Search, Bell, Plus, Filter, Grid, List as ListIcon, MoreVertical, Star, Video, Mail, Users, FileText } from 'lucide-react';
import Link from 'next/link';
import { safeDateFormat } from '@/lib/utils/date';

export const revalidate = 0;

export default async function ApplicantsCRM() {
    const supabase = await createClient();

    // 1. Fetch Real Applications + Related Job Info
    const { data: applications, error } = await supabase
        .from('job_applications')
        .select(`
            id,
            applicant_name,
            email,
            resume_url,
            status,
            applied_at,
            job:jobs (
                title,
                type
            )
        `)
        .order('applied_at', { ascending: false });

    if (error) {
        console.error("Error fetching applicants:", error);
    }

    const applicants = applications || [];

    // Calculate Stats
    const totalApplicants = applicants.length;
    const screeningCount = applicants.filter(a => a.status === 'New' || a.status === 'Screening').length;
    const interviewCount = applicants.filter(a => a.status === 'Interview').length;
    const offerCount = applicants.filter(a => a.status === 'Offer' || a.status === 'Hired').length;

    return (
        <div className="space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="text-xs text-agri-green font-bold uppercase tracking-widest mb-1">Recruiter Workspace</div>
                    <h1 className="font-serif text-3xl font-bold">Pipeline Overview</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input type="text" placeholder="Search applicants..." className="pl-10 pr-4 py-2 border border-stone-200 rounded-lg text-sm bg-white focus:outline-none focus:border-agri-green w-64" />
                    </div>
                </div>
            </div>

            {/* Pipeline Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm flex items-start justify-between">
                    <div>
                        <div className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">Total Applicants</div>
                        <div className="text-3xl font-serif font-bold mb-1">{totalApplicants}</div>
                        <div className="text-[10px] font-bold text-stone-400">All time</div>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-50 text-stone-600">
                        <Users className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm flex items-start justify-between">
                    <div>
                        <div className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">Screening</div>
                        <div className="text-3xl font-serif font-bold mb-1">{screeningCount}</div>
                        <div className="text-[10px] font-bold text-agri-green">Active Pipeline</div>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
                        <Star className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm flex items-start justify-between">
                    <div>
                        <div className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">Interviews</div>
                        <div className="text-3xl font-serif font-bold mb-1">{interviewCount}</div>
                        <div className="text-[10px] font-bold text-orange-500">Action required</div>
                    </div>
                    <div className="p-2 rounded-lg bg-orange-50 text-orange-500">
                        <Video className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm flex items-start justify-between">
                    <div>
                        <div className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">Offers/Hired</div>
                        <div className="text-3xl font-serif font-bold mb-1">{offerCount}</div>
                        <div className="text-[10px] font-bold text-purple-500">Success</div>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-500">
                        <Mail className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-stone-100 font-bold uppercase text-xs tracking-widest text-stone-500">
                    Latest Applications
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                            <tr>
                                <th className="p-4">Candidate</th>
                                <th className="p-4">Applied For</th>
                                <th className="p-4">Resume</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Applied</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-sm">
                            {applicants.map((app: any) => (
                                <tr key={app.id} className="hover:bg-stone-50 group transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-500 uppercase">
                                                {app.applicant_name.slice(0, 2)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-stone-900">{app.applicant_name}</div>
                                                <div className="text-xs text-stone-400">{app.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold">{app.job?.title || 'Unknown Job'}</div>
                                        <div className="text-xs text-stone-500">{app.job?.type || 'Full-time'}</div>
                                    </td>
                                    <td className="p-4">
                                        {app.resume_url ? (
                                            <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-agri-green hover:underline">
                                                <FileText className="w-4 h-4" /> View
                                            </a>
                                        ) : (
                                            <span className="text-stone-400 text-xs">No Resume</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${app.status === 'Hired' ? 'bg-green-100 text-green-700 border-green-200' :
                                            app.status === 'Rejected' ? 'bg-red-50 text-red-500 border-red-100' :
                                                'bg-stone-100 text-stone-600 border-stone-200'
                                            }`}>
                                            {app.status || 'New'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-stone-500">
                                        {safeDateFormat(app.applied_at)}
                                    </td>
                                </tr>
                            ))}
                            {applicants.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-stone-500">
                                        No applications yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
