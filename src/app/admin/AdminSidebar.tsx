"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Briefcase,
    FileText,
    Star,
    Zap,
    Settings,
    Menu,
    X,
    Wand2,
    Plus,
    TrendingUp,
    Eye,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Tag,
    Users,
    UserCheck,
    DollarSign,
    AlertTriangle,
    Calendar,
    BarChart3,
    Megaphone,
    Building2,
    UserPlus,
    FlaskConical,
    Crown,
    MoreHorizontal,
    type LucideIcon,
} from 'lucide-react';

import type { User } from '@supabase/supabase-js';

interface AdminSidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    user: User | null;
    role?: string;
}

type MenuItemType = {
    name: string;
    icon: LucideIcon;
    href: string;
    adminOnly?: boolean;
}

type MenuSection = {
    section: string;
    adminOnly?: boolean;
    items: MenuItemType[];
}

export default function AdminSidebar({ isCollapsed, toggleCollapse, user, role = 'user' }: AdminSidebarProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();

    // Get initials and name
    const email = user?.email || '';
    const name = user?.user_metadata?.full_name || email.split('@')[0] || 'Admin';
    const initials = name.slice(0, 2).toUpperCase();

    // ─── New 6-section IA ───
    const rawMenuItems: MenuSection[] = [
        {
            section: 'Newsroom',
            items: [
                { name: 'Home', icon: Home, href: '/admin' },
                { name: 'Review', icon: Eye, href: '/admin/review' },
                { name: 'Calendar', icon: Calendar, href: '/admin/calendar' },
            ]
        },
        {
            section: 'Content',
            items: [
                { name: 'Stories', icon: FileText, href: '/admin/posts' },
                { name: 'Jobs', icon: Briefcase, href: '/admin/jobs' },
                { name: 'Startups', icon: Zap, href: '/admin/startups' },
                { name: 'Research', icon: FlaskConical, href: '/admin/research' },
                { name: 'Grants & Funding', icon: DollarSign, href: '/admin/posts?category=Grants' },
                { name: 'Warnings', icon: AlertTriangle, href: '/admin/posts?category=Warnings' },
            ]
        },
        {
            section: 'Discovery',
            items: [
                { name: 'Featured', icon: Crown, href: '/admin/posts?is_featured=true' },
                { name: 'Hero & Highlights', icon: Star, href: '/admin/posts?display=hero' },
                { name: 'Trending', icon: TrendingUp, href: '/admin/posts?display=trending' },
                { name: 'Categories', icon: Tag, href: '/admin/categories', adminOnly: true },
            ]
        },
        {
            section: 'People',
            items: [
                { name: 'Authors', icon: Users, href: '/admin/authors', adminOnly: true },
                { name: 'Companies', icon: Building2, href: '/admin/companies' },
                { name: 'Applicants', icon: UserPlus, href: '/admin/applicants' },
                { name: 'Team', icon: UserCheck, href: '/admin/team', adminOnly: true },
            ]
        },
        {
            section: 'Business',
            items: [
                { name: 'Analytics', icon: BarChart3, href: '/admin/dashboard' },
                { name: 'Ads', icon: Megaphone, href: '/admin/ads' },
            ]
        },
        {
            section: 'System',
            adminOnly: true,
            items: [
                { name: 'Settings', icon: Settings, href: '/admin/settings' },
            ]
        }
    ];

    // Filter based on role
    const menuItems = rawMenuItems
        .filter(group => role === 'admin' || !group.adminOnly)
        .map(group => ({
            ...group,
            items: group.items.filter(item => role === 'admin' || !item.adminOnly)
        }))
        .filter(group => group.items.length > 0);

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        if (href.includes('?')) return pathname === href.split('?')[0] && typeof window !== 'undefined' && window.location.search.includes(href.split('?')[1]);
        return pathname?.startsWith(href) || false;
    };

    const renderSidebarContent = (collapsed = false) => (
        <div className={`flex flex-col h-full transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
            style={{ background: 'var(--admin-surface)', borderRight: '1px solid var(--admin-border)' }}>
            {/* Header */}
            <div className={`h-14 flex items-center shrink-0 ${collapsed ? 'justify-center' : 'px-5'}`}>
                {collapsed ? (
                    <button
                        onClick={toggleCollapse}
                        className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                        title="Expand Sidebar"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <>
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 flex-shrink-0 bg-stone-900 rounded-lg flex items-center justify-center text-white">
                                <span className="font-serif font-bold text-sm leading-none">A</span>
                            </div>
                            <span className="font-serif font-bold text-base tracking-tight text-stone-900 leading-none truncate">Agri Updates</span>
                        </div>
                        <button
                            onClick={toggleCollapse}
                            className="ml-auto w-7 h-7 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                            title="Collapse Sidebar"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                    </>
                )}
                {!collapsed && (
                    <button onClick={() => setIsMobileOpen(false)} className="md:hidden ml-2 text-stone-400 hover:text-stone-900">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* + New Story Button */}
            <div className={`px-3 mb-2 ${collapsed ? 'flex justify-center' : ''}`}>
                <Link
                    href="/admin/posts/new"
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-[0.97] ${
                        collapsed
                            ? 'w-10 h-10 rounded-lg bg-stone-900 text-white hover:bg-stone-800'
                            : 'w-full px-4 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                    title={collapsed ? '+ New Story' : ''}
                >
                    <Plus className="w-4 h-4" />
                    {!collapsed && <span>New Story</span>}
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-grow px-3 py-1 space-y-0.5 overflow-y-auto overflow-x-hidden">
                {menuItems.map((group, idx) => (
                    <div key={idx} className={`mb-4 ${collapsed ? 'flex flex-col items-center' : ''}`}>
                        {!collapsed ? (
                            <div className="admin-section-label mt-3 mb-1.5">
                                {group.section}
                            </div>
                        ) : (
                            <div className="w-6 h-px bg-stone-200/60 my-2" />
                        )}

                        <div className="space-y-px">
                            {group.items.map((item) => {
                                const active = isActive(item.href);

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        title={collapsed ? item.name : ''}
                                        className={`
                                            flex items-center rounded-md transition-all duration-150 relative group
                                            ${collapsed
                                                ? 'justify-center w-10 h-9 mx-auto'
                                                : 'gap-2.5 px-3 py-1.5 text-[13px] w-full'
                                            }
                                            ${active
                                                ? 'bg-stone-100 text-stone-900 font-semibold'
                                                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                                            }
                                        `}
                                    >
                                        {/* Active indicator bar */}
                                        {active && !collapsed && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full" style={{ background: 'var(--admin-brand)' }} />
                                        )}
                                        {active && collapsed && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full" style={{ background: 'var(--admin-brand)' }} />
                                        )}

                                        <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-stone-700' : ''}`} />

                                        {!collapsed && (
                                            <span className="truncate">{item.name}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* View Site — always at bottom of nav */}
                <div className={`mt-auto pt-3 border-t ${collapsed ? 'flex flex-col items-center' : ''}`} style={{ borderColor: 'var(--admin-border)' }}>
                    <Link
                        href="/"
                        target="_blank"
                        title="View Site"
                        className={`
                            flex items-center text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-all duration-150 rounded-md group
                            ${collapsed ? 'justify-center w-10 h-9 mx-auto' : 'gap-2.5 px-3 py-1.5 text-[13px] w-full'}
                        `}
                    >
                        <ExternalLink className="w-4 h-4" />
                        {!collapsed && <span>View Site</span>}
                    </Link>
                </div>
            </nav>

            {/* User Profile — simplified */}
            <div className={`p-3 mt-auto shrink-0 ${collapsed ? 'flex justify-center' : ''}`} style={{ borderTop: '1px solid var(--admin-border)' }}>
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
                    <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex-shrink-0 flex items-center justify-center font-semibold text-xs">
                        {initials}
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col overflow-hidden min-w-0">
                            <span className="text-sm font-semibold text-stone-900 truncate leading-tight">{name}</span>
                            <span className="text-[10px] uppercase tracking-widest font-semibold text-stone-400 leading-tight">{role}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Top Header */}
            <header className="md:hidden sticky top-0 z-30 border-b px-4 py-2.5 flex items-center justify-between"
                style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-stone-900 flex items-center justify-center text-white">
                        <span className="font-serif font-bold text-sm leading-none">A</span>
                    </div>
                    <span className="font-serif font-bold text-base tracking-tight text-stone-900">Agri Updates</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <Link
                        href="/admin/posts/new"
                        className="bg-stone-900 text-white p-2 rounded-lg font-bold flex items-center justify-center hover:bg-stone-800 transition-colors active:scale-95"
                        title="New Story"
                    >
                        <Plus className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 border text-stone-700 rounded-lg hover:bg-stone-50 active:bg-stone-100 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        style={{ borderColor: 'var(--admin-border-strong)' }}
                        aria-label="Open Navigation Menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Desktop Sidebar (Fixed) */}
            <aside className={`hidden md:block fixed inset-y-0 z-40 transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}`}>
                {renderSidebarContent(isCollapsed)}
            </aside>

            {/* Mobile Sidebar Drawer (Overlay) */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-stone-950/50 transition-opacity"
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-2xl flex flex-col"
                        style={{ background: 'var(--admin-surface)' }}>
                        {renderSidebarContent(false)}
                    </div>
                </div>
            )}

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t px-2 py-1.5 flex items-center justify-around"
                style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}>
                <Link
                    href="/admin"
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-all ${
                        pathname === '/admin' ? 'text-stone-900' : 'text-stone-400'
                    }`}
                >
                    <Home className="w-4 h-4 mb-0.5" />
                    <span>Home</span>
                </Link>

                <Link
                    href="/admin/posts"
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-all ${
                        pathname === '/admin/posts' ? 'text-stone-900' : 'text-stone-400'
                    }`}
                >
                    <FileText className="w-4 h-4 mb-0.5" />
                    <span>Stories</span>
                </Link>

                <Link
                    href="/admin/posts/new"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex flex-col items-center justify-center -mt-3"
                >
                    <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform">
                        <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-stone-900 mt-0.5">New</span>
                </Link>

                <Link
                    href="/admin/review"
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-all ${
                        pathname === '/admin/review' ? 'text-stone-900' : 'text-stone-400'
                    }`}
                >
                    <Eye className="w-4 h-4 mb-0.5" />
                    <span>Review</span>
                </Link>

                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold text-stone-400"
                >
                    <MoreHorizontal className="w-4 h-4 mb-0.5" />
                    <span>More</span>
                </button>
            </nav>
        </>
    );
}
