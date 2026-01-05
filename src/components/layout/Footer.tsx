'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [privacyAccepted, setPrivacyAccepted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setStatus('error');
            setMessage('Please enter your email address');
            return;
        }

        if (!privacyAccepted) {
            setStatus('error');
            setMessage('You must accept the privacy policy');
            return;
        }

        setStatus('loading');

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message);
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };
    return (
        <footer className="bg-stone-50 border-t border-stone-200 mt-20 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <h3 className="font-serif text-2xl font-bold mb-4">AGRI UPDATES</h3>
                        <p className="text-stone-500 text-sm leading-relaxed mb-6">
                            Agri Updates is an innovation news platform connecting startups, funding updates, case studies, and artificial intelligence in the agricultural sector.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 bg-stone-200 hover:bg-black hover:text-white transition-colors"><Facebook className="w-4 h-4" /></a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="p-2 bg-stone-200 hover:bg-black hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-2 bg-stone-200 hover:bg-black hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold uppercase text-xs tracking-widest mb-6">About Us</h4>
                        <ul className="space-y-3 text-sm text-stone-500">
                            <li><Link href="/about" className="hover:text-black">Our Story</Link></li>
                            <li><Link href="/contact" className="hover:text-black">Contact</Link></li>
                            <li><Link href="/disclaimer" className="hover:text-black">Disclaimer</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold uppercase text-xs tracking-widest mb-6">Categories</h4>
                        <ul className="space-y-3 text-sm text-stone-500">
                            <li><Link href="/startups" className="hover:text-black">Startups</Link></li>
                            <li><Link href="/jobs" className="hover:text-black">Jobs</Link></li>
                            <li><Link href="/blog" className="hover:text-black">Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold uppercase text-xs tracking-widest mb-6">Subscribe</h4>
                        <p className="text-stone-500 text-sm mb-4">Get the latest updates delivered to your inbox.</p>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="w-full px-4 py-2 border border-stone-300 focus:outline-none focus:border-agri-green text-sm"
                                disabled={status === 'loading'}
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="bg-agri-green text-white px-4 py-2 text-xs font-bold uppercase hover:bg-agri-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </form>

                        {message && (
                            <p className={`text-xs mt-2 ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message}
                            </p>
                        )}

                        <p className="text-xs text-stone-400 mt-2">
                            <input
                                type="checkbox"
                                className="mr-2 accent-agri-green"
                                checked={privacyAccepted}
                                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                            /> I have read and accept the{' '}
                            <Link href="/privacy" className="text-agri-green hover:underline">
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </div>
                </div>

                <div className="border-t border-stone-200 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-400 uppercase tracking-wider">
                    <p>© {new Date().getFullYear()} Agri Updates. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-black">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-black">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
