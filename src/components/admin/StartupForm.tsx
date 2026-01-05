'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Startup } from '@/types/database'

interface StartupFormProps {
    initialData?: Startup
}

export default function StartupForm({ initialData }: StartupFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<Partial<Startup>>({
        name: initialData?.name || '',
        description: initialData?.description || '',
        funding_stage: initialData?.funding_stage || '',
        location: initialData?.location || '',
        website_url: initialData?.website_url || '',
        logo_url: initialData?.logo_url || '',
        tags: initialData?.tags || [],
    })

    const [tagInput, setTagInput] = useState('')

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault()
            const newTag = tagInput.trim()
            if (!formData.tags?.includes(newTag)) {
                setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), newTag] }))
            }
            setTagInput('')
        }
    }

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(tag => tag !== tagToRemove)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const dataToSave = {
                name: formData.name,
                description: formData.description,
                funding_stage: formData.funding_stage,
                location: formData.location,
                website_url: formData.website_url,
                logo_url: formData.logo_url,
                tags: formData.tags,
            }

            if (initialData?.id) {
                // Update
                const { error } = await supabase
                    .from('startups')
                    .update(dataToSave)
                    .eq('id', initialData.id)

                if (error) throw error
            } else {
                // Create
                const { error } = await supabase
                    .from('startups')
                    .insert([dataToSave])

                if (error) throw error
            }

            router.push('/admin/startups')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl bg-white p-8 border border-stone-200 shadow-sm">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 mb-6 border border-red-100">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Startup Name *</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black transition-colors"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Funding Stage</label>
                    <select
                        value={formData.funding_stage || ''}
                        onChange={(e) => setFormData({ ...formData, funding_stage: e.target.value })}
                        className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black transition-colors"
                    >
                        <option value="">Select Stage</option>
                        <option value="Pre-Seed">Pre-Seed</option>
                        <option value="Seed">Seed</option>
                        <option value="Series A">Series A</option>
                        <option value="Series B">Series B</option>
                        <option value="Series C+">Series C+</option>
                        <option value="Bootstrapped">Bootstrapped</option>
                        <option value="IPO">IPO</option>
                        <option value="Acquired">Acquired</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Location</label>
                    <input
                        type="text"
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black transition-colors"
                        placeholder="e.g. San Francisco, CA"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Website URL</label>
                    <input
                        type="url"
                        value={formData.website_url || ''}
                        onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                        className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black transition-colors"
                        placeholder="https://example.com"
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Description</label>
                <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black transition-colors h-32"
                    placeholder="Brief description of the startup..."
                />
            </div>

            <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Tags (Press Enter to add)</label>
                <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black transition-colors mb-2"
                    placeholder="e.g. AI, Robotics, Sustainable"
                />
                <div className="flex flex-wrap gap-2">
                    {formData.tags?.map((tag) => (
                        <span key={tag} className="bg-stone-200 text-xs px-2 py-1 rounded flex items-center gap-1">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">×</button>
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-stone-100">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 font-bold uppercase tracking-widest text-stone-500 hover:text-black transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-agri-green transition-colors disabled:opacity-50"
                >
                    {loading ? 'Saving...' : (initialData ? 'Update Startup' : 'Create Startup')}
                </button>
            </div>
        </form>
    )
}
