import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Edit, ExternalLink } from 'lucide-react'

export const revalidate = 0

export default async function AdminStartupsPage() {
    const supabase = await createClient()
    const { data: startups, error } = await supabase
        .from('startups')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return <div className="text-red-500">Error loading startups: {error.message}</div>
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold mb-2">Startups Directory</h1>
                    <p className="text-stone-500">Manage featured agritech startups.</p>
                </div>
                <Link
                    href="/admin/startups/new"
                    className="bg-black text-white px-4 py-2 flex items-center gap-2 font-bold uppercase tracking-widest text-sm hover:bg-agri-green transition-colors"
                >
                    <Plus size={16} />
                    Add Startup
                </Link>
            </div>

            <div className="bg-white border border-stone-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-stone-50 border-b border-stone-200">
                            <tr>
                                <th className="p-4 font-bold uppercase text-xs text-stone-500 tracking-wider">Name</th>
                                <th className="p-4 font-bold uppercase text-xs text-stone-500 tracking-wider">Stage</th>
                                <th className="p-4 font-bold uppercase text-xs text-stone-500 tracking-wider">Location</th>
                                <th className="p-4 font-bold uppercase text-xs text-stone-500 tracking-wider">Tags</th>
                                <th className="p-4 font-bold uppercase text-xs text-stone-500 tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {startups?.map((startup) => (
                                <tr key={startup.id} className="hover:bg-stone-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-bold">{startup.name}</div>
                                    </td>
                                    <td className="p-4 text-sm text-stone-600">
                                        <span className="bg-stone-100 px-2 py-1 rounded text-xs">
                                            {startup.funding_stage || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-stone-600">{startup.location || '-'}</td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {startup.tags?.slice(0, 3).map((tag: string) => (
                                                <span key={tag} className="text-[10px] uppercase font-bold text-stone-400 bg-stone-50 px-1 border border-stone-200">
                                                    {tag}
                                                </span>
                                            ))}
                                            {startup.tags && startup.tags.length > 3 && (
                                                <span className="text-[10px] text-stone-400">+{startup.tags.length - 3}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {startup.website_url && (
                                                <a href={startup.website_url} target="_blank" rel="noopener noreferrer" className="p-2 text-stone-400 hover:text-black">
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                            <Link href={`/admin/startups/${startup.id}`} className="p-2 text-stone-400 hover:text-agri-green">
                                                <Edit size={16} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {startups?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-stone-500">
                                        No startups found. Click "Add Startup" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
