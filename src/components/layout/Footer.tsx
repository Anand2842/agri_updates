'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, Linkedin, Twitter } from 'lucide-react';
import { getAllHubs } from '@/lib/hubs';
import { PublicCategoryDescriptor, getCategoryAccentClasses } from '@/lib/public-categories';

type FooterProps = {
    categories: PublicCategoryDescriptor[];
}

function AccordionItem({
    title,
    children,
    id,
    isOpen,
    onToggle,
}: {
    title: string
    children: React.ReactNode
    id: string
    isOpen: boolean
    onToggle: (id: string) => void
}) {
    return (
        <div className="border-b border-stone-200 md:border-none">
            <button
                onClick={() => onToggle(id)}
                className="flex w-full items-center justify-between py-4 md:cursor-default md:py-0"
            >
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-700 md:mb-5">{title}</h4>
                <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform md:hidden ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 md:h-auto ${isOpen ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 opacity-0 md:max-h-none md:opacity-100'}`}>
                {children}
            </div>
        </div>
    )
}

export default function Footer({ categories }: FooterProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [openSection, setOpenSection] = useState<string | null>(null);

    const pathname = usePathname();

    if (
        pathname?.startsWith('/admin') ||
        pathname?.startsWith('/login') ||
        pathname?.startsWith('/signup') ||
        pathname?.startsWith('/forgot-password')
    ) {
        return null;
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

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

    return (
        <footer className="mt-20 border-t border-stone-200 bg-[var(--color-paper-elevated)]">
            <div className="editorial-shell py-12 md:py-16">
                <div className="mb-10 grid gap-10 border-b border-stone-200 pb-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
                    <div>
                        <p className="eyebrow-label mb-4">Agri Updates</p>
                        <h3 className="max-w-sm text-3xl font-semibold text-[var(--color-graphite)]">International agriculture coverage with regional relevance.</h3>
                        <p className="mt-4 max-w-md text-sm leading-7 text-stone-600">
                            Follow policy moves, research pipelines, funding signals, startup momentum, hiring, and urgent field notices from one editorial desk.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <a href="https://twitter.com/AgriUpdates" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="rounded-full border border-stone-300 p-2 text-stone-600 transition-colors hover:border-stone-500 hover:text-black"><Twitter className="h-4 w-4" /></a>
                            <a href="https://linkedin.com/company/agriupdates" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="rounded-full border border-stone-300 p-2 text-stone-600 transition-colors hover:border-stone-500 hover:text-black"><Linkedin className="h-4 w-4" /></a>
                        </div>
                    </div>

                    <div>
                        <AccordionItem title="Navigate" id="navigate" isOpen={openSection === 'navigate'} onToggle={(id) => setOpenSection(openSection === id ? null : id)}>
                            <ul className="space-y-3 text-sm text-stone-600">
                                <li><Link href="/updates" className="transition-colors hover:text-black">All Updates</Link></li>
                                <li><Link href="/about" className="transition-colors hover:text-black">About</Link></li>
                                <li><Link href="/contact" className="transition-colors hover:text-black">Contact</Link></li>
                                <li><Link href="/disclaimer" className="transition-colors hover:text-black">Disclaimer</Link></li>
                            </ul>
                        </AccordionItem>
                    </div>

                    <div>
                        <AccordionItem title="Coverage" id="coverage" isOpen={openSection === 'coverage'} onToggle={(id) => setOpenSection(openSection === id ? null : id)}>
                            <div className="flex flex-col gap-3">
                                {categories.map((category) => {
                                    const accent = getCategoryAccentClasses(category.accent);
                                    return (
                                        <Link
                                            key={category.href}
                                            href={category.href}
                                            className={`rounded-2xl border px-3 py-3 transition-colors hover:border-stone-400 ${accent.panel}`}
                                        >
                                            <div className="mb-1 flex items-center justify-between">
                                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${accent.chip}`}>
                                                    {category.label}
                                                </span>
                                            </div>
                                            <p className="text-xs leading-5 text-stone-600">{category.description}</p>
                                        </Link>
                                    );
                                })}
                            </div>
                        </AccordionItem>
                    </div>

                    <div>
                        <AccordionItem title="Job Collections" id="collections" isOpen={openSection === 'collections'} onToggle={(id) => setOpenSection(openSection === id ? null : id)}>
                            <ul className="space-y-3 text-sm text-stone-600">
                                {getAllHubs().slice(0, 5).map((hub) => (
                                    <li key={hub.slug}>
                                        <Link href={`/${hub.slug}`} className="transition-colors hover:text-black">
                                            {hub.title.split(' - ')[0]}
                                        </Link>
                                    </li>
                                ))}
                                <li><Link href="/jobs" className="font-semibold text-[var(--color-forest)] transition-colors hover:text-black">View All Jobs</Link></li>
                            </ul>
                        </AccordionItem>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-[1.2fr_auto] md:items-end">
                    <div>
                        <p className="eyebrow-label mb-3">Newsletter</p>
                        <h4 className="text-2xl font-semibold text-[var(--color-graphite)]">Get the daily agriculture briefing.</h4>
                        <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600">
                            A concise digest of jobs, research, capital, startups, and urgent warnings.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid gap-3 md:min-w-[360px]">
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Email address"
                            className="rounded-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-stone-500"
                            disabled={status === 'loading'}
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="rounded-full bg-[var(--color-forest)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--color-graphite)] disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                        </button>
                        <label className="flex items-start gap-2 text-xs leading-5 text-stone-500">
                            <input
                                type="checkbox"
                                checked={privacyAccepted}
                                onChange={(event) => setPrivacyAccepted(event.target.checked)}
                                className="mt-1"
                            />
                            <span>I agree to the privacy policy and want editorial updates by email.</span>
                        </label>
                        {message && (
                            <p className={`text-xs ${status === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {message}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </footer>
    );
}
