import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import DeletePostButton from '@/components/admin/DeletePostButton'
import { safeDateFormat } from '@/lib/utils/date'
import { CheckCircle, XCircle, Edit3 } from 'lucide-react'

export default async function ReviewQueuePage() {
    const supabase = await createClient()

    // Fetch posts that are pending review
    const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'pending_review')
        .order('updated_at', { ascending: false })

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
                        Review Queue
                        <span className="bg-amber-100 text-amber-700 text-sm px-2 py-0.5 rounded-full font-bold">
                            {posts?.length || 0} Pending
                        </span>
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">Review drafts submitted by writers before publishing.</p>
                </div>
            </div>

            <div className="bg-white border border-stone-200 shadow-sm rounded-xl overflow-hidden">
                {posts?.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 mb-1">All caught up!</h3>
                        <p className="text-stone-500">There are no posts pending review at this time.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-widest text-xs border-b border-stone-200">
                            <tr>
                                <th className="p-4">Content</th>
                                <th className="p-4">Author</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Submitted</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {posts?.map((post) => (
                                <tr key={post.id} className="hover:bg-stone-50 transition-colors group">
                                    <td className="p-4 align-top">
                                        <div className="font-bold text-stone-800 text-base mb-1 group-hover:text-agri-green transition-colors">
                                            <Link href={`/admin/posts/${post.id}`}>{post.title}</Link>
                                        </div>
                                        <p className="text-stone-500 text-xs line-clamp-1 w-96">
                                            {post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'No excerpt'}
                                        </p>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="font-medium text-stone-900">{post.author_name}</div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">
                                            {post.category}
                                        </span>
                                    </td>
                                    <td className="p-4 align-top text-stone-500 text-xs">
                                        {safeDateFormat(post.updated_at || post.created_at)}
                                    </td>
                                    <td className="p-4 align-top text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link 
                                                href={`/admin/posts/${post.id}`} 
                                                className="flex items-center gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                                Review
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
