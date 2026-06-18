import { createClient } from '@supabase/supabase-js'
import type { McpEnv } from './env.ts'

export function createMcpSupabaseClients(env: McpEnv) {
    const authOptions = {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }

    return {
        publicSupabase: createClient(env.supabaseUrl, env.supabaseAnonKey, authOptions),
        adminSupabase: createClient(env.supabaseUrl, env.supabaseServiceRoleKey, authOptions),
    }
}
