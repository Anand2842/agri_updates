'use client';

import { useState } from 'react';

export default function NewsletterForm() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus('loading');

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email');

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) throw new Error('Subscription failed');

            setStatus('success');
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            if (status !== 'success') setStatus('idle');
        }
    }

    if (status === 'success') {
        return (
            <div className="bg-green-50 text-agri-green p-6 rounded-lg">
                <p className="font-bold">Thank you for subscribing!</p>
                <p className="text-sm mt-1">Check your inbox for confirmation.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <input
                type="email"
                name="email"
                required
                disabled={status === 'loading'}
                placeholder="Your email address"
                className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-agri-green text-center text-sm disabled:opacity-50"
            />
            <div className="flex items-start justify-center gap-2 text-left">
                <input
                    type="checkbox"
                    required
                    id="privacy-check-form"
                    className="mt-1 accent-agri-green"
                />
                <label htmlFor="privacy-check-form" className="text-xs text-stone-500">
                    I have read and agree to the <a href="/privacy" className="text-agri-green hover:underline">Privacy Policy</a>.
                </label>
            </div>
            <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-agri-green text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-agri-dark transition-colors disabled:opacity-70"
            >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
            </button>
            {status === 'error' && (
                <p className="text-red-500 text-xs mt-2">Something went wrong. Please try again.</p>
            )}
        </form>
    );
}
