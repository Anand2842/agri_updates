import { z } from 'zod/v4'

const stringArraySchema = z.array(z.string().trim().min(1)).default([])
const nullableStringSchema = z.string().nullable()

export const aspectRatioSchema = z.enum(['square', 'portrait', 'landscape']).default('landscape')

export const searchPublishedPostsInput = z.object({
    query: z.string().trim().min(2).max(120),
    limit: z.number().int().min(1).max(25).default(10),
})
export type SearchPublishedPostsInput = z.infer<typeof searchPublishedPostsInput>

export const getPublishedPostInput = z.object({
    slug: z.string().trim().min(1).max(180),
})
export type GetPublishedPostInput = z.infer<typeof getPublishedPostInput>

export const listRecentPublishedPostsInput = z.object({
    limit: z.number().int().min(1).max(25).default(10),
    category: z.string().trim().min(1).max(120).optional(),
})
export type ListRecentPublishedPostsInput = z.infer<typeof listRecentPublishedPostsInput>

export const createDraftPostInput = z.object({
    title: z.string().trim().min(3).max(180),
    excerpt: z.string().trim().min(1).max(280).optional(),
    content_html: z.string().trim().min(20),
    category: z.string().trim().min(2).max(60),
    tags: stringArraySchema,
    author_name: z.string().trim().min(1).max(120).default('Agri Updates'),
    source_url: z.string().url().optional(),
    source_name: z.string().trim().min(1).max(120).optional(),
    canonical_url: z.string().url().optional(),
    image_url: z.string().url().optional(),
})
export type CreateDraftPostInput = z.infer<typeof createDraftPostInput>

export const generatePostImageInput = z.object({
    prompt: z.string().trim().min(12).max(5000),
    aspect_ratio: aspectRatioSchema,
    style: z.string().trim().min(1).max(120).optional(),
})
export type GeneratePostImageInput = z.infer<typeof generatePostImageInput>

export const uploadPostImageInput = z.object({
    image_url: z.string().url().optional(),
    base64: z.string().trim().min(16).optional(),
    filename: z.string().trim().min(1).max(180).optional(),
    content_type: z.string().trim().min(1).max(120).optional(),
})
export type UploadPostImageInput = z.infer<typeof uploadPostImageInput>

export const attachPostImageInput = z.object({
    post_id: z.string().uuid(),
    image_url: z.string().url(),
})
export type AttachPostImageInput = z.infer<typeof attachPostImageInput>

export const schedulePostInput = z.object({
    post_id: z.string().uuid(),
    scheduled_for: z.string().trim().min(20).max(64),
})
export type SchedulePostInput = z.infer<typeof schedulePostInput>

export const publishedPostSummary = z.object({
    post_id: z.string().uuid(),
    slug: z.string(),
    title: z.string(),
    excerpt: nullableStringSchema,
    category: z.string(),
    tags: stringArraySchema,
    author_name: z.string(),
    image_url: nullableStringSchema,
    published_at: z.string().datetime(),
    public_url: z.string().url(),
    canonical_url: z.string().url(),
})
export type PublishedPostSummary = z.infer<typeof publishedPostSummary>

export const publishedPostDetail = publishedPostSummary.extend({
    content_html: z.string(),
    updated_at: nullableStringSchema.optional(),
})
export type PublishedPostDetail = z.infer<typeof publishedPostDetail>

export const searchPublishedPostsOutput = z.object({
    posts: z.array(publishedPostSummary),
})
export type SearchPublishedPostsOutput = z.infer<typeof searchPublishedPostsOutput>

export const getPublishedPostOutput = z.object({
    post: publishedPostDetail,
})
export type GetPublishedPostOutput = z.infer<typeof getPublishedPostOutput>

export const listRecentPublishedPostsOutput = z.object({
    posts: z.array(publishedPostSummary),
})
export type ListRecentPublishedPostsOutput = z.infer<typeof listRecentPublishedPostsOutput>

export const createDraftPostOutput = z.object({
    post_id: z.string().uuid(),
    slug: z.string(),
    status: z.literal('draft'),
    admin_url: z.string().url(),
    public_url: z.string().url(),
})
export type CreateDraftPostOutput = z.infer<typeof createDraftPostOutput>

export const uploadPostImageOutput = z.object({
    storage_path: z.string(),
    image_url: z.string().url(),
    content_type: z.string(),
    size_bytes: z.number().int().min(0),
})
export type UploadPostImageOutput = z.infer<typeof uploadPostImageOutput>

export const generatePostImageOutput = uploadPostImageOutput.extend({
    model: z.string(),
    aspect_ratio: aspectRatioSchema,
    prompt: z.string(),
    revised_prompt: z.string().optional(),
})
export type GeneratePostImageOutput = z.infer<typeof generatePostImageOutput>

export const attachPostImageOutput = z.object({
    post_id: z.string().uuid(),
    slug: z.string(),
    title: z.string(),
    image_url: z.string().url(),
})
export type AttachPostImageOutput = z.infer<typeof attachPostImageOutput>

export const schedulePostOutput = z.object({
    post_id: z.string().uuid(),
    slug: z.string(),
    title: z.string(),
    status: z.literal('scheduled'),
    scheduled_for: z.string().datetime(),
    admin_url: z.string().url(),
    public_url: z.string().url(),
})
export type SchedulePostOutput = z.infer<typeof schedulePostOutput>
