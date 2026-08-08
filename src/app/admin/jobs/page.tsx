import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function AdminJobsPage() {
    const supabase = await createClient()
    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <h1 className="font-serif text-3xl font-bold">Manage Jobs</h1>
                <Link href="/admin/jobs/new" className="bg-black text-white px-4 py-2 font-bold uppercase tracking-widest text-xs hover:bg-agri-green text-center">
                    + New Job
                </Link>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {jobs?.map((job) => (
                    <div key={job.id} className="bg-white border border-stone-200 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="min-w-0 flex-1">
                                <div className="font-bold text-stone-900">{job.title}</div>
                                <div className="text-xs text-stone-500 mt-1">{job.company}</div>
                            </div>
                            {job.is_active ? (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-[10px] uppercase font-bold shrink-0">Active</span>
                            ) : (
                                <span className="bg-stone-100 text-stone-500 px-2 py-1 rounded-full text-[10px] uppercase font-bold shrink-0">Draft</span>
                            )}
                        </div>
                        <div className="flex items-center justify-between border-t border-stone-100 pt-3 mt-2">
                            <span className="text-xs text-stone-500">{job.type}</span>
                            <Link href={`/admin/jobs/${job.id}`} className="text-stone-400 hover:text-black font-bold uppercase text-[10px] tracking-widest">
                                Edit
                            </Link>
                        </div>
                    </div>
                ))}
                {jobs?.length === 0 && (
                    <div className="bg-white border border-stone-200 rounded-xl p-8 text-center text-stone-500">
                        No jobs found. Create one to get started.
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white border border-stone-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-widest text-xs border-b border-stone-200">
                        <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Company</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {jobs?.map((job) => (
                            <tr key={job.id} className="hover:bg-stone-50 transition-colors">
                                <td className="p-4 font-bold">{job.title}</td>
                                <td className="p-4 text-stone-600">{job.company}</td>
                                <td className="p-4 text-stone-500">{job.type}</td>
                                <td className="p-4">
                                    {job.is_active ? (
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-[10px] uppercase font-bold">Active</span>
                                    ) : (
                                        <span className="bg-stone-100 text-stone-500 px-2 py-1 rounded-full text-[10px] uppercase font-bold">Draft</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <Link href={`/admin/jobs/${job.id}`} className="text-stone-400 hover:text-black font-bold uppercase text-[10px] tracking-widest">
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {jobs?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-stone-500">
                                    No jobs found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
