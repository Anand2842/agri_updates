import { createServer, type Server } from 'node:http'
import { pathToFileURL } from 'node:url'
import { mcpAuthMetadataRouter, getOAuthProtectedResourceMetadataUrl } from '@modelcontextprotocol/sdk/server/auth/router.js'
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js'
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import type { OAuthMetadata } from '@modelcontextprotocol/sdk/shared/auth.js'
import type { EditorialBackend } from './backend.ts'
import { createEditorialBackend } from './backend.ts'
import { buildSupabaseOAuthMetadata, createSupabaseTokenVerifier, isAdminAuth } from './auth.ts'
import { loadMcpEnv } from './env.ts'
import { createEditorialMcpServer, protectedToolNames } from './server.ts'
import { createMcpSupabaseClients } from './supabase.ts'

type RequestWithAuth = {
    headers: Record<string, string | string[] | undefined>
    body?: unknown
    auth?: AuthInfo
}

type CreateMcpHttpAppOptions = {
    backend: EditorialBackend
    authVerifier: {
        verifyAccessToken(token: string): Promise<AuthInfo>
    }
    mcpBaseUrl: string
    oauthMetadata: OAuthMetadata
    host?: string
    allowedHosts?: string[]
    serviceDocumentationUrl?: string
    resourceName?: string
}

function jsonRpcErrorResponse(res: any, status: number, id: unknown, code: number, message: string, headers?: Record<string, string>) {
    if (headers) {
        Object.entries(headers).forEach(([name, value]) => res.setHeader(name, value))
    }

    res.status(status).json({
        jsonrpc: '2.0',
        error: {
            code,
            message,
        },
        id: id ?? null,
    })
}

function getJsonRpcId(body: unknown): unknown {
    if (!body || Array.isArray(body) || typeof body !== 'object') return null
    return 'id' in body ? (body as { id?: unknown }).id ?? null : null
}

function readProtectedToolNames(body: unknown) {
    const messages = Array.isArray(body) ? body : [body]

    return messages.flatMap((message) => {
        if (!message || typeof message !== 'object') return []
        const candidate = message as { method?: unknown; params?: { name?: unknown } }
        if (candidate.method !== 'tools/call') return []
        if (typeof candidate.params?.name !== 'string') return []
        return protectedToolNames.has(candidate.params.name) ? [candidate.params.name] : []
    })
}

function readBearerToken(request: RequestWithAuth) {
    const rawHeader = request.headers.authorization
    const header = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader
    if (!header) return undefined

    const match = /^Bearer\s+(.+)$/i.exec(header.trim())
    if (!match?.[1]) {
        throw new Error('Authorization header must use the Bearer scheme.')
    }

    return match[1].trim()
}

function buildAuthChallenge(resourceMetadataUrl: string, error?: string, errorDescription?: string) {
    const parts = [`Bearer realm="agri-updates-mcp"`, `resource_metadata="${resourceMetadataUrl}"`]
    if (error) parts.push(`error="${error}"`)
    if (errorDescription) parts.push(`error_description="${errorDescription.replace(/"/g, "'")}"`)
    return parts.join(', ')
}

function methodNotAllowed(res: any, allowed: string) {
    res.setHeader('Allow', allowed)
    jsonRpcErrorResponse(res, 405, null, -32000, 'Method not allowed.')
}

async function maybeAuthenticateRequest(
    request: RequestWithAuth,
    response: any,
    verifier: CreateMcpHttpAppOptions['authVerifier'],
    resourceMetadataUrl: string,
) {
    let token: string | undefined

    try {
        token = readBearerToken(request)
    } catch (error) {
        jsonRpcErrorResponse(response, 401, getJsonRpcId(request.body), -32001, 'Invalid Authorization header.', {
            'WWW-Authenticate': buildAuthChallenge(resourceMetadataUrl, 'invalid_request', error instanceof Error ? error.message : 'Invalid request.'),
        })
        return false
    }

    if (!token) return true

    try {
        request.auth = await verifier.verifyAccessToken(token)
        return true
    } catch (error) {
        jsonRpcErrorResponse(response, 401, getJsonRpcId(request.body), -32001, 'Invalid or expired access token.', {
            'WWW-Authenticate': buildAuthChallenge(resourceMetadataUrl, 'invalid_token', error instanceof Error ? error.message : 'Access token verification failed.'),
        })
        return false
    }
}

export function createMcpHttpApp({
    backend,
    authVerifier,
    mcpBaseUrl,
    oauthMetadata,
    host = '0.0.0.0',
    allowedHosts,
    serviceDocumentationUrl,
    resourceName = 'Agri Updates Publishing MCP',
}: CreateMcpHttpAppOptions) {
    const app = createMcpExpressApp({
        host,
        allowedHosts,
    })
    const mcpUrl = new URL(mcpBaseUrl)
    const resourceMetadataUrl = getOAuthProtectedResourceMetadataUrl(mcpUrl)

    app.use(
        mcpAuthMetadataRouter({
            oauthMetadata,
            resourceServerUrl: mcpUrl,
            scopesSupported: ['openid', 'email', 'profile'],
            resourceName,
            serviceDocumentationUrl: serviceDocumentationUrl ? new URL(serviceDocumentationUrl) : undefined,
        }),
    )

    app.get('/', (_request: any, response: any) => {
        response.json({
            name: resourceName,
            mcp_endpoint: mcpUrl.href,
            resource_metadata_url: resourceMetadataUrl,
            authorization_server: oauthMetadata.issuer,
        })
    })

    app.get('/healthz', (_request: any, response: any) => {
        response.status(200).json({ ok: true })
    })

    app.post('/mcp', async (request: any, response: any) => {
        const req = request as RequestWithAuth
        if (!(await maybeAuthenticateRequest(req, response, authVerifier, resourceMetadataUrl))) {
            return
        }

        const protectedCalls = readProtectedToolNames(req.body)
        if (protectedCalls.length > 0) {
            if (!req.auth) {
                jsonRpcErrorResponse(response, 401, getJsonRpcId(req.body), -32001, 'OAuth authentication is required for this tool.', {
                    'WWW-Authenticate': buildAuthChallenge(resourceMetadataUrl),
                })
                return
            }

            if (!isAdminAuth(req.auth)) {
                jsonRpcErrorResponse(response, 403, getJsonRpcId(req.body), -32003, 'Only admin accounts can use write tools in this MCP service.')
                return
            }
        }

        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: true,
        })
        const server = createEditorialMcpServer({ backend })

        response.on('close', () => {
            void transport.close()
            void server.close()
        })

        try {
            await server.connect(transport)
            await transport.handleRequest(req as any, response as any, req.body)
        } catch (error) {
            if (!response.headersSent) {
                jsonRpcErrorResponse(response, 500, getJsonRpcId(req.body), -32603, error instanceof Error ? error.message : 'Internal server error.')
            }
        }
    })

    app.get('/mcp', (_request: any, response: any) => {
        methodNotAllowed(response, 'POST')
    })

    app.delete('/mcp', (_request: any, response: any) => {
        methodNotAllowed(response, 'POST')
    })

    return app
}

export async function startMcpHttpServer() {
    const env = loadMcpEnv()
    const { publicSupabase, adminSupabase } = createMcpSupabaseClients(env)
    const backend = createEditorialBackend({
        env,
        publicSupabase,
        adminSupabase,
    })
    const authVerifier = createSupabaseTokenVerifier({
        env,
        publicSupabase,
        adminSupabase,
    })
    const app = createMcpHttpApp({
        backend,
        authVerifier,
        mcpBaseUrl: env.mcpBaseUrl,
        oauthMetadata: buildSupabaseOAuthMetadata(env),
        host: env.host,
        allowedHosts: env.allowedHosts.length > 0 ? env.allowedHosts : undefined,
        serviceDocumentationUrl: env.supportUrl,
    })

    const server = createServer(app as any)

    await new Promise<void>((resolve, reject) => {
        server.once('error', reject)
        server.listen(env.port, env.host, () => {
            server.off('error', reject)
            resolve()
        })
    })

    return { app, env, server }
}

async function main() {
    const { env } = await startMcpHttpServer()
    console.error(`Agri Updates MCP HTTP server listening on ${env.host}:${env.port}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}

export type { Server }
