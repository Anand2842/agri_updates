"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    PenTool,
    Plus,
    Crown,
    TrendingUp,
    Eye,
    Megaphone
} from 'lucide-react';

export default function AdminSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

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

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white border-r border-stone-200">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-agri-green rounded-lg flex items-center justify-center text-white">
                        <Eye className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-serif font-bold text-lg leading-none">Agri Updates</h1>
                        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Admin Panel</span>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="md:hidden text-stone-400 hover:text-black">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
                {menuItems.map((group, idx) => (
                    <div key={idx} className="mb-6">
                        <div className="text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-2 px-3">{group.section}</div>
                        {group.items.map((item) => {
                            const isActive = pathname === item.href || (item.href.includes('?') && pathname === item.href.split('?')[0]);
                            const isMoney = 'money' in item && item.money;
                            const isHighlight = 'highlight' in item && item.highlight;
                            const isSpecial = 'special' in item && item.special;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors font-medium ${isActive
                                        ? 'bg-agri-green/10 text-agri-dark'
                                        : isMoney
                                            ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                                            : isHighlight
                                                ? 'bg-agri-green text-white hover:bg-agri-dark'
                                                : isSpecial
                                                    ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 hover:from-purple-200 hover:to-indigo-200'
                                                    : 'text-stone-600 hover:bg-stone-50 hover:text-black'
                                        }`}
                                >
                                    <item.icon className={`w-4 h-4 ${isActive ? 'text-agri-green' : isMoney ? 'text-amber-600' : ''}`} />
                                    {item.name}
                                    {isMoney && <span className="ml-auto text-[9px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold">$$$</span>}
                                </Link>
                            );
                        })}
                    </div>
                ))}

                <div className="mt-auto pt-4 border-t border-stone-100">
                    <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-stone-600 rounded-lg hover:bg-stone-50 hover:text-black transition-colors font-medium">
                        <Settings className="w-4 h-4" />
                        Settings
                    </Link>
                    <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2 text-sm text-stone-500 rounded-lg hover:bg-stone-50 hover:text-black transition-colors font-medium">
                        <Eye className="w-4 h-4" />
                        View Site
                    </Link>
                </div>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-stone-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-agri-green text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                    AA
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold">Anand Admin</span>
                    <span className="text-[10px] text-stone-400">Admin Access</span>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Trigger */}
            <div className="md:hidden sticky top-0 z-30 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
                <h1 className="font-serif font-bold text-xl">Agri Updates Admin</h1>
                <button onClick={() => setIsOpen(true)} className="p-2 border border-stone-200 rounded hover:bg-stone-50">
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 fixed inset-y-0 z-50">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            {isOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-2xl animate-in slide-in-from-left">
                        <SidebarContent />
                    </div>
                </div>
            )}
        </>
    );
}
