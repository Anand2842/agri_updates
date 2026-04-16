import { SupabaseClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export type UserRole = 'admin' | 'moderator' | 'user';

export async function getUserRole(supabase: SupabaseClient): Promise<UserRole> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 'user';

        // Check emergency admin bootstrap via env emails FIRST.
        // This takes priority over the DB profile so that even if the profile
        // row exists with role='user', env-listed admins always get access.
        const adminEmailEnv = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '')
            .split(',')
            .map(e => e.trim().toLowerCase())
            .filter(Boolean);

        if (user.email && adminEmailEnv.includes(user.email.toLowerCase())) {
            return 'admin';
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        if (profile?.role) return profile.role as UserRole;

        return 'user';
    } catch (e) {
        console.error("Error fetching user role:", e);
        return 'user';
    }
}

export async function requireStaff(supabase: SupabaseClient): Promise<UserRole> {
    const role = await getUserRole(supabase);
    if (role === 'user') {
        // Non-staff users should never sit inside /admin; send them home to avoid loops.
        redirect('/');
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
