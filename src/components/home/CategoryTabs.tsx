'use client';

import React, { useState } from 'react';

type TabType = 'Grants' | 'Startups' | 'Jobs';

type Props = {
    children: React.ReactNode; 
    // Expect exactly 3 children representing the sections for Grants, Startups, Jobs
};

export default function CategoryTabs({ children }: Props) {
    const [activeTab, setActiveTab] = useState<TabType>('Grants');

    const tabs: TabType[] = ['Grants', 'Startups', 'Jobs'];
    
    // We expect the children to be passed in the order: Grants, Startups, Jobs
    const childrenArray = React.Children.toArray(children);

    return (
        <div className="w-full">
            {/* Mobile Tab Headers */}
            <div className="flex md:hidden bg-[var(--color-paper-bg)] p-1 rounded-xl mb-6 shadow-sm border border-stone-200">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-lg ${
                            activeTab === tab
                                ? 'bg-agri-green text-white shadow-md'
                                : 'text-stone-500 hover:text-stone-900 bg-transparent'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="block md:hidden">
                {/* Show only the active child on mobile */}
                {activeTab === 'Grants' && childrenArray[0]}
                {activeTab === 'Startups' && childrenArray[1]}
                {activeTab === 'Jobs' && childrenArray[2]}
            </div>

            {/* Desktop Fallback (keeps original 3-column layout) */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
                {children}
            </div>
        </div>
    );
}

