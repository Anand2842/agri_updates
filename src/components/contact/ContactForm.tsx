'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function ContactForm() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        // Honeypot check
        if (formData.get('website')) {
            // Silently fail (bot detected)
            setStatus('success');
            return;
        }

        setStatus('loading');

        const data = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to send message');

            setStatus('success');
        } catch (error) {
            console.error('Contact form error:', error);
            setStatus('error');
            alert('Failed to send message. Please try again.');
        } finally {
            if (status !== 'success') setStatus('idle');
        }
    }

    if (status === 'success') {
        return (
            <div className="bg-white min-h-screen pb-20">
                <div className="bg-stone-50 border-b border-stone-200 py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Message Sent</h1>
                        <div className="h-1 w-20 bg-agri-green mx-auto mt-6"></div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-24 text-center">
                    <div className="bg-green-50 text-agri-green p-8 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h2 className="font-serif text-3xl font-bold mb-4">Thank you for reaching out!</h2>
                    <p className="text-stone-500 max-w-md mx-auto mb-8">
                        We have received your message and will get back to you within 24-48 hours.
                    </p>
                    <button
                        onClick={() => setStatus('idle')}
                        className="bg-stone-900 text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-black transition-colors"
                    >
                        Send Another Message
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="bg-stone-50 border-b border-stone-200 py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 text-stone-900">Connect With Agri Updates</h1>
                    <p className="text-stone-600 max-w-3xl mx-auto text-lg leading-relaxed">
                        Agri Updates is a curated digital platform sharing verified agricultural jobs, opportunities, programs, and ecosystem updates across India.
                    </p>
                    <p className="text-stone-500 max-w-2xl mx-auto mt-4">
                        If you have a query, partnership idea, or opportunity to share, feel free to reach out.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
                    {/* Contact Information */}
                    <div>
                        <h2 className="font-serif text-3xl font-bold mb-8 text-stone-900">Get In Touch</h2>

                        <div className="bg-stone-50 p-8 rounded-xl border border-stone-100 mb-8">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="bg-white p-3 rounded-full border border-stone-100 shadow-sm">
                                    <Mail className="w-6 h-6 text-agri-green" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Email</h3>
                                    <p className="font-mono text-stone-700 bg-white px-3 py-1 rounded border border-stone-200 inline-block mb-2">
                                        aanand.ak15@gmail.com
                                    </p>
                                    <p className="text-sm text-stone-500 italic">
                                        All communications are handled via email to ensure clarity and timely response.
                                    </p>
                                </div>
                            </div>

                            <div className="pl-16">
                                <h4 className="font-bold text-sm uppercase tracking-widest text-stone-400 mb-3">For:</h4>
                                <ul className="space-y-2 text-stone-700 font-medium">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-agri-green rounded-full"></span>
                                        General inquiries
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-agri-green rounded-full"></span>
                                        Partnerships & collaborations
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-agri-green rounded-full"></span>
                                        Featured Listings & visibility requests
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-stone-900 text-white p-8 rounded-xl">
                            <h3 className="font-serif text-xl font-bold mb-4">About Agri Updates</h3>
                            <p className="text-stone-300 leading-relaxed mb-0">
                                Agri Updates is an innovation news platform connecting startups, funding updates, case studies, and artificial intelligence in the agricultural sector.
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
                        <h2 className="font-serif text-3xl font-bold mb-2 text-stone-900">Send Us a Message</h2>
                        <p className="text-stone-500 mb-8">Use the form below to contact us directly.</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="firstName" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        required
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all"
                                        placeholder="First Name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        required
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all"
                                        placeholder="Last Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    required
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all"
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all resize-none"
                                    placeholder="Write your message here..."
                                ></textarea>
                            </div>

                            <div className="flex items-start gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="privacy"
                                    name="privacy"
                                    required
                                    className="mt-1 w-4 h-4 text-agri-green border-stone-300 rounded focus:ring-agri-green"
                                />
                                <label htmlFor="privacy" className="text-sm text-stone-500 leading-snug">
                                    I have read and agree to the{' '}
                                    <a href="/privacy" className="text-stone-900 font-bold hover:underline">
                                        Privacy Policy
                                    </a>
                                    {' '}and{' '}
                                    <a href="/terms" className="text-stone-900 font-bold hover:underline">
                                        Terms of Use
                                    </a>
                                    .
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-black text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed rounded-lg mt-4"
                            >
                                {status === 'loading' ? 'Sending Message...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Transparency Note */}
                <div className="border-t border-stone-200 pt-16 text-center max-w-3xl mx-auto">
                    <h3 className="font-serif text-2xl font-bold mb-6 text-stone-900">Transparency Note</h3>
                    <div className="bg-stone-50 p-8 rounded-xl border border-stone-100">
                        <p className="text-stone-600 mb-4 leading-relaxed">
                            Agri Updates is an independent, remote-first digital platform.
                            We currently operate without a physical office address or public phone line.
                        </p>
                        <p className="text-stone-600 font-medium">
                            This allows us to focus on content quality, verification, and timely responses.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
