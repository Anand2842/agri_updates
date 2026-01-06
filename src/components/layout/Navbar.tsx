"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const pathname = usePathname();

    // Hide Navbar on Admin pages
    if (pathname?.startsWith('/admin')) {
        return null;
    }

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
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    return (
        <header className="border-b border-stone-200 bg-white/90 backdrop-blur-md relative z-50 transition-all duration-300">
            {/* Top Bar */}
            <div className="hidden md:flex container mx-auto px-4 py-2 justify-between items-center text-xs font-sans text-stone-500 uppercase tracking-wider border-b border-stone-100">
                <div className="flex items-center gap-4">
                    <Link href="/about" className="hover:text-black">About</Link>
                    <Link href="/contact" className="hover:text-black">Connect With Us</Link>
                </div>
                <div>
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/admin/posts" className="hover:text-black font-bold text-agri-green">
                                Admin Dashboard
                            </Link>
                            <button onClick={handleSignOut} className="hover:text-red-500">
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="hover:text-black">Login</Link>
                    )}
                </div>
            </div>

            {/* Main Logo */}
            <div className="container mx-auto px-4 py-8 md:py-12 text-center border-b border-black">
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black tracking-tighter text-black uppercase transform scale-y-110">
                        AGRI UPDATES
                    </h1>
                </Link>
            </div>

            {/* Navigation */}
            <div className="border-b border-black/10 bg-white">
                <div className="container mx-auto px-4">
                    <nav className="hidden md:flex flex-wrap justify-center items-center gap-x-8 gap-y-3 py-4 text-[11px] font-bold tracking-widest uppercase text-stone-600 relative z-50">
                        {/* Opportunities Dropdown */}
                        <div className="group relative text-center">
                            <button className="hover:text-black flex items-center justify-center gap-1 py-2">
                                Opportunities
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 w-48">
                                <div className="bg-white border border-stone-100 shadow-xl rounded-lg p-2 flex flex-col gap-1 text-center -mt-2">
                                    <Link href="/jobs" className="px-4 py-2 hover:bg-stone-50 hover:text-agri-green rounded block">Jobs</Link>
                                    <Link href="/updates?category=Internships" className="px-4 py-2 hover:bg-stone-50 hover:text-agri-green rounded block">Internships</Link>
                                    <Link href="/updates?category=Fellowships" className="px-4 py-2 hover:bg-stone-50 hover:text-agri-green rounded block whitespace-nowrap">Fellowships</Link>
                                    <Link href="/updates?category=Scholarships" className="px-4 py-2 hover:bg-stone-50 hover:text-agri-green rounded block whitespace-nowrap">Scholarships</Link>
                                    <Link href="/updates?category=Grants" className="px-4 py-2 hover:bg-stone-50 hover:text-agri-green rounded block whitespace-nowrap">Grants</Link>
                                </div>
                            </div>
                        </div>

                        <Link href="/startups" className="hover:text-black hover:underline underline-offset-4 decoration-2 decoration-agri-green">Startups</Link>

                        {/* Resources Dropdown */}
                        <div className="group relative text-center">
                            <button className="hover:text-black flex items-center justify-center gap-1 py-2">
                                Resources
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 w-48">
                                <div className="bg-white border border-stone-100 shadow-xl rounded-lg p-2 flex flex-col gap-1 text-center -mt-2">
                                    <Link href="/updates?category=Exams" className="px-4 py-2 hover:bg-stone-50 hover:text-agri-green rounded block whitespace-nowrap">Exams</Link>
                                    <Link href="/updates?category=Events" className="px-4 py-2 hover:bg-stone-50 hover:text-agri-green rounded block whitespace-nowrap">Conferences</Link>
                                    <Link href="/blog" className="px-4 py-2 hover:bg-stone-50 hover:text-agri-green rounded block whitespace-nowrap">Blog & News</Link>
                                </div>
                            </div>
                        </div>

                        <Link href="/search" className="ml-4 text-stone-400 hover:text-black">
                            <Search className="w-4 h-4" />
                        </Link>
                    </nav>

                    {/* Mobile Header */}
                    <div className="md:hidden flex items-center justify-between py-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Menu</span>
                        <button
                            className="p-2 -mr-2 text-stone-600 hover:text-black"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-white overflow-y-auto animate-in slide-in-from-right">
                    <div className="p-4 flex justify-end">
                        <button onClick={() => setIsMenuOpen(false)} className="p-2">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex flex-col gap-6 p-8 text-center">
                        <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif font-bold">Home</Link>
                        <Link href="/jobs" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif">Job Opportunities</Link>
                        <Link href="/updates" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif">All Updates</Link>
                        <Link href="/startups" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif">Startups</Link>
                        <Link href="/about" onClick={() => setIsMenuOpen(false)} className="text-xl font-serif">About</Link>
                        <div className="border-t border-stone-100 my-4"></div>
                        {user ? (
                            <>
                                <Link href="/admin/posts" onClick={() => setIsMenuOpen(false)} className="text-lg font-serif text-agri-green">Admin Dashboard</Link>
                                <button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="text-lg font-serif text-red-500">Sign Out</button>
                            </>
                        ) : (
                            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-lg font-serif text-stone-500">Login</Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
