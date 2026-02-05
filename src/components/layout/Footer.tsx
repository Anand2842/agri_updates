'use client';

import Link from 'next/link';
import { Twitter, Linkedin, Facebook, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { getAllHubs } from '@/lib/hubs';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [privacyAccepted, setPrivacyAccepted] = useState(false);

    // Mobile Accordion State
    const [openSection, setOpenSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

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
        } catch {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };
    const pathname = usePathname();

    // Hide Footer on Admin pages
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    const AccordionItem = ({ title, children, id }: { title: string, children: React.ReactNode, id: string }) => (
        <div className="border-b border-stone-100 md:border-none">
            <button
                onClick={() => toggleSection(id)}
                className="flex items-center justify-between w-full py-4 md:py-0 md:cursor-default"
            >
                <h4 className="font-bold uppercase text-xs tracking-widest text-stone-900 md:mb-6">{title}</h4>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform md:hidden ${openSection === id ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 md:h-auto ${openSection === id ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0 md:opacity-100 md:max-h-none'}`}>
                {children}
            </div>
        </div>
    );

    return (
        <footer className="bg-white border-t-2 border-black mt-16 pt-12 pb-8 w-full overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-16">
                    {/* 1. Brand Block (Always Visible) */}
                    <div className="col-span-1 md:col-span-1 border-b border-stone-100 md:border-none pb-8 md:pb-0">
                        <h3 className="font-serif text-2xl font-bold mb-4">AGRI UPDATES</h3>
                        <p className="text-stone-500 text-sm leading-relaxed mb-6">
                            Agri Updates is an innovation news platform connecting startups, funding updates, case studies, and artificial intelligence in the agricultural sector.
                        </p>
                        {/* Desktop Socials */}
                        <div className="hidden md:flex gap-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 bg-stone-200 hover:bg-black hover:text-white transition-colors"><Facebook className="w-4 h-4" /></a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="p-2 bg-stone-200 hover:bg-black hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-2 bg-stone-200 hover:bg-black hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
                        </div>
                    </div>

                    {/* 2. About Us */}
                    <div className="md:col-span-1">
                        <AccordionItem title="About Us" id="about">
                            <ul className="space-y-3 text-sm text-stone-500">
                                <li><Link href="/about" className="hover:text-black py-1 block">Our Story</Link></li>
                                <li><Link href="/contact" className="hover:text-black py-1 block">Contact</Link></li>
                                <li><Link href="/disclaimer" className="hover:text-black py-1 block">Disclaimer</Link></li>
                            </ul>
                        </AccordionItem>
                    </div>

                    {/* 3. Categories */}
                    <div className="md:col-span-1">
                        <AccordionItem title="Categories" id="categories">
                            <ul className="space-y-3 text-sm text-stone-500">
                                <li><Link href="/startups" className="hover:text-black py-1 block">Startups</Link></li>
                                <li><Link href="/jobs" className="hover:text-black py-1 block">Jobs</Link></li>
                                <li><Link href="/blog" className="hover:text-black py-1 block">Blog</Link></li>
                            </ul>
                        </AccordionItem>
                    </div>

                    {/* 4. Collections */}
                    <div className="md:col-span-1">
                        <AccordionItem title="Job Collections" id="collections">
                            <ul className="space-y-3 text-sm text-stone-500">
                                {getAllHubs().slice(0, 5).map(hub => (
                                    <li key={hub.slug}>
                                        <Link href={`/${hub.slug}`} className="hover:text-black py-1 block">
                                            {hub.title.split(' - ')[0]}
                                        </Link>
                                    </li>
                                ))}
                                <li><Link href="/jobs" className="font-bold text-agri-green hover:underline py-1 block">View All Jobs</Link></li>
                            </ul>
                        </AccordionItem>
                    </div>

                    {/* 5. Subscribe (Always Visible on Desktop, Accordion on Mobile?) -> Keep visible or compact on mobile? 
                       Playbook says "Footer stacks into an endless link dump." 
                       Let's keep Subscribe visible as it's separate from links.
                    */}
                    <div className="pt-8 md:pt-0">
                        <h4 className="font-bold uppercase text-xs tracking-widest mb-6 text-stone-900">Subscribe</h4>
                        <p className="text-stone-500 text-sm mb-4">Get the latest updates delivered to your inbox.</p>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="w-full px-4 py-2 border border-stone-300 focus:outline-none focus:border-agri-green text-sm rounded"
                                disabled={status === 'loading'}
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="bg-agri-green text-white px-4 py-2.5 text-xs font-bold uppercase hover:bg-agri-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded shadow-sm"
                            >
                                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </form>

                        {message && (
                            <p className={`text-xs mt-2 ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message}
                            </p>
                        )}

                        <p className="text-xs text-stone-400 mt-4 flex items-start leading-relaxed">
                            <input
                                type="checkbox"
                                className="mr-2 mt-0.5 accent-agri-green flex-shrink-0"
                                checked={privacyAccepted}
                                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                            />
                            <span>
                                I have read and accept the{' '}
                                <Link href="/privacy" className="text-agri-green hover:underline">Privacy Policy</Link>.
                            </span>
                        </p>
                    </div>
                </div>

                {/* Mobile Socials & Copyright - Centered */}
                <div className="border-t border-stone-200 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    {/* Mobile Socials (Big Tap Targets) */}
                    <div className="flex gap-8 md:hidden">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-stone-100 rounded-full hover:bg-agri-green hover:text-white transition-colors"><Facebook className="w-6 h-6" /></a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-stone-100 rounded-full hover:bg-agri-green hover:text-white transition-colors"><Twitter className="w-6 h-6" /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-stone-100 rounded-full hover:bg-agri-green hover:text-white transition-colors"><Linkedin className="w-6 h-6" /></a>
                    </div>

                    <p className="text-xs text-stone-400 uppercase tracking-wider text-center md:text-left order-2 md:order-1">
                        © {new Date().getFullYear()} Agri Updates. All rights reserved.
                    </p>

                    <div className="flex gap-6 mt-0 md:mt-0 order-3 md:order-2">
                        <Link href="/privacy" className="text-xs text-stone-400 hover:text-black uppercase tracking-wider">Privacy Policy</Link>
                        <Link href="/terms" className="text-xs text-stone-400 hover:text-black uppercase tracking-wider">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
