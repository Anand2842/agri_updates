import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/admin/LogoutButton' // We'll create this component

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

    return (
        <div className="flex h-screen bg-stone-100">
            {/* Sidebar */}
            <aside className="w-64 bg-black text-white p-6 hidden md:block">
                <h2 className="text-xl font-serif font-bold mb-8 text-agri-green">Admin Panel</h2>
                <nav className="space-y-4 text-sm font-bold uppercase tracking-widest">
                    <Link href="/admin" className="block hover:text-stone-300">Dashboard</Link>
                    <Link href="/admin/jobs" className="block hover:text-stone-300">Jobs</Link>
                    <Link href="/admin/posts" className="block hover:text-stone-300">Posts</Link>
                    <Link href="/admin/startups" className="block hover:text-stone-300">Startups</Link>
                    <Link href="/" target="_blank" className="block text-stone-500 pt-8 hover:text-white">View Site ↗</Link>
                </nav>

                <div className="absolute bottom-6">
                    <LogoutButton />
                </div>
            </aside>

            {/* Mobile Header (TODO: Add mobile menu toggle) */}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
