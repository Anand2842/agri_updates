import { SupabaseClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { resolveUserRole, type StaffAccessRole } from '@/lib/staff-access';

export type UserRole = StaffAccessRole;

export async function getUserRole(supabase: SupabaseClient): Promise<UserRole> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return await resolveUserRole(supabase as unknown as Parameters<typeof resolveUserRole>[0], user);
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
