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
    Megaphone,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';

interface AdminSidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    user: any;
}

export default function AdminSidebar({ isCollapsed, toggleCollapse, user }: AdminSidebarProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();

    // Get initials and name
    const email = user?.email || '';
    const name = user?.user_metadata?.full_name || email.split('@')[0] || 'Admin';
    const initials = name.slice(0, 2).toUpperCase();
    const role = user?.app_metadata?.role || 'Admin Access';

    const menuItems = [
        {
            section: 'Quick Actions',
            items: [
                { name: 'New Post', icon: Plus, href: '/admin/posts/new', highlight: true },
                { name: 'Add Job', icon: Briefcase, href: '/admin/jobs/new' },
                { name: 'Blog Generator', icon: Wand2, href: '/admin/posts/generate', special: true },
            ]
        },
        {
            section: 'Overview',
            items: [
                { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' }
            ]
        },
        {
            section: 'Content Management',
            items: [
                { name: 'All Posts', icon: FileText, href: '/admin/posts' },
                { name: 'Featured Manager', icon: Crown, href: '/admin/posts?is_featured=true', money: true },
                { name: 'Hero & Highlights', icon: Star, href: '/admin/posts?display=hero' },
                { name: 'Trending', icon: TrendingUp, href: '/admin/posts?display=trending' },
                { name: 'Ads Manager', icon: Megaphone, href: '/admin/ads' },
            ]
        },
        {
            section: 'Categories',
            items: [
                { name: 'Jobs', icon: Briefcase, href: '/admin/jobs' },
                { name: 'Startups', icon: Zap, href: '/admin/startups' },
            ]
        }
    ];

    const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
        <div className={`flex flex-col h-full bg-white border-r border-stone-200 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
            {/* Header */}
            <div className={`h-16 flex items-center shrink-0 border-b border-stone-100 ${collapsed ? 'justify-center' : 'px-6'}`}>
                {collapsed ? (
                    <button
                        onClick={toggleCollapse}
                        className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-black hover:bg-stone-50 rounded-lg transition-colors"
                        title="Expand Sidebar"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                ) : (
                    <>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex-shrink-0 bg-agri-green rounded-lg flex items-center justify-center text-white">
                                <Eye className="w-5 h-5" />
                            </div>
                            <div className="overflow-hidden whitespace-nowrap">
                                <h1 className="font-serif font-bold text-lg leading-none">Agri Updates</h1>
                                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Admin Panel</span>
                            </div>
                        </div>
                        <button
                            onClick={toggleCollapse}
                            className="ml-auto w-8 h-8 flex items-center justify-center text-stone-400 hover:text-black hover:bg-stone-50 rounded-lg transition-colors"
                            title="Collapse Sidebar"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    </>
                )}
                {!collapsed && (
                    <button onClick={() => setIsMobileOpen(false)} className="md:hidden ml-2 text-stone-400 hover:text-black">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-grow p-3 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
                {menuItems.map((group, idx) => (
                    <div key={idx} className={`mb-4 ${collapsed ? 'flex flex-col items-center' : ''}`}>
                        {!collapsed ? (
                            <div className="text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-2 px-3 truncate">
                                {group.section}
                            </div>
                        ) : (
                            <div className="w-8 h-[1px] bg-stone-100 my-2" />
                        )}

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
                                        flex items-center rounded-lg transition-colors font-medium mb-1 relative
                                        ${collapsed
                                            ? 'justify-center w-10 h-10 p-0'
                                            : 'gap-3 px-3 py-2 text-sm w-full'
                                        }
                                        ${isActive
                                            ? 'bg-agri-green/10 text-agri-dark'
                                            : isMoney
                                                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                                                : isHighlight
                                                    ? 'bg-agri-green text-white hover:bg-agri-dark'
                                                    : isSpecial
                                                        ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 hover:from-purple-200 hover:to-indigo-200'
                                                        : 'text-stone-600 hover:bg-stone-50 hover:text-black'
                                        }
                                    `}
                                >
                                    <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-agri-green' : isMoney ? 'text-amber-600' : ''}`} />

                                    {!collapsed && (
                                        <>
                                            <span className="truncate">{item.name}</span>
                                            {isMoney && <span className="ml-auto text-[9px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold">$$$</span>}
                                        </>
                                    )}

                                    {/* Collapsed Tooltip (simple native title used above, but visual dot for active state) */}
                                    {collapsed && isActive && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-agri-green"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}

                <div className={`mt-auto pt-4 border-t border-stone-100 ${collapsed ? 'flex flex-col items-center' : ''}`}>
                    {/* Toggle Button (Desktop Only) */}


                    <Link
                        href="/admin/settings"
                        title="Settings"
                        className={`
                            flex items-center text-stone-600 hover:bg-stone-50 hover:text-black transition-colors font-medium rounded-lg
                            ${collapsed ? 'justify-center w-10 h-10 p-0' : 'gap-3 px-3 py-2 text-sm w-full'}
                        `}
                    >
                        <Settings className="w-4 h-4" />
                        {!collapsed && <span>Settings</span>}
                    </Link>
                    <Link
                        href="/"
                        target="_blank"
                        title="View Site"
                        className={`
                            flex items-center text-stone-500 hover:bg-stone-50 hover:text-black transition-colors font-medium rounded-lg
                            ${collapsed ? 'justify-center w-10 h-10 p-0' : 'gap-3 px-3 py-2 text-sm w-full'}
                        `}
                    >
                        <LogOut className="w-4 h-4" />
                        {!collapsed && <span>View Site</span>}
                    </Link>
                </div>
            </nav>

            {/* User Profile */}
            <div className={`p-4 border-t border-stone-100 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="w-8 h-8 rounded-full bg-agri-green text-white flex-shrink-0 flex items-center justify-center font-bold text-xs ring-2 ring-white">
                    {initials}
                </div>
                {!collapsed && (
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-bold truncate" title={name}>{name}</span>
                        <span className="text-[10px] text-stone-400 truncate">{email}</span>
                    </div>
                )}
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
                <SidebarContent collapsed={isCollapsed} />
            </aside>

            {/* Mobile Sidebar (Overlay) */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-2xl animate-in slide-in-from-left">
                        <SidebarContent collapsed={false} />
                    </div>
                </div>
            )}
        </>
    );
}
