import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminShell from './AdminShell'
import { requireStaff } from '@/lib/auth'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const role = await requireStaff(supabase)

    return <AdminShell user={user} role={role}>{children}</AdminShell>
}
