'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Post } from '@/types/database'
import dynamic from 'next/dynamic'

import { Image as ImageIcon, Wand2 } from 'lucide-react'
import ImageUpload from './ImageUpload'

// Dynamically import Quill to avoid SSR issues
const ReactQuill = dynamic(
    () => import('react-quill-new').then((mod) => mod.default),
    { ssr: false, loading: () => <p>Loading Editor...</p> }
);
import 'react-quill-new/dist/quill.snow.css';

interface PostFormProps {
    initialData?: Post
}

export default function PostForm({ initialData }: PostFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    // Unified Form State (includes job-specific fields)
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        excerpt: initialData?.excerpt || '',
        content: initialData?.content || '',
        author_name: initialData?.author_name || 'Agri Updates',
        category: initialData?.category || 'Research',
        image_url: initialData?.image_url || '',
        is_featured: initialData?.is_featured || false,
        display_location: initialData?.display_location || 'standard',
        // Job-specific fields
        company: initialData?.company || '',
        location: initialData?.location || '',
        job_type: initialData?.job_type || '',
        salary_range: initialData?.salary_range || '',
        application_link: initialData?.application_link || '',
        status: initialData?.status || 'draft',
        is_active: initialData?.is_active ?? true
    })

    const generateSlug = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/[^\w\-]+/g, '') // Remove all non-word chars
            .replace(/\-\-+/g, '-')   // Replace multiple - with single -
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setFormData(prev => ({
            ...prev,
            title: newTitle,
            slug: !initialData ? generateSlug(newTitle) : prev.slug
        }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const postData: any = {
            title: formData.title,
            slug: formData.slug,
            excerpt: formData.excerpt,
            content: formData.content,
            author_name: formData.author_name,
            category: formData.category,
            image_url: formData.image_url,
            is_featured: formData.is_featured,
            display_location: formData.display_location,
            published_at: initialData?.published_at || new Date().toISOString()
        }

        // Add job-specific fields if category is Jobs
        if (formData.category === 'Jobs') {
            postData.company = formData.company
            postData.location = formData.location
            postData.job_type = formData.job_type
            postData.salary_range = formData.salary_range
            postData.application_link = formData.application_link
        }

        // Save status
        postData.status = formData.status
        // Sync is_active for backward compatibility
        postData.is_active = (formData.status === 'published')

        try {
            if (initialData) {
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
        } catch (error) {
            console.error('Error saving post:', error)
            alert('Failed to save post.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 border border-stone-200 shadow-sm max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-2xl font-bold">
                    {initialData ? 'Edit Post' : 'Write New Post'}
                </h2>
                {!initialData && (
                    <button
                        type="button"
                        onClick={() => router.push('/admin/posts/generate')}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
                    >
                        <Wand2 className="w-4 h-4" />
                        Generate with AI
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Title</label>
                    <input
                        required
                        value={formData.title}
                        onChange={handleTitleChange}
                        className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black font-serif text-lg"
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Slug (URL)</label>
                        <input
                            required
                            value={formData.slug}
                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black font-mono text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Category *</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black transition-colors"
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="Research">Research & News</option>
                            <option value="Jobs">Jobs & Opportunities</option>
                            <option value="Fellowships">Fellowships</option>
                            <option value="Scholarships">Scholarships</option>
                            <option value="Grants">Grants & Funding</option>
                            <option value="Exams">Exams & Admissions</option>
                            <option value="Events">Conferences & Events</option>
                            <option value="Guidance">Application Guidance</option>
                            <option value="Warnings">Warnings & Awareness</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Author Name</label>
                    <input
                        value={formData.author_name}
                        onChange={e => setFormData({ ...formData, author_name: e.target.value })}
                        className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Excerpt (Short Summary)</label>
                    <textarea
                        rows={3}
                        value={formData.excerpt}
                        onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                        className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black"
                    />
                </div>

                {/* Job-specific fields - shown only when category is Jobs */}
                {formData.category === 'Jobs' && (
                    <div className="grid grid-cols-2 gap-6 p-6 bg-blue-50 border border-blue-200 rounded">
                        <h3 className="col-span-2 font-serif text-lg font-bold text-blue-900">Job Details</h3>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Company Name *</label>
                            <input
                                required={formData.category === 'Jobs'}
                                value={formData.company}
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                className="w-full p-3 bg-white border border-stone-200 outline-none focus:border-black"
                                placeholder="e.g. AgriTech Solutions"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Location</label>
                            <input
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                className="w-full p-3 bg-white border border-stone-200 outline-none focus:border-black"
                                placeholder="e.g. Bangalore, Remote, Pan India"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Job Type</label>
                            <select
                                value={formData.job_type}
                                onChange={e => setFormData({ ...formData, job_type: e.target.value })}
                                className="w-full p-3 bg-white border border-stone-200 outline-none focus:border-black"
                            >
                                <option value="">Select Type</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                                <option value="Remote">Remote</option>
                                <option value="Part-time">Part-time</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Salary Range</label>
                            <input
                                value={formData.salary_range}
                                onChange={e => setFormData({ ...formData, salary_range: e.target.value })}
                                className="w-full p-3 bg-white border border-stone-200 outline-none focus:border-black"
                                placeholder="e.g. ₹5-8 LPA, Not Disclosed"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Application Link</label>
                            <input
                                value={formData.application_link}
                                onChange={e => setFormData({ ...formData, application_link: e.target.value })}
                                className="w-full p-3 bg-white border border-stone-200 outline-none focus:border-black font-mono text-sm"
                                placeholder="/jobs/apply/[slug] or external URL"
                            />
                            <p className="text-xs text-stone-500 mt-1">Use /jobs/apply/[slug] for internal applications or paste external URL</p>
                        </div>


                    </div>
                )}

                <div className="prose-editor">
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Content</label>
                    <ReactQuill
                        theme="snow"
                        value={formData.content}
                        onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                        className="bg-white h-96 mb-12"
                    />
                </div>

            </div>

            <div className="mt-8">
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">Cover Image</label>
                <ImageUpload
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                />
            </div>

            <div className="mt-8 p-6 bg-stone-50 border border-stone-200">
                <h3 className="font-serif text-lg font-bold mb-4">Display Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Display Location</label>
                        <select
                            value={formData.display_location}
                            onChange={(e) => setFormData({ ...formData, display_location: e.target.value as any })}
                            className="w-full p-3 bg-white border border-stone-200 outline-none focus:border-black"
                        >
                            <option value="standard">Standard (Feed)</option>
                            <option value="hero">Main Hero (Big Center)</option>
                            <option value="featured">Featured Grid (Top 3)</option>
                            <option value="trending">Trending (Numbered List)</option>
                            <option value="dont_miss">Don't Miss (Bottom)</option>
                        </select>
                        <p className="text-xs text-stone-400 mt-2">
                            Controls where this post appears on the home page.
                        </p>
                    </div>

                    <div>
                        <span className="block font-bold uppercase text-xs tracking-widest text-stone-500 mb-2">Post Status</span>
                        <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                            className={`w-full p-3 border outline-none font-bold uppercase text-xs tracking-widest ${formData.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' :
                                    formData.status === 'archived' ? 'bg-red-50 text-red-700 border-red-200' :
                                        'bg-stone-50 text-stone-600 border-stone-200'
                                }`}
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                        <p className="text-xs text-stone-400 mt-2">
                            Only 'Published' posts appear on the site.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-agri-green disabled:opacity-50"
                >
                    {loading ? 'Publishing...' : 'Publish Post'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-3 font-bold uppercase tracking-widest hover:bg-stone-100 border border-transparent hover:border-stone-200"
                >
                    Cancel
                </button>
            </div>
        </form >
    )
}
