'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { getUserRole } from '@/lib/auth'
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/lib/supabase-config'
import type { UserProfile, UserRole } from '@/types/database'

function getAdminClient() {
    const url = getSupabaseUrl()
    const serviceRoleKey = getSupabaseServiceRoleKey()

    if (!url || !serviceRoleKey) {
        throw new Error('Missing Supabase Service Role Key or URL for admin actions.')
    }

    return createSupabaseClient(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

async function verifyAdminCaller() {
    const callerSupabase = await createClient()
    const { data: { user } } = await callerSupabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized: Authentication required.')
    }

    const role = await getUserRole(callerSupabase)
    if (role !== 'admin') {
        throw new Error('Forbidden: Only administrators can manage team members and roles.')
    }

    return { callerSupabase, user }
}

export async function fetchTeamMembers(): Promise<{ success: boolean; data?: UserProfile[]; error?: string }> {
    try {
        await verifyAdminCaller()
        const adminSupabase = getAdminClient()

        // 1. Fetch auth users
        const { data: authUsersData, error: authError } = await adminSupabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000
        })

        if (authError) {
            throw new Error(`Failed to list users: ${authError.message}`)
        }

        // 2. Fetch profiles
        const { data: profiles, error: profilesError } = await adminSupabase
            .from('profiles')
            .select('*')

        if (profilesError) {
            throw new Error(`Failed to fetch profiles: ${profilesError.message}`)
        }

        const profileMap = new Map(profiles?.map((p: { id: string; role: UserRole; full_name?: string | null; avatar_url?: string | null; updated_at?: string | null }) => [p.id, p]) || [])

        const members: UserProfile[] = (authUsersData?.users || []).map((u) => {
            const profile = profileMap.get(u.id)
            const role: UserRole = (profile?.role as UserRole) || 'user'
            const fullName = profile?.full_name || (u.user_metadata?.full_name as string) || ''
            const avatarUrl = profile?.avatar_url || (u.user_metadata?.avatar_url as string) || null

            return {
                id: u.id,
                email: u.email || '',
                role,
                full_name: fullName,
                avatar_url: avatarUrl,
                created_at: u.created_at,
                last_sign_in_at: u.last_sign_in_at || null,
                updated_at: profile?.updated_at || null
            }
        })

        // Sort: admins first, then moderators, then authors, then users, then by name
        const roleOrder: Record<UserRole, number> = { admin: 1, moderator: 2, author: 3, user: 4 }
        members.sort((a, b) => {
            const orderDiff = (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99)
            if (orderDiff !== 0) return orderDiff
            return (a.full_name || a.email || '').localeCompare(b.full_name || b.email || '')
        })

        return { success: true, data: members }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred'
        console.error('fetchTeamMembers error:', err)
        return { success: false, error: message }
    }
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<{ success: boolean; error?: string }> {
    try {
        const { user: currentCaller } = await verifyAdminCaller()
        const validRoles: UserRole[] = ['admin', 'moderator', 'author', 'user']
        if (!validRoles.includes(newRole)) {
            return { success: false, error: `Invalid role: ${newRole}` }
        }

        // Prevent self-demotion from admin
        if (currentCaller.id === userId && newRole !== 'admin') {
            return { success: false, error: 'You cannot change your own admin role.' }
        }

        const adminSupabase = getAdminClient()

        // Upsert into profiles table
        const { error: upsertError } = await adminSupabase
            .from('profiles')
            .upsert({
                id: userId,
                role: newRole,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })

        if (upsertError) {
            throw new Error(`Failed to update user role: ${upsertError.message}`)
        }

        return { success: true }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred'
        console.error('updateUserRole error:', err)
        return { success: false, error: message }
    }
}

export async function inviteTeamMember(params: {
    email: string
    fullName: string
    role: UserRole
    password?: string
}): Promise<{ success: boolean; data?: { userId: string }; error?: string }> {
    try {
        await verifyAdminCaller()
        const { email, fullName, role, password } = params

        if (!email || !email.includes('@')) {
            return { success: false, error: 'Valid email address is required.' }
        }

        const validRoles: UserRole[] = ['admin', 'moderator', 'author', 'user']
        if (!validRoles.includes(role)) {
            return { success: false, error: `Invalid role: ${role}` }
        }

        const adminSupabase = getAdminClient()
        let createdUserId: string | null = null

        if (password && password.trim().length >= 6) {
            // Direct create with password
            const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
                email: email.trim().toLowerCase(),
                password: password.trim(),
                email_confirm: true,
                user_metadata: {
                    full_name: fullName.trim()
                }
            })

            if (createError) {
                // If user already exists, retrieve and update
                if (createError.message.toLowerCase().includes('already registered')) {
                    const { data: listData } = await adminSupabase.auth.admin.listUsers()
                    const existing = listData?.users.find((u) => u.email?.toLowerCase() === email.trim().toLowerCase())
                    if (existing) {
                        createdUserId = existing.id
                    } else {
                        throw new Error(createError.message)
                    }
                } else {
                    throw new Error(createError.message)
                }
            } else if (newUser?.user) {
                createdUserId = newUser.user.id
            }
        } else {
            // Invite via Email magic link / confirmation
            const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(
                email.trim().toLowerCase(),
                {
                    data: {
                        full_name: fullName.trim()
                    }
                }
            )

            if (inviteError) {
                // If user already exists, update their profile
                if (inviteError.message.toLowerCase().includes('already registered')) {
                    const { data: listData } = await adminSupabase.auth.admin.listUsers()
                    const existing = listData?.users.find((u) => u.email?.toLowerCase() === email.trim().toLowerCase())
                    if (existing) {
                        createdUserId = existing.id
                    } else {
                        throw new Error(inviteError.message)
                    }
                } else {
                    throw new Error(inviteError.message)
                }
            } else if (inviteData?.user) {
                createdUserId = inviteData.user.id
            }
        }

        if (!createdUserId) {
            throw new Error('Failed to determine user ID after creation/invite.')
        }

        // Set role and profile in profiles table
        const { error: profileError } = await adminSupabase
            .from('profiles')
            .upsert({
                id: createdUserId,
                role: role,
                full_name: fullName.trim() || null,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })

        if (profileError) {
            throw new Error(`User account prepared, but failed to save profile role: ${profileError.message}`)
        }

        return { success: true, data: { userId: createdUserId } }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred'
        console.error('inviteTeamMember error:', err)
        return { success: false, error: message }
    }
}

export async function deleteTeamMember(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { user: currentCaller } = await verifyAdminCaller()
        if (currentCaller.id === userId) {
            return { success: false, error: 'You cannot delete your own account from the team interface.' }
        }

        const adminSupabase = getAdminClient()

        // Delete from auth.users (cascades to profile)
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId)
        if (deleteError) {
            throw new Error(`Failed to delete user: ${deleteError.message}`)
        }

        return { success: true }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred'
        console.error('deleteTeamMember error:', err)
        return { success: false, error: message }
    }
}

export async function resetTeamMemberPassword(params: {
    userId: string
    email?: string
    newPassword?: string
    sendEmail?: boolean
}): Promise<{ success: boolean; message?: string; recoveryLink?: string; error?: string }> {
    try {
        await verifyAdminCaller()
        const { userId, email, newPassword, sendEmail } = params
        const adminSupabase = getAdminClient()

        if (newPassword && newPassword.trim().length >= 6) {
            // Set password directly
            const { error: updateError } = await adminSupabase.auth.admin.updateUserById(userId, {
                password: newPassword.trim()
            })
            if (updateError) {
                throw new Error(`Failed to update password: ${updateError.message}`)
            }
            return { success: true, message: 'Password updated directly.' }
        } else if (sendEmail && email) {
            // Generate recovery email link
            const { data, error: resetError } = await adminSupabase.auth.admin.generateLink({
                type: 'recovery',
                email: email.trim().toLowerCase()
            })
            if (resetError) {
                throw new Error(`Failed to generate password reset link: ${resetError.message}`)
            }
            return {
                success: true,
                message: 'Password reset link generated.',
                recoveryLink: data?.properties?.action_link
            }
        } else {
            return { success: false, error: 'Either a new password (min 6 chars) or email is required.' }
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred'
        console.error('resetTeamMemberPassword error:', err)
        return { success: false, error: message }
    }
}

export async function updateCurrentUserPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (!newPassword || newPassword.trim().length < 6) {
            return { success: false, error: 'Password must be at least 6 characters.' }
        }

        const callerSupabase = await createClient()
        const { data: { user } } = await callerSupabase.auth.getUser()
        if (!user) {
            throw new Error('Unauthorized: Authentication required.')
        }

        const { error } = await callerSupabase.auth.updateUser({
            password: newPassword.trim()
        })

        if (error) {
            throw new Error(error.message)
        }

        return { success: true }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred'
        console.error('updateCurrentUserPassword error:', err)
        return { success: false, error: message }
    }
}

