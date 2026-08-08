import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import PostsTable from '@/components/admin/PostsTable'

interface AdminPostsPageProps {
    searchParams: Promise<{
        category?: string;
        status?: string;
        is_featured?: string;
        display?: string;
        mine?: string;
        search?: string;
        sort?: string;
    }>
}

export default async function AdminPostsPage({ searchParams }: AdminPostsPageProps) {
    const params = await searchParams
    const categoryFilter = params.category
    const statusFilter = params.status
    const isFeaturedFilter = params.is_featured === 'true'
    const displayFilter = params.display
    const mineFilter = params.mine === 'true'
    const searchQuery = params.search || ''
    const sortParam = params.sort || 'newest'

    const supabase = await createClient()

    // Get current user for "My Posts" filter
    const { data: { user } } = await supabase.auth.getUser()

    // Build base URL for filters (to preserve state across sort/search changes)
    const filterParams = new URLSearchParams()
    if (categoryFilter) filterParams.set('category', categoryFilter)
    if (statusFilter) filterParams.set('status', statusFilter)
    if (isFeaturedFilter) filterParams.set('is_featured', 'true')
    if (displayFilter) filterParams.set('display', displayFilter)
    if (mineFilter) filterParams.set('mine', 'true')

    let query = supabase
        .from('posts')
        .select('*')

    // Apply search
    if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`)
    }

    // Apply filters
    if (categoryFilter) {
        query = query.eq('category', categoryFilter)
    }
    if (statusFilter) {
        query = query.eq('status', statusFilter)
    }
    if (isFeaturedFilter) {
        query = query.eq('is_featured', true)
    }
    if (displayFilter) {
        query = query.eq('display_location', displayFilter)
    }
    if (mineFilter && user) {
        query = query.eq('user_id', user.id)
    }

    // Apply sort
    switch (sortParam) {
        case 'oldest':
            query = query.order('published_at', { ascending: true })
            break
        case 'views':
            query = query.order('views', { ascending: false })
            break
        case 'title':
            query = query.order('title', { ascending: true })
            break
        default:
            query = query.order('published_at', { ascending: false })
    }

    const { data: posts } = await query

    const { data: dbCategories } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

    const categories = [
        { value: '', label: 'All Categories' },
        ...(dbCategories?.map(cat => ({ value: cat.name, label: cat.name })) || [])
    ]


    const statuses = [
        { value: '', label: 'All Status' },
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Drafts' },
        { value: 'archived', label: 'Archived' },
    ]

    // Determine page title based on active filter
    let pageTitle = "Content Management";
    let pageSubtitle = "Manage, publish, and archive your posts.";

    if (displayFilter === 'hero') {
        pageTitle = "Hero & Highlights";
        pageSubtitle = "Managing posts displayed in the main hero section.";
    } else if (displayFilter === 'trending') {
        pageTitle = "Trending Posts";
        pageSubtitle = "Managing posts appearing in the trending sidebar.";
    } else if (isFeaturedFilter) {
        pageTitle = "Featured Posts";
        pageSubtitle = "Managing posts marked as featured.";
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold">{pageTitle}</h1>
                    <p className="text-stone-500 text-sm mt-1">{pageSubtitle}</p>
                </div>
                <Link href="/admin/posts/new" className="bg-black text-white px-4 py-2 font-bold uppercase tracking-widest text-xs hover:bg-agri-green w-fit">
                    + New Post
                </Link>
            </div>

            {/* Filters */}
            <div className="mb-6 pb-4 border-b border-stone-200">
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Search */}
                    <form method="GET" className="flex items-center gap-2">
                        {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
                        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
                        {isFeaturedFilter && <input type="hidden" name="is_featured" value="true" />}
                        {displayFilter && <input type="hidden" name="display" value={displayFilter} />}
                        {mineFilter && <input type="hidden" name="mine" value="true" />}
                        {sortParam && sortParam !== 'newest' && <input type="hidden" name="sort" value={sortParam} />}
                        <span className="text-xs font-bold uppercase text-stone-400">Search:</span>
                        <input
                            type="text"
                            name="search"
                            defaultValue={searchQuery}
                            placeholder="Search by title..."
                            className="px-3 py-1.5 text-xs border border-stone-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-black w-48"
                        />
                        <button type="submit" className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded bg-stone-800 text-white hover:bg-black">
                            Go
                        </button>
                        {searchQuery && (
                            <Link
                                href={`/admin/posts?${filterParams.toString()}`}
                                className="text-xs text-stone-500 hover:text-red-500 underline"
                            >
                                Clear
                            </Link>
                        )}
                    </form>

                    <div className="w-px bg-stone-200 h-6 self-center mx-2"></div>

                    {/* Sort */}
                    <div className="flex gap-2 items-center">
                        <span className="text-xs font-bold uppercase text-stone-400">Sort:</span>
                        {[
                            { value: 'newest', label: 'Newest' },
                            { value: 'oldest', label: 'Oldest' },
                            { value: 'views', label: 'Most Viewed' },
                            { value: 'title', label: 'Title A-Z' },
                        ].map((opt) => {
                            const p = new URLSearchParams(filterParams)
                            if (searchQuery) p.set('search', searchQuery)
                            if (opt.value !== 'newest') p.set('sort', opt.value)
                            return (
                                <Link
                                    key={opt.value}
                                    href={`/admin/posts?${p.toString()}`}
                                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-colors ${sortParam === opt.value
                                        ? 'bg-stone-800 text-white'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                    }`}
                                >
                                    {opt.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex gap-2 items-center">
                    <span className="text-xs font-bold uppercase text-stone-400">Status:</span>
                    {statuses.map((stat) => {
                        const p = new URLSearchParams(filterParams)
                        if (searchQuery) p.set('search', searchQuery)
                        if (sortParam !== 'newest') p.set('sort', sortParam)
                        p.set('status', stat.value)
                        return (
                            <Link
                                key={stat.value}
                                href={`/admin/posts?${p.toString()}`}
                                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-colors ${(statusFilter === stat.value) || (!statusFilter && stat.value === '')
                                    ? 'bg-black text-white'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                    }`}
                            >
                                {stat.label}
                            </Link>
                        )
                    })}
                </div>
                <div className="w-px bg-stone-200 h-6 self-center mx-2"></div>
                <div className="flex gap-2 items-center flex-wrap">
                    <span className="text-xs font-bold uppercase text-stone-400">Category:</span>
                    {categories.map((cat) => {
                        const p = new URLSearchParams(filterParams)
                        if (searchQuery) p.set('search', searchQuery)
                        if (sortParam !== 'newest') p.set('sort', sortParam)
                        p.set('category', cat.value)
                        return (
                            <Link
                                key={cat.value}
                                href={`/admin/posts?${p.toString()}`}
                                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-colors ${(categoryFilter === cat.value) || (!categoryFilter && cat.value === '')
                                    ? 'bg-agri-green text-white'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                    }`}
                            >
                                {cat.label}
                            </Link>
                        )
                    })}
                </div>
                <div className="w-px bg-stone-200 h-6 self-center mx-2"></div>
                <div className="flex gap-2 items-center">
                    {(() => {
                        const mineParams = new URLSearchParams(filterParams)
                        if (searchQuery) mineParams.set('search', searchQuery)
                        if (sortParam !== 'newest') mineParams.set('sort', sortParam)
                        mineParams.set('mine', 'true')
                        const clearParams = new URLSearchParams(filterParams)
                        if (searchQuery) clearParams.set('search', searchQuery)
                        if (sortParam !== 'newest') clearParams.set('sort', sortParam)
                        return (
                            <>
                                <Link
                                    href={`/admin/posts?${mineParams.toString()}`}
                                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-colors ${mineFilter
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                    }`}
                                >
                                    My Posts
                                </Link>
                                {mineFilter && (
                                    <Link
                                        href={`/admin/posts?${clearParams.toString()}`}
                                        className="text-xs text-stone-500 hover:text-red-500 underline"
                                    >
                                        Clear
                                    </Link>
                                )}
                            </>
                        )
                    })()}
                </div>
                </div>
            </div>

            <PostsTable posts={posts || []} />
        </div>
    )
}
