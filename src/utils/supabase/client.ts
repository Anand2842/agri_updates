import { createBrowserClient } from '@supabase/ssr'
import { getRequiredSupabaseClientConfig } from '@/lib/supabase-config'

let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
    if (typeof window === 'undefined') {
        const { url, publishableKey } = getRequiredSupabaseClientConfig()
        return createBrowserClient(url, publishableKey)
    }

    if (!client) {
        const { url, publishableKey } = getRequiredSupabaseClientConfig()
        client = createBrowserClient(url, publishableKey)
    }

    return client
}
