'use client';

import React, { useState } from 'react';
import { Sparkles, X, Check, Copy, Loader2, ListChecks, Type, RefreshCw } from 'lucide-react';
import { WriterFormData } from './types';

interface AIAssistantToolsProps {
    isOpen: boolean;
    onClose: () => void;
    formData: WriterFormData;
    onApplyHeadline: (headline: string) => void;
    onInsertTakeaways: (htmlContent: string) => void;
}

export default function AIAssistantTools({
    isOpen,
    onClose,
    formData,
    onApplyHeadline,
    onInsertTakeaways,
}: AIAssistantToolsProps) {
    const [activeTool, setActiveTool] = useState<'headlines' | 'takeaways' | 'summary'>('headlines');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedHeadlines, setGeneratedHeadlines] = useState<string[]>([]);
    const [generatedTakeaways, setGeneratedTakeaways] = useState<string[]>([]);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const generateHeadlineVariants = async () => {
        setIsGenerating(true);
        // Uses the existing AI polish/generate endpoint or smart fallback generator
        try {
            const baseTitle = formData.title || 'Agricultural Update';
            const plainText = (formData.content || '').replace(/<[^>]*>/g, ' ').trim().substring(0, 500);

            const res = await fetch('/api/ai/polish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `Title: ${baseTitle}\n\nSummary context: ${plainText}`,
                    mode: 'headlines'
                })
            });

            const data = await res.json();
            if (data.title) {
                setGeneratedHeadlines([
                    data.title,
                    `Explained: ${data.title.replace(/^Explained:\s*/i, '')}`,
                    `How ${data.title} Is Transforming ${formData.category} in India`,
                    `Key Analysis: What Farmers & Agronomists Need to Know About ${data.title}`,
                    `Deep Dive: ${data.title} — Market & Policy Impact`,
                ]);
            } else {
                setGeneratedHeadlines([
                    `${baseTitle}: Comprehensive 2026 Analysis & Practical Guide`,
                    `Why ${baseTitle} Matters for Indian Agri Innovation`,
                    `Market Breakdown: What You Need to Know About ${baseTitle}`,
                    `Advisory: Strategic Recommendations & Key Takeaways for ${baseTitle}`,
                    `Explained: The Real Impact of ${baseTitle}`,
                ]);
            }
        } catch {
            const base = formData.title || 'Agri Update';
            setGeneratedHeadlines([
                `${base}: Comprehensive 2026 Analysis & Practical Guide`,
                `Why ${base} Matters for Indian Agri Innovation`,
                `Market Breakdown: What You Need to Know About ${base}`,
                `Advisory: Strategic Recommendations & Key Takeaways for ${base}`,
                `Explained: The Real Impact of ${base}`,
            ]);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateTakeaways = async () => {
        setIsGenerating(true);
        try {
            const plainText = (formData.content || '').replace(/<[^>]*>/g, ' ').trim();
            if (plainText.length < 30) {
                alert('Please write some content first to extract takeaways.');
                setIsGenerating(false);
                return;
            }

            const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 15);
            const bullets = sentences.slice(0, 3).map(s => s.trim() + '.');

            if (bullets.length > 0) {
                setGeneratedTakeaways(bullets);
            } else {
                setGeneratedTakeaways([
                    'Highlights the primary developments and agricultural impact for this season.',
                    'Details essential compliance, eligibility guidelines, or agronomic recommendations.',
                    'Outlines forward-looking market projections and strategic guidance for growers.',
                ]);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleInsertTakeawaysCallout = () => {
        if (generatedTakeaways.length === 0) return;
        const html = `
<div style="background-color: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 12px; padding: 16px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #5B21B6; font-size: 15px; font-weight: bold;">⚡ Key Takeaways at a Glance</h3>
    <ul style="margin-bottom: 0; padding-left: 20px; color: #374151; font-size: 14px;">
        ${generatedTakeaways.map(t => `<li style="margin-bottom: 6px;">${t}</li>`).join('')}
    </ul>
</div>
`;
        onInsertTakeaways(html);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100 bg-purple-50/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-serif font-bold text-base text-stone-900">AI Intelligence Suite</h3>
                            <p className="text-xs text-stone-500">Editorial brainstorming, headline optimization & summaries.</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Sub-navigation tabs */}
                <div className="flex border-b border-stone-200/80 px-4 pt-2 gap-2 bg-stone-50/50">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTool('headlines');
                            if (generatedHeadlines.length === 0) generateHeadlineVariants();
                        }}
                        className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                            activeTool === 'headlines'
                                ? 'border-purple-600 text-purple-900'
                                : 'border-transparent text-stone-400 hover:text-stone-700'
                        }`}
                    >
                        <Type className="w-3.5 h-3.5" />
                        <span>5 Headline Variants</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTool('takeaways');
                            if (generatedTakeaways.length === 0) generateTakeaways();
                        }}
                        className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                            activeTool === 'takeaways'
                                ? 'border-purple-600 text-purple-900'
                                : 'border-transparent text-stone-400 hover:text-stone-700'
                        }`}
                    >
                        <ListChecks className="w-3.5 h-3.5" />
                        <span>Key Takeaways Box</span>
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {/* HEADLINES TOOL */}
                    {activeTool === 'headlines' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-stone-500">
                                    Click any variant to set as your primary story title:
                                </span>
                                <button
                                    type="button"
                                    onClick={generateHeadlineVariants}
                                    disabled={isGenerating}
                                    className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                                    <span>Regenerate</span>
                                </button>
                            </div>

                            {isGenerating && generatedHeadlines.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-purple-600 mb-2" />
                                    <p className="text-xs text-stone-500">Crafting editorial headlines...</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {generatedHeadlines.map((h, i) => (
                                        <div
                                            key={i}
                                            className="p-3 rounded-xl border border-stone-200 hover:border-purple-300 hover:bg-purple-50/40 transition-all flex items-center justify-between gap-3 group"
                                        >
                                            <p className="font-serif font-bold text-xs sm:text-sm text-stone-900 leading-snug">
                                                {h}
                                            </p>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(h, i)}
                                                    className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"
                                                    title="Copy"
                                                >
                                                    {copiedIndex === i ? (
                                                        <Check className="w-3.5 h-3.5 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        onApplyHeadline(h);
                                                        onClose();
                                                    }}
                                                    className="px-2.5 py-1 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAKEAWAYS TOOL */}
                    {activeTool === 'takeaways' && (
                        <div className="space-y-4">
                            <p className="text-xs text-stone-500">
                                Extract an executive bulleted summary to insert at the top of your article:
                            </p>

                            {isGenerating && generatedTakeaways.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-purple-600 mb-2" />
                                    <p className="text-xs text-stone-500">Analyzing body text for key insights...</p>
                                </div>
                            ) : (
                                <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-4 space-y-2.5">
                                    <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                        <span>Preview Callout Box</span>
                                    </h4>
                                    <ul className="space-y-1.5 list-disc list-inside text-xs text-stone-700">
                                        {generatedTakeaways.map((t, idx) => (
                                            <li key={idx} className="leading-relaxed">{t}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={generateTakeaways}
                                    disabled={isGenerating}
                                    className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 border rounded-lg"
                                >
                                    Regenerate
                                </button>
                                <button
                                    type="button"
                                    onClick={handleInsertTakeawaysCallout}
                                    disabled={generatedTakeaways.length === 0}
                                    className="px-4 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-xs"
                                >
                                    Insert Callout Box into Canvas
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
