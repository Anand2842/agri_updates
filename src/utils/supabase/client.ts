import { createBrowserClient } from '@supabase/ssr'
import { getRequiredSupabaseClientConfig } from '@/lib/supabase-config'

export function createClient() {
    const { url, publishableKey } = getRequiredSupabaseClientConfig()

    return createBrowserClient(
        url,
        publishableKey
    )
}
