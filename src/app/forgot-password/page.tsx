'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const supabase = createClient()

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
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
                        We've sent a password reset link to <strong>{email}</strong>.
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
                    <h1 className="font-serif text-3xl font-bold mb-2">Reset Password</h1>
                    <p className="text-stone-500 text-sm">Enter your email to receive a reset link</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 text-sm mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-6">
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
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-agri-green transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-stone-500">
                    <Link href="/login" className="text-black font-bold hover:underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
