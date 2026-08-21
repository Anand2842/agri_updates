'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function SubscribeBlock() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setStatus('loading');
        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await response.json();
            if (response.ok) {
                setStatus('success');
                setMessage(data.message || 'Subscribed successfully!');
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong');
            }
        } catch {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    return (
        <section className="editorial-shell py-10 my-4">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
                {/* SVG Noise Texture Overlay */}
                <div 
                    className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
                
                {/* Subtle decorative glow */}
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
                            <Mail className="w-3.5 h-3.5" />
                            Daily Intelligence Briefing
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
                            Stay ahead of agricultural markets, research & careers.
                        </h2>
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mb-6">
                            Join over 5,000+ agribusiness founders, researchers, ICAR scholars, and agronomy professionals receiving our curated 7 AM briefing.
                        </p>

                        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                Verified job & grant alerts
                            </span>
                            <span className="flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                No spam, unsubscribe anytime
                            </span>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-inner">
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your professional email"
                                    required
                                    disabled={status === 'loading'}
                                    className="w-full pl-10 pr-4 py-3 bg-white/90 focus:bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-xl outline-none border border-transparent focus:border-emerald-400 transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {status === 'loading' ? (
                                    'Joining Briefing...'
                                ) : (
                                    <>
                                        <span>Get Free Daily Briefing</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            {message && (
                                <p className={`text-xs text-center font-medium mt-1 ${status === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>
                                    {message}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
