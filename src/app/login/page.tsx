'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            // Hard navigate to completely bypass the Next.js React router.
            // This forces the browser to fully commit the auth cookie and perform a totally
            // fresh HTTP GET request. This stops all Next.js app router race conditions
            // and `fetch()` chunk errors (like ERR_CONNECTION_REFUSED on internal router chunks).
            window.location.href = '/admin/dashboard'
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
            <div className="max-w-md w-full bg-white p-8 border border-stone-200 shadow-sm">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-4">
                        <span className="font-black text-2xl tracking-tighter uppercase">AGRI UPDATES</span>
                    </Link>
                    <h1 className="font-serif text-3xl font-bold mb-2">Sign In</h1>
                    <p className="text-stone-500 text-sm">Welcome back to your dashboard</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 text-sm mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black transition-colors"
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500">Password</label>
                            <Link href="/forgot-password" className="text-xs font-bold text-agri-green hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black transition-colors pr-12"
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-agri-green transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-stone-500">
                    Need an account?{' '}
                    <Link href="/signup" className="text-black font-bold hover:underline">
                        Sign up here
                    </Link>
                </div>
            </div>
        </div>
    )
}
