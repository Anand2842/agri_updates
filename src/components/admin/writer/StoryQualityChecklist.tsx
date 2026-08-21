'use client';

import React, { useMemo } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { WriterFormData } from './types';

interface StoryQualityChecklistProps {
    formData: WriterFormData;
    onTabSwitch: (tab: 'settings' | 'seo' | 'specifics' | 'outline') => void;
}

export default function StoryQualityChecklist({ formData, onTabSwitch }: StoryQualityChecklistProps) {
    const checks = useMemo(() => {
        const plainText = (formData.content || '').replace(/<[^>]*>/g, ' ').trim();
        const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
        const hasSubheadings = /<h[2-4][^>]*>/i.test(formData.content || '');

        const items = [
            {
                id: 'headline',
                label: 'Headline Length',
                passed: formData.title.trim().length >= 25 && formData.title.trim().length <= 90,
                hint: `${formData.title.trim().length} chars (Target: 30–80 chars)`,
                tab: 'settings' as const,
            },
            {
                id: 'excerpt',
                label: 'Meta Description / Excerpt',
                passed: formData.excerpt.trim().length >= 40 && formData.excerpt.trim().length <= 160,
                hint: `${formData.excerpt.trim().length}/160 chars`,
                tab: 'seo' as const,
            },
            {
                id: 'image',
                label: 'Cover Image',
                passed: Boolean(formData.image_url),
                hint: formData.image_url ? 'Cover image attached' : 'No image uploaded',
                tab: 'settings' as const,
            },
            {
                id: 'depth',
                label: 'Article Depth',
                passed: wordCount >= 150,
                hint: `${wordCount} words (Target: 150+ words)`,
                tab: 'settings' as const,
            },
            {
                id: 'subheadings',
                label: 'Section Structure (H2/H3)',
                passed: hasSubheadings,
                hint: hasSubheadings ? 'Subheadings present' : 'Add H2/H3 subheadings',
                tab: 'outline' as const,
            },
            {
                id: 'slug',
                label: 'URL Slug Format',
                passed: Boolean(formData.slug && /^[a-z0-9-]+$/.test(formData.slug)),
                hint: formData.slug ? `/blog/${formData.slug}` : 'Missing slug',
                tab: 'seo' as const,
            },
        ];

        const passedCount = items.filter(i => i.passed).length;
        const score = Math.round((passedCount / items.length) * 100);

        return { items, passedCount, totalCount: items.length, score };
    }, [formData]);

    return (
        <div className="space-y-4">
            {/* Score Banner */}
            <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        checks.score >= 80 ? 'bg-green-100 text-green-700' :
                        checks.score >= 50 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                        {checks.score}%
                    </div>
                    <div>
                        <h4 className="font-semibold text-xs text-stone-900">
                            {checks.score >= 80 ? 'Editorial Ready' : checks.score >= 50 ? 'Needs Refinement' : 'Draft Incomplete'}
                        </h4>
                        <p className="text-[10px] text-stone-400">
                            {checks.passedCount} of {checks.totalCount} checkpoints passed
                        </p>
                    </div>
                </div>

                <div className="w-16 h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                            width: `${checks.score}%`,
                            background: checks.score >= 80 ? 'var(--admin-success)' : checks.score >= 50 ? 'var(--admin-warning)' : 'var(--admin-danger)',
                        }}
                    />
                </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-1.5">
                {checks.items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onTabSwitch(item.tab)}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-stone-100 hover:bg-stone-50 cursor-pointer transition-colors group"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            {item.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                            )}
                            <div className="min-w-0">
                                <span className={`block text-xs font-semibold truncate ${item.passed ? 'text-stone-800' : 'text-stone-600'}`}>
                                    {item.label}
                                </span>
                                <span className="block text-[10px] text-stone-400 truncate">
                                    {item.hint}
                                </span>
                            </div>
                        </div>

                        <span className="text-[10px] font-semibold text-stone-400 group-hover:text-stone-700 transition-colors">
                            Fix →
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
