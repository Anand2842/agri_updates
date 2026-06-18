import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import type { OAuthMetadata } from '@modelcontextprotocol/sdk/shared/auth.js'
import { createMcpHttpApp } from './http.ts'

const oauthMetadata: OAuthMetadata = {
    issuer: 'https://supabase.example.com/auth/v1',
    authorization_endpoint: 'https://supabase.example.com/auth/v1/oauth/authorize',
    token_endpoint: 'https://supabase.example.com/auth/v1/oauth/token',
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
}

const cleanup: Array<() => Promise<void> | void> = []

afterEach(async () => {
    while (cleanup.length > 0) {
        await cleanup.pop()?.()
    }
})

async function startTestServer() {
    const backend = {
        async searchPublishedPosts() {
            return {
                posts: [
                    {
                        post_id: '11111111-1111-4111-8111-111111111111',
                        slug: 'soil-health-update',
                        title: 'Soil Health Update',
                        excerpt: 'Published excerpt',
                        category: 'Research',
                        tags: ['soil'],
                        author_name: 'Agri Updates',
                        image_url: 'https://cdn.example.com/soil.png',
                        published_at: '2026-05-29T10:00:00.000Z',
                        public_url: 'https://www.agriupdates.online/blog/soil-health-update',
                        canonical_url: 'https://www.agriupdates.online/blog/soil-health-update',
                    },
                ],
            }
        },
        async getPublishedPost() {
            return {
                post: {
                    post_id: '11111111-1111-4111-8111-111111111111',
                    slug: 'soil-health-update',
                    title: 'Soil Health Update',
                    excerpt: 'Published excerpt',
                    category: 'Research',
                    tags: ['soil'],
                    author_name: 'Agri Updates',
                    image_url: 'https://cdn.example.com/soil.png',
                    published_at: '2026-05-29T10:00:00.000Z',
                    public_url: 'https://www.agriupdates.online/blog/soil-health-update',
                    canonical_url: 'https://www.agriupdates.online/blog/soil-health-update',
                    content_html: '<p>Published article body</p>',
                    updated_at: '2026-05-29T10:10:00.000Z',
                },
            }
        },
        async listRecentPublishedPosts() {
            return {
                posts: [],
            }
        },
        async createDraftPost() {
            return {
                post_id: '22222222-2222-4222-8222-222222222222',
                slug: 'new-draft-post',
                status: 'draft' as const,
                admin_url: 'https://www.agriupdates.online/admin/posts/22222222-2222-4222-8222-222222222222',
                public_url: 'https://www.agriupdates.online/blog/new-draft-post',
            }
        },
        async generatePostImage() {
            return {
                storage_path: 'mcp/generated.png',
                image_url: 'https://cdn.example.com/generated.png',
                content_type: 'image/png',
                size_bytes: 1024,
                model: 'gpt-image-2',
                aspect_ratio: 'landscape' as const,
                prompt: 'prompt',
            }
        },
        async uploadPostImage() {
            return {
                storage_path: 'mcp/upload.png',
                image_url: 'https://cdn.example.com/upload.png',
                content_type: 'image/png',
                size_bytes: 512,
            }
        },
        async attachPostImage() {
            return {
                post_id: '22222222-2222-4222-8222-222222222222',
                slug: 'new-draft-post',
                title: 'New Draft Post',
                image_url: 'https://cdn.example.com/upload.png',
            }
        },
        async schedulePost() {
            return {
                post_id: '22222222-2222-4222-8222-222222222222',
                slug: 'new-draft-post',
                title: 'New Draft Post',
                status: 'scheduled' as const,
                scheduled_for: '2026-05-30T10:00:00.000Z',
                admin_url: 'https://www.agriupdates.online/admin/posts/22222222-2222-4222-8222-222222222222',
                public_url: 'https://www.agriupdates.online/blog/new-draft-post',
            }
        },
        async createBlogDraft() {
            throw new Error('not used')
        },
        async createBlogFromRawUpdate() {
            throw new Error('not used')
        },
        async uploadBlogImage() {
            throw new Error('not used')
        },
        async attachImageToPost() {
            throw new Error('not used')
        },
        async scheduleBlogPost() {
            throw new Error('not used')
        },
        async publishBlogPost() {
            throw new Error('not used')
        },
        async getBlogPost() {
            throw new Error('not used')
        },
        async listRecentPosts() {
            throw new Error('not used')
        },
        async searchPosts() {
            throw new Error('not used')
        },
    }

    const authVerifier = {
        async verifyAccessToken(token: string) {
            if (token === 'admin-token') {
                return {
                    token,
                    clientId: 'chatgpt-test',
                    scopes: ['openid', 'email', 'profile'],
                    extra: {
                        role: 'admin',
                        email: 'editor@agriupdates.online',
                    },
                }
            }

            if (token === 'user-token') {
                return {
                    token,
                    clientId: 'chatgpt-test',
                    scopes: ['openid', 'email', 'profile'],
                    extra: {
                        role: 'user',
                        email: 'reader@agriupdates.online',
                    },
                }
            }

            throw new Error('bad token')
        },
    }

    const app = createMcpHttpApp({
        backend,
        authVerifier,
        mcpBaseUrl: 'http://127.0.0.1:0/mcp',
        oauthMetadata,
        host: '127.0.0.1',
        resourceName: 'Agri Updates Publishing MCP',
    })

    const server = createServer(app as any)
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    cleanup.push(() => new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))))

    const address = server.address() as AddressInfo
    return `http://127.0.0.1:${address.port}`
}

function rpcRequest(id: number, method: string, params: Record<string, unknown> = {}) {
    return {
        jsonrpc: '2.0',
        id,
        method,
        params,
    }
}

function rpcHeaders(extra: Record<string, string> = {}) {
    return {
        accept: 'application/json, text/event-stream',
        'content-type': 'application/json',
        ...extra,
    }
}

test('advertises OAuth protected resource metadata', async () => {
    const baseUrl = await startTestServer()
    const response = await fetch(`${baseUrl}/.well-known/oauth-protected-resource/mcp`)

    assert.equal(response.status, 200)
    const body = (await response.json()) as any
    assert.equal(body.authorization_servers[0], oauthMetadata.issuer)
    assert.equal(body.resource_name, 'Agri Updates Publishing MCP')
})

test('lists tools publicly and keeps descriptions action-oriented', async () => {
    const baseUrl = await startTestServer()

    const initialize = await fetch(`${baseUrl}/mcp`, {
        method: 'POST',
        headers: rpcHeaders(),
        body: JSON.stringify(
            rpcRequest(1, 'initialize', {
                protocolVersion: '2025-03-26',
                clientInfo: {
                    name: 'test-client',
                    version: '1.0.0',
                },
                capabilities: {},
            }),
        ),
    })

    assert.equal(initialize.status, 200)

    const toolsList = await fetch(`${baseUrl}/mcp`, {
        method: 'POST',
        headers: rpcHeaders(),
        body: JSON.stringify(rpcRequest(2, 'tools/list')),
    })

    assert.equal(toolsList.status, 200)
    const body = (await toolsList.json()) as any
    const tools = body.result.tools as Array<{ name: string; description: string }>

    assert.equal(tools.length, 8)
    assert.ok(tools.every((tool) => tool.description.startsWith('Use this when')))
    assert.ok(tools.some((tool) => tool.name === 'create_draft_post'))
})

test('rejects protected tool calls without OAuth', async () => {
    const baseUrl = await startTestServer()

    const response = await fetch(`${baseUrl}/mcp`, {
        method: 'POST',
        headers: rpcHeaders(),
        body: JSON.stringify(
            rpcRequest(3, 'tools/call', {
                name: 'create_draft_post',
                arguments: {
                    title: 'Draft title',
                    content_html: '<p>Draft content with enough length to pass validation.</p>',
                    category: 'Research',
                    tags: ['soil'],
                },
            }),
        ),
    })

    assert.equal(response.status, 401)
    assert.match(response.headers.get('www-authenticate') || '', /resource_metadata=/)
})

test('rejects non-admin authenticated write calls', async () => {
    const baseUrl = await startTestServer()

    const response = await fetch(`${baseUrl}/mcp`, {
        method: 'POST',
        headers: rpcHeaders({
            authorization: 'Bearer user-token',
        }),
        body: JSON.stringify(
            rpcRequest(4, 'tools/call', {
                name: 'create_draft_post',
                arguments: {
                    title: 'Draft title',
                    content_html: '<p>Draft content with enough length to pass validation.</p>',
                    category: 'Research',
                    tags: ['soil'],
                },
            }),
        ),
    })

    assert.equal(response.status, 403)
})

test('allows admin-authenticated write calls', async () => {
    const baseUrl = await startTestServer()

    const response = await fetch(`${baseUrl}/mcp`, {
        method: 'POST',
        headers: rpcHeaders({
            authorization: 'Bearer admin-token',
        }),
        body: JSON.stringify(
            rpcRequest(5, 'tools/call', {
                name: 'create_draft_post',
                arguments: {
                    title: 'Draft title',
                    content_html: '<p>Draft content with enough length to pass validation.</p>',
                    category: 'Research',
                    tags: ['soil'],
                },
            }),
        ),
    })

    assert.equal(response.status, 200)
    const body = (await response.json()) as any
    assert.equal(body.result.structuredContent.status, 'draft')
    assert.equal(body.result.structuredContent.post_id, '22222222-2222-4222-8222-222222222222')
})
