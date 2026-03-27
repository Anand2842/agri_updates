export function getSupabaseUrl() {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
}

export function getSupabasePublishableKey() {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
}

export function getRequiredSupabaseClientConfig() {
    const url = getSupabaseUrl()
    const publishableKey = getSupabasePublishableKey()

    if (!url || !publishableKey) {
        throw new Error(
            'Supabase URL and publishable key are required. Set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.'
        )
    }

    return { url, publishableKey }
}

export function getSupabaseServiceRoleKey() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY
}
