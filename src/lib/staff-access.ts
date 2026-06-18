import type { User } from '@supabase/supabase-js'

export type StaffAccessRole = 'admin' | 'moderator' | 'user'

type MinimalUser = Pick<User, 'id' | 'email'> | null | undefined
type ProfileLookupClient = {
    from(table: string): {
        select(columns: string): {
            eq(column: string, value: string): {
                maybeSingle(): Promise<{ data: { role?: unknown } | null }>
            }
        }
    }
}

export function getAdminEmailAllowlist(env: NodeJS.ProcessEnv = process.env) {
    return (env.NEXT_PUBLIC_ADMIN_EMAILS || env.ADMIN_EMAILS || '')
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
}

export function isAdminEmail(email: string | null | undefined, env: NodeJS.ProcessEnv = process.env) {
    if (!email) return false
    return getAdminEmailAllowlist(env).includes(email.trim().toLowerCase())
}

export function coerceStaffAccessRole(value: unknown): StaffAccessRole | null {
    if (value === 'admin' || value === 'moderator' || value === 'user') {
        return value
    }
    return null
}

export async function lookupProfileRole(supabase: ProfileLookupClient, userId: string): Promise<StaffAccessRole | null> {
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle()

    return coerceStaffAccessRole(profile?.role)
}

export async function resolveUserRole(
    supabase: ProfileLookupClient,
    user: MinimalUser,
    env: NodeJS.ProcessEnv = process.env,
): Promise<StaffAccessRole> {
    if (!user) return 'user'

    if (isAdminEmail(user.email, env)) {
        return 'admin'
    }

    try {
        return (await lookupProfileRole(supabase, user.id)) || 'user'
    } catch (error) {
        console.error('Error fetching user role:', error)
        return 'user'
    }
}
