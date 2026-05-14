import fs from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import { generatePostFromRawText, generateSlug } from './blog-generator.js'
import { optionalEnv } from './env.js'
import { hasServiceRoleKey, supabase } from './supabase.js'

const postStatusSchema = z.enum(['draft', 'published', 'archived', 'scheduled', 'pending_review'])

export const authSchema = {
  token: z.string().optional().describe('MCP write/admin token, required only when configured on the server.'),
}

export const createBlogDraftSchema = {
  ...authSchema,
  title: z.string().min(3),
  content: z.string().min(20),
  excerpt: z.string().optional(),
  category: z.string().default('Research'),
  tags: z.array(z.string()).default([]),
  image_url: z.string().url().optional(),
  author_name: z.string().default('Agri Updates'),
  status: z.enum(['draft', 'pending_review']).default('draft'),
  source: z.string().default('mcp'),
}

export const createFromRawSchema = {
  ...authSchema,
  rawText: z.string().min(20),
  author_name: z.string().default('Agri Bot'),
  status: z.enum(['draft', 'pending_review']).default('draft'),
}

export const uploadImageSchema = {
  ...authSchema,
  file_path: z.string().optional(),
  image_url: z.string().url().optional(),
  base64: z.string().optional(),
  filename: z.string().optional(),
  content_type: z.string().optional(),
}

export const attachImageSchema = {
  ...authSchema,
  post_id: z.string().uuid(),
  image_url: z.string().url(),
}

export const scheduleSchema = {
  ...authSchema,
  post_id: z.string().uuid(),
  scheduled_for: z.string().datetime(),
}

export const publishSchema = {
  ...authSchema,
  post_id: z.string().uuid(),
}

export const getPostSchema = {
  id: z.string().uuid().optional(),
  slug: z.string().optional(),
}

export const listRecentSchema = {
  limit: z.number().int().min(1).max(50).default(10),
  status: postStatusSchema.optional(),
  category: z.string().optional(),
}

export type CreateBlogDraftInput = z.infer<z.ZodObject<typeof createBlogDraftSchema>>
export type CreateFromRawInput = z.infer<z.ZodObject<typeof createFromRawSchema>>
export type UploadImageInput = z.infer<z.ZodObject<typeof uploadImageSchema>>

function requireWriteToken(token: string | undefined) {
  if (!hasServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for MCP write tools.')
  }

  const expected = optionalEnv('MCP_WRITE_TOKEN')
  if (expected && token !== expected) {
    throw new Error('Invalid or missing MCP write token')
  }
}

function requireAdminToken(token: string | undefined) {
  if (!hasServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for MCP admin tools.')
  }

  const expected = optionalEnv('MCP_ADMIN_TOKEN')
  if (expected && token !== expected) {
    throw new Error('Invalid or missing MCP admin token')
  }
}

function excerptFromContent(content: string) {
  const plain = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  return plain.length > 180 ? `${plain.slice(0, 177).trim()}...` : plain
}

async function uniqueSlug(titleOrSlug: string) {
  const base = generateSlug(titleOrSlug) || `agri-update-${Date.now()}`
  let slug = base

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { data, error } = await supabase
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

function publicPostUrl(slug: string) {
  const siteUrl = optionalEnv('NEXT_PUBLIC_SITE_URL') || optionalEnv('SITE_URL')
  return siteUrl ? `${siteUrl.replace(/\/$/, '')}/${slug}` : `/${slug}`
}

function adminPostUrl(id: string) {
  const siteUrl = optionalEnv('NEXT_PUBLIC_SITE_URL') || optionalEnv('SITE_URL')
  return siteUrl ? `${siteUrl.replace(/\/$/, '')}/admin/posts/${id}` : `/admin/posts/${id}`
}

export async function createBlogDraft(input: CreateBlogDraftInput) {
  requireWriteToken(input.token)

  const slug = await uniqueSlug(input.title)
  const now = new Date().toISOString()
  const postData = {
    title: input.title,
    slug,
    excerpt: input.excerpt || excerptFromContent(input.content),
    content: input.content,
    category: input.category,
    tags: input.tags,
    image_url: input.image_url || null,
    author_name: input.author_name,
    status: input.status,
    is_active: false,
    published_at: now,
    source: input.source,
  }

  const { data, error } = await supabase.from('posts').insert(postData).select().single()
  if (error) throw error

  return {
    id: data.id as string,
    slug: data.slug as string,
    title: data.title as string,
    status: data.status as string,
    admin_url: adminPostUrl(data.id),
    public_url: publicPostUrl(data.slug),
  }
}

export async function createBlogFromRawUpdate(input: CreateFromRawInput) {
  requireWriteToken(input.token)

  const generated = generatePostFromRawText(input.rawText)
  const draft = await createBlogDraft({
    token: input.token,
    title: generated.title,
    content: generated.content,
    excerpt: generated.excerpt,
    category: generated.category,
    tags: generated.keywords,
    author_name: input.author_name,
    status: input.status,
    source: 'mcp_raw_update',
  })

  if (generated.job_details && Object.keys(generated.job_details).length > 0) {
    await supabase.from('posts').update(generated.job_details).eq('id', draft.id)
  }

  return {
    ...draft,
    generated,
  }
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

async function imageBytes(input: UploadImageInput): Promise<{ bytes: Buffer; filename: string; contentType: string }> {
  if (input.file_path) {
    const bytes = await fs.readFile(input.file_path)
    const filename = input.filename || path.basename(input.file_path)
    return { bytes, filename, contentType: inferContentType(filename, input.content_type) }
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
    const base64 = input.base64.includes(',') ? input.base64.split(',').pop() || '' : input.base64
    const filename = input.filename || `mcp-image-${Date.now()}.png`
    return {
      bytes: Buffer.from(base64, 'base64'),
      filename,
      contentType: inferContentType(filename, input.content_type),
    }
  }

  throw new Error('Provide one of file_path, image_url, or base64')
}

export async function uploadBlogImage(input: UploadImageInput) {
  requireWriteToken(input.token)

  const image = await imageBytes(input)
  const safeName = image.filename.replace(/[^a-zA-Z0-9._-]/g, '-')
  const objectPath = `mcp/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`

  const { error } = await supabase.storage.from('images').upload(objectPath, image.bytes, {
    contentType: image.contentType,
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error

  const { data } = supabase.storage.from('images').getPublicUrl(objectPath)
  return {
    path: objectPath,
    public_url: data.publicUrl,
    content_type: image.contentType,
    size_bytes: image.bytes.length,
  }
}

export async function attachImageToPost(input: z.infer<z.ZodObject<typeof attachImageSchema>>) {
  requireWriteToken(input.token)
  const { data, error } = await supabase
    .from('posts')
    .update({ image_url: input.image_url })
    .eq('id', input.post_id)
    .select('id, slug, title, image_url')
    .single()

  if (error) throw error
  return data
}

export async function scheduleBlogPost(input: z.infer<z.ZodObject<typeof scheduleSchema>>) {
  requireWriteToken(input.token)
  const scheduledFor = new Date(input.scheduled_for)
  if (Number.isNaN(scheduledFor.getTime())) {
    throw new Error('scheduled_for must be a valid ISO timestamp')
  }

  const { data, error } = await supabase
    .from('posts')
    .update({
      status: 'scheduled',
      scheduled_for: scheduledFor.toISOString(),
      is_active: false,
    })
    .eq('id', input.post_id)
    .select('id, slug, title, status, scheduled_for')
    .single()

  if (error) throw error
  return data
}

export async function publishBlogPost(input: z.infer<z.ZodObject<typeof publishSchema>>) {
  requireAdminToken(input.token)
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('posts')
    .update({
      status: 'published',
      published_at: now,
      is_active: true,
      scheduled_for: null,
    })
    .eq('id', input.post_id)
    .select('id, slug, title, status, published_at')
    .single()

  if (error) throw error
  return {
    ...data,
    public_url: publicPostUrl(data.slug as string),
  }
}

export async function getBlogPost(input: z.infer<z.ZodObject<typeof getPostSchema>>) {
  if (!input.id && !input.slug) {
    throw new Error('Provide id or slug')
  }

  let query = supabase
    .from('posts')
    .select('id, title, slug, excerpt, content, category, image_url, tags, status, is_active, published_at, scheduled_for, created_at, updated_at')

  query = input.id ? query.eq('id', input.id) : query.eq('slug', input.slug)

  const { data, error } = await query.single()
  if (error) throw error
  return data
}

export async function listRecentPosts(input: z.infer<z.ZodObject<typeof listRecentSchema>>) {
  let query = supabase
    .from('posts')
    .select('id, title, slug, excerpt, category, image_url, tags, status, published_at, scheduled_for, created_at')
    .order('published_at', { ascending: false })
    .limit(input.limit)

  if (input.status) query = query.eq('status', input.status)
  if (input.category) query = query.eq('category', input.category)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export function textResult(data: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  }
}
