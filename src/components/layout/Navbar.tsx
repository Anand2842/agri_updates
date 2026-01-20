"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
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

    // Get current date for newspaper-style header
    const currentDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

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

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
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


            {/* --- MOBILE HEADER & NAV --- */}
            <div className="md:hidden">
                {/* 1. Main Mobile Header (Logo + Actions) */}
                <header className="bg-white border-b border-stone-200 px-4 py-3 sticky top-0 z-50 flex justify-between items-center">
                    {/* Left: Hamburger */}
                    <button
                        className="p-1 -ml-1 text-stone-800"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    {/* Center: Brand */}
                    <Link href="/" onClick={() => setIsMenuOpen(false)}>
                        <h1 className="text-2xl font-black tracking-tight text-black uppercase" style={{ fontStretch: 'condensed' }}>
                            AGRI UPDATES
                        </h1>
                    </Link>

                    {/* Right: Search */}
                    <Link href="/search" className="p-1 -mr-1 text-stone-800">
                        <Search className="w-5 h-5" />
                    </Link>
                </header>

                {/* 2. Mobile Sub-Nav (Horizontal Scroll) */}
                <div className="bg-white border-b border-stone-200 sticky top-[57px] z-40 overflow-x-auto no-scrollbar">
                    <div className="flex px-4 py-2 gap-6 min-w-max">
                        {navCategories.map((cat) => {
                            let isActive = false;
                            if (cat.href === '/jobs' && pathname === '/jobs') isActive = true;
                            else if (cat.href === '/startups' && pathname === '/startups') isActive = true;
                            else if (cat.href.startsWith('/updates')) {
                                const catParam = new URL(cat.href, 'http://a').searchParams.get('category');
                                isActive = pathname === '/updates' && currentCategory === catParam;
                            }

                            return (
                                <Link
                                    key={cat.href}
                                    href={cat.href}
                                    className={`text-[11px] font-bold uppercase tracking-widest whitespace-nowrap py-1 ${isActive ? 'text-agri-green border-b-2 border-agri-green' : 'text-stone-500'}`}
                                >
                                    {cat.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>


            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 top-[57px] z-50 bg-white overflow-y-auto animate-in slide-in-from-left duration-200">
                    <div className="flex flex-col p-6 pb-24">
                        <div className="mb-8 p-4 bg-stone-50 rounded-lg">
                            <span className="text-xs font-bold uppercase tracking-widest text-stone-500 block mb-1">Today</span>
                            <span className="font-serif text-lg text-stone-800">{currentDate}</span>
                        </div>

                        {navCategories.map((cat) => (
                            <Link
                                key={cat.href}
                                href={cat.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="py-4 text-xl font-bold text-stone-800 border-b border-stone-100 hover:text-agri-green"
                            >
                                {cat.label}
                            </Link>
                        ))}

                        <div className="mt-8 pt-6 border-t border-stone-200 flex flex-col gap-4">
                            {user ? (
                                <>
                                    <Link href="/admin/posts" onClick={() => setIsMenuOpen(false)} className="py-3 px-4 bg-stone-100 rounded-lg text-center font-bold text-stone-800">Admin Dashboard</Link>
                                    <button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="py-3 px-4 border border-red-200 text-red-600 rounded-lg font-bold">Sign Out</button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="py-3 px-4 border border-stone-300 rounded-lg text-center font-bold text-stone-600">Login</Link>
                                    <Link href="/newsletter" onClick={() => setIsMenuOpen(false)} className="py-3 px-4 bg-agri-green text-white rounded-lg text-center font-bold shadow-md">Subscribe Free</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
