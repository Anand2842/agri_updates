"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { PublicCategoryDescriptor, getCategoryAccentClasses } from '@/lib/public-categories';

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

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
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

    const isHomePage = pathname === '/';

    const isActive = (href: string) => {
        if (href === '/updates') return pathname === '/updates';
        if (href === '/jobs') return pathname?.startsWith('/jobs');
        if (href === '/startups') return pathname?.startsWith('/startups');
        return pathname === href;
    };

    return (
        <>
            <header className="hidden md:block border-b border-stone-200 bg-[var(--color-paper-elevated)]/95 backdrop-blur-sm">
                <div className="editorial-shell">
                    <div className="flex items-center justify-between border-b border-stone-200 py-3 text-[11px] uppercase tracking-[0.24em] text-stone-500">
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-stone-700">Agri Updates</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="hidden lg:inline">{currentDate}</span>
                            {user ? (
                                <>
                                    <Link href="/admin/posts" className="hover:text-black">Dashboard</Link>
                                    <button onClick={handleSignOut} className="hover:text-[var(--color-vermilion)]">Sign Out</button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="hover:text-black">Login</Link>
                                    <Link href="/newsletter" className="font-semibold text-[var(--color-forest)] hover:text-black">Subscribe</Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={`grid gap-6 border-b border-stone-200 ${isHomePage ? 'grid-cols-[1fr_auto] py-10' : 'grid-cols-[auto_1fr_auto] items-center py-6'}`}>
                        <div className={isHomePage ? 'max-w-2xl' : ''}>
                            <Link href="/" className="block">
                                <h1 className={`${isHomePage ? 'text-6xl lg:text-7xl' : 'text-4xl lg:text-5xl'} font-black uppercase tracking-[-0.05em] text-[var(--color-graphite)]`}>
                                    AGRI UPDATES
                                </h1>
                            </Link>
                            {isHomePage ? (
                                <p className="mt-4 max-w-xl text-lg leading-7 text-stone-600">
                                    A calm, global desk for agriculture news, research, capital flows, careers, startup signals, and field warnings.
                                </p>
                            ) : (
                                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-stone-500">
                                    Markets, science, careers, and urgent notices from the agri ecosystem
                                </p>
                            )}
                        </div>

                        {isHomePage ? (
                            <div className="min-w-[280px] justify-self-end border-l border-stone-200 pl-8">
                                <p className="eyebrow-label mb-4">Today&apos;s Focus</p>
                                <div className="space-y-3 text-sm leading-6 text-stone-600">
                                    <p>Research pipelines, startup financing, and verified hiring.</p>
                                    <Link href="/updates" className="inline-flex items-center gap-2 font-semibold text-[var(--color-forest)] hover:text-black">
                                        View all updates
                                        <span aria-hidden="true">→</span>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSearch} className="mx-8 flex max-w-md items-center rounded-full border border-stone-300 bg-white px-4 py-2">
                                <Search className="h-4 w-4 text-stone-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search reporting, grants, jobs..."
                                    className="w-full bg-transparent px-3 py-1 text-sm text-stone-800 outline-none placeholder:text-stone-400"
                                />
                            </form>
                        )}
                    </div>

                    <nav className="flex items-center justify-between gap-6 py-4">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-700">
                            {categories.map((category) => (
                                <Link
                                    key={category.href}
                                    href={category.href}
                                    className={`border-b pb-1 transition-colors ${isActive(category.href)
                                        ? 'border-[var(--color-graphite)] text-[var(--color-graphite)]'
                                        : 'border-transparent hover:border-stone-400 hover:text-black'
                                    }`}
                                >
                                    {category.label}
                                </Link>
                            ))}
                        </div>
                        <Link href="/search" className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 transition-colors hover:text-black">
                            Search
                            <Search className="h-4 w-4" />
                        </Link>
                    </nav>
                </div>
            </header>

            <div className="md:hidden sticky top-0 z-50 border-b border-stone-200 bg-[var(--color-paper-elevated)]/95 backdrop-blur-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/" className="block" onClick={() => setIsMenuOpen(false)}>
                        <span className="block text-xl font-black uppercase tracking-[-0.05em] text-[var(--color-graphite)]">AGRI UPDATES</span>
                    </Link>

                    <button
                        className="rounded-full border border-stone-200 p-2 text-stone-700 transition-colors hover:bg-white"
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Open Menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <div className={`md:hidden fixed inset-y-0 right-0 z-[70] w-[88%] max-w-[360px] transform bg-[var(--color-paper-elevated)] shadow-2xl transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                        <div>
                            <p className="eyebrow-label mb-1">Sections</p>
                            <p className="text-sm text-stone-500">Browse the full public desk</p>
                        </div>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="rounded-full border border-stone-200 p-2 text-stone-600"
                            aria-label="Close Menu"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        <form onSubmit={handleSearch} className="mb-6 flex items-center rounded-full border border-stone-300 bg-white px-4 py-2">
                            <Search className="h-4 w-4 text-stone-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search reporting, grants, jobs..."
                                className="w-full bg-transparent px-3 py-1 text-sm text-stone-800 outline-none placeholder:text-stone-400"
                            />
                        </form>

                        <div className="mb-6 rounded-2xl border border-stone-200 bg-white px-4 py-4">
                            <p className="eyebrow-label mb-2">Today</p>
                            <p className="font-serif text-lg text-[var(--color-graphite)]">{currentDate}</p>
                        </div>

                        <div className="space-y-3">
                            {categories.map((category) => {
                                const accent = getCategoryAccentClasses(category.accent);
                                return (
                                    <Link
                                        key={category.href}
                                        href={category.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`block rounded-2xl border px-4 py-4 transition-colors ${isActive(category.href) ? accent.panel : 'border-stone-200 bg-white'}`}
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${accent.chip}`}>
                                                {category.surfaceType}
                                            </span>
                                            <span className="text-xs text-stone-400">{category.label}</span>
                                        </div>
                                        <h3 className={`mb-1 text-xl font-semibold ${accent.text}`}>{category.label}</h3>
                                        <p className="text-sm leading-6 text-stone-500">{category.description}</p>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="border-t border-stone-200 px-5 py-4">
                        <div className="mb-4 flex gap-2">
                            {user ? (
                                <>
                                    <Link href="/admin/posts" onClick={() => setIsMenuOpen(false)} className="btn-secondary w-full text-center">Dashboard</Link>
                                    <button onClick={() => { void handleSignOut(); setIsMenuOpen(false); }} className="btn-secondary w-full text-center">Sign Out</button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="btn-secondary w-full text-center">Login</Link>
                                    <Link href="/newsletter" onClick={() => setIsMenuOpen(false)} className="btn-primary w-full text-center">Subscribe</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
