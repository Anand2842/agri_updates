'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Check,
    Cloud,
    Loader2,
    Sparkles,
    Monitor,
    Smartphone,
    PanelRightOpen,
    PanelRightClose,
    ChevronDown,
    Send,
    Save,
    Clock,
    Eye
} from 'lucide-react';
import { UserRole } from '@/lib/auth';

interface WriterAppBarProps {
    title: string;
    status: string;
    saveState: 'saved' | 'saving' | 'unsaved';
    isPolishing: boolean;
    loading: boolean;
    isModLocked: boolean;
    userRole: UserRole;
    previewDevice: 'desktop' | 'mobile';
    isSidePanelOpen: boolean;
    onToggleSidePanel: () => void;
    onSetPreviewDevice: (device: 'desktop' | 'mobile') => void;
    onPolish: () => void;
    onOpenTemplates?: () => void;
    onOpenAITools?: () => void;
    onSave: (targetStatus?: string) => void;
}

export default function WriterAppBar({
    title,
    status,
    saveState,
    isPolishing,
    loading,
    isModLocked,
    userRole,
    previewDevice,
    isSidePanelOpen,
    onToggleSidePanel,
    onSetPreviewDevice,
    onPolish,
    onOpenTemplates,
    onOpenAITools,
    onSave,
}: WriterAppBarProps) {
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

    const getSaveLabel = () => {
        if (loading) return 'Saving...';
        if (status === 'scheduled') return 'Schedule Story';
        if (status === 'pending_review') return 'Submit for Review';
        if (userRole === 'moderator') return 'Save Draft';
        return status === 'published' ? 'Update & Publish' : 'Publish Story';
    };

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-3 sm:px-6 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-all">
            {/* Left section: Back navigation + Title preview + Autosave status */}
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
                <Link
                    href="/admin/posts"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors shrink-0"
                    title="Back to Stories"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-2 min-w-0">
                    <span className="font-serif font-bold text-sm sm:text-base text-stone-900 truncate max-w-[120px] sm:max-w-[240px] md:max-w-[320px]">
                        {title.trim() || 'Untitled Story'}
                    </span>

                    {/* Autosave badge */}
                    <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-stone-400 bg-stone-50 border border-stone-200/60 shrink-0">
                        {saveState === 'saving' ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin text-stone-500" />
                                <span>Saving...</span>
                            </>
                        ) : saveState === 'unsaved' ? (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                <span>Unsaved changes</span>
                            </>
                        ) : (
                            <>
                                <Cloud className="w-3 h-3 text-stone-400" />
                                <span>Saved</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Right section: Templates + AI Suite + Preview + Actions + Side Panel Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Templates Picker */}
                {onOpenTemplates && (
                    <button
                        type="button"
                        onClick={onOpenTemplates}
                        className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-600 bg-stone-50 border border-stone-200/70 hover:bg-stone-100 transition-all"
                        title="Choose an editorial template"
                    >
                        <span>Templates</span>
                    </button>
                )}

                {/* AI Tools Suite */}
                {onOpenAITools && (
                    <button
                        type="button"
                        onClick={onOpenAITools}
                        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200/70 hover:bg-purple-100/70 transition-all active:scale-[0.97]"
                        title="Open AI Intelligence Suite (Headlines, Key Takeaways)"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span className="hidden sm:inline">AI Tools</span>
                    </button>
                )}

                {/* Device preview toggles */}
                <div className="hidden md:flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200/60">
                    <button
                        type="button"
                        onClick={() => onSetPreviewDevice('desktop')}
                        className={`p-1.5 rounded-md text-xs font-semibold transition-all ${
                            previewDevice === 'desktop'
                                ? 'bg-white shadow-xs text-stone-900'
                                : 'text-stone-400 hover:text-stone-700'
                        }`}
                        title="Desktop view"
                    >
                        <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onSetPreviewDevice('mobile')}
                        className={`p-1.5 rounded-md text-xs font-semibold transition-all ${
                            previewDevice === 'mobile'
                                ? 'bg-white shadow-xs text-stone-900'
                                : 'text-stone-400 hover:text-stone-700'
                        }`}
                        title="Mobile view"
                    >
                        <Smartphone className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* AI Polish Trigger */}
                <button
                    type="button"
                    onClick={onPolish}
                    disabled={isPolishing || loading}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200/70 hover:bg-purple-100/70 transition-all active:scale-[0.97] disabled:opacity-50"
                    title="Polish & structure content with AI"
                >
                    {isPolishing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    )}
                    <span className="hidden sm:inline">Polish</span>
                </button>

                {/* Save Draft / Fast Action */}
                {userRole === 'admin' && (
                    <button
                        type="button"
                        onClick={() => onSave('draft')}
                        disabled={loading || isModLocked}
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200/80 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span>Draft</span>
                    </button>
                )}

                {/* Main Action Button with dropdown */}
                <div className="relative flex items-center">
                    <button
                        type="button"
                        onClick={() => onSave()}
                        disabled={loading || isModLocked}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-l-lg text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.97] disabled:opacity-50 ${
                            status === 'scheduled'
                                ? 'bg-purple-600 hover:bg-purple-700'
                                : status === 'pending_review'
                                ? 'bg-amber-600 hover:bg-amber-700'
                                : 'bg-stone-900 hover:bg-black'
                        }`}
                    >
                        {loading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : status === 'scheduled' ? (
                            <Clock className="w-3.5 h-3.5" />
                        ) : status === 'pending_review' ? (
                            <Eye className="w-3.5 h-3.5" />
                        ) : (
                            <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{getSaveLabel()}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                        disabled={loading || isModLocked}
                        className={`p-1.5 rounded-r-lg border-l text-white transition-colors disabled:opacity-50 ${
                            status === 'scheduled'
                                ? 'bg-purple-600 hover:bg-purple-700 border-purple-500'
                                : status === 'pending_review'
                                ? 'bg-amber-600 hover:bg-amber-700 border-amber-500'
                                : 'bg-stone-900 hover:bg-black border-stone-800'
                        }`}
                        title="More publishing options"
                    >
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Action dropdown */}
                    {isActionMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsActionMenuOpen(false)} />
                            <div className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-white border border-stone-200/80 rounded-xl shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-150">
                                {userRole === 'admin' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsActionMenuOpen(false);
                                                onSave('published');
                                            }}
                                            className="w-full px-3.5 py-2 text-left text-xs font-semibold text-stone-800 hover:bg-stone-50 flex items-center justify-between transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Send className="w-3.5 h-3.5 text-green-600" />
                                                <span>Publish Immediately</span>
                                            </div>
                                            {status === 'published' && <Check className="w-3 h-3 text-stone-400" />}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsActionMenuOpen(false);
                                                onSave('scheduled');
                                            }}
                                            className="w-full px-3.5 py-2 text-left text-xs font-semibold text-stone-800 hover:bg-stone-50 flex items-center justify-between transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-purple-600" />
                                                <span>Schedule for Later</span>
                                            </div>
                                            {status === 'scheduled' && <Check className="w-3 h-3 text-stone-400" />}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsActionMenuOpen(false);
                                                onSave('draft');
                                            }}
                                            className="w-full px-3.5 py-2 text-left text-xs font-semibold text-stone-800 hover:bg-stone-50 flex items-center justify-between transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Save className="w-3.5 h-3.5 text-stone-500" />
                                                <span>Save as Draft</span>
                                            </div>
                                            {status === 'draft' && <Check className="w-3 h-3 text-stone-400" />}
                                        </button>
                                    </>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsActionMenuOpen(false);
                                        onSave('pending_review');
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-stone-800 hover:bg-stone-50 flex items-center justify-between transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Submit for Review</span>
                                    </div>
                                    {status === 'pending_review' && <Check className="w-3 h-3 text-stone-400" />}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Side Panel Toggle */}
                <button
                    type="button"
                    onClick={onToggleSidePanel}
                    className={`p-2 rounded-lg border transition-all ${
                        isSidePanelOpen
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'text-stone-500 hover:text-stone-900 border-stone-200/80 bg-white hover:bg-stone-50'
                    }`}
                    title={isSidePanelOpen ? 'Close Side Panel' : 'Open Side Panel'}
                >
                    {isSidePanelOpen ? (
                        <PanelRightClose className="w-4 h-4" />
                    ) : (
                        <PanelRightOpen className="w-4 h-4" />
                    )}
                </button>
            </div>
        </header>
    );
}
