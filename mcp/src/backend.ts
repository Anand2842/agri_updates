import fs from 'node:fs/promises'
import path from 'node:path'
import OpenAI from 'openai'
import type { SupabaseClient } from '@supabase/supabase-js'
import { generatePostFromRawText, generateSlug } from './blog-generator.ts'
import type {
    AttachPostImageInput,
    AttachPostImageOutput,
    CreateDraftPostInput,
    CreateDraftPostOutput,
    GeneratePostImageInput,
    GeneratePostImageOutput,
    GetPublishedPostInput,
    GetPublishedPostOutput,
    ListRecentPublishedPostsInput,
    ListRecentPublishedPostsOutput,
    PublishedPostDetail,
    PublishedPostSummary,
    SchedulePostInput,
    SchedulePostOutput,
    SearchPublishedPostsInput,
    SearchPublishedPostsOutput,
    UploadPostImageInput,
    UploadPostImageOutput,
} from './contracts.ts'
import type { McpEnv } from './env.ts'
import { loadMcpEnv } from './env.ts'
import { createMcpSupabaseClients } from './supabase.ts'

type PostRow = Record<string, unknown> & {
    id: string
    slug: string
    title: string
    category: string
    author_name?: string | null
    excerpt?: string | null
    content?: string | null
    image_url?: string | null
    tags?: string[] | null
    published_at?: string | null
    updated_at?: string | null
    created_at?: string | null
    status?: string | null
    scheduled_for?: string | null
}

type CreateLegacyDraftInput = {
    title: string
    content: string
    excerpt?: string
    category?: string
    tags?: string[]
    image_url?: string
    author_name?: string
    status?: 'draft' | 'pending_review'
    source?: string
    source_url?: string
    source_name?: string
    canonical_url?: string
    dedupe_key?: string
}

type UploadLegacyImageInput = UploadPostImageInput & {
    file_path?: string
}

type ScheduleLegacyInput = {
    post_id: string
    scheduled_for: string
}

type PublishLegacyInput = {
    post_id: string
}

type ListLegacyPostsInput = {
    limit: number
    status?: string
    category?: string
}

type SearchLegacyPostsInput = {
    query: string
    limit: number
}

type GetLegacyPostInput = {
    id?: string
    slug?: string
}

type CreateRawUpdateInput = {
    rawText: string
    author_name?: string
    status?: 'draft' | 'pending_review'
}

function excerptFromHtml(contentHtml: string) {
    const plain = contentHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    return plain.length > 180 ? `${plain.slice(0, 177).trim()}...` : plain
}

function categoryPath(category: string, slug: string) {
    return category.trim().toLowerCase() === 'jobs' ? `/jobs/${slug}` : `/blog/${slug}`
}

function publicPostUrl(env: McpEnv, row: Pick<PostRow, 'category' | 'slug'>) {
    return `${env.siteUrl}${categoryPath(row.category, row.slug)}`
}

function adminPostUrl(env: McpEnv, postId: string) {
    return `${env.siteUrl}/admin/posts/${postId}`
}

function normalizeTags(value: unknown) {
    if (!Array.isArray(value)) return []
    return value.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
}

function normalizePublishedSummary(env: McpEnv, row: PostRow): PublishedPostSummary {
    const publicUrl = publicPostUrl(env, row)
    const canonicalUrl =
        typeof row.canonical_url === 'string' && row.canonical_url.trim().length > 0
            ? row.canonical_url
            : typeof row.source_url === 'string' && row.source_url.trim().length > 0
              ? row.source_url
              : publicUrl

    return {
        post_id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: typeof row.excerpt === 'string' ? row.excerpt : null,
        category: row.category,
        tags: normalizeTags(row.tags),
        author_name: typeof row.author_name === 'string' && row.author_name.trim().length > 0 ? row.author_name : 'Agri Updates',
        image_url: typeof row.image_url === 'string' ? row.image_url : null,
        published_at: row.published_at || row.created_at || new Date(0).toISOString(),
        public_url: publicUrl,
        canonical_url: canonicalUrl,
    }
}

function normalizePublishedDetail(env: McpEnv, row: PostRow): PublishedPostDetail {
    return {
        ...normalizePublishedSummary(env, row),
        content_html: typeof row.content === 'string' ? row.content : '',
        updated_at: typeof row.updated_at === 'string' ? row.updated_at : null,
    }
}

function sanitizeSearchTerm(query: string) {
    return query.replace(/[(),]/g, ' ').replace(/\s+/g, ' ').trim()
}

function inferContentType(filename: string, provided?: string) {
    if (provided) return provided

    const ext = path.extname(filename).toLowerCase()

    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
    if (ext === '.png') return 'image/png'
    if (ext === '.webp') return 'image/webp'
    if (ext === '.gif') return 'image/gif'
    if (ext === '.svg') return 'image/svg+xml'

    return 'application/octet-stream'
}

function sanitizeFilename(filename: string) {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '-')
}

function parseScheduledTimestamp(value: string) {
    const trimmed = value.trim()
    if (!/(Z|[+-]\d{2}:\d{2})$/.test(trimmed)) {
        throw new Error('scheduled_for must be an RFC3339 timestamp with an explicit timezone offset.')
    }

    const parsed = new Date(trimmed)
    if (Number.isNaN(parsed.getTime())) {
        throw new Error('scheduled_for must be a valid RFC3339 timestamp.')
    }

    if (parsed.getTime() <= Date.now()) {
        throw new Error('scheduled_for must be in the future.')
    }

    return parsed.toISOString()
}

async function uniqueSlug(adminSupabase: SupabaseClient, titleOrSlug: string) {
    const base = generateSlug(titleOrSlug) || `agri-update-${Date.now()}`
    let slug = base

    for (let attempt = 0; attempt < 20; attempt += 1) {
        const { data, error } = await adminSupabase
            .from('posts')
            .select('id')
            .eq('slug', slug)
            .maybeSingle()

        if (error) throw error
        if (!data) return slug

        slug = `${base}-${attempt + 2}`
    }

    return `${base}-${Date.now()}`
}

async function readImageBytes(input: UploadLegacyImageInput) {
    if (input.file_path) {
        const bytes = await fs.readFile(input.file_path)
        const filename = input.filename || path.basename(input.file_path)

        return {
            bytes,
            filename,
            contentType: inferContentType(filename, input.content_type),
        }
    }

    if (input.image_url) {
        const response = await fetch(input.image_url)
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status} ${response.statusText}`)
        }

        const bytes = Buffer.from(await response.arrayBuffer())
        const urlName = new URL(input.image_url).pathname.split('/').filter(Boolean).pop() || 'image'
        const filename = input.filename || urlName

        return {
            bytes,
            filename,
            contentType: input.content_type || response.headers.get('content-type') || inferContentType(filename),
        }
    }

    if (input.base64) {
        const base64Payload = input.base64.includes(',') ? input.base64.split(',').pop() || '' : input.base64
        const filename = input.filename || `mcp-image-${Date.now()}.png`

        return {
            bytes: Buffer.from(base64Payload, 'base64'),
            filename,
            contentType: inferContentType(filename, input.content_type),
        }
    }

    throw new Error('Provide one of image_url, base64, or file_path.')
}

async function uploadBytesToStorage(adminSupabase: SupabaseClient, bytes: Buffer, filename: string, contentType: string) {
    const safeName = sanitizeFilename(filename)
    const objectPath = `mcp/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`
    const { error } = await adminSupabase.storage.from('images').upload(objectPath, bytes, {
        contentType,
        cacheControl: '3600',
        upsert: false,
    })

    if (error) throw error

    const { data } = adminSupabase.storage.from('images').getPublicUrl(objectPath)

    return {
        storage_path: objectPath,
        image_url: data.publicUrl,
        content_type: contentType,
        size_bytes: bytes.length,
    }
}

export type EditorialBackend = ReturnType<typeof createEditorialBackend>

export function createEditorialBackend({
    env,
    publicSupabase,
    adminSupabase,
    openaiClient = env.openaiApiKey ? new OpenAI({ apiKey: env.openaiApiKey }) : undefined,
}: {
    env: McpEnv
    publicSupabase: SupabaseClient
    adminSupabase: SupabaseClient
    openaiClient?: OpenAI
}) {
    async function insertDraftRecord(input: CreateLegacyDraftInput) {
        const slug = await uniqueSlug(adminSupabase, input.title)
        const now = new Date().toISOString()
        const status = input.status || 'draft'
        const postData = {
            title: input.title,
            slug,
            excerpt: input.excerpt || excerptFromHtml(input.content),
            content: input.content,
            category: input.category || 'Research',
            tags: input.tags || [],
            image_url: input.image_url || null,
            author_name: input.author_name || 'Agri Updates',
            status,
            is_active: false,
            published_at: now,
            source: input.source || 'chatgpt_mcp',
            source_url: input.source_url || null,
            source_name: input.source_name || null,
            canonical_url: input.canonical_url || input.source_url || null,
            dedupe_key: input.dedupe_key || input.source_url || null,
        }

        let { data, error } = await adminSupabase.from('posts').insert(postData).select('*').single()

        if (error && /source_url|source_name|canonical_url|dedupe_key/i.test(error.message)) {
            const { source_url: _sourceUrl, source_name: _sourceName, canonical_url: _canonicalUrl, dedupe_key: _dedupeKey, ...compatiblePostData } = postData
            const retry = await adminSupabase.from('posts').insert(compatiblePostData).select('*').single()
            data = retry.data
            error = retry.error
        }

        if (error || !data) {
            throw error || new Error('Draft creation failed.')
        }

        return data as PostRow
    }

    return {
        async searchPublishedPosts(input: SearchPublishedPostsInput): Promise<SearchPublishedPostsOutput> {
            const term = sanitizeSearchTerm(input.query)
            const { data, error } = await publicSupabase
                .from('posts')
                .select('*')
                .eq('status', 'published')
                .or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,content.ilike.%${term}%`)
                .order('published_at', { ascending: false })
                .limit(input.limit)

            if (error) throw error

            return {
                posts: ((data || []) as PostRow[]).map((row) => normalizePublishedSummary(env, row)),
            }
        },

        async getPublishedPost(input: GetPublishedPostInput): Promise<GetPublishedPostOutput> {
            const { data, error } = await publicSupabase
                .from('posts')
                .select('*')
                .eq('status', 'published')
                .eq('slug', input.slug)
                .maybeSingle()

            if (error) throw error
            if (!data) throw new Error(`No published post found for slug "${input.slug}".`)

            return {
                post: normalizePublishedDetail(env, data as PostRow),
            }
        },

        async listRecentPublishedPosts(input: ListRecentPublishedPostsInput): Promise<ListRecentPublishedPostsOutput> {
            let query = publicSupabase
                .from('posts')
                .select('*')
                .eq('status', 'published')
                .order('published_at', { ascending: false })
                .limit(input.limit)

            if (input.category) {
                query = query.eq('category', input.category)
            }

            const { data, error } = await query
            if (error) throw error

            return {
                posts: ((data || []) as PostRow[]).map((row) => normalizePublishedSummary(env, row)),
            }
        },

        async createDraftPost(input: CreateDraftPostInput): Promise<CreateDraftPostOutput> {
            const post = await insertDraftRecord({
                title: input.title,
                content: input.content_html,
                excerpt: input.excerpt,
                category: input.category,
                tags: input.tags,
                image_url: input.image_url,
                author_name: input.author_name,
                source: 'chatgpt_mcp',
                source_url: input.source_url,
                source_name: input.source_name,
                canonical_url: input.canonical_url,
                status: 'draft',
            })

            return {
                post_id: post.id,
                slug: post.slug,
                status: 'draft',
                admin_url: adminPostUrl(env, post.id),
                public_url: publicPostUrl(env, post),
            }
        },

        async uploadPostImage(input: UploadPostImageInput): Promise<UploadPostImageOutput> {
            if (!input.image_url && !input.base64) {
                throw new Error('Provide image_url or base64.')
            }

            const image = await readImageBytes(input)
            return uploadBytesToStorage(adminSupabase, image.bytes, image.filename, image.contentType)
        },

        async generatePostImage(input: GeneratePostImageInput): Promise<GeneratePostImageOutput> {
            if (!openaiClient) {
                throw new Error('OPENAI_API_KEY is required for generate_post_image.')
            }

            const prompt = input.style
                ? `${input.prompt}\n\nStyle guidance: ${input.style}`
                : input.prompt

            const size =
                input.aspect_ratio === 'square'
                    ? '1024x1024'
                    : input.aspect_ratio === 'portrait'
                      ? '1024x1536'
                      : '1536x1024'

            const response = await openaiClient.images.generate({
                model: env.openaiImageModel,
                prompt,
                size,
            })

            const image = response.data?.[0]
            if (!image) {
                throw new Error('OpenAI did not return an image.')
            }

            let bytes: Buffer
            let contentType = 'image/png'
            let extension = 'png'

            if (image.b64_json) {
                bytes = Buffer.from(image.b64_json, 'base64')
            } else if (image.url) {
                const generated = await fetch(image.url)
                if (!generated.ok) {
                    throw new Error(`Failed to download generated image: ${generated.status} ${generated.statusText}`)
                }
                contentType = generated.headers.get('content-type') || contentType
                extension = contentType.includes('webp') ? 'webp' : contentType.includes('jpeg') ? 'jpg' : 'png'
                bytes = Buffer.from(await generated.arrayBuffer())
            } else {
                throw new Error('Generated image did not include image content.')
            }

            const uploaded = await uploadBytesToStorage(
                adminSupabase,
                bytes,
                `generated-${Date.now()}.${extension}`,
                contentType,
            )

            return {
                ...uploaded,
                model: env.openaiImageModel,
                aspect_ratio: input.aspect_ratio,
                prompt,
                revised_prompt: image.revised_prompt,
            }
        },

        async attachPostImage(input: AttachPostImageInput): Promise<AttachPostImageOutput> {
            const { data, error } = await adminSupabase
                .from('posts')
                .update({ image_url: input.image_url })
                .eq('id', input.post_id)
                .select('id, slug, title, image_url')
                .single()

            if (error || !data) throw error || new Error('Image attachment failed.')

            return {
                post_id: data.id,
                slug: data.slug,
                title: data.title,
                image_url: data.image_url,
            }
        },

        async schedulePost(input: SchedulePostInput): Promise<SchedulePostOutput> {
            const scheduledFor = parseScheduledTimestamp(input.scheduled_for)
            const { data, error } = await adminSupabase
                .from('posts')
                .update({
                    status: 'scheduled',
                    scheduled_for: scheduledFor,
                    is_active: false,
                })
                .eq('id', input.post_id)
                .select('id, slug, title, category, status, scheduled_for')
                .single()

            if (error || !data) throw error || new Error('Scheduling failed.')

            return {
                post_id: data.id,
                slug: data.slug,
                title: data.title,
                status: 'scheduled',
                scheduled_for: data.scheduled_for,
                admin_url: adminPostUrl(env, data.id),
                public_url: publicPostUrl(env, data as PostRow),
            }
        },

        async createBlogDraft(input: CreateLegacyDraftInput) {
            const post = await insertDraftRecord(input)
            return {
                id: post.id,
                slug: post.slug,
                title: post.title,
                status: post.status,
                admin_url: adminPostUrl(env, post.id),
                public_url: publicPostUrl(env, post),
            }
        },

        async createBlogFromRawUpdate(input: CreateRawUpdateInput) {
            const generated = generatePostFromRawText(input.rawText)
            const draft = await this.createBlogDraft({
                title: generated.title,
                content: generated.content,
                excerpt: generated.excerpt,
                category: generated.category,
                tags: generated.keywords,
                author_name: input.author_name || 'Agri Bot',
                status: input.status || 'draft',
                source: 'mcp_raw_update',
            })

            if (generated.job_details && Object.keys(generated.job_details).length > 0) {
                await adminSupabase.from('posts').update(generated.job_details).eq('id', draft.id)
            }

            return {
                ...draft,
                generated,
            }
        },

        async uploadBlogImage(input: UploadLegacyImageInput) {
            const image = await readImageBytes(input)
            return uploadBytesToStorage(adminSupabase, image.bytes, image.filename, image.contentType)
        },

        async attachImageToPost(input: AttachPostImageInput) {
            return this.attachPostImage(input)
        },

        async scheduleBlogPost(input: ScheduleLegacyInput) {
            const scheduledFor = parseScheduledTimestamp(input.scheduled_for)
            const { data, error } = await adminSupabase
                .from('posts')
                .update({
                    status: 'scheduled',
                    scheduled_for: scheduledFor,
                    is_active: false,
                })
                .eq('id', input.post_id)
                .select('id, slug, title, status, scheduled_for')
                .single()

            if (error || !data) throw error || new Error('Scheduling failed.')
            return data
        },

        async publishBlogPost(input: PublishLegacyInput) {
            const now = new Date().toISOString()
            const { data, error } = await adminSupabase
                .from('posts')
                .update({
                    status: 'published',
                    published_at: now,
                    is_active: true,
                    scheduled_for: null,
                })
                .eq('id', input.post_id)
                .select('id, slug, title, category, status, published_at')
                .single()

            if (error || !data) throw error || new Error('Publishing failed.')

            return {
                ...data,
                public_url: publicPostUrl(env, data as PostRow),
            }
        },

        async getBlogPost(input: GetLegacyPostInput) {
            if (!input.id && !input.slug) {
                throw new Error('Provide id or slug.')
            }

            let query = adminSupabase.from('posts').select('*')
            query = input.id ? query.eq('id', input.id) : query.eq('slug', input.slug!)

            const { data, error } = await query.single()
            if (error) throw error
            return data
        },

	        async listRecentPosts(input: ListLegacyPostsInput) {
	            let query = adminSupabase
	                .from('posts')
	                .select('*')
	                .order('created_at', { ascending: false })
	                .limit(input.limit)

            if (input.status) query = query.eq('status', input.status)
            if (input.category) query = query.eq('category', input.category)

            const { data, error } = await query
            if (error) throw error
            return data || []
        },

        async searchPosts(input: SearchLegacyPostsInput) {
            const term = sanitizeSearchTerm(input.query)
            const { data, error } = await adminSupabase
                .from('posts')
                .select('*')
                .or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,content.ilike.%${term}%`)
                .order('published_at', { ascending: false })
                .limit(input.limit)

            if (error) throw error
            return data || []
        },
    }
}

let defaultBackend: EditorialBackend | null = null

function getDefaultBackend() {
    if (defaultBackend) return defaultBackend

    const env = loadMcpEnv()
    const { publicSupabase, adminSupabase } = createMcpSupabaseClients(env)
    defaultBackend = createEditorialBackend({
        env,
        publicSupabase,
        adminSupabase,
    })

    return defaultBackend
}

export async function searchPublishedPosts(input: SearchPublishedPostsInput) {
    return getDefaultBackend().searchPublishedPosts(input)
}

export async function getPublishedPost(input: GetPublishedPostInput) {
    return getDefaultBackend().getPublishedPost(input)
}

export async function listRecentPublishedPosts(input: ListRecentPublishedPostsInput) {
    return getDefaultBackend().listRecentPublishedPosts(input)
}

export async function createDraftPost(input: CreateDraftPostInput) {
    return getDefaultBackend().createDraftPost(input)
}

export async function uploadPostImage(input: UploadPostImageInput) {
    return getDefaultBackend().uploadPostImage(input)
}

export async function generatePostImage(input: GeneratePostImageInput) {
    return getDefaultBackend().generatePostImage(input)
}

export async function attachPostImage(input: AttachPostImageInput) {
    return getDefaultBackend().attachPostImage(input)
}

export async function schedulePost(input: SchedulePostInput) {
    return getDefaultBackend().schedulePost(input)
}

export async function createBlogDraft(input: CreateLegacyDraftInput) {
    return getDefaultBackend().createBlogDraft(input)
}

export async function createBlogFromRawUpdate(input: CreateRawUpdateInput) {
    return getDefaultBackend().createBlogFromRawUpdate(input)
}

export async function uploadBlogImage(input: UploadLegacyImageInput) {
    return getDefaultBackend().uploadBlogImage(input)
}

export async function attachImageToPost(input: AttachPostImageInput) {
    return getDefaultBackend().attachImageToPost(input)
}

export async function scheduleBlogPost(input: ScheduleLegacyInput) {
    return getDefaultBackend().scheduleBlogPost(input)
}

export async function publishBlogPost(input: PublishLegacyInput) {
    return getDefaultBackend().publishBlogPost(input)
}

export async function getBlogPost(input: GetLegacyPostInput) {
    return getDefaultBackend().getBlogPost(input)
}

export async function listRecentPosts(input: ListLegacyPostsInput) {
    return getDefaultBackend().listRecentPosts(input)
}

export async function searchPosts(input: SearchLegacyPostsInput) {
    return getDefaultBackend().searchPosts(input)
}
