'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, Linkedin, Twitter } from 'lucide-react';
import { getAllHubs } from '@/lib/hubs';
import { PublicCategoryDescriptor } from '@/lib/public-categories';

type FooterProps = {
    categories: PublicCategoryDescriptor[];
};

function AccordionItem({
    title,
    children,
    id,
    isOpen,
    onToggle,
}: {
    title: string;
    children: React.ReactNode;
    id: string;
    isOpen: boolean;
    onToggle: (id: string) => void;
}) {
    return (
        <div className="border-b border-slate-200 md:border-none">
            <button
                onClick={() => onToggle(id)}
                className="flex w-full items-center justify-between py-3 md:cursor-default md:py-0"
            >
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 md:mb-4">{title}</h4>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform md:hidden ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 md:h-auto ${isOpen ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 opacity-0 md:max-h-none md:opacity-100'}`}>
                {children}
            </div>
        </div>
    );
}

export default function Footer({ categories }: FooterProps) {
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

    return (
        <footer className="mt-16 border-t border-slate-200 bg-white">
            <div className="editorial-shell py-12 md:py-16">
                <div className="grid gap-10 md:grid-cols-12 pb-12 border-b border-slate-200">
                    {/* Brand column */}
                    <div className="md:col-span-4">
                        <Link href="/" className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-black text-base">
                                A
                            </div>
                            <span className="font-black text-xl tracking-tight text-slate-900">
                                AGRI UPDATES
                            </span>
                        </Link>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-sm mb-6">
                            India&apos;s premier intelligence, career, and research platform for agriculture, agribusiness, and AgriTech startups.
                        </p>
                        <div className="flex items-center gap-3">
                            <a
                                href="https://twitter.com/AgriUpdates"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Twitter"
                                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-400 transition-colors"
                            >
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a
                                href="https://linkedin.com/company/agriupdates"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-400 transition-colors"
                            >
                                <Linkedin className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Coverage Columns */}
                    <div className="md:col-span-3">
                        <AccordionItem
                            title="Editorial Desks"
                            id="desks"
                            isOpen={openSection === 'desks'}
                            onToggle={(id) => setOpenSection(openSection === id ? null : id)}
                        >
                            <ul className="space-y-2.5 text-xs text-slate-600">
                                <li><Link href="/updates" className="hover:text-emerald-800 transition-colors font-medium">All Coverage Feed</Link></li>
                                {categories.map((c) => (
                                    <li key={c.href}>
                                        <Link href={c.href} className="hover:text-emerald-800 transition-colors">
                                            {c.label} Desk
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </AccordionItem>
                    </div>

                    <div className="md:col-span-3">
                        <AccordionItem
                            title="Careers & Hubs"
                            id="hubs"
                            isOpen={openSection === 'hubs'}
                            onToggle={(id) => setOpenSection(openSection === id ? null : id)}
                        >
                            <ul className="space-y-2.5 text-xs text-slate-600">
                                <li><Link href="/jobs" className="font-semibold text-emerald-800 hover:underline">Browse All Openings</Link></li>
                                {getAllHubs().slice(0, 5).map((hub) => (
                                    <li key={hub.slug}>
                                        <Link href={`/${hub.slug}`} className="hover:text-emerald-800 transition-colors">
                                            {hub.title.split(' - ')[0]}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </AccordionItem>
                    </div>

                    <div className="md:col-span-2">
                        <AccordionItem
                            title="Organization"
                            id="company"
                            isOpen={openSection === 'company'}
                            onToggle={(id) => setOpenSection(openSection === id ? null : id)}
                        >
                            <ul className="space-y-2.5 text-xs text-slate-600">
                                <li><Link href="/about" className="hover:text-slate-900 transition-colors">About Us</Link></li>
                                <li><Link href="/contact" className="hover:text-slate-900 transition-colors">Contact Editorial</Link></li>
                                <li><Link href="/editorial-guidelines" className="hover:text-slate-900 transition-colors">Editorial Standards</Link></li>
                                <li><Link href="/corrections" className="hover:text-slate-900 transition-colors">Corrections Policy</Link></li>
                                <li><Link href="/disclaimer" className="hover:text-slate-900 transition-colors">Disclaimer</Link></li>
                                <li><Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link></li>
                            </ul>
                        </AccordionItem>
                    </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                    <p>© {new Date().getFullYear()} Agri Updates. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link href="/rss" className="hover:text-slate-600 transition-colors">RSS Feed</Link>
                        <span>•</span>
                        <Link href="/sitemap.xml" className="hover:text-slate-600 transition-colors">Sitemap</Link>
                        <span>•</span>
                        <Link href="/login" className="hover:text-slate-600 transition-colors">Staff Access</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
