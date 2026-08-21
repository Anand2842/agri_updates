'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Post, Category } from '@/types/database';
import { getUserRole, UserRole } from '@/lib/auth';
import { Editor } from '@tiptap/react';
import RichTextEditor from './editor/RichTextEditor';
import WriterAppBar from './writer/WriterAppBar';
import WriterStatusBar from './writer/WriterStatusBar';
import WriterSidePanel from './writer/WriterSidePanel';
import StoryTemplatesModal, { StoryTemplate } from './writer/StoryTemplatesModal';
import AIAssistantTools from './writer/AIAssistantTools';
import { WriterFormData } from './writer/types';

interface PostFormProps {
    initialData?: Post;
}

export default function PostForm({ initialData }: PostFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [isPolishing, setIsPolishing] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [userRole, setUserRole] = useState<UserRole>('user');
    const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

    // UI View State
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [saveState, setSaveState] = useState<'saved' | 'saving' | 'unsaved'>('saved');
    const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
    const [isAIToolsOpen, setIsAIToolsOpen] = useState(false);

    // Fetch categories and user role on mount
    useEffect(() => {
        const init = async () => {
            const [roleData, { data: categoriesData }] = await Promise.all([
                getUserRole(supabase),
                supabase.from('categories').select('*').eq('is_active', true).order('name')
            ]);
            setUserRole(roleData);
            if (categoriesData) setCategories(categoriesData);
        };
        init();
    }, [supabase]);

    // Unified Form State
    const [formData, setFormData] = useState<WriterFormData>({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        excerpt: initialData?.excerpt || '',
        content: initialData?.content || '',
        author_name: initialData?.author_name || (typeof window !== 'undefined' ? localStorage.getItem('lastAuthor') : null) || 'Agri Updates',
        author_id: initialData?.author_id || '',
        category: initialData?.category || 'Research',
        image_url: initialData?.image_url || '',
        is_featured: initialData?.is_featured || false,
        featured_until: initialData?.featured_until || '',
        display_location: initialData?.display_location || 'standard',
        tags: initialData?.tags?.join(', ') || '',
        scheduled_for: initialData?.scheduled_for || '',
        company: initialData?.company || '',
        location: initialData?.location || '',
        job_type: initialData?.job_type || 'Full-time',
        salary_range: initialData?.salary_range || '',
        application_link: initialData?.application_link || '',
        status: initialData?.status || 'draft',
        is_active: initialData?.is_active ?? true,
        policy_rules: initialData?.policy_rules || null,
        attachment_url: initialData?.attachment_url || '',
        attachment_type: initialData?.attachment_type || '',
    });

    // Auto slug generator
    const generateSlug = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setSaveState('unsaved');
        setFormData(prev => ({
            ...prev,
            title: newTitle,
            slug: !initialData ? generateSlug(newTitle) : prev.slug
        }));
    };

    const handleContentChange = useCallback((newContent: string) => {
        setSaveState('unsaved');
        setFormData(prev => ({ ...prev, content: newContent }));
    }, []);

    // Remember author preference
    useEffect(() => {
        if (formData.author_name && typeof window !== 'undefined') {
            localStorage.setItem('lastAuthor', formData.author_name);
        }
    }, [formData.author_name]);

    // Auto-excerpt generator if empty
    useEffect(() => {
        if (!formData.excerpt && formData.content && formData.content.length > 50) {
            const plainText = formData.content.replace(/<[^>]*>/g, '').trim();
            const autoExcerpt = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
            setFormData(prev => ({ ...prev, excerpt: autoExcerpt }));
        }
    }, [formData.content, formData.excerpt]);

    // Auto-switch status to 'scheduled' if a future date is picked
    useEffect(() => {
        if (formData.scheduled_for) {
            const scheduleDate = new Date(formData.scheduled_for);
            const now = new Date();
            if (scheduleDate > now && formData.status !== 'scheduled') {
                setFormData(prev => ({ ...prev, status: 'scheduled' }));
            }
        }
    }, [formData.scheduled_for, formData.status]);

    // AI Polish Content
    const handlePolish = async () => {
        if (!formData.content || formData.content.length < 10) {
            alert('Please write some content first to polish.');
            return;
        }

        setIsPolishing(true);
        try {
            const res = await fetch('/api/ai/polish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: formData.content })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to polish');

            setFormData(prev => ({
                ...prev,
                content: data.content,
                title: data.title || prev.title,
                slug: data.slug ? generateSlug(data.title) : prev.slug,
                excerpt: data.excerpt || prev.excerpt,
                category: data.category || prev.category,
                company: data.job_details?.company || prev.company,
                location: data.job_details?.location || prev.location,
                job_type: data.job_details?.job_type || prev.job_type || 'Full-time',
                salary_range: data.job_details?.salary_range || prev.salary_range,
                application_link: data.job_details?.application_link || prev.application_link,
            }));

            if (editorInstance) {
                editorInstance.commands.setContent(data.content);
            }

            setSaveState('unsaved');
            alert('Content polished & structured successfully!');
        } catch (error) {
            console.error('Polish error:', error);
            alert('Failed to polish content. Please check API configuration or try again.');
        } finally {
            setIsPolishing(false);
        }
    };

    // Upload cover image
    const uploadImage = async (file: File): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `content/${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);

        return data.publicUrl;
    };

    // Upload attachment for warnings
    const uploadAttachment = async (file: File): Promise<{ url: string; type: string }> => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const typeMap: Record<string, string> = {
            pdf: 'pdf', pptx: 'ppt', ppt: 'ppt',
            html: 'html', htm: 'html',
            mp4: 'video', webm: 'video', mov: 'video', avi: 'video', mkv: 'video',
        };
        const attachType = typeMap[ext] || 'pdf';
        const fileName = `warning-attachments/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from('attachments')
            .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('attachments')
            .getPublicUrl(fileName);

        return { url: data.publicUrl, type: attachType };
    };

    // Autosave to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined' && formData.title) {
            const draftKey = `draft_story_${initialData?.id || 'new'}`;
            localStorage.setItem(draftKey, JSON.stringify({ ...formData, updatedAt: Date.now() }));
        }
    }, [formData, initialData?.id]);

    // Primary Save / Publish Handler
    const handleSave = async (targetStatus?: string) => {
        const effectiveStatus = targetStatus || formData.status;

        // RBAC validation
        if (userRole === 'moderator' && effectiveStatus === 'published') {
            alert('Moderators cannot publish directly. Please save as Draft or Submit for Review.');
            return;
        }

        if (!formData.title.trim()) {
            alert('Please provide a story headline / title.');
            return;
        }

        setLoading(true);
        setSaveState('saving');

        const postData: Partial<Post> & Record<string, unknown> = {
            title: formData.title,
            slug: formData.slug || generateSlug(formData.title),
            excerpt: formData.excerpt,
            content: formData.content,
            author_id: formData.author_id || null,
            author_name: formData.author_name,
            category: formData.category,
            image_url: formData.image_url,
            is_featured: formData.is_featured,
            featured_until: formData.is_featured && formData.featured_until ? formData.featured_until : null,
            display_location: formData.display_location,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            published_at: initialData?.published_at || new Date().toISOString(),
            scheduled_for: formData.scheduled_for || null,
            status: effectiveStatus as Post['status'],
            company: formData.category === 'Jobs' ? formData.company : null,
            location: formData.category === 'Jobs' ? formData.location : null,
            job_type: formData.category === 'Jobs' ? formData.job_type : null,
            salary_range: formData.category === 'Jobs' ? formData.salary_range : null,
            application_link: formData.category === 'Jobs' ? formData.application_link : null,
            policy_rules: formData.category === 'Grants' ? formData.policy_rules : null,
            attachment_url: formData.category === 'Warnings' ? formData.attachment_url : null,
            attachment_type: formData.category === 'Warnings' ? (formData.attachment_type as Post['attachment_type']) : null,
        };

        try {
            if (initialData?.id) {
                const { error } = await supabase
                    .from('posts')
                    .update(postData)
                    .eq('id', initialData.id);

                if (error) throw error;
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                const { data: newPost, error } = await supabase
                    .from('posts')
                    .insert([{ ...postData, user_id: user?.id }])
                    .select('id')
                    .single();

                if (error) throw error;
                if (newPost?.id) {
                    router.replace(`/admin/posts/${newPost.id}`);
                }
            }

            setSaveState('saved');
            router.refresh();
        } catch (err: unknown) {
            console.error('Save failed:', err);
            const message = err instanceof Error ? err.message : 'Unknown error';
            alert(`Save failed: ${message}`);
            setSaveState('unsaved');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTemplate = (template: StoryTemplate) => {
        setFormData(prev => ({
            ...prev,
            title: prev.title || template.defaultTitle,
            excerpt: prev.excerpt || template.defaultExcerpt,
            category: template.category || prev.category,
            content: template.htmlContent,
        }));
        if (editorInstance) {
            editorInstance.commands.setContent(template.htmlContent);
        }
        setSaveState('unsaved');
    };

    const handleApplyHeadline = (headline: string) => {
        setFormData(prev => ({ ...prev, title: headline }));
        setSaveState('unsaved');
    };

    const handleInsertTakeaways = (html: string) => {
        if (editorInstance) {
            editorInstance.commands.insertContentAt(0, html);
        }
        setSaveState('unsaved');
    };

    const isModLocked = userRole === 'moderator' && initialData?.status === 'published';

    return (
        <div className="min-h-screen bg-[#F5F5F2] flex flex-col -mx-4 -my-5 md:-mx-8 md:-my-6">
            {/* 1. TOP APP BAR */}
            <WriterAppBar
                title={formData.title}
                status={formData.status}
                saveState={saveState}
                isPolishing={isPolishing}
                loading={loading}
                isModLocked={isModLocked}
                userRole={userRole}
                previewDevice={previewDevice}
                isSidePanelOpen={isSidePanelOpen && !isFocusMode}
                onToggleSidePanel={() => setIsSidePanelOpen(!isSidePanelOpen)}
                onSetPreviewDevice={setPreviewDevice}
                onPolish={handlePolish}
                onOpenTemplates={() => setIsTemplatesOpen(true)}
                onOpenAITools={() => setIsAIToolsOpen(true)}
                onSave={handleSave}
            />

            {/* 2. MAIN WORKSPACE: CANVAS + RIGHT SIDE PANEL */}
            <div className="flex-1 flex flex-col lg:flex-row relative">
                {/* CANVAS WRAPPER */}
                <main className="flex-1 overflow-y-auto px-3 sm:px-8 py-6 pb-20 flex justify-center">
                    <div
                        className={`w-full transition-all duration-300 ${
                            previewDevice === 'mobile'
                                ? 'max-w-[385px] bg-white rounded-3xl shadow-2xl border-4 border-stone-800 my-4 p-4 overflow-hidden'
                                : isFocusMode
                                ? 'max-w-4xl bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 sm:p-12'
                                : 'max-w-3xl bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 sm:p-10'
                        }`}
                    >
                        {/* Headline / Title input (Google Docs Large Continuous H1) */}
                        <div className="mb-4 pb-2 border-b border-stone-100">
                            <input
                                required
                                value={formData.title}
                                onChange={handleTitleChange}
                                placeholder="Headline / Story Title..."
                                className="w-full bg-transparent border-none outline-none font-serif text-2xl sm:text-4xl font-bold placeholder-stone-300 focus:placeholder-stone-400 text-stone-900 leading-tight"
                            />
                        </div>

                        {/* TipTap Rich Text Body Canvas */}
                        <RichTextEditor
                            content={formData.content}
                            onChange={handleContentChange}
                            onImageUpload={uploadImage}
                            onEditorReady={setEditorInstance}
                            borderless={true}
                        />
                    </div>
                </main>

                {/* 3. CONTEXTUAL RIGHT SIDE PANEL */}
                {!isFocusMode && (
                    <WriterSidePanel
                        isOpen={isSidePanelOpen}
                        onClose={() => setIsSidePanelOpen(false)}
                        formData={formData}
                        setFormData={setFormData}
                        categories={categories}
                        userRole={userRole}
                        editorInstance={editorInstance}
                        storyId={initialData?.id}
                        uploadAttachment={uploadAttachment}
                        onRestoreSnapshot={(snapshot) => {
                            setFormData(prev => ({
                                ...prev,
                                title: snapshot.title,
                                content: snapshot.content
                            }));
                            if (editorInstance) {
                                editorInstance.commands.setContent(snapshot.content);
                            }
                            setSaveState('unsaved');
                        }}
                    />
                )}
            </div>

            {/* 4. BOTTOM STATUS BAR */}
            <WriterStatusBar
                content={formData.content}
                isFocusMode={isFocusMode}
                onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
            />

            {/* 5. EDITORIAL TEMPLATES MODAL */}
            <StoryTemplatesModal
                isOpen={isTemplatesOpen}
                onClose={() => setIsTemplatesOpen(false)}
                onSelectTemplate={handleSelectTemplate}
            />

            {/* 6. AI INTELLIGENCE SUITE MODAL */}
            <AIAssistantTools
                isOpen={isAIToolsOpen}
                onClose={() => setIsAIToolsOpen(false)}
                formData={formData}
                onApplyHeadline={handleApplyHeadline}
                onInsertTakeaways={handleInsertTakeaways}
            />
        </div>
    );
}
