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
        <header className="bg-white relative z-50">
            {/* Top Utility Bar */}
            <div className="hidden md:flex container mx-auto px-4 py-2 justify-between items-center text-[10px] uppercase tracking-[0.15em] text-stone-500 border-b border-stone-200">
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
            <div className="container mx-auto px-4 py-6 md:py-10 text-center border-b-2 border-black">
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-black uppercase" style={{ fontStretch: 'condensed' }}>
                        AGRI UPDATES
                    </h1>
                </Link>
            </div>

            {/* Category Navigation */}
            <nav className="border-b border-stone-200 bg-white overflow-x-auto">
                <div className="container mx-auto px-4">
                    {/* Desktop Nav */}
                    <div className="hidden md:flex flex-wrap justify-center items-center gap-x-1 py-3 text-[10px] font-bold tracking-[0.1em] uppercase text-stone-700">
                        {navCategories.map((cat, idx) => {
                            // Determine if this link is active
                            let isActive = false;
                            if (cat.href === '/jobs' && pathname === '/jobs') {
                                isActive = true;
                            } else if (cat.href === '/startups' && pathname === '/startups') {
                                isActive = true;
                            } else if (cat.href.startsWith('/updates')) {
                                const catParam = new URL(cat.href, 'http://a').searchParams.get('category');
                                isActive = pathname === '/updates' && currentCategory === catParam;
                            }

                            return (
                                <span key={cat.href} className="flex items-center">
                                    {idx > 0 && <span className="mx-2 text-stone-300">|</span>}
                                    <Link
                                        href={cat.href}
                                        className={`py-1 whitespace-nowrap transition-colors ${isActive ? 'text-agri-green border-b-2 border-agri-green' : 'hover:text-agri-green'}`}
                                    >
                                        {cat.label}
                                    </Link>
                                </span>
                            );
                        })}
                        <span className="mx-2 text-stone-300">|</span>
                        <Link href="/search" className="text-stone-400 hover:text-black p-1">
                            <Search className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Mobile Header */}
                    <div className="md:hidden flex items-center justify-between py-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{currentDate}</span>
                        <button
                            className="p-2 -mr-2 text-stone-600 hover:text-black"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-white overflow-y-auto animate-in slide-in-from-right">
                    <div className="p-4 flex justify-between items-center border-b border-stone-200">
                        <span className="font-bold text-xl">Menu</span>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex flex-col p-6">
                        {navCategories.map((cat) => (
                            <Link
                                key={cat.href}
                                href={cat.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="py-3 text-lg font-medium border-b border-stone-100 hover:text-agri-green"
                            >
                                {cat.label}
                            </Link>
                        ))}
                        <div className="mt-6 pt-6 border-t border-stone-200">
                            {user ? (
                                <>
                                    <Link href="/admin/posts" onClick={() => setIsMenuOpen(false)} className="block py-3 text-lg text-agri-green">Admin Dashboard</Link>
                                    <button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="block py-3 text-lg text-red-500">Sign Out</button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block py-3 text-lg text-stone-500">Login</Link>
                                    <Link href="/newsletter" onClick={() => setIsMenuOpen(false)} className="block py-3 text-lg text-agri-green font-bold">Subscribe</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
