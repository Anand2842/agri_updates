"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Briefcase,
    GraduationCap,
    Award,
    DollarSign,
    Rocket,
    FileText,
    Calendar,
    BookOpen,
    AlertTriangle,
    Settings,
    Menu,
    X,
    Wand2,
    PenTool
} from 'lucide-react';

export default function AdminSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const menuItems = [
        {
            section: 'Overview',
            items: [
                { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' }
            ]
        },
        {
            section: 'Opportunities',
            items: [
                { name: 'Jobs', icon: Briefcase, href: '/admin/jobs' },
                { name: 'Internships & Training', icon: GraduationCap, href: '/admin/jobs?type=Internship' }, // Filtered view could be better, but for now linking to jobs
                { name: 'Fellowships', icon: Award, href: '/admin/posts?category=Fellowships' },
                { name: 'Scholarships', icon: Award, href: '/admin/posts?category=Scholarships' },
                { name: 'Grants & Funding', icon: DollarSign, href: '/admin/posts?category=Grants' },
            ]
        },
        {
            section: 'Innovation',
            items: [
                { name: 'Startups & Innovation', icon: Rocket, href: '/admin/startups' },
            ]
        },
        {
            section: 'Resources',
            items: [
                { name: 'Exams & Admissions', icon: FileText, href: '/admin/posts?category=Exams' },
                { name: 'Conferences & Events', icon: Calendar, href: '/admin/posts?category=Events' },
                { name: 'Application Guidance', icon: BookOpen, href: '/admin/posts?category=Guidance' },
                { name: 'Warnings & Awareness', icon: AlertTriangle, href: '/admin/posts?category=Warnings' },
            ]
        }
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white border-r border-stone-200">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-agri-green rounded-lg flex items-center justify-center text-white">
                        <Rocket className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-serif font-bold text-lg leading-none">Agri Updates</h1>
                        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Admin Workspace</span>
                    </div>
                </div>
                {/* Mobile Close Button */}
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
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors font-medium ${isActive
                                        ? 'bg-agri-green/10 text-agri-dark'
                                        : 'text-stone-600 hover:bg-stone-50 hover:text-black'
                                        }`}
                                >
                                    <item.icon className={`w-4 h-4 ${isActive ? 'text-agri-green' : ''}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                ))}

                <div className="mt-auto pt-4 border-t border-stone-100">
                    <Link href="/admin/posts/new" className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${pathname === '/admin/posts/new' ? 'bg-agri-green text-white shadow-md' : 'text-stone-600 hover:bg-stone-100'}`}>
                        <PenTool className="w-5 h-5" />
                        <span className="font-medium">Write Post</span>
                    </Link>
                    <Link href="/admin/posts/generate" className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-6 transition-colors ${pathname === '/admin/posts/generate' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-stone-600 hover:bg-purple-50 hover:text-purple-700'}`}>
                        <Wand2 className="w-5 h-5" />
                        <span className="font-medium">Blog Generator</span>
                    </Link>
                    <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-stone-600 rounded-lg hover:bg-stone-50 hover:text-black transition-colors font-medium">
                        <Settings className="w-4 h-4" />
                        Settings
                    </Link>
                </div>
            </nav>

            {/* User Profile Snippet */}
            <div className="p-4 border-t border-stone-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden relative">
                    <Image src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80" alt="Admin" fill className="object-cover" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold">Admin User</span>
                    <span className="text-[10px] text-stone-400">Super Admin</span>
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

            {/* Desktop Sidebar (Fixed) */}
            <aside className="hidden md:flex w-64 fixed inset-y-0 z-50">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar (Overlay) */}
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
