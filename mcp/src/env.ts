function requiredEnv(env: NodeJS.ProcessEnv, name: string) {
    const value = env[name]?.trim()
    if (!value) {
        throw new Error(`${name} is required for the Agri Updates MCP service.`)
    }
    return value
}

function trimTrailingSlash(value: string) {
    return value.replace(/\/+$/, '')
}

function commaList(value: string | undefined) {
    return (value || '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
}

export type McpEnv = {
    supabaseUrl: string
    supabaseAnonKey: string
    supabaseServiceRoleKey: string
    siteUrl: string
    mcpBaseUrl: string
    supabaseIssuer: string
    supportUrl: string
    privacyUrl: string
    openaiApiKey?: string
    openaiImageModel: string
    port: number
    host: string
    allowedHosts: string[]
}

export function loadMcpEnv(source: NodeJS.ProcessEnv = process.env): McpEnv {
    const supabaseUrl = trimTrailingSlash(requiredEnv(source, 'NEXT_PUBLIC_SUPABASE_URL'))
    const supabaseAnonKey = requiredEnv(
        source,
        source.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
    )

    const siteUrl = trimTrailingSlash(
        source.NEXT_PUBLIC_SITE_URL?.trim() ||
            source.SITE_URL?.trim() ||
            'https://www.agriupdates.online',
    )
    const portValue = Number(source.MCP_PORT || '8787')

    return {
        supabaseUrl,
        supabaseAnonKey,
        supabaseServiceRoleKey: requiredEnv(source, 'SUPABASE_SERVICE_ROLE_KEY'),
        siteUrl,
        mcpBaseUrl: trimTrailingSlash(source.MCP_BASE_URL?.trim() || `http://localhost:${portValue}/mcp`),
        supabaseIssuer: trimTrailingSlash(source.SUPABASE_OAUTH_ISSUER?.trim() || `${supabaseUrl}/auth/v1`),
        supportUrl: trimTrailingSlash(source.MCP_SUPPORT_URL?.trim() || `${siteUrl}/contact`),
        privacyUrl: trimTrailingSlash(source.MCP_PRIVACY_URL?.trim() || `${siteUrl}/privacy`),
        openaiApiKey: source.OPENAI_API_KEY?.trim() || undefined,
        openaiImageModel: source.OPENAI_IMAGE_MODEL?.trim() || 'gpt-image-2',
        port: Number.isFinite(portValue) ? portValue : 8787,
        host: source.MCP_HOST?.trim() || '0.0.0.0',
        allowedHosts: commaList(source.MCP_ALLOWED_HOSTS),
    }
}
