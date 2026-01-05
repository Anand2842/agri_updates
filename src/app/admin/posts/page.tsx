import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

interface AdminPostsPageProps {
    searchParams: Promise<{ category?: string }>
}

export default async function AdminPostsPage({ searchParams }: AdminPostsPageProps) {
    const params = await searchParams
    const categoryFilter = params.category

    const supabase = await createClient()

    let query = supabase
        .from('posts')
        .select('*')
        .order('published_at', { ascending: false })

    // Apply category filter if present
    if (categoryFilter) {
        query = query.eq('category', categoryFilter)
    }

    const { data: posts } = await query

    const categories = [
        { value: '', label: 'All Posts' },
        { value: 'Research', label: 'Research & News' },
        { value: 'Fellowships', label: 'Fellowships' },
        { value: 'Scholarships', label: 'Scholarships' },
        { value: 'Grants', label: 'Grants & Funding' },
        { value: 'Exams', label: 'Exams & Admissions' },
        { value: 'Events', label: 'Conferences & Events' },
        { value: 'Guidance', label: 'Application Guidance' },
        { value: 'Warnings', label: 'Warnings & Awareness' },
    ]

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold">
                        {categoryFilter ? categories.find(c => c.value === categoryFilter)?.label || 'Posts' : 'All Posts'}
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">Manage your content updates</p>
                </div>
                <Link href="/admin/posts/new" className="bg-black text-white px-4 py-2 font-bold uppercase tracking-widest text-xs hover:bg-agri-green">
                    + New Post
                </Link>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-stone-200">
                {categories.map((cat) => (
                    <Link
                        key={cat.value}
                        href={cat.value ? `/admin/posts?category=${cat.value}` : '/admin/posts'}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-colors ${(categoryFilter === cat.value) || (!categoryFilter && cat.value === '')
                                ? 'bg-agri-green text-white'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                    >
                        {cat.label}
                    </Link>
                ))}
            </div>

            <div className="bg-white border border-stone-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-widest text-xs border-b border-stone-200">
                        <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Author</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Published</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {posts?.map((post) => (
                            <tr key={post.id} className="hover:bg-stone-50 transition-colors">
                                <td className="p-4 font-bold">{post.title}</td>
                                <td className="p-4 text-stone-600">{post.author_name}</td>
                                <td className="p-4">
                                    <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded text-[10px] uppercase font-bold">
                                        {post.category}
                                    </span>
                                </td>
                                <td className="p-4 text-stone-400 text-xs">
                                    {new Date(post.published_at).toLocaleDateString()}
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
                                <td colSpan={5} className="p-8 text-center text-stone-500">
                                    No posts found{categoryFilter ? ` in ${categoryFilter}` : ''}. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
