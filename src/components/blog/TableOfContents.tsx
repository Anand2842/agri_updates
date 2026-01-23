'use client';

import React, { useEffect, useState } from 'react';

interface Heading {
    id: string;
    text: string;
    level: number;
}

export default function TableOfContents() {
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        // Wait for content to render
        const timeout = setTimeout(() => {
            const articleContent = document.querySelector('article .prose');
            if (!articleContent) return;

            const elements = articleContent.querySelectorAll('h2, h3');
            const headingData: Heading[] = [];

            elements.forEach((elem, index) => {
                // Ensure id exists
                if (!elem.id) {
                    elem.id = `heading-${index}`;
                }

                headingData.push({
                    id: elem.id,
                    text: elem.textContent || '',
                    level: parseInt(elem.tagName.substring(1))
                });
            });

            setHeadings(headingData);
        }, 500); // 500ms delay to ensure content is loaded/purified

        return () => clearTimeout(timeout);
    }, []);

    // Scroll spy
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-10% 0px -80% 0px' }
        );

        headings.forEach((heading) => {
            const element = document.getElementById(heading.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <div className="mb-8">
            <h4 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4">On this page</h4>
            <nav className="flex flex-col space-y-3">
                {headings.map((heading) => (
                    <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`text-sm leading-tight transition-colors duration-200 border-l-2 pl-3 ${activeId === heading.id
                                ? 'border-agri-green text-agri-green font-bold'
                                : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
                            } ${heading.level === 3 ? 'ml-2' : ''}`}
                    >
                        {heading.text}
                    </a>
                ))}
            </nav>
        </div>
    );
}
