import { supabase } from '@/lib/supabase'
import { Post } from '@/types/database'
import { resolveCategoryPresetKey } from '@/lib/public-categories'
import { decodeHtmlEntities } from '@/lib/utils/string'

export const UPDATES_PAGE_SIZE = 12
const ALLOWED_IMAGE_HOSTS = new Set([
    'images.unsplash.com',
    'ulqzicqxnaygfergqrbe.supabase.co',
    'ui-avatars.com',
])

type PublishedPostsOptions = {
    category?: string
    q?: string
    page?: number
    limit?: number
}

export async function getPublishedPostsPage({
    category,
    q,
    page = 1,
    limit = UPDATES_PAGE_SIZE,
}: PublishedPostsOptions): Promise<{ posts: Post[]; total: number }> {
    try {
        const from = (page - 1) * limit
        const to = from + limit - 1

            let query = supabase
                .from('posts')
                .select('*', { count: 'exact' })
                .eq('status', 'published')
                .order('published_at', { ascending: false })
                .order('id', { ascending: false })

        if (category) {
            query = query.eq('category', category)
        }

        if (q) {
            query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,company.ilike.%${q}%`)
        }

        const { data, error, count } = await query.range(from, to)

        if (error) {
            console.error('Failed to fetch published posts page:', error)
            return { posts: [], total: 0 }
        }

        return {
            posts: ((data || []) as Post[]).map(normalizePostRecord),
            total: count || 0,
        }
    } catch (error) {
        console.error('Failed to fetch published posts page:', error)
        return { posts: [], total: 0 }
    }
}

export async function getRecentPublishedPosts(limit = 48) {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .order('id', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Failed to fetch recent posts:', error)
            return []
        }

        return ((data || []) as Post[]).map(normalizePostRecord)
    } catch (error) {
        console.error('Failed to fetch recent posts:', error)
        return []
    }
}

export function getPublicPostHref(post: Pick<Post, 'category' | 'slug'>) {
    return resolveCategoryPresetKey(post.category) === 'jobs' ? `/jobs/${post.slug}` : `/blog/${post.slug}`
}

export function normalizePublicImageUrl(imageUrl?: string | null) {
    if (!imageUrl) return null

    if (imageUrl.startsWith('/images/')) {
        return '/placeholder.jpg'
    }

    if (imageUrl.startsWith('/')) {
        return imageUrl
    }

    try {
        const url = new URL(imageUrl)
        if (!ALLOWED_IMAGE_HOSTS.has(url.hostname) || url.hostname === 'example.com') {
            return '/placeholder.jpg'
        }
        return imageUrl
    } catch {
        return '/placeholder.jpg'
    }
}

export function normalizePostRecord(post: Post): Post {
    return {
        ...post,
        title: post.title ? decodeHtmlEntities(post.title) : post.title,
        excerpt: post.excerpt ? decodeHtmlEntities(post.excerpt) : post.excerpt,
        author_name: post.author_name ? decodeHtmlEntities(post.author_name) : post.author_name,
        image_url: normalizePublicImageUrl(post.image_url),
    }
}
