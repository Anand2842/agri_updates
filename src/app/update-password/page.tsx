'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import Link from 'next/link'
import { Lock, Check, AlertCircle, CheckCircle2, RefreshCw, ArrowLeft, Mail } from 'lucide-react'

function UpdatePasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    // Check for errors in URL params (e.g. otp_expired)
    const errorParam = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const errorDescription = searchParams.get('error_description')

    useEffect(() => {
        if (errorParam || errorCode || errorDescription) {
            let msg = errorDescription || 'The password reset link is invalid or has expired.'
            if (errorCode === 'otp_expired') {
                msg = 'This password reset link has expired. Please request a new link.'
            }
            setStatus({ type: 'error', message: msg })
            return
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, _session: Session | null) => {
            // Active session ready
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [errorParam, errorCode, errorDescription, supabase.auth])

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus(null)

        if (password.length < 6) {
            setStatus({ type: 'error', message: 'Password must be at least 6 characters long.' })
            return
        }

        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match.' })
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.updateUser({
            password: password.trim()
        })

        if (error) {
            setStatus({ type: 'error', message: error.message })
            setLoading(false)
        } else {
            setStatus({ type: 'success', message: 'Password updated successfully! Redirecting to dashboard...' })
            setTimeout(() => {
                router.push('/admin')
            }, 1800)
        }
    }

    // Expired or invalid link view
    if (errorParam || errorCode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-stone-200 shadow-sm text-center">
                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <h1 className="font-serif text-2xl font-bold text-stone-900 mb-2">Reset Link Expired</h1>
                    <p className="text-stone-600 text-sm mb-6 leading-relaxed">
                        {status?.message || 'This password reset link is invalid or has expired. For security, reset links are single-use.'}
                    </p>

                    <div className="space-y-3">
                        <Link
                            href="/forgot-password"
                            className="w-full inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-5 py-3 rounded-xl font-medium text-sm transition-all shadow-sm"
                        >
                            <Mail className="w-4 h-4" />
                            Request New Reset Link
                        </Link>
                        <Link
                            href="/login"
                            className="w-full inline-flex items-center justify-center gap-2 border border-stone-200 hover:bg-stone-50 text-stone-700 px-5 py-3 rounded-xl font-medium text-sm transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                <div className="text-center mb-6">
                    <Link href="/" className="inline-block mb-3">
                        <span className="font-black text-xl tracking-tighter uppercase text-stone-900">
                            AGRI UPDATES
                        </span>
                    </Link>
                    <h1 className="font-serif text-2xl font-bold text-stone-900 mb-1">Set New Password</h1>
                    <p className="text-stone-500 text-xs">Enter your new secure password below.</p>
                </div>

                {status && (
                    <div
                        className={`p-3.5 rounded-xl border mb-5 text-sm flex items-center gap-2.5 ${
                            status.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                    >
                        {status.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        )}
                        <span className="text-xs font-medium">{status.message}</span>
                    </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-xl font-medium text-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Updating Password...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Save New Password
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-xs text-stone-500 hover:text-stone-900 font-medium">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function UpdatePasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="animate-spin w-8 h-8 border-4 border-stone-200 border-t-stone-900 rounded-full" />
            </div>
        }>
            <UpdatePasswordContent />
        </Suspense>
    )
}
