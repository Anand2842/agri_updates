import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

interface AdminPostsPageProps {
    searchParams: Promise<{ category?: string; status?: string }>
}

export default async function AdminPostsPage({ searchParams }: AdminPostsPageProps) {
    const params = await searchParams
    const categoryFilter = params.category
    const statusFilter = params.status

    const supabase = await createClient()

    let query = supabase
        .from('posts')
        .select('*')
        .order('published_at', { ascending: false })

    // Apply filters
    if (categoryFilter) {
        query = query.eq('category', categoryFilter)
    }
    if (statusFilter) {
        query = query.eq('status', statusFilter)
    }

    const { data: posts } = await query

    const categories = [
        { value: '', label: 'All Categories' },
        { value: 'Research', label: 'Research' },
        { value: 'Fellowships', label: 'Fellowships' },
        { value: 'Scholarships', label: 'Scholarships' },
        { value: 'Grants', label: 'Grants' },
        { value: 'Exams', label: 'Exams' },
        { value: 'Events', label: 'Events' },
        { value: 'Guidance', label: 'Guidance' },
        { value: 'Warnings', label: 'Warnings' },
    ]

    const statuses = [
        { value: '', label: 'All Status' },
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Drafts' },
        { value: 'archived', label: 'Archived' },
    ]

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Content Management</h1>
                    <p className="text-stone-500 text-sm mt-1">Manage, publish, and archive your posts.</p>
                </div>
                <Link href="/admin/posts/new" className="bg-black text-white px-4 py-2 font-bold uppercase tracking-widest text-xs hover:bg-agri-green">
                    + New Post
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-stone-200">
                <div className="flex gap-2 items-center">
                    <span className="text-xs font-bold uppercase text-stone-400">Status:</span>
                    {statuses.map((stat) => (
                        <Link
                            key={stat.value}
                            href={`/admin/posts?category=${categoryFilter || ''}&status=${stat.value}`}
                            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-colors ${(statusFilter === stat.value) || (!statusFilter && stat.value === '')
                                ? 'bg-black text-white'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                        >
                            {stat.label}
                        </Link>
                    ))}
                </div>
                <div className="w-px bg-stone-200 h-6 self-center mx-2"></div>
                <div className="flex gap-2 items-center flex-wrap">
                    <span className="text-xs font-bold uppercase text-stone-400">Category:</span>
                    {categories.map((cat) => (
                        <Link
                            key={cat.value}
                            href={`/admin/posts?status=${statusFilter || ''}&category=${cat.value}`}
                            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-colors ${(categoryFilter === cat.value) || (!categoryFilter && cat.value === '')
                                ? 'bg-agri-green text-white'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                        >
                            {cat.label}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="bg-white border border-stone-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-widest text-xs border-b border-stone-200">
                        <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Views</th>
                            <th className="p-4">Updated</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {posts?.map((post) => (
                            <tr key={post.id} className="hover:bg-stone-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-stone-800">{post.title}</div>
                                    <div className="text-xs text-stone-500 mt-1">by {post.author_name}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest ${post.status === 'published' ? 'bg-green-100 text-green-700' :
                                        post.status === 'archived' ? 'bg-red-100 text-red-700' :
                                            'bg-stone-200 text-stone-600'
                                        }`}>
                                        {post.status || 'Draft'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded text-[10px] uppercase font-bold">
                                        {post.category}
                                    </span>
                                </td>
                                <td className="p-4 font-mono font-bold text-stone-700">
                                    {post.views || 0}
                                </td>
                                <td className="p-4 text-stone-400 text-xs">
                                    {new Date(post.updated_at || post.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <Link href={`/admin/posts/${post.id}`} className="text-stone-400 hover:text-black font-bold uppercase text-[10px] tracking-widest">
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {posts?.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-stone-500">
                                    No posts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
