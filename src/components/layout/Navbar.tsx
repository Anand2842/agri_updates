"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { PublicCategoryDescriptor } from '@/lib/public-categories';

type NavbarProps = {
    categories: PublicCategoryDescriptor[];
}

export default function Navbar({ categories }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentDate] = useState(() => new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }));

    const pathname = usePathname();
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: unknown, session: unknown) => {
            setUser((session as { user?: typeof user })?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        if (!searchQuery.trim()) return;

        setIsMenuOpen(false);
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    if (
        pathname?.startsWith('/admin') ||
        pathname?.startsWith('/login') ||
        pathname?.startsWith('/signup') ||
        pathname?.startsWith('/forgot-password')
    ) {
        return null;
    }

    const isActive = (href: string) => {
        if (href === '/updates') return pathname === '/updates';
        if (href === '/jobs') return pathname?.startsWith('/jobs');
        if (href === '/startups') return pathname?.startsWith('/startups');
        return pathname === href;
    };

    return (
        <>
            {/* Desktop Header */}
            <header className="hidden md:block sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="editorial-shell">
                    {/* Top utility row */}
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 text-[11px] font-medium text-slate-500">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Live Intelligence Desk
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>{currentDate}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {user ? (
                                <>
                                    <Link href="/admin/posts" className="hover:text-slate-900 font-semibold">Dashboard</Link>
                                    <button onClick={handleSignOut} className="hover:text-rose-600 font-medium">Sign Out</button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="hover:text-slate-900 font-semibold">Staff Login</Link>
                                    <Link href="/newsletter" className="font-semibold text-emerald-700 hover:text-emerald-800">Get Daily Alerts</Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Main branding and search bar */}
                    <div className="flex items-center justify-between py-3.5 gap-8">
                        <div className="flex items-center gap-6">
                            <Link href="/" className="group flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                                    A
                                </div>
                                <div>
                                    <span className="block font-black text-xl tracking-tight text-slate-900 leading-none">
                                        AGRI UPDATES
                                    </span>
                                    <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mt-0.5">
                                        Agriculture Intelligence & Careers
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Search input right in the center */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
                            <div className="relative flex items-center">
                                <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search news, ICAR grants, agritech jobs, tenders..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded-full text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-emerald-500/10 focus:shadow-sm"
                                />
                            </div>
                        </form>

                        {/* Action CTA */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/jobs"
                                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Post / Find Jobs
                            </Link>
                            <Link
                                href="/newsletter"
                                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all active:scale-95"
                            >
                                Subscribe Free
                            </Link>
                        </div>
                    </div>

                    {/* Category Navigation Pills */}
                    <nav className="flex items-center justify-between gap-4 py-2 border-t border-slate-100 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-1 text-xs font-medium">
                            {categories.map((category) => {
                                const active = isActive(category.href);
                                return (
                                    <Link
                                        key={category.href}
                                        href={category.href}
                                        className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                                            active
                                                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                    >
                                        {category.label}
                                    </Link>
                                );
                            })}
                        </div>
                        <Link
                            href="/updates"
                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 whitespace-nowrap"
                        >
                            All Sections →
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Mobile Sticky Header */}
            <div className="md:hidden sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                        <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-black text-sm">
                            A
                        </div>
                        <span className="text-lg font-black uppercase tracking-tight text-slate-900">AGRI UPDATES</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/search"
                            className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
                            aria-label="Search"
                        >
                            <Search className="h-4 w-4" />
                        </Link>
                        <button
                            className="rounded-full p-2 text-slate-700 hover:bg-slate-100"
                            onClick={() => setIsMenuOpen(true)}
                            aria-label="Open Menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-xs"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <div className={`md:hidden fixed inset-y-0 right-0 z-[70] w-[88%] max-w-[340px] transform bg-white shadow-2xl transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Sections</p>
                            <p className="text-xs text-slate-500">Agri Updates Editorial</p>
                        </div>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="rounded-full border border-slate-200 p-1.5 text-slate-600"
                            aria-label="Close Menu"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                        <form onSubmit={handleSearch} className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2">
                            <Search className="h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search all reporting & jobs..."
                                className="w-full bg-transparent px-2 text-xs text-slate-800 outline-none placeholder:text-slate-400"
                            />
                        </form>

                        <div className="space-y-1.5">
                            {categories.map((category) => {
                                const active = isActive(category.href);
                                return (
                                    <Link
                                        key={category.href}
                                        href={category.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center justify-between px-3.5 py-3 rounded-xl border transition-all ${
                                            active
                                                ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                                                : 'bg-white text-slate-800 border-slate-100 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div>
                                            <div className="text-sm font-medium">{category.label}</div>
                                            <div className={`text-[11px] mt-0.5 line-clamp-1 ${active ? 'text-slate-300' : 'text-slate-400'}`}>{category.description}</div>
                                        </div>
                                        <span className="text-xs opacity-50">→</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                        {user ? (
                            <div className="space-y-2">
                                <Link href="/admin/posts" onClick={() => setIsMenuOpen(false)} className="btn-secondary w-full text-center">Dashboard</Link>
                                <button onClick={() => { void handleSignOut(); setIsMenuOpen(false); }} className="w-full text-xs text-rose-600 font-semibold py-2">Sign Out</button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Link href="/newsletter" onClick={() => setIsMenuOpen(false)} className="btn-primary w-full text-center">Subscribe Free</Link>
                                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="btn-secondary w-full text-center">Staff Login</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
