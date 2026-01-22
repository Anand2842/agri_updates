'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Post, Author } from '@/types/database'
import { getUserRole, UserRole } from '@/lib/auth'
import { Wand2, Sparkles, Lock, Smartphone, Monitor, Globe, Search } from 'lucide-react'
import ImageUpload from './ImageUpload'
import RichTextEditor from './editor/RichTextEditor'
import TableOfContents from './editor/TableOfContents'
import Scratchpad from './editor/Scratchpad'
import { Editor } from '@tiptap/react'

interface PostFormProps {
    initialData?: Post
}

export default function PostForm({ initialData }: PostFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [isPolishing, setIsPolishing] = useState(false)
    const [authors, setAuthors] = useState<Author[]>([])
    const [userRole, setUserRole] = useState<UserRole>('user')
    const [roleLoading, setRoleLoading] = useState(true)
    const [editorInstance, setEditorInstance] = useState<Editor | null>(null)

    // Device Preview Configuration
    type DeviceType = 'desktop' | 'mobile';
    const deviceConfig: Record<DeviceType, { name: string, width: string, icon: any }> = {
        'desktop': { name: 'Desktop', width: '100%', icon: Monitor },
        'mobile': { name: 'Mobile', width: '375px', icon: Smartphone },
    };
    const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop')

    // Fetch authors and user role on mount
    useEffect(() => {
        const init = async () => {
            const [roleData, { data: authorsData }] = await Promise.all([
                getUserRole(supabase),
                supabase.from('authors').select('*').eq('is_active', true)
            ])
            setUserRole(roleData)
            if (authorsData) setAuthors(authorsData)
            setRoleLoading(false)
        }
        init()
    }, [supabase])

    // Unified Form State (includes job-specific fields)
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        excerpt: initialData?.excerpt || '',
        content: initialData?.content || '',
        author_name: initialData?.author_name || 'Agri Updates',
        author_id: initialData?.author_id || '',
        category: initialData?.category || 'Research',
        image_url: initialData?.image_url || '',
        is_featured: initialData?.is_featured || false,
        featured_until: initialData?.featured_until || '',
        display_location: initialData?.display_location || 'standard',
        tags: initialData?.tags?.join(', ') || '',
        scheduled_for: initialData?.scheduled_for || '',
        // Job-specific fields
        company: initialData?.company || '',
        location: initialData?.location || '',
        job_type: initialData?.job_type || '',
        salary_range: initialData?.salary_range || '',
        application_link: initialData?.application_link || '',
        status: initialData?.status || 'draft',
        is_active: initialData?.is_active ?? true
    })

    // Helper to set featured duration
    const setFeaturedDuration = (days: number) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        setFormData(prev => ({ ...prev, featured_until: date.toISOString().slice(0, 16) }));
    }

    const generateSlug = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setFormData(prev => ({
            ...prev,
            title: newTitle,
            slug: !initialData ? generateSlug(newTitle) : prev.slug
        }));
    }

    // Auto-switch status to 'scheduled' if a future date is picked
    useEffect(() => {
        if (formData.scheduled_for) {
            const scheduleDate = new Date(formData.scheduled_for);
            const now = new Date();
            if (scheduleDate > now && formData.status !== 'scheduled') {
                setFormData(prev => ({ ...prev, status: 'scheduled' }));
            }
        }
    }, [formData.scheduled_for]);

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
                company: data.job_details?.company || '',
                location: data.job_details?.location || '',
                job_type: data.job_details?.job_type || prev.job_type || 'Full-time',
                salary_range: data.job_details?.salary_range || '',
                application_link: data.job_details?.application_link || '',
            }));

            // Allow editor to update
            if (editorInstance) {
                editorInstance.commands.setContent(data.content)
            }

            alert('Content polished & structured successfully!');
        } catch (error) {
            console.error('Polish error:', error);
            alert('Failed to polished content. Check API Key or try again.');
        } finally {
            setIsPolishing(false);
        }
    }

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

        return data.publicUrl
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // RBAC Check
        if (userRole === 'moderator' && formData.status === 'published') {
            alert("Moderators cannot publish posts directly. Please save as Draft or Pending.");
            setLoading(false);
            return;
        }

        const postData: Partial<Post> & Record<string, unknown> = {
            title: formData.title,
            slug: formData.slug,
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
        }

        if (formData.category === 'Jobs') {
            postData.company = formData.company
            postData.location = formData.location
            postData.job_type = formData.job_type
            postData.salary_range = formData.salary_range
            postData.application_link = formData.application_link
        }

        postData.status = formData.status
        postData.is_active = (formData.status === 'published')

        try {
            if (initialData) {
                if (userRole === 'moderator' && initialData.status === 'published') {
                    throw new Error("Moderators cannot edit published posts.");
                }

                const { error } = await supabase
                    .from('posts')
                    .update(postData)
                    .eq('id', initialData.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('posts')
                    .insert([postData])
                if (error) throw error
            }

            router.push('/admin/posts')
            router.refresh()
        } catch (error: any) {
            console.error('Error saving post:', error)
            alert(error.message || 'Failed to save post.')
        } finally {
            setLoading(false)
        }
    }

    if (roleLoading) {
        return <div className="p-8 text-center text-stone-500">Checking permissions...</div>
    }

    const isModLocked = userRole === 'moderator' && initialData?.status === 'published';

    return (
        <form onSubmit={handleSubmit} className="min-h-screen pb-20 relative">
            {isModLocked && (
                <div className="fixed inset-0 z-50 bg-stone-50/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white p-8 rounded-xl shadow-xl border border-red-200 text-center max-w-md">
                        <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="font-serif text-xl font-bold text-red-900 mb-2">Protected Content</h3>
                        <p className="text-stone-600 mb-6">
                            This post is <strong>Published</strong>. Moderators cannot make changes to live content.
                        </p>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="bg-stone-900 text-white px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm hover:bg-black"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            )}

            {/* Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-4 border-b border-stone-200 sticky top-0 z-20">
                <h2 className="font-serif text-2xl font-bold">
                    {initialData ? 'Edit Post' : 'New Post'}
                </h2>
                <div className="flex gap-3">
                    {!initialData && (
                        <button
                            type="button"
                            onClick={() => router.push('/admin/posts/generate')}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors border border-indigo-100"
                        >
                            <Wand2 className="w-4 h-4" />
                            AI Gen
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading || isModLocked}
                        className={`text-white px-6 py-2 rounded font-bold uppercase tracking-widest text-xs disabled:opacity-50 transition-colors shadow-sm
                            ${formData.status === 'scheduled' ? 'bg-purple-600 hover:bg-purple-700' :
                                formData.status === 'pending_review' ? 'bg-amber-600 hover:bg-amber-700' :
                                    'bg-green-700 hover:bg-green-800'}`}
                    >
                        {loading ? 'Saving...' :
                            (formData.status === 'scheduled' ? 'Confirm Schedule' :
                                formData.status === 'pending_review' ? 'Submit for Review' :
                                    userRole === 'moderator' ? 'Save Draft' : 'Publish')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 md:px-8 max-w-[1600px] mx-auto">

                {/* LEFT: Main Editor (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Title Input */}
                    <div>
                        <input
                            required
                            value={formData.title}
                            onChange={handleTitleChange}
                            placeholder="Post Title"
                            className="w-full p-4 bg-transparent border-none outline-none font-serif text-4xl font-bold placeholder-stone-300"
                        />
                    </div>

                    {/* Editor Controls & Container */}
                    <div className="relative">
                        <div className="flex justify-between mb-2">
                            {/* Device Switcher */}
                            <div className="flex bg-stone-100 rounded-lg p-1 gap-1">
                                {(Object.entries(deviceConfig) as [DeviceType, typeof deviceConfig['desktop']][]).map(([key, config]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setPreviewDevice(key)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                                            ${previewDevice === key
                                                ? 'bg-white shadow text-black'
                                                : 'text-stone-500 hover:text-stone-900'
                                            }`}
                                        title={`${config.name} (${config.width})`}
                                    >
                                        <config.icon className="w-3.5 h-3.5" />
                                        <span className="hidden xl:inline">{config.name}</span>
                                    </button>
                                ))}
                            </div>

                            {userRole === 'admin' && (
                                <button
                                    type="button"
                                    onClick={handlePolish}
                                    disabled={isPolishing}
                                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-600 hover:bg-purple-50 px-3 py-1 rounded transition-colors disabled:opacity-50 border border-purple-100 bg-white shadow-sm"
                                >
                                    <Sparkles className="w-3 h-3" />
                                    {isPolishing ? 'Polishing...' : 'Polish Content'}
                                </button>
                            )}
                        </div>

                        <div
                            className={`transition-all duration-300 mx-auto bg-white overflow-hidden shadow-sm border border-stone-200
                                ${previewDevice !== 'desktop' ? 'rounded-2xl border-stone-300 shadow-xl my-4 ring-4 ring-stone-900/5' : 'rounded-lg'}
                            `}
                            style={{
                                maxWidth: deviceConfig[previewDevice].width,
                                minHeight: '600px'
                            }}
                        >
                            <RichTextEditor
                                content={formData.content}
                                onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                                onImageUpload={uploadImage}
                                isEditable={!isModLocked}
                                onEditorReady={setEditorInstance}
                            />
                        </div>
                    </div>

                    {/* Job Specifics moved down for better flow */}
                    {formData.category === 'Jobs' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h3 className="font-serif text-lg font-bold text-blue-900 mb-4">Job Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    className="p-3 border rounded"
                                    placeholder="Company Name"
                                />
                                <input
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    className="p-3 border rounded"
                                    placeholder="Location"
                                />
                                <select
                                    value={formData.job_type}
                                    onChange={e => setFormData({ ...formData, job_type: e.target.value })}
                                    className="p-3 border rounded bg-white"
                                >
                                    <option value="">Job Type</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                </select>
                                <input
                                    value={formData.salary_range}
                                    onChange={e => setFormData({ ...formData, salary_range: e.target.value })}
                                    className="p-3 border rounded"
                                    placeholder="Salary Range"
                                />
                                <input
                                    value={formData.application_link}
                                    onChange={e => setFormData({ ...formData, application_link: e.target.value })}
                                    className="col-span-2 p-3 border rounded"
                                    placeholder="Application Link"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: Sidebar (4 cols) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Status Card */}
                    <div className="bg-white p-6 border border-stone-200 rounded-xl shadow-sm">
                        <h3 className="font-bold uppercase text-xs tracking-widest text-stone-500 mb-4">Publishing</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full p-2 border rounded bg-stone-50"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="pending_review">Pending Review</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>

                            {formData.status === 'scheduled' && (
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 mb-1">Schedule For</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.scheduled_for}
                                        onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                                        className="w-full p-2 border rounded bg-stone-50"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full p-2 border rounded bg-stone-50"
                                >
                                    <option value="Research">Research & News</option>
                                    <option value="Jobs">Jobs & Opportunities</option>
                                    <option value="Fellowships">Fellowships</option>
                                    <option value="Scholarships">Scholarships</option>
                                    <option value="Grants">Grants & Funding</option>
                                    <option value="Exams">Exams & Admissions</option>
                                    <option value="Events">Conferences & Events</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SEO Card (New) */}
                    <div className="bg-white p-6 border border-stone-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-blue-600">
                            <Search className="w-4 h-4" />
                            <h3 className="font-bold uppercase text-xs tracking-widest">SEO & Metadata</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-1">URL Slug</label>
                                <div className="flex items-center bg-stone-50 border rounded px-2">
                                    <span className="text-stone-400 text-xs">/</span>
                                    <input
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full p-2 bg-transparent text-sm border-none outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-1">Meta Description (Excerpt)</label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full p-2 border rounded bg-stone-50 text-sm h-24 resize-none"
                                    placeholder="Brief summary for Google results..."
                                />
                                <div className="flex justify-between mt-1">
                                    <p className="text-[10px] text-stone-400">Recommended: 150-160 characters</p>
                                    <p className={`text-[10px] ${formData.excerpt.length > 160 ? 'text-red-500' : 'text-stone-400'}`}>
                                        {formData.excerpt.length} chars
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-1">Canonical URL</label>
                                <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 p-2 rounded truncate">
                                    <Globe className="w-3 h-3" />
                                    <span className="truncate">https://agriupdates.online/blog/{formData.slug || '...'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table of Contents */}
                    <TableOfContents editor={editorInstance} />

                    {/* Scratchpad */}
                    <Scratchpad />

                    {/* Meta Card (Author, Tags, Image) */}
                    <div className="bg-white p-6 border border-stone-200 rounded-xl shadow-sm space-y-4">
                        <h3 className="font-bold uppercase text-xs tracking-widest text-stone-500">Post Details</h3>

                        <div>
                            <label className="block text-xs font-bold text-stone-400 mb-1">Author</label>
                            <input
                                value={formData.author_name}
                                onChange={e => setFormData({ ...formData, author_name: e.target.value })}
                                className="w-full p-2 border rounded bg-stone-50"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-400 mb-1">Tags</label>
                            <input
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full p-2 border rounded bg-stone-50"
                                placeholder="Comma separated"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-400 mb-1">Cover Image</label>
                            <ImageUpload
                                value={formData.image_url}
                                onChange={(url) => setFormData({ ...formData, image_url: url })}
                            />
                        </div>
                    </div>

                    {/* Featured settings */}
                    <div className="bg-amber-50 p-6 border border-amber-200 rounded-xl shadow-sm">
                        <label className="flex items-center gap-2 mb-4 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_featured}
                                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                className="w-4 h-4 text-amber-600 rounded"
                            />
                            <span className="font-bold uppercase text-xs tracking-widest text-amber-800">Featured Post</span>
                        </label>

                        {formData.is_featured && (
                            <div>
                                <label className="block text-xs font-bold text-amber-700 mb-1">Featured Until</label>
                                <div className="flex gap-2 mb-2">
                                    <button type="button" onClick={() => setFeaturedDuration(7)} className="xs-btn bg-white border px-2 py-1 text-xs rounded">7d</button>
                                    <button type="button" onClick={() => setFeaturedDuration(14)} className="xs-btn bg-white border px-2 py-1 text-xs rounded">14d</button>
                                    <button type="button" onClick={() => setFeaturedDuration(30)} className="xs-btn bg-white border px-2 py-1 text-xs rounded">30d</button>
                                </div>
                                <input
                                    type="datetime-local"
                                    value={formData.featured_until}
                                    onChange={(e) => setFormData({ ...formData, featured_until: e.target.value })}
                                    className="w-full p-2 border rounded bg-white text-sm"
                                />
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-amber-200">
                            <label className="block text-xs font-bold text-amber-700 mb-1">Display Location</label>
                            <select
                                value={formData.display_location}
                                onChange={e => setFormData({ ...formData, display_location: e.target.value as any })}
                                className="w-full p-2 border rounded bg-white text-sm"
                            >
                                <option value="standard">Standard Feed</option>
                                <option value="hero">Main Hero</option>
                                <option value="featured">Featured Grid</option>
                                <option value="trending">Trending</option>
                                <option value="dont_miss">Don't Miss</option>
                            </select>
                        </div>
                    </div>

                </div>
            </div>
        </form>
    )
}
