import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import DeleteHubButton from '@/components/admin/DeleteHubButton';
import { ExternalLink } from 'lucide-react';

export default async function AdminHubsPage() {
    const supabase = await createClient();

    const { data: hubs } = await supabase
        .from('hubs')
        .select('*')
        .order('title', { ascending: true });

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Job Hubs</h1>
                    <p className="text-stone-500 text-sm mt-1">
                        Manage landing pages for specific job categories and locations.
                    </p>
                </div>
                <Link
                    href="/admin/hubs/new"
                    className="bg-black text-white px-4 py-2 font-bold uppercase tracking-widest text-xs hover:bg-agri-green transition-colors"
                >
                    + New Hub
                </Link>
            </div>

            <div className="bg-white border border-stone-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-widest text-xs border-b border-stone-200">
                        <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Slug</th>
                            <th className="p-4">Filter Tag</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {hubs?.map((hub) => (
                            <tr key={hub.id} className="hover:bg-stone-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-stone-800">{hub.h1}</div>
                                    <div className="text-xs text-stone-500 mt-1 line-clamp-1">
                                        {hub.description}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <code className="text-xs bg-stone-100 px-2 py-1 rounded font-mono">
                                        /{hub.slug}
                                    </code>
                                </td>
                                <td className="p-4">
                                    <span className="bg-agri-green/10 text-agri-green px-2 py-1 rounded text-xs font-bold">
                                        {hub.filter_tag}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span
                                        className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest ${hub.is_active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-stone-200 text-stone-600'
                                            }`}
                                    >
                                        {hub.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end items-center gap-3">
                                        <a
                                            href={`/${hub.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-stone-400 hover:text-agri-green transition-colors"
                                            title="View hub page"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <Link
                                            href={`/admin/hubs/${hub.id}`}
                                            className="text-stone-400 hover:text-black font-bold uppercase text-[10px] tracking-widest"
                                        >
                                            Edit
                                        </Link>
                                        <DeleteHubButton hubId={hub.id} hubTitle={hub.title} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {(!hubs || hubs.length === 0) && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-stone-500">
                                    <div className="mb-4">No hubs created yet.</div>
                                    <Link
                                        href="/admin/hubs/new"
                                        className="text-agri-green font-bold hover:underline"
                                    >
                                        Create your first hub →
                                    </Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">How Hub Filtering Works</h3>
                <p className="text-sm text-blue-800">
                    Each hub displays jobs that have a matching tag. For example, a hub with filter tag{' '}
                    <code className="bg-blue-100 px-1 rounded">Karnataka</code> will show all jobs
                    tagged with &quot;Karnataka&quot;. Make sure your job posts include the appropriate tags.
                </p>
            </div>
        </div>
    );
}
