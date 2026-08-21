'use client';

import React, { useState } from 'react';
import {
    Settings,
    Search,
    Layers,
    ListTree,
    X,
    Calendar,
    Tag,
    User,
    Paperclip,
    AlertTriangle,
    Briefcase,
    DollarSign,
    ShieldCheck,
    History,
    MessageSquare
} from 'lucide-react';
import ImageUpload from '../ImageUpload';
import EligibilityEditor from '../editor/EligibilityEditor';
import StoryQualityChecklist from './StoryQualityChecklist';
import VersionHistory, { VersionSnapshot } from './VersionHistory';
import EditorialNotes from './EditorialNotes';
import { Category } from '@/types/database';
import { UserRole } from '@/lib/auth';
import { Editor } from '@tiptap/react';
import { WriterFormData } from './types';

export type SidePanelTab = 'settings' | 'seo' | 'qa' | 'notes' | 'history' | 'specifics' | 'outline';

interface WriterSidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    formData: WriterFormData;
    setFormData: React.Dispatch<React.SetStateAction<WriterFormData>>;
    categories: Category[];
    userRole: UserRole;
    editorInstance: Editor | null;
    storyId?: string;
    uploadAttachment: (file: File) => Promise<{ url: string; type: string }>;
    onRestoreSnapshot?: (snapshot: VersionSnapshot) => void;
}

export default function WriterSidePanel({
    isOpen,
    onClose,
    formData,
    setFormData,
    categories,
    userRole,
    editorInstance,
    storyId,
    uploadAttachment,
    onRestoreSnapshot,
}: WriterSidePanelProps) {
    const [activeTab, setActiveTab] = useState<SidePanelTab>('settings');

    const hasCategorySpecifics = ['Jobs', 'Warnings', 'Grants'].includes(formData.category);

    const generateExcerpt = () => {
        if (!formData.content) return;
        const plainText = formData.content.replace(/<[^>]*>/g, ' ').trim();
        const auto = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
        setFormData(prev => ({ ...prev, excerpt: auto }));
    };

    // Table of contents items
    const [tocItems, setTocItems] = useState<{ id: string; text: string; level: number }[]>([]);

    React.useEffect(() => {
        if (!editorInstance) return;

        const updateToc = () => {
            const items: { id: string; text: string; level: number }[] = [];
            editorInstance.state.doc.descendants((node) => {
                if (node.type.name === 'heading') {
                    const text = node.textContent;
                    const id = node.attrs.id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    if (text) {
                        items.push({ id, text, level: node.attrs.level });
                    }
                }
            });
            setTocItems(items);
        };

        updateToc();
        editorInstance.on('update', updateToc);
        return () => {
            editorInstance.off('update', updateToc);
        };
    }, [editorInstance]);

    if (!isOpen) return null;

    return (
        <aside className="w-full lg:w-[320px] xl:w-[360px] bg-white border-l border-stone-200/80 flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 shrink-0 shadow-lg lg:shadow-none z-20 transition-all">
            {/* Tab Header with horizontal scroll */}
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-stone-200/80 bg-stone-50/70">
                <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none py-0.5">
                    <button
                        type="button"
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
                            activeTab === 'settings'
                                ? 'bg-white text-stone-900 shadow-xs'
                                : 'text-stone-500 hover:text-stone-800'
                        }`}
                        title="Story Settings"
                    >
                        <Settings className="w-3 h-3" />
                        <span>Settings</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('seo')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
                            activeTab === 'seo'
                                ? 'bg-white text-stone-900 shadow-xs'
                                : 'text-stone-500 hover:text-stone-800'
                        }`}
                        title="SEO & Snippet"
                    >
                        <Search className="w-3 h-3" />
                        <span>SEO</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('qa')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
                            activeTab === 'qa'
                                ? 'bg-white text-stone-900 shadow-xs'
                                : 'text-stone-500 hover:text-stone-800'
                        }`}
                        title="Editorial QA"
                    >
                        <ShieldCheck className="w-3 h-3" />
                        <span>QA</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('notes')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
                            activeTab === 'notes'
                                ? 'bg-white text-stone-900 shadow-xs'
                                : 'text-stone-500 hover:text-stone-800'
                        }`}
                        title="Editorial Notes"
                    >
                        <MessageSquare className="w-3 h-3" />
                        <span>Notes</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
                            activeTab === 'history'
                                ? 'bg-white text-stone-900 shadow-xs'
                                : 'text-stone-500 hover:text-stone-800'
                        }`}
                        title="Version History"
                    >
                        <History className="w-3 h-3" />
                        <span>History</span>
                    </button>

                    {hasCategorySpecifics && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('specifics')}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap relative ${
                                activeTab === 'specifics'
                                    ? 'bg-white text-stone-900 shadow-xs'
                                    : 'text-stone-500 hover:text-stone-800'
                            }`}
                            title="Category Specifics"
                        >
                            <Layers className="w-3 h-3" />
                            <span>Details</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-agri-green"></span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setActiveTab('outline')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
                            activeTab === 'outline'
                                ? 'bg-white text-stone-900 shadow-xs'
                                : 'text-stone-500 hover:text-stone-800'
                        }`}
                        title="Document Outline"
                    >
                        <ListTree className="w-3 h-3" />
                        <span>Outline</span>
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-md text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 transition-colors ml-1"
                    title="Close panel"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">

                {/* ─── TAB 1: STORY SETTINGS ─── */}
                {activeTab === 'settings' && (
                    <div className="space-y-4">
                        {/* Category */}
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 outline-none focus:ring-1 focus:ring-stone-900"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                                {categories.length === 0 && (
                                    <option value="Research">Research</option>
                                )}
                            </select>
                        </div>

                        {/* Author */}
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                                Author Byline
                            </label>
                            <div className="relative">
                                <User className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                                <input
                                    value={formData.author_name}
                                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                    placeholder="Author name"
                                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 outline-none focus:ring-1 focus:ring-stone-900"
                                />
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                                Cover Image
                            </label>
                            <ImageUpload
                                value={formData.image_url}
                                onChange={(url) => setFormData({ ...formData, image_url: url })}
                            />
                        </div>

                        {/* Display Placement */}
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                                Display Placement
                            </label>
                            <select
                                value={formData.display_location}
                                onChange={(e) => setFormData({ ...formData, display_location: e.target.value as WriterFormData['display_location'] })}
                                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 outline-none focus:ring-1 focus:ring-stone-900"
                            >
                                <option value="standard">Standard Article Feed</option>
                                <option value="hero">Hero & Highlights Section</option>
                                <option value="trending">Trending Sidebar</option>
                                <option value="dont_miss">Don&apos;t Miss Grid</option>
                            </select>
                        </div>

                        {/* Feature Toggle (Admin only) */}
                        {userRole === 'admin' && (
                            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 space-y-2.5">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                        className="w-4 h-4 text-amber-600 rounded"
                                    />
                                    <span className="font-bold text-xs text-amber-900">⭐ Mark as Featured Story</span>
                                </label>

                                {formData.is_featured && (
                                    <div>
                                        <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                                            Featured Until
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.featured_until}
                                            onChange={(e) => setFormData({ ...formData, featured_until: e.target.value })}
                                            className="w-full p-2 bg-white border border-amber-200 rounded-lg text-xs"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Scheduled Publishing */}
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                                Schedule Publication
                            </label>
                            <div className="relative">
                                <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                                <input
                                    type="datetime-local"
                                    value={formData.scheduled_for}
                                    onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 outline-none focus:ring-1 focus:ring-stone-900"
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                                Tags (comma separated)
                            </label>
                            <div className="relative">
                                <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                                <input
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="agritech, seeds, funding"
                                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 outline-none focus:ring-1 focus:ring-stone-900"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── TAB 2: SEO & SOCIAL ─── */}
                {activeTab === 'seo' && (
                    <div className="space-y-4">
                        {/* URL Slug */}
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                                URL Slug
                            </label>
                            <div className="flex items-center gap-1.5 p-2 bg-stone-50 border border-stone-200 rounded-xl">
                                <span className="text-[11px] text-stone-400 shrink-0">/blog/</span>
                                <input
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="article-slug"
                                    className="w-full bg-transparent text-xs font-mono text-stone-900 outline-none"
                                />
                            </div>
                        </div>

                        {/* Excerpt / Meta Description */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                                    Meta Excerpt ({formData.excerpt.length}/160)
                                </label>
                                <button
                                    type="button"
                                    onClick={generateExcerpt}
                                    className="text-[11px] font-semibold text-agri-green hover:underline"
                                >
                                    Auto-generate
                                </button>
                            </div>
                            <textarea
                                rows={3}
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                placeholder="Short synopsis for search engines and social cards..."
                                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:ring-1 focus:ring-stone-900"
                            />
                        </div>

                        {/* Google SERP Snippet Preview */}
                        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                Google Search Preview
                            </span>
                            <div className="space-y-1">
                                <p className="text-xs text-stone-500 truncate">
                                    https://agriupdates.com › blog › {formData.slug || 'story-slug'}
                                </p>
                                <h4 className="text-sm font-semibold text-[#1a0dab] line-clamp-1 hover:underline cursor-pointer">
                                    {formData.title || 'Story Title — Agri Updates'}
                                </h4>
                                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                                    {formData.excerpt || 'Read the latest agricultural updates, policies, and market trends on Agri Updates.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── TAB 3: QUALITY ASSURANCE (QA) ─── */}
                {activeTab === 'qa' && (
                    <StoryQualityChecklist
                        formData={formData}
                        onTabSwitch={(tab) => setActiveTab(tab)}
                    />
                )}

                {/* ─── TAB 4: EDITORIAL NOTES ─── */}
                {activeTab === 'notes' && (
                    <EditorialNotes
                        storyId={storyId}
                        authorName={formData.author_name}
                        userRole={userRole}
                    />
                )}

                {/* ─── TAB 5: VERSION HISTORY & SNAPSHOTS ─── */}
                {activeTab === 'history' && (
                    <VersionHistory
                        formData={formData}
                        storyId={storyId}
                        onRestore={(snapshot) => {
                            if (onRestoreSnapshot) {
                                onRestoreSnapshot(snapshot);
                            } else {
                                setFormData(prev => ({
                                    ...prev,
                                    title: snapshot.title,
                                    content: snapshot.content
                                }));
                                if (editorInstance) {
                                    editorInstance.commands.setContent(snapshot.content);
                                }
                            }
                        }}
                    />
                )}

                {/* ─── TAB 6: CATEGORY SPECIFICS ─── */}
                {activeTab === 'specifics' && hasCategorySpecifics && (
                    <div className="space-y-4">
                        {formData.category === 'Jobs' && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                                    <Briefcase className="w-4 h-4 text-stone-700" />
                                    <h4 className="font-semibold text-sm text-stone-900">Job Posting Details</h4>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-stone-500 mb-1">Company</label>
                                    <input
                                        value={formData.company}
                                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                                        placeholder="e.g. AgriTech Innovations"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-stone-500 mb-1">Location</label>
                                    <input
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                                        placeholder="e.g. Pune, MH / Remote"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-stone-500 mb-1">Job Type</label>
                                    <select
                                        value={formData.job_type}
                                        onChange={e => setFormData({ ...formData, job_type: e.target.value })}
                                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-stone-500 mb-1">Salary / CTC Range</label>
                                    <input
                                        value={formData.salary_range}
                                        onChange={e => setFormData({ ...formData, salary_range: e.target.value })}
                                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                                        placeholder="e.g. ₹6-8 LPA"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-stone-500 mb-1">Application URL or Email</label>
                                    <input
                                        value={formData.application_link}
                                        onChange={e => setFormData({ ...formData, application_link: e.target.value })}
                                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                                        placeholder="https://company.com/jobs/123"
                                    />
                                </div>
                            </div>
                        )}

                        {formData.category === 'Warnings' && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    <h4 className="font-semibold text-sm text-stone-900">Advisory Attachment</h4>
                                </div>

                                <p className="text-xs text-stone-500">
                                    Upload official circular, advisory notice, or guidance document.
                                </p>

                                {formData.attachment_url ? (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                                        <div className="min-w-0 pr-2">
                                            <p className="text-xs font-bold text-amber-900 uppercase">
                                                {formData.attachment_type?.toUpperCase() || 'File'} Attached
                                            </p>
                                            <p className="text-[11px] text-stone-500 truncate">{formData.attachment_url}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, attachment_url: '', attachment_type: '' }))}
                                            className="text-xs text-red-600 font-semibold px-2 py-1 bg-white border border-red-200 rounded-lg"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-200 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors text-center">
                                        <Paperclip className="w-5 h-5 text-stone-400 mb-1" />
                                        <span className="text-xs font-semibold text-stone-700">Upload Alert Document</span>
                                        <span className="text-[10px] text-stone-400 mt-0.5">PDF, PPTX, HTML, MP4</span>
                                        <input
                                            type="file"
                                            accept=".pdf,.ppt,.pptx,.html,.htm,.mp4,.webm"
                                            className="sr-only"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                try {
                                                    const { url, type } = await uploadAttachment(file);
                                                    setFormData(prev => ({ ...prev, attachment_url: url, attachment_type: type }));
                                                } catch (err) {
                                                    alert('Upload failed.');
                                                    console.error(err);
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                        )}

                        {formData.category === 'Grants' && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    <h4 className="font-semibold text-sm text-stone-900">Grant Eligibility Rules</h4>
                                </div>
                                <EligibilityEditor
                                    value={formData.policy_rules}
                                    onChange={(rules) => setFormData({ ...formData, policy_rules: rules })}
                                    onGenerate={() => alert('Add eligibility criteria for this scheme.')}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* ─── TAB 7: OUTLINE ─── */}
                {activeTab === 'outline' && (
                    <div className="space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            Document Outline ({tocItems.length} headings)
                        </span>

                        {tocItems.length > 0 ? (
                            <ul className="space-y-1.5 border-l border-stone-200 pl-3">
                                {tocItems.map((item, idx) => (
                                    <li
                                        key={`${item.id}-${idx}`}
                                        style={{ paddingLeft: `${(item.level - 1) * 8}px` }}
                                    >
                                        <span className={`block text-xs text-stone-600 truncate ${item.level === 1 ? 'font-bold text-stone-900' : ''}`}>
                                            {item.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-stone-400 italic py-4 text-center">
                                Headings added to the canvas will automatically generate an outline here.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}
