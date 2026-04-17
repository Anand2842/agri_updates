"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    Star,
    Zap,
    Settings,
    Menu,
    X,
    Wand2,
    Plus,
    Crown,
    TrendingUp,
    Eye,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Tag,
    Users,
    DollarSign,
    AlertTriangle,
    type LucideIcon
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
    highlight?: boolean;
    adminOnly?: boolean;
    special?: boolean;
    money?: boolean;
}

export default function AdminSidebar({ isCollapsed, toggleCollapse, user, role = 'user' }: AdminSidebarProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();

    // Get initials and name
    const email = user?.email || '';
    const name = user?.user_metadata?.full_name || email.split('@')[0] || 'Admin';
    const initials = name.slice(0, 2).toUpperCase();

    // Base menu items
    const rawMenuItems = [
        {
            section: 'Quick Actions',
            items: [
                { name: 'New Post', icon: Plus, href: '/admin/posts/new', highlight: true },
                { name: 'Add Job', icon: Briefcase, href: '/admin/jobs/new', adminOnly: true },
                { name: 'Blog Generator', icon: Wand2, href: '/admin/posts/generate', special: true },
            ] as MenuItemType[]
        },
        {
            section: 'Overview',
            items: [
                { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' }
            ] as MenuItemType[]
        },
        {
            section: 'Content Management',
            items: [
                { name: 'All Posts', icon: FileText, href: '/admin/posts' },
                { name: 'Review Queue', icon: Eye, href: '/admin/review', special: true },
                { name: 'Featured Manager', icon: Crown, href: '/admin/posts?is_featured=true', money: true },
                { name: 'Hero & Highlights', icon: Star, href: '/admin/posts?display=hero' },
                { name: 'Trending', icon: TrendingUp, href: '/admin/posts?display=trending' },
                { name: 'Categories', icon: Tag, href: '/admin/categories', adminOnly: true },
                { name: 'Authors Directory', icon: Users, href: '/admin/authors', adminOnly: true },
            ] as MenuItemType[]
        },
        {
            section: 'Categories',
            adminOnly: true,
            items: [
                { name: 'Jobs', icon: Briefcase, href: '/admin/jobs' },
                { name: 'Startup Directory', icon: Zap, href: '/admin/startups' },
                { name: 'Startup News', icon: Zap, href: '/admin/posts?category=Startups' },
                { name: 'Grants & Funding', icon: DollarSign, href: '/admin/posts?category=Grants' },
                { name: 'Warnings', icon: AlertTriangle, href: '/admin/posts?category=Warnings' },
            ] as MenuItemType[]
        }
    ];

    // Filter based on role
    const menuItems = rawMenuItems
        .filter(group => role === 'admin' || !('adminOnly' in group) || !group.adminOnly)
        .map(group => ({
            ...group,
            items: group.items.filter(item => role === 'admin' || !item.adminOnly)
        }))
        .filter(group => group.items.length > 0);

    const renderSidebarContent = (collapsed = false) => (
        <div className={`flex flex-col h-full bg-[#fdfdfc] border-r border-stone-200/60 transition-all duration-300 ${collapsed ? 'w-[88px]' : 'w-[280px]'}`}>
            {/* Header */}
            <div className={`h-20 flex items-center shrink-0 ${collapsed ? 'justify-center' : 'px-6'}`}>
                {collapsed ? (
                    <button
                        onClick={toggleCollapse}
                        className="w-12 h-12 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100/50 rounded-2xl transition-all"
                        title="Expand Sidebar"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                ) : (
                    <>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex-shrink-0 bg-stone-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-stone-900/20">
                                <span className="font-serif font-bold text-xl leading-none -mt-0.5">A</span>
                            </div>
                            <div className="overflow-hidden whitespace-nowrap">
                                <h1 className="font-serif font-bold text-xl tracking-tight text-stone-900 leading-none mb-1">Agri Updates</h1>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-agri-green animate-pulse"></span>
                                    <span className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">Workspace</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={toggleCollapse}
                            className="ml-auto w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100/50 rounded-xl transition-all"
                            title="Collapse Sidebar"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </>
                )}
                {!collapsed && (
                    <button onClick={() => setIsMobileOpen(false)} className="md:hidden ml-2 text-stone-400 hover:text-stone-900">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-grow px-4 py-2 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
                {menuItems.map((group, idx) => (
                    <div key={idx} className={`mb-6 ${collapsed ? 'flex flex-col items-center' : ''}`}>
                        {!collapsed ? (
                            <div className="text-[10px] font-bold uppercase text-stone-400 tracking-widest mb-3 px-3 truncate">
                                {group.section}
                            </div>
                        ) : (
                            <div className="w-8 h-[1px] bg-stone-200/60 my-3" />
                        )}

                        <div className="space-y-1">
                        {group.items.map((item) => {
                            const isActive = pathname === item.href || (item.href.includes('?') && pathname === item.href.split('?')[0]);
                            const isMoney = 'money' in item && item.money;
                            const isHighlight = 'highlight' in item && item.highlight;
                            const isSpecial = 'special' in item && item.special;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    title={collapsed ? item.name : ''}
                                    className={`
                                        flex items-center rounded-xl transition-all duration-200 font-medium relative group
                                        ${collapsed
                                            ? 'justify-center w-12 h-12 p-0'
                                            : 'gap-3 px-3.5 py-2.5 text-sm w-full'
                                        }
                                        ${isActive
                                            ? 'bg-white text-stone-900 shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-stone-200/80 font-bold'
                                            : isMoney
                                                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100/80 border border-transparent hover:border-amber-200/50'
                                                : isHighlight
                                                    ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-md border border-transparent'
                                                    : isSpecial
                                                        ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 hover:from-purple-100 hover:to-indigo-100 border border-transparent hover:border-purple-200/50'
                                                        : 'text-stone-500 hover:bg-stone-100/50 hover:text-stone-900 border border-transparent'
                                        }
                                    `}
                                >
                                    <item.icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                                        isActive ? 'text-stone-900' : 
                                        isMoney ? 'text-amber-600' : 
                                        isHighlight ? 'text-white' : ''
                                    }`} />

                                    {!collapsed && (
                                        <>
                                            <span className="truncate">{item.name}</span>
                                            {isMoney && <span className="ml-auto text-[9px] bg-amber-200/50 text-amber-800 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Prem</span>}
                                        </>
                                    )}

                                    {/* Collapsed Tooltip (simple native title used above, but visual dot for active state) */}
                                    {collapsed && isActive && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-3 rounded-full bg-stone-900 -mr-1"></div>
                                    )}
                                </Link>
                            );
                        })}
                        </div>
                    </div>
                ))}

                <div className={`mt-10 pt-4 border-t border-stone-200/60 ${collapsed ? 'flex flex-col items-center' : ''}`}>
                    {role === 'admin' && (
                        <Link
                            href="/admin/settings"
                            title="Settings"
                            className={`
                                flex items-center text-stone-500 hover:bg-white hover:text-stone-900 hover:shadow-[0_2px_10px_rgb(0,0,0,0.04)] hover:border-stone-200/80 border border-transparent transition-all duration-200 font-medium rounded-xl group
                                ${collapsed ? 'justify-center w-12 h-12 p-0 mb-1' : 'gap-3 px-3.5 py-2.5 text-sm w-full mb-1'}
                            `}
                        >
                            <Settings className="w-4 h-4 transition-transform group-hover:rotate-45" />
                            {!collapsed && <span>Settings</span>}
                        </Link>
                    )}
                    <Link
                        href="/"
                        target="_blank"
                        title="View Site"
                        className={`
                            flex items-center text-stone-500 hover:bg-white hover:text-stone-900 hover:shadow-[0_2px_10px_rgb(0,0,0,0.04)] hover:border-stone-200/80 border border-transparent transition-all duration-200 font-medium rounded-xl group
                            ${collapsed ? 'justify-center w-12 h-12 p-0' : 'gap-3 px-3.5 py-2.5 text-sm w-full'}
                        `}
                    >
                        <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        {!collapsed && <span>View Site</span>}
                    </Link>
                </div>
            </nav>

            {/* User Profile */}
            <div className="p-4 mt-auto border-t border-stone-200/60">
                <div className={`p-3 bg-white border border-stone-200/60 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-600 flex-shrink-0 flex items-center justify-center font-bold text-xs ring-1 ring-stone-200 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-stone-200/50 to-transparent"></div>
                        <span className="relative z-10">{initials}</span>
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-stone-900 truncate" title={name}>{name}</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-stone-500 truncate mt-0.5">{role}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Trigger */}
            <div className="md:hidden sticky top-0 z-30 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
                <h1 className="font-serif font-bold text-xl">Agri Updates Admin</h1>
                <button onClick={() => setIsMobileOpen(true)} className="p-2 border border-stone-200 rounded hover:bg-stone-50">
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* Desktop Sidebar (Fixed) */}
            <aside className={`hidden md:block fixed inset-y-0 z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                {renderSidebarContent(isCollapsed)}
            </aside>

            {/* Mobile Sidebar (Overlay) */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-2xl animate-in slide-in-from-left">
                        {renderSidebarContent(false)}
                    </div>
                </div>
            )}
        </>
    );
}
