'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateDisplayLocation(postId: string, location: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('posts')
            .update({ display_location: location })
            .eq('id', postId)

        if (error) throw error

        revalidatePath('/admin/posts')
        revalidatePath('/') // Revalidate homepage so changes appear immediately
        return { success: true }
    } catch (e) {
        console.error('Failed to update location:', e)
        return { success: false, error: 'Failed to update location' }
    }
}
