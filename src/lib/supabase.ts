import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

// Client-side Supabase client (uses anon key with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (uses service role key to bypass RLS)
// Only use this in API routes that need admin privileges
export const supabaseAdmin = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // This MUST be the service role key. Do not fallback to anon key.
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)
