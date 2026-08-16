'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PublicCategoryDescriptor } from '@/lib/public-categories';

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
        <div className="md:hidden sticky top-[53px] z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-2">
                {categories.map((category) => {
                    const active = isActive(category.href);

                    return (
                        <Link
                            key={category.href}
                            href={category.href}
                            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                active
                                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                                    : 'text-slate-600 bg-slate-100/80 hover:bg-slate-100'
                            }`}
                        >
                            {category.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
