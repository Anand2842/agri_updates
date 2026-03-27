import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getRequiredSupabaseClientConfig, getSupabaseServiceRoleKey } from '@/lib/supabase-config'

const { url: supabaseUrl, publishableKey: supabaseAnonKey } = getRequiredSupabaseClientConfig()

// Client-side Supabase client (uses anon key with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

let adminClient: SupabaseClient | null = null

function getAdminClient() {
    if (adminClient) {
        return adminClient
    }

    const serviceRoleKey = getSupabaseServiceRoleKey()
    if (!serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin Supabase operations.')
    }

    adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    return adminClient
}

// Delay service-role initialization until an admin path actually uses it.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_target, prop, receiver) {
        const client = getAdminClient()
        const value = Reflect.get(client, prop, receiver)
        return typeof value === 'function' ? value.bind(client) : value
    }
})
