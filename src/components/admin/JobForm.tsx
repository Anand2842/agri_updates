'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Job } from '@/types/database'

interface JobFormProps {
    initialData?: Job
}

export default function JobForm({ initialData }: JobFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    // Form States
    const [title, setTitle] = useState(initialData?.title || '')
    const [company, setCompany] = useState(initialData?.company || '')
    const [location, setLocation] = useState(initialData?.location || '')
    const [type, setType] = useState(initialData?.type || 'Full-time')
    const [salary, setSalary] = useState(initialData?.salary_range || '')
    const [link, setLink] = useState(initialData?.application_link || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [tags, setTags] = useState(initialData?.tags?.join(', ') || '')
    const [isActive, setIsActive] = useState(initialData?.is_active ?? true)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const jobData = {
            title,
            company,
            location,
            type,
            salary_range: salary,
            application_link: link,
            description,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            is_active: isActive,
        }

        try {
            if (initialData) {
                // Update
                const { error } = await supabase
                    .from('jobs')
                    .update(jobData)
                    .eq('id', initialData.id)

                if (error) throw error
            } else {
                // Create
                const { error } = await supabase
                    .from('jobs')
                    .insert([jobData])

                if (error) throw error
            }

            router.push('/admin/jobs')
            router.refresh()
        } catch (error) {
            console.error('Error saving job:', error)
            alert('Failed to save job.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 border border-stone-200 shadow-sm max-w-4xl">
            <h2 className="font-serif text-2xl font-bold mb-6">
                {initialData ? 'Edit Job' : 'Post New Job'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Job Title</label>
                    <input
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Company Name</label>
                    <input
                        required
                        value={company}
                        onChange={e => setCompany(e.target.value)}
                        className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Location</label>
                    <input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black"
                        placeholder="e.g. Remote, London"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Type</label>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                        className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black"
                    >
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                        <option>Internship</option>
                        <option>Temporary</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Salary Range</label>
                    <input
                        value={salary}
                        onChange={e => setSalary(e.target.value)}
                        className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black"
                        placeholder="e.g. $50k - $70k"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">External Application Link / Email</label>
                    <input
                        value={link}
                        onChange={e => setLink(e.target.value)}
                        className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black"
                        placeholder="https://... or mailto:..."
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Tags (comma separated)</label>
                <input
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black"
                    placeholder="Engineering, Design, Remote"
                />
            </div>

            <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Description / News Content</label>
                <textarea
                    rows={10}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black whitespace-pre-wrap font-serif"
                    placeholder="Enter the full job description or news article text here..."
                />
            </div>

            <div className="mb-8">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={e => setIsActive(e.target.checked)}
                        className="w-5 h-5"
                    />
                    <span className="font-bold text-stone-700">Active (Visible on site)</span>
                </label>
            </div>

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-agri-green disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Job'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-3 font-bold uppercase tracking-widest hover:bg-stone-100 border border-transparent hover:border-stone-200"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}
