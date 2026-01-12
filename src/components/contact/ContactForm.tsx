'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

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
            name: `${formData.get('firstName')} ${formData.get('lastName')}`,
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
            <div className="bg-stone-50 border-b border-stone-200 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
                    <p className="text-stone-500 max-w-2xl mx-auto italic font-serif text-lg">
                        &quot;Let&apos;s build the future of agricultural careers together&quot;
                    </p>
                    <div className="h-1 w-20 bg-agri-green mx-auto mt-6"></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Information */}
                    <div>
                        <h2 className="font-serif text-3xl font-bold mb-8">Get In Touch</h2>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-agri-green/10 p-3 rounded-full">
                                    <Mail className="w-6 h-6 text-agri-green" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Email</h3>
                                    <p className="text-stone-600">hello@agriupdates.com</p>
                                    <p className="text-sm text-stone-500 mt-1">For general inquiries and partnerships</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-agri-green/10 p-3 rounded-full">
                                    <Phone className="w-6 h-6 text-agri-green" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Phone</h3>
                                    <p className="text-stone-600">+1 (555) 123-4567</p>
                                    <p className="text-sm text-stone-500 mt-1">Mon-Fri, 9AM-6PM EST</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-agri-green/10 p-3 rounded-full">
                                    <MapPin className="w-6 h-6 text-agri-green" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Address</h3>
                                    <p className="text-stone-600">
                                        Agri Updates HQ<br />
                                        123 Innovation Drive<br />
                                        Agriculture Valley, CA 94043
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-agri-green/10 p-3 rounded-full">
                                    <Clock className="w-6 h-6 text-agri-green" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Business Hours</h3>
                                    <p className="text-stone-600">
                                        Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                                        Saturday: 10:00 AM - 4:00 PM EST<br />
                                        Sunday: Closed
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-stone-50 border-l-4 border-agri-green">
                            <h3 className="font-bold text-lg mb-2">For Job Postings</h3>
                            <p className="text-stone-600 mb-3">
                                Companies interested in posting agricultural job opportunities can reach us at:
                            </p>
                            <p className="font-mono text-sm bg-white p-2 border">
                                jobs@agriupdates.com
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <h2 className="font-serif text-3xl font-bold mb-8">Send us a Message</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-bold text-stone-700 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        required
                                        className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-agri-green text-sm"
                                        placeholder="Your first name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-bold text-stone-700 mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        required
                                        className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-agri-green text-sm"
                                        placeholder="Your last name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-stone-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-agri-green text-sm"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-bold text-stone-700 mb-2">
                                    Subject *
                                </label>
                                <select
                                    id="subject"
                                    name="subject"
                                    required
                                    className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-agri-green text-sm"
                                >
                                    <option value="">Select a topic</option>
                                    <option value="general">General Inquiry</option>
                                    <option value="partnership">Partnership Opportunity</option>
                                    <option value="jobs">Job Posting</option>
                                    <option value="support">Technical Support</option>
                                    <option value="feedback">Feedback</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-bold text-stone-700 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={6}
                                    className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-agri-green text-sm"
                                    placeholder="Tell us how we can help you..."
                                ></textarea>
                            </div>

                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="privacy"
                                    name="privacy"
                                    required
                                    className="mt-1 accent-agri-green"
                                />
                                <label htmlFor="privacy" className="text-sm text-stone-600">
                                    I have read and agree to the{' '}
                                    <a href="/privacy" className="text-agri-green hover:underline">
                                        Privacy Policy
                                    </a>
                                    {' '}and{' '}
                                    <a href="/terms" className="text-agri-green hover:underline">
                                        Terms of Use
                                    </a>
                                    .
                                </label>
                            </div>

                            <div className="hidden">
                                <label htmlFor="website">Website</label>
                                <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-agri-green text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-agri-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
