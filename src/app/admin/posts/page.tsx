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
        page?: string;
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
    const currentPage = Math.max(1, parseInt(params.page || '1', 10) || 1)
    const pageSize = 20

    const supabase = await createClient()

    // Get current user for "My Stories" filter
    const { data: { user } } = await supabase.auth.getUser()

    // Build base URL for filters (to preserve state across sort/search/page changes)
    const filterParams = new URLSearchParams()
    if (categoryFilter) filterParams.set('category', categoryFilter)
    if (statusFilter) filterParams.set('status', statusFilter)
    if (isFeaturedFilter) filterParams.set('is_featured', 'true')
    if (displayFilter) filterParams.set('display', displayFilter)
    if (mineFilter) filterParams.set('mine', 'true')
    if (sortParam && sortParam !== 'newest') filterParams.set('sort', sortParam)
    if (searchQuery) filterParams.set('search', searchQuery)

    // SELECT LIGHTWEIGHT COLUMNS ONLY (Do NOT fetch heavy 'content' html)
    let query = supabase
        .from('posts')
        .select('id, title, author_name, status, display_location, category, views, updated_at, created_at, is_featured, slug', { count: 'exact' })

    // Apply search
    if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`)
    }

    // Apply filters
    if (categoryFilter) query = query.eq('category', categoryFilter)
    if (statusFilter) query = query.eq('status', statusFilter)
    if (isFeaturedFilter) query = query.eq('is_featured', true)
    if (displayFilter) query = query.eq('display_location', displayFilter)
    if (mineFilter && user) query = query.eq('user_id', user.id)

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

    // Apply pagination range
    const from = (currentPage - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const [
        { data: posts, count: totalCount },
        { data: dbCategories }
    ] = await Promise.all([
        query,
        supabase.from('categories').select('*').eq('is_active', true).order('name')
    ])

    const totalPages = Math.ceil((totalCount || 0) / pageSize)

    const categories = [
        { value: '', label: 'All Categories' },
        ...(dbCategories?.map(cat => ({ value: cat.name, label: cat.name })) || [])
    ]

    // Determine page title based on active filter
    let pageTitle = "Stories"
    let pageSubtitle = "All content across your newsroom."

    if (displayFilter === 'hero') {
        pageTitle = "Hero & Highlights"
        pageSubtitle = "Stories displayed in the main hero section."
    } else if (displayFilter === 'trending') {
        pageTitle = "Trending"
        pageSubtitle = "Stories appearing in the trending section."
    } else if (isFeaturedFilter) {
        pageTitle = "Featured Stories"
        pageSubtitle = "Premium featured content."
    } else if (categoryFilter) {
        pageTitle = categoryFilter
        pageSubtitle = `Stories in ${categoryFilter}.`
    }

    // Helper for filter links preserving state
    const createFilterUrl = (overrides: Record<string, string | undefined>) => {
        const p = new URLSearchParams()
        if (categoryFilter) p.set('category', categoryFilter)
        if (statusFilter) p.set('status', statusFilter)
        if (isFeaturedFilter) p.set('is_featured', 'true')
        if (displayFilter) p.set('display', displayFilter)
        if (mineFilter) p.set('mine', 'true')
        if (sortParam && sortParam !== 'newest') p.set('sort', sortParam)
        if (searchQuery) p.set('search', searchQuery)

        Object.entries(overrides).forEach(([k, v]) => {
            if (!v) p.delete(k)
            else p.set(k, v)
        })

        const qs = p.toString()
        return `/admin/posts${qs ? `?${qs}` : ''}`
    }

    // Status tabs
    const statusTabs = [
        { key: '', label: 'All', count: totalCount || 0 },
        { key: 'draft', label: 'Drafts' },
        { key: 'pending_review', label: 'Review' },
        { key: 'scheduled', label: 'Scheduled' },
        { key: 'published', label: 'Published' },
        { key: 'archived', label: 'Archived' },
    ]

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">{pageTitle}</h1>
                    <p className="text-stone-400 text-xs mt-0.5">
                        {pageSubtitle} <span className="font-semibold text-stone-500">{totalCount || 0} total</span>
                    </p>
                </div>
                <Link
                    href="/admin/posts/new"
                    className="inline-flex items-center justify-center gap-1.5 bg-stone-900 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-stone-800 active:scale-[0.97] transition-all w-full sm:w-auto"
                >
                    + New Story
                </Link>
            </div>

            {/* Status Tab Bar */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none" style={{ borderBottom: '1px solid var(--admin-border)' }}>
                {statusTabs.map((tab) => {
                    const isActive = (statusFilter === tab.key) || (!statusFilter && tab.key === '')
                    return (
                        <Link
                            key={tab.key}
                            href={createFilterUrl({ status: tab.key || undefined, page: undefined })}
                            className={`px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors relative ${
                                isActive
                                    ? 'text-stone-900'
                                    : 'text-stone-400 hover:text-stone-700'
                            }`}
                        >
                            {tab.label}
                            {isActive && (
                                <div className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full" style={{ background: 'var(--admin-brand)' }} />
                            )}
                        </Link>
                    )
                })}
            </div>

            {/* Search + Filter Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <form method="GET" className="flex items-center gap-2 flex-1 max-w-md">
                    {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
                    {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
                    {isFeaturedFilter && <input type="hidden" name="is_featured" value="true" />}
                    {displayFilter && <input type="hidden" name="display" value={displayFilter} />}
                    {mineFilter && <input type="hidden" name="mine" value="true" />}
                    {sortParam && sortParam !== 'newest' && <input type="hidden" name="sort" value={sortParam} />}

                    <input
                        type="text"
                        name="search"
                        defaultValue={searchQuery}
                        placeholder="Search stories..."
                        className="flex-1 px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
                        style={{ borderColor: 'var(--admin-border-strong)' }}
                    />
                    <button
                        type="submit"
                        className="px-3 py-2 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors shrink-0"
                    >
                        Search
                    </button>
                    {searchQuery && (
                        <Link
                            href={createFilterUrl({ search: undefined })}
                            className="text-xs text-stone-400 hover:text-red-500 font-medium shrink-0"
                        >
                            Clear
                        </Link>
                    )}
                </form>

                {/* Category + Sort filters */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                    {/* Category dropdown */}
                    <div className="flex items-center gap-1.5">
                        {categories.slice(0, 6).map((cat) => {
                            const isActive = (categoryFilter === cat.value) || (!categoryFilter && cat.value === '')
                            return (
                                <Link
                                    key={cat.value}
                                    href={createFilterUrl({ category: cat.value || undefined, page: undefined })}
                                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                                        isActive
                                            ? 'bg-stone-900 text-white'
                                            : 'text-stone-500 hover:bg-stone-100'
                                    }`}
                                >
                                    {cat.label}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-1 ml-auto">
                        {[
                            { value: 'newest', label: 'Newest' },
                            { value: 'views', label: 'Views' },
                            { value: 'title', label: 'A-Z' },
                        ].map((opt) => (
                            <Link
                                key={opt.value}
                                href={createFilterUrl({ sort: opt.value === 'newest' ? undefined : opt.value, page: undefined })}
                                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap ${
                                    sortParam === opt.value
                                        ? 'bg-stone-100 text-stone-900'
                                        : 'text-stone-400 hover:text-stone-700'
                                }`}
                            >
                                {opt.label}
                            </Link>
                        ))}
                    </div>

                    {/* My Posts toggle */}
                    {user && (
                        <Link
                            href={createFilterUrl({ mine: mineFilter ? undefined : 'true', page: undefined })}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                                mineFilter
                                    ? 'bg-stone-900 text-white'
                                    : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50'
                            }`}
                        >
                            {mineFilter ? '✓ Mine' : 'Mine'}
                        </Link>
                    )}
                </div>
            </div>

            {/* Posts Table */}
            <PostsTable
                posts={posts || []}
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount || 0}
                filterParamsString={filterParams.toString()}
            />
        </div>
    )
}
