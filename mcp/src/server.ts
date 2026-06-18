import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js'
import {
    attachPostImageInput,
    attachPostImageOutput,
    createDraftPostInput,
    createDraftPostOutput,
    generatePostImageInput,
    generatePostImageOutput,
    getPublishedPostInput,
    getPublishedPostOutput,
    listRecentPublishedPostsInput,
    listRecentPublishedPostsOutput,
    schedulePostInput,
    schedulePostOutput,
    searchPublishedPostsInput,
    searchPublishedPostsOutput,
    uploadPostImageInput,
    uploadPostImageOutput,
} from './contracts.ts'
import type { EditorialBackend } from './backend.ts'

export const protectedToolNames = new Set([
    'create_draft_post',
    'generate_post_image',
    'upload_post_image',
    'attach_post_image',
    'schedule_post',
])

function asTextResult<T extends Record<string, unknown>>(structuredContent: T) {
    return {
        content: [
            {
                type: 'text' as const,
                text: JSON.stringify(structuredContent, null, 2),
            },
        ],
        structuredContent,
    }
}

function requireAdminAccess(authInfo: AuthInfo | undefined, allowLocalAdmin: boolean) {
    if (allowLocalAdmin) return
    if (authInfo?.extra?.role === 'admin') return

    throw new Error(authInfo ? 'Admin access is required for this tool.' : 'OAuth authentication is required for this tool.')
}

export function createEditorialMcpServer({
    backend,
    allowLocalAdmin = false,
}: {
    backend: EditorialBackend
    allowLocalAdmin?: boolean
}) {
    const server = new McpServer({
        name: 'agri-updates-publishing',
        version: '1.0.0',
        websiteUrl: 'https://www.agriupdates.online',
    })

    server.registerTool(
        'search_published_posts',
        {
            title: 'Search Published Posts',
            description: 'Use this when you need to find published Agri Updates posts by keyword before citing, summarizing, or linking to them.',
            inputSchema: searchPublishedPostsInput.shape,
            outputSchema: searchPublishedPostsOutput.shape,
            annotations: {
                readOnlyHint: true,
                openWorldHint: false,
                destructiveHint: false,
            },
        },
        async (input) => asTextResult(await backend.searchPublishedPosts(input)),
    )

    server.registerTool(
        'get_published_post',
        {
            title: 'Get Published Post',
            description: 'Use this when you already know a published post slug and need the full Agri Updates article content plus canonical links.',
            inputSchema: getPublishedPostInput.shape,
            outputSchema: getPublishedPostOutput.shape,
            annotations: {
                readOnlyHint: true,
                openWorldHint: false,
                destructiveHint: false,
            },
        },
        async (input) => asTextResult(await backend.getPublishedPost(input)),
    )

    server.registerTool(
        'list_recent_published_posts',
        {
            title: 'List Recent Published Posts',
            description: 'Use this when you need the latest published Agri Updates stories for discovery, browsing, or citation.',
            inputSchema: listRecentPublishedPostsInput.shape,
            outputSchema: listRecentPublishedPostsOutput.shape,
            annotations: {
                readOnlyHint: true,
                openWorldHint: false,
                destructiveHint: false,
            },
        },
        async (input) => asTextResult(await backend.listRecentPublishedPosts(input)),
    )

    server.registerTool(
        'create_draft_post',
        {
            title: 'Create Draft Post',
            description: 'Use this when rewritten post content is ready and you want Agri Updates to create a new draft in the CMS.',
            inputSchema: createDraftPostInput.shape,
            outputSchema: createDraftPostOutput.shape,
            annotations: {
                readOnlyHint: false,
                openWorldHint: false,
                destructiveHint: false,
            },
        },
        async (input, extra) => {
            requireAdminAccess(extra.authInfo, allowLocalAdmin)
            return asTextResult(await backend.createDraftPost(input))
        },
    )

    server.registerTool(
        'generate_post_image',
        {
            title: 'Generate Post Image',
            description: 'Use this when the chat needs a server-side fallback image for an Agri Updates post and the native ChatGPT image handoff is not practical.',
            inputSchema: generatePostImageInput.shape,
            outputSchema: generatePostImageOutput.shape,
            annotations: {
                readOnlyHint: false,
                openWorldHint: true,
                destructiveHint: false,
            },
        },
        async (input, extra) => {
            requireAdminAccess(extra.authInfo, allowLocalAdmin)
            return asTextResult(await backend.generatePostImage(input))
        },
    )

    server.registerTool(
        'upload_post_image',
        {
            title: 'Upload Post Image',
            description: 'Use this when you already have a remote image URL or base64 image payload and need it uploaded into Agri Updates storage.',
            inputSchema: uploadPostImageInput.shape,
            outputSchema: uploadPostImageOutput.shape,
            annotations: {
                readOnlyHint: false,
                openWorldHint: true,
                destructiveHint: false,
            },
        },
        async (input, extra) => {
            requireAdminAccess(extra.authInfo, allowLocalAdmin)
            return asTextResult(await backend.uploadPostImage(input))
        },
    )

    server.registerTool(
        'attach_post_image',
        {
            title: 'Attach Post Image',
            description: 'Use this when a draft already exists and you want to attach a specific uploaded image URL to that Agri Updates post.',
            inputSchema: attachPostImageInput.shape,
            outputSchema: attachPostImageOutput.shape,
            annotations: {
                readOnlyHint: false,
                openWorldHint: true,
                destructiveHint: false,
            },
        },
        async (input, extra) => {
            requireAdminAccess(extra.authInfo, allowLocalAdmin)
            return asTextResult(await backend.attachPostImage(input))
        },
    )

    server.registerTool(
        'schedule_post',
        {
            title: 'Schedule Post',
            description: 'Use this when a draft is approved and you want Agri Updates to publish it later at an explicit RFC3339 timestamp with timezone offset.',
            inputSchema: schedulePostInput.shape,
            outputSchema: schedulePostOutput.shape,
            annotations: {
                readOnlyHint: false,
                openWorldHint: true,
                destructiveHint: false,
            },
        },
        async (input, extra) => {
            requireAdminAccess(extra.authInfo, allowLocalAdmin)
            return asTextResult(await backend.schedulePost(input))
        },
    )

    return server
}
