"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Menu, Search, X, ArrowRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { PublicCategoryDescriptor } from '@/lib/public-categories';

type NavbarProps = {
    categories: PublicCategoryDescriptor[];
}

export default function Navbar({ categories }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentDate] = useState(() => new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }));
    const [isScrolled, setIsScrolled] = useState(false);

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

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 180);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        if (!searchQuery.trim()) return;

        setIsMenuOpen(false);
        setIsMobileSearchOpen(false);
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
            {/* ======================================================== */}
            {/* 1. DESKTOP FULL STATIC HEADER (In Normal Document Flow)  */}
            {/* ======================================================== */}
            <header className="hidden md:block bg-white border-b border-slate-200/80">
                <div className="editorial-shell">
                    {/* Top utility row */}
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 text-[11px] font-medium text-slate-500">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold">
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
                    <div className="flex items-center justify-between gap-8 py-5">
                        <div className="flex items-center gap-6">
                            <Link href="/" className="group flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center text-white font-black text-2xl shadow-sm group-hover:scale-[1.02] transition-transform">
                                    A
                                </div>
                                <div>
                                    <span className="block font-black text-[22px] tracking-tight text-slate-900 leading-none mb-1">
                                        AGRI UPDATES
                                    </span>
                                    <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 leading-none">
                                        Agriculture Intelligence & Careers
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Search input right in the center */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
                            <div className="relative flex items-center">
                                <Search className="absolute left-4 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search news, ICAR grants, agritech jobs, tenders..."
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded-full text-[13px] text-slate-900 placeholder:text-slate-500 outline-none transition-all focus:ring-4 focus:ring-emerald-500/10 focus:shadow-sm shadow-inner"
                                />
                            </div>
                        </form>

                        {/* Action CTA */}
                        <div className="flex items-center gap-4">
                            <Link
                                href="/jobs"
                                className="px-4 py-2 text-[13px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors tracking-wide"
                            >
                                Post / Find Jobs
                            </Link>
                            <Link
                                href="/newsletter"
                                className="px-5 py-2 text-[13px] font-bold uppercase tracking-wider text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all active:scale-95"
                            >
                                Subscribe Free
                            </Link>
                        </div>
                    </div>

                    {/* Category Navigation Bar */}
                    <nav className="flex items-center justify-between gap-4 py-2.5 border-t border-slate-100 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-1 text-[13px] font-semibold">
                            <Link
                                href="/updates"
                                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                                    isActive('/updates')
                                        ? 'text-emerald-700 bg-emerald-50'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                                All Updates
                            </Link>
                            {categories.map((category) => {
                                const active = isActive(category.href);
                                return (
                                    <Link
                                        key={category.href}
                                        href={category.href}
                                        className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                                            active
                                                ? 'text-emerald-700 bg-emerald-50'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                        }`}
                                    >
                                        {category.label}
                                    </Link>
                                );
                            })}
                        </div>
                        <Link
                            href="/updates"
                            className="text-[12px] font-bold text-slate-400 hover:text-emerald-700 whitespace-nowrap transition-colors"
                        >
                            All Sections →
                        </Link>
                    </nav>
                </div>
            </header>

            {/* ======================================================== */}
            {/* 2. DESKTOP STICKY COMPACT HEADER (Appears Only on Scroll) */}
            {/* ======================================================== */}
            <div
                className={`hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-transform duration-300 ${
                    isScrolled ? 'translate-y-0' : '-translate-y-full pointer-events-none'
                }`}
            >
                <div className="editorial-shell flex items-center justify-between h-14 gap-6">
                    {/* Compact Logo */}
                    <Link href="/" className="flex items-center gap-2.5 shrink-0 pr-4 border-r border-slate-200">
                        <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-black text-xs shadow-sm">
                            A
                        </div>
                        <span className="font-black text-sm tracking-tight text-slate-900">
                            AGRI UPDATES
                        </span>
                    </Link>

                    {/* Navigation Pills */}
                    <nav className="flex items-center gap-1 text-xs font-semibold overflow-x-auto no-scrollbar flex-1">
                        <Link
                            href="/updates"
                            className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                                isActive('/updates') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            All
                        </Link>
                        {categories.map((category) => {
                            const active = isActive(category.href);
                            return (
                                <Link
                                    key={category.href}
                                    href={category.href}
                                    className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                                        active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    {category.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 shrink-0">
                        <form onSubmit={handleSearch} className="relative hidden lg:block w-48">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search..."
                                className="w-full pl-8 pr-3 py-1 bg-slate-100 rounded-full text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                            />
                        </form>
                        <Link
                            href="/newsletter"
                            className="px-3.5 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-all shadow-xs"
                        >
                            Subscribe
                        </Link>
                    </div>
                </div>
            </div>

            {/* ======================================================== */}
            {/* 3. MOBILE HEADER (Clean Single Masthead + Search)        */}
            {/* ======================================================== */}
            <header className="md:hidden sticky top-0 z-50 bg-white border-b border-slate-200/90 shadow-2xs">
                {/* Top Branding Row */}
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsMenuOpen(false)}>
                        <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-black text-base shadow-xs">
                            A
                        </div>
                        <div>
                            <span className="block text-base font-black tracking-tight text-slate-900 leading-none">
                                AGRI UPDATES
                            </span>
                            <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                                India Editorial
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg active:bg-slate-100 transition-colors"
                            aria-label="Toggle Search"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            className="p-2 text-slate-700 hover:text-slate-900 rounded-lg active:bg-slate-100 transition-colors"
                            onClick={() => setIsMenuOpen(true)}
                            aria-label="Open Navigation Menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Mobile Full-Width Search Input (Collapsible or toggleable) */}
                <div className={`px-4 pb-3 transition-all duration-200 ${isMobileSearchOpen ? 'block' : 'hidden'}`}>
                    <form onSubmit={handleSearch} className="relative flex items-center">
                        <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search news, grants, jobs..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 text-xs text-slate-900 placeholder:text-slate-500 rounded-lg outline-none border border-slate-200 focus:border-emerald-600 focus:bg-white transition-all"
                            autoFocus={isMobileSearchOpen}
                        />
                    </form>
                </div>
            </header>

            {/* ======================================================== */}
            {/* 4. MOBILE DRAWER MENU                                    */}
            {/* ======================================================== */}
            {isMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-xs transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <div className={`md:hidden fixed inset-y-0 right-0 z-[70] w-[85%] max-w-[320px] transform bg-white shadow-2xl transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex h-full flex-col">
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-emerald-700 flex items-center justify-center text-white font-black text-xs">
                                A
                            </div>
                            <span className="font-black text-xs uppercase tracking-wider text-slate-800">Sections</span>
                        </div>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="rounded-full p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            aria-label="Close Menu"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Drawer Search & Categories */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                        <form onSubmit={handleSearch} className="relative flex items-center">
                            <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search articles & jobs..."
                                className="w-full pl-9 pr-3 py-2 bg-slate-100 text-xs text-slate-800 rounded-lg outline-none border border-transparent focus:border-emerald-600 focus:bg-white"
                            />
                        </form>

                        <div className="space-y-1">
                            <Link
                                href="/updates"
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                    isActive('/updates')
                                        ? 'bg-emerald-700 text-white'
                                        : 'text-slate-800 hover:bg-slate-100'
                                }`}
                            >
                                <span>All Updates</span>
                                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                            </Link>

                            {categories.map((category) => {
                                const active = isActive(category.href);
                                return (
                                    <Link
                                        key={category.href}
                                        href={category.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                            active
                                                ? 'bg-emerald-700 text-white'
                                                : 'text-slate-800 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span>{category.label}</span>
                                        <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Drawer Footer Actions */}
                    <div className="border-t border-slate-100 px-5 py-4 bg-slate-50 space-y-2">
                        {user ? (
                            <>
                                <Link href="/admin/posts" onClick={() => setIsMenuOpen(false)} className="block w-full py-2.5 text-center text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg shadow-2xs">
                                    Dashboard
                                </Link>
                                <button onClick={() => { void handleSignOut(); setIsMenuOpen(false); }} className="w-full text-xs text-rose-600 font-semibold py-2">
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/newsletter" onClick={() => setIsMenuOpen(false)} className="block w-full py-2.5 text-center text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm">
                                    Subscribe Free
                                </Link>
                                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block w-full py-2 text-center text-xs font-semibold text-slate-600 hover:text-slate-900">
                                    Staff Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
