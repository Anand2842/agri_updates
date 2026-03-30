import { SupabaseClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export type UserRole = 'admin' | 'moderator' | 'user';

export async function getUserRole(supabase: SupabaseClient): Promise<UserRole> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 'user';

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        return (profile?.role as UserRole) || 'user';
    } catch (e) {
        console.error("Error fetching user role:", e);
        return 'user';
    }
}

export async function requireStaff(supabase: SupabaseClient): Promise<UserRole> {
    const role = await getUserRole(supabase);
    if (role === 'user') {
        // Do NOT redirect to /login — a logged-in user on /login gets bounced
        // back to /admin by middleware, creating an infinite loop.
        redirect('/unauthorized');
    }
    return role;
}

export async function requireAdmin(supabase: SupabaseClient): Promise<UserRole> {
    const role = await getUserRole(supabase);
    if (role !== 'admin') {
        if (role === 'moderator') {
            redirect('/admin/dashboard');
        } else {
            redirect('/unauthorized');
        }
    }
    return role;
}
