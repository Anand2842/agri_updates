'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Home,
    FileText,
    Eye,
    Plus,
    Briefcase,
    Zap,
    BarChart3,
    Settings,
    Calendar,
    Megaphone,
    ArrowRight
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CommandItem {
    id: string;
    title: string;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    action?: () => void;
    category: 'Navigation' | 'Actions' | 'Stories';
}

const DEFAULT_COMMANDS: CommandItem[] = [
    { id: 'act_new', title: 'Create New Story', subtitle: 'Open fresh Google Docs canvas', icon: Plus, href: '/admin/posts/new', category: 'Actions' },
    { id: 'act_gen', title: 'AI Blog Generator Engine', subtitle: 'Transform raw notes & WhatsApp forwards', icon: Zap, href: '/admin/posts/generate', category: 'Actions' },
    { id: 'nav_home', title: 'Newsroom Home', subtitle: 'Command center & daily agenda', icon: Home, href: '/admin', category: 'Navigation' },
    { id: 'nav_stories', title: 'All Stories & Articles', subtitle: 'Browse drafts, published, archived', icon: FileText, href: '/admin/posts', category: 'Navigation' },
    { id: 'nav_review', title: 'Editorial Review Queue', subtitle: 'Submissions awaiting review', icon: Eye, href: '/admin/review', category: 'Navigation' },
    { id: 'nav_calendar', title: 'Publishing Calendar', subtitle: 'Scheduled content timeline', icon: Calendar, href: '/admin/calendar', category: 'Navigation' },
    { id: 'nav_jobs', title: 'Job Board Manager', subtitle: 'Agri openings & hiring', icon: Briefcase, href: '/admin/jobs', category: 'Navigation' },
    { id: 'nav_startups', title: 'Startup Directory', subtitle: 'AgriTech founders & profiles', icon: Zap, href: '/admin/startups', category: 'Navigation' },
    { id: 'nav_analytics', title: 'Analytics & Traffic', subtitle: 'Views, visitors & traction', icon: BarChart3, href: '/admin/dashboard', category: 'Navigation' },
    { id: 'nav_ads', title: 'Ad Placements', subtitle: 'Manage banner campaigns', icon: Megaphone, href: '/admin/ads', category: 'Navigation' },
    { id: 'nav_settings', title: 'Admin Settings', subtitle: 'System & team configurations', icon: Settings, href: '/admin/settings', category: 'Navigation' },
];

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const router = useRouter();
    const supabase = createClient();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [searchResults, setSearchResults] = useState<CommandItem[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    // Live search stories in Supabase when query changes
    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed) {
            return;
        }

        let isCurrent = true;
        const debounce = setTimeout(async () => {
            try {
                const { data } = await supabase
                    .from('posts')
                    .select('id, title, category, status')
                    .ilike('title', `%${trimmed}%`)
                    .limit(5);

                if (data && isCurrent) {
                    const storyItems: CommandItem[] = (data as { id: string; title?: string | null; category?: string | null; status?: string | null }[]).map(post => ({
                        id: `story_${post.id}`,
                        title: post.title || 'Untitled Story',
                        subtitle: `${post.category || 'General'} · ${post.status || 'draft'}`,
                        icon: FileText,
                        href: `/admin/posts/${post.id}`,
                        category: 'Stories'
                    }));
                    setSearchResults(storyItems);
                }
            } catch (err) {
                console.error(err);
            }
        }, 200);

        return () => {
            isCurrent = false;
            clearTimeout(debounce);
        };
    }, [query, supabase]);

    // Combine static matches + dynamic story matches
    const allItems = useMemo(() => {
        const filteredStatic = DEFAULT_COMMANDS.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.subtitle?.toLowerCase().includes(query.toLowerCase())
        );
        const dynamicStories = query.trim() ? searchResults : [];
        return [...dynamicStories, ...filteredStatic];
    }, [query, searchResults]);

    const handleSelect = useCallback((item: CommandItem) => {
        setQuery('');
        onClose();
        if (item.href) {
            router.push(item.href);
        } else if (item.action) {
            item.action();
        }
    }, [onClose, router]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % (allItems.length || 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + allItems.length) % (allItems.length || 1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (allItems[selectedIndex]) {
                    handleSelect(allItems[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setQuery('');
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, allItems, selectedIndex, handleSelect, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Search Input Bar */}
                <div className="flex items-center px-4 py-3.5 border-b border-stone-100 gap-3">
                    <Search className="w-4 h-4 text-stone-400 shrink-0" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        placeholder="Type a command or search stories..."
                        className="w-full bg-transparent border-none outline-none text-sm text-stone-900 placeholder-stone-400 font-medium"
                    />
                    <kbd className="hidden sm:inline-block text-[10px] font-mono font-bold text-stone-400 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded">
                        ESC
                    </kbd>
                </div>

                {/* Results List */}
                <div className="max-h-80 overflow-y-auto p-2 divide-y divide-stone-50 scrollbar-thin">
                    {allItems.length === 0 ? (
                        <div className="py-8 text-center text-xs text-stone-400">
                            No commands or stories found matching &ldquo;{query}&rdquo;
                        </div>
                    ) : (
                        allItems.map((item, index) => {
                            const Icon = item.icon;
                            const isSelected = index === selectedIndex;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                                        isSelected
                                            ? 'bg-stone-900 text-white'
                                            : 'text-stone-700 hover:bg-stone-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                            isSelected ? 'bg-white/15 text-white' : 'bg-stone-100 text-stone-600'
                                        }`}>
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="block text-xs font-semibold truncate leading-tight">
                                                {item.title}
                                            </span>
                                            {item.subtitle && (
                                                <span className={`block text-[10px] truncate leading-tight mt-0.5 ${
                                                    isSelected ? 'text-stone-300' : 'text-stone-400'
                                                }`}>
                                                    {item.subtitle}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                                            isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                                        }`}>
                                            {item.category}
                                        </span>
                                        {isSelected && <ArrowRight className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer hints */}
                <div className="px-4 py-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <div className="flex items-center gap-3">
                        <span>↑↓ to navigate</span>
                        <span>↵ to select</span>
                    </div>
                    <span>Agri Updates Newsroom ⌘K</span>
                </div>
            </div>
        </div>
    );
}
