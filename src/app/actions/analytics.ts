'use server'

import { createClient } from '@/utils/supabase/server'

export async function incrementView(postId: string) {
    const supabase = await createClient()

    // Call the RPC function we created in the migration
    await supabase.rpc('increment_post_views', { post_id: postId })
}
