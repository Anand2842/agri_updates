
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // Correct type for Next.js 15+ params
) {
    try {
        // Await the params object
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Increment likes
        const { error } = await supabase.rpc('increment_comment_likes', { comment_id: id });

        // Fallback if RPC doesn't exist (simpler update, though less safe for concurrency)
        if (error) {
            // Check if error is "function not found"
            if (error.code === 'PGRST202' || error.message.includes('function') || error.message.includes('not found')) {
                // Fetch current likes
                const { data: current, error: fetchError } = await supabase
                    .from('comments')
                    .select('likes')
                    .eq('id', id)
                    .single();

                if (fetchError || !current) {
                    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
                }

                // Update manually
                const { error: updateError } = await supabase
                    .from('comments')
                    .update({ likes: (current.likes || 0) + 1 })
                    .eq('id', id);

                if (updateError) throw updateError;
            } else {
                throw error;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error liking comment:', error);
        return NextResponse.json({ error: 'Failed to like comment' }, { status: 500 });
    }
}
