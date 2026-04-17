'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Search, Rocket, MoreHorizontal } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Highlight based on current path
  const isJobs = pathname?.startsWith('/jobs');
  const isStartups = pathname?.startsWith('/updates') && pathname?.includes('Startups'); // roughly
  const isSearch = pathname?.startsWith('/search');
  const isMore = pathname?.startsWith('/about') || pathname?.startsWith('/contact') || pathname?.startsWith('/faq');
  const isHome = pathname === '/' || (!isJobs && !isStartups && !isSearch && !isMore && !pathname?.startsWith('/blog'));

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 card-glass border-t border-white/40 pb-safe">
      <nav className="flex items-center justify-around h-16 px-2">
        
        {/* Home */}
        <Link href="/" className="flex flex-col items-center justify-center w-full h-full gap-1 group">
          <div className={`p-1.5 rounded-full transition-all ${isHome ? 'card-neu-pressed text-agri-green' : 'text-stone-500 group-hover:text-stone-900'}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className={`text-[10px] font-medium ${isHome ? 'text-agri-green font-bold' : 'text-stone-500'}`}>
            Home
          </span>
        </Link>

        {/* Jobs (with notification badge) */}
        <Link href="/jobs" className="flex flex-col items-center justify-center w-full h-full gap-1 group relative">
          <div className={`p-1.5 rounded-full transition-all relative ${isJobs ? 'card-neu-pressed text-agri-green' : 'text-stone-500 group-hover:text-stone-900'}`}>
            <Briefcase className="w-5 h-5" />
            {/* Notification Badge */}
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-[var(--color-paper-bg)] rounded-full animate-pulse" />
          </div>
          <span className={`text-[10px] font-medium ${isJobs ? 'text-agri-green font-bold' : 'text-stone-500'}`}>
            Jobs
          </span>
        </Link>
        
        {/* Search */}
        <Link href="/search" className="flex flex-col items-center justify-center w-full h-full gap-1 group">
          <div className={`p-1.5 rounded-full transition-all ${isSearch ? 'card-neu-pressed text-agri-green' : 'text-stone-500 group-hover:text-stone-900'}`}>
            <Search className="w-5 h-5" />
          </div>
          <span className={`text-[10px] font-medium ${isSearch ? 'text-agri-green font-bold' : 'text-stone-500'}`}>
            Search
          </span>
        </Link>

        {/* Startups */}
        <Link href="/updates?category=Startups" className="flex flex-col items-center justify-center w-full h-full gap-1 group">
          <div className={`p-1.5 rounded-full transition-all ${isStartups ? 'card-neu-pressed text-agri-green' : 'text-stone-500 group-hover:text-stone-900'}`}>
            <Rocket className="w-5 h-5" />
          </div>
          <span className={`text-[10px] font-medium ${isStartups ? 'text-agri-green font-bold' : 'text-stone-500'}`}>
            Startups
          </span>
        </Link>

        {/* More */}
        <Link href="/about" className="flex flex-col items-center justify-center w-full h-full gap-1 group">
          <div className={`p-1.5 rounded-full transition-all ${isMore ? 'card-neu-pressed text-agri-green' : 'text-stone-500 group-hover:text-stone-900'}`}>
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className={`text-[10px] font-medium ${isMore ? 'text-agri-green font-bold' : 'text-stone-500'}`}>
            More
          </span>
        </Link>

      </nav>
    </div>
  );
}
