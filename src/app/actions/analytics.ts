'use server'

import { createClient } from '@/utils/supabase/server'

export async function incrementView(postId: string) {
    try {
        const supabase = await createClient()
        // Call the RPC function we created in the migration
        await supabase.rpc('increment_post_views', { post_id: postId })
    } catch (error) {
        // Silently fail if RPC function doesn't exist - don't break the page
        console.error('Failed to increment view count:', error)
    }
}
