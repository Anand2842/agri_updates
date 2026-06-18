import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js'
import type { OAuthMetadata } from '@modelcontextprotocol/sdk/shared/auth.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { isAdminEmail, lookupProfileRole } from '../../src/lib/staff-access.ts'
import type { McpEnv } from './env.ts'

type JwtClaims = {
    aud?: string | string[]
    azp?: string
    client_id?: string
    exp?: number
    scope?: string
    sub?: string
}

export type SupabaseTokenVerifier = {
    verifyAccessToken(token: string): Promise<AuthInfo>
}

function parseJwtClaims(token: string): JwtClaims {
    try {
        const [, payload] = token.split('.')
        if (!payload) return {}
        return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as JwtClaims
    } catch {
        return {}
    }
}

export function buildSupabaseOAuthMetadata(env: McpEnv): OAuthMetadata {
    const issuer = env.supabaseIssuer

    return {
        issuer,
        authorization_endpoint: `${issuer}/oauth/authorize`,
        token_endpoint: `${issuer}/oauth/token`,
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code', 'refresh_token'],
        token_endpoint_auth_methods_supported: ['none', 'client_secret_basic', 'client_secret_post'],
        code_challenge_methods_supported: ['S256'],
        scopes_supported: ['openid', 'email', 'profile'],
        service_documentation: env.supportUrl,
    }
}

export function getAuthRole(authInfo?: AuthInfo) {
    return typeof authInfo?.extra?.role === 'string' ? authInfo.extra.role : undefined
}

export function isAdminAuth(authInfo?: AuthInfo) {
    return getAuthRole(authInfo) === 'admin'
}

export function createSupabaseTokenVerifier({
    env,
    publicSupabase,
    adminSupabase,
}: {
    env: McpEnv
    publicSupabase: SupabaseClient
    adminSupabase: SupabaseClient
}): SupabaseTokenVerifier {
    return {
        async verifyAccessToken(token) {
            const {
                data: { user },
                error,
            } = await publicSupabase.auth.getUser(token)

            if (error || !user) {
                throw new Error(error?.message || 'Invalid or expired Supabase access token.')
            }

            const claims = parseJwtClaims(token)
            const role = isAdminEmail(user.email)
                ? 'admin'
                : (await lookupProfileRole(adminSupabase as any, user.id)) || 'user'
            const scopes = typeof claims.scope === 'string' ? claims.scope.split(/\s+/).filter(Boolean) : []

            return {
                token,
                clientId: claims.azp || claims.client_id || 'supabase-oauth-client',
                scopes,
                expiresAt: claims.exp,
                resource: new URL(env.mcpBaseUrl),
                extra: {
                    userId: user.id,
                    email: user.email || '',
                    role,
                    subject: claims.sub || user.id,
                },
            }
        },
    }
}
