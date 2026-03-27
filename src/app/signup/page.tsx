'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const supabase = createClient()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
                <div className="max-w-md w-full bg-white p-8 border border-stone-200 shadow-sm text-center">
                    <h1 className="font-serif text-3xl font-bold mb-4">Check Your Email</h1>
                    <p className="text-stone-600 mb-8">
                        We&apos;ve sent a confirmation link to <strong>{email}</strong>.
                        Please check your inbox to complete your registration.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block bg-black text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-agri-green transition-colors"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
            <div className="max-w-md w-full bg-white p-8 border border-stone-200 shadow-sm">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-4">
                        <span className="font-black text-2xl tracking-tighter uppercase">AGRI UPDATES</span>
                    </Link>
                    <h1 className="font-serif text-3xl font-bold mb-2">Create Account</h1>
                    <p className="text-stone-500 text-sm">Join the Agri Updates community</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 text-sm mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-6">
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
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black transition-colors pr-12"
                                autoComplete="new-password"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {password.length > 0 && (
                            <div className="mt-2 flex items-center justify-between">
                                <div className="flex gap-1 flex-1 mr-4">
                                    <div className={`h-1 flex-1 rounded-full ${password.length >= 6 ? (password.length > 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-green-500' : 'bg-yellow-400') : 'bg-red-400'}`}></div>
                                    <div className={`h-1 flex-1 rounded-full ${password.length > 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-green-500' : (password.length >= 6 ? 'bg-yellow-400' : 'bg-stone-200')}`}></div>
                                    <div className={`h-1 flex-1 rounded-full ${password.length > 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 'bg-green-500' : 'bg-stone-200'}`}></div>
                                </div>
                                <span className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">
                                    {password.length < 6 ? 'Weak' : (password.length > 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'Strong' : 'Medium')}
                                </span>
                            </div>
                        )}
                        <p className="text-[10px] text-stone-400 mt-2">Must be at least 6 characters long.</p>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-agri-green transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-stone-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-black font-bold hover:underline">
                        Log in here
                    </Link>
                </div>
            </div>
        </div>
    )
}
