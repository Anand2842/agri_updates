import { SupabaseClient } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'moderator' | 'user';

export async function getUserRole(supabase: SupabaseClient): Promise<UserRole> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 'user';

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        return (profile?.role as UserRole) || 'user';
    } catch (e) {
        console.error("Error fetching user role:", e);
        return 'user';
    }
}
