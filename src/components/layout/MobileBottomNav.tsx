'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PublicCategoryDescriptor, getCategoryAccentClasses } from '@/lib/public-categories';

type MobileBottomNavProps = {
    categories: PublicCategoryDescriptor[];
}

export default function MobileBottomNav({ categories }: MobileBottomNavProps) {
    const pathname = usePathname();

    if (
        pathname?.startsWith('/admin') ||
        pathname?.startsWith('/login') ||
        pathname?.startsWith('/signup') ||
        pathname?.startsWith('/forgot-password')
    ) {
        return null;
    }

    const isActive = (href: string) => {
        if (href === '/updates') return pathname === '/updates';
        if (href === '/jobs') return pathname?.startsWith('/jobs');
        if (href === '/startups') return pathname?.startsWith('/startups');
        return pathname === href;
    };

    return (
        <div className="md:hidden sticky top-[61px] z-40 border-b border-stone-200 bg-[var(--color-paper-elevated)]/95 backdrop-blur-sm">
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
                {categories.map((category) => {
                    const accent = getCategoryAccentClasses(category.accent);
                    const active = isActive(category.href);

                    return (
                        <Link
                            key={category.href}
                            href={category.href}
                            className={`whitespace-nowrap rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${active ? accent.chip : 'border-stone-300 bg-white text-stone-700'}`}
                        >
                            {category.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
