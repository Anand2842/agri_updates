"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X, ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const supabase = createClient();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category');

    const [currentDate, setCurrentDate] = useState<string>('');
    // Search state for mobile drawer
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }));
    }, []);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsMenuOpen(false);
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    // Hide Navbar on Admin pages
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    const navCategories = [
        { label: 'Job Opportunities', href: '/jobs' },
        { label: 'Internships', href: '/updates?category=Internships' },
        { label: 'Fellowships', href: '/updates?category=Fellowships' },
        { label: 'Scholarships', href: '/updates?category=Scholarships' },
        { label: 'Grants & Funding', href: '/updates?category=Grants' },
        { label: 'Startups', href: '/startups' },
        { label: 'Exams', href: '/updates?category=Exams' },
        { label: 'Conferences & Events', href: '/updates?category=Events' },
        { label: 'Warnings', href: '/updates?category=Warnings' },
    ];

    return (
        <>
            {/* --- DESKTOP HEADER --- */}
            <header className="hidden md:block bg-white relative z-50">
                {/* Top Utility Bar */}
                <div className="container mx-auto px-4 py-2 flex justify-between items-center text-[10px] uppercase tracking-[0.15em] text-stone-500 border-b border-stone-200">
                    <span className="font-medium">{currentDate}</span>
                    <div className="flex items-center gap-6">
                        {user ? (
                            <>
                                <Link href="/admin/posts" className="hover:text-black font-bold text-agri-green">
                                    Dashboard
                                </Link>
                                <button onClick={handleSignOut} className="hover:text-red-500">
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="hover:text-black">Login</Link>
                                <Link href="/newsletter" className="hover:text-black font-bold text-agri-green">Subscribe</Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Masthead */}
                <div className="container mx-auto px-4 py-10 text-center border-b-2 border-black">
                    <Link href="/" onClick={() => setIsMenuOpen(false)}>
                        <h1 className="text-6xl lg:text-7xl font-black tracking-tight text-black uppercase" style={{ fontStretch: 'condensed' }}>
                            AGRI UPDATES
                        </h1>
                    </Link>
                </div>

                {/* Desktop Sticky Nav */}
                <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/50 shadow-sm transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
                    <div className="container mx-auto px-4 flex justify-center items-center gap-x-1 py-3 text-[10px] font-bold tracking-[0.15em] uppercase text-stone-700">
                        {navCategories.map((cat, idx) => {
                            let isActive = false;
                            if (cat.href === '/jobs' && pathname === '/jobs') isActive = true;
                            else if (cat.href === '/startups' && pathname === '/startups') isActive = true;
                            else if (cat.href.startsWith('/updates')) {
                                const catParam = new URL(cat.href, 'http://a').searchParams.get('category');
                                isActive = pathname === '/updates' && currentCategory === catParam;
                            }

                            return (
                                <span key={cat.href} className="flex items-center">
                                    {idx > 0 && <span className="mx-3 text-stone-300 font-light">|</span>}
                                    <Link
                                        href={cat.href}
                                        className={`relative group py-1 whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-agri-green' : 'hover:text-agri-green text-stone-600'}`}
                                    >
                                        {cat.label}
                                        <span className={`absolute -bottom-1 left-0 h-0.5 bg-agri-green transition-all duration-300 ease-out ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                                    </Link>
                                </span>
                            );
                        })}
                        <span className="mx-3 text-stone-300 font-light">|</span>
                        <Link href="/search" className="text-stone-400 hover:text-agri-green p-1 transition-colors duration-300">
                            <Search className="w-4 h-4" />
                        </Link>
                    </div>
                </nav>
            </header>


            {/* --- MOBILE HEADER & NAV (Redesigned) --- */}
            <div className="md:hidden">
                {/* 1. Main Mobile Header (Logo + Hamburger) */}
                <header
                    className="flex justify-between items-center px-4 sticky top-0 z-50 transition-all border-b border-[#eee]"
                    style={{
                        height: '60px',
                        backgroundColor: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)', // Safari support
                    }}
                >
                    {/* Left: Brand */}
                    <Link href="/" onClick={() => setIsMenuOpen(false)}>
                        <h1 className="text-xl font-black tracking-tight text-black uppercase" style={{ fontStretch: 'condensed' }}>
                            AGRI UPDATES
                        </h1>
                    </Link>

                    {/* Right: Hamburger */}
                    <button
                        className="p-2 -mr-2 text-stone-800 hover:bg-stone-100/50 rounded-full transition-colors active:scale-95"
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Open Menu"
                    >
                        <Menu className="w-6 h-6 stroke-[2.5]" />
                    </button>
                </header>

                {/* NOTE: Horizontal Sub-nav Removed per playbooks instructions for cleaner look */}
            </div>


            {/* --- MOBILE DRAWER MENU (Slide from Right) --- */}
            {/* Backdrop */}
            {isMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Side Drawer */}
            <div
                className={`md:hidden fixed top-0 right-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Drawer Header */}
                <div className="flex justify-between items-center p-4 border-b border-stone-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Menu</span>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2 -mr-2 text-stone-500 hover:text-black rounded-full hover:bg-stone-100 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-white p-5">

                    {/* Search in Drawer */}
                    <form onSubmit={handleSearch} className="mb-8 relative">
                        <input
                            type="text"
                            placeholder="Search updates..."
                            className="w-full h-12 pl-4 pr-10 bg-stone-50 border border-stone-200 rounded-lg text-base text-stone-800 focus:border-agri-green focus:ring-1 focus:ring-agri-green/20 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-agri-green">
                            <Search className="w-5 h-5" />
                        </button>
                    </form>

                    {/* Date Display */}
                    <div className="mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Today</span>
                        <span className="font-serif text-lg font-medium text-stone-800">{currentDate}</span>
                    </div>

                    {/* Primary Links */}
                    <div className="space-y-1 mb-8">
                        <Link
                            href="/"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center justify-between w-full h-[48px] border-b border-stone-100 text-lg font-bold text-stone-800 group"
                        >
                            Home
                            <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-agri-green transition-colors" />
                        </Link>

                        {/* Grouped Links */}
                        <div className="py-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-3">Explore</span>
                            {navCategories.map((cat) => (
                                <Link
                                    key={cat.href}
                                    href={cat.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-between w-full h-[48px] border-b border-stone-100 text-base font-medium text-stone-600 hover:text-agri-green hover:pl-2 transition-all duration-200 group"
                                >
                                    {cat.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* User Actions */}
                    <div className="flex flex-col gap-3 pb-8">
                        {user ? (
                            <>
                                <Link href="/admin/posts" onClick={() => setIsMenuOpen(false)} className="btn-secondary text-center w-full">Dashboard</Link>
                                <button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="h-[48px] flex items-center justify-center border border-red-200 text-red-600 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-red-50 transition-colors">Sign Out</button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="btn-secondary text-center w-full min-h-[48px] flex items-center justify-center">Login</Link>
                                <Link href="/newsletter" onClick={() => setIsMenuOpen(false)} className="btn-primary text-center w-full shadow-lg min-h-[48px] flex items-center justify-center">Subscribe Free</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
