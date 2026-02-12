'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Startup } from '@/types/database'
import { Plus, X, Globe, MapPin, DollarSign, Calendar, Users, Star, AlertTriangle, Link as LinkIcon } from 'lucide-react'

interface StartupFormProps {
    initialData?: Startup
}

type TabType = 'basic' | 'story' | 'highlights' | 'funding'

export default function StartupForm({ initialData }: StartupFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>('basic')

    // Initial State Setup
    const [formData, setFormData] = useState<Partial<Startup>>({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        logo_url: initialData?.logo_url || '',
        description: initialData?.description || '', // Short desc
        elevator_pitch: initialData?.elevator_pitch || '',
        long_description: initialData?.long_description || '', // Markdown
        funding_stage: initialData?.funding_stage || '',
        funding_amount: initialData?.funding_amount || '',
        location: initialData?.location || '',
        founded_year: initialData?.founded_year || new Date().getFullYear(),
        team_size: initialData?.team_size || '',
        founder_names: initialData?.founder_names || '',
        website_url: initialData?.website_url || '',
        tags: initialData?.tags || [],
        investors: initialData?.investors || [],
        is_featured: initialData?.is_featured || false,
        // JSON fields need careful initialization
        social_links: initialData?.social_links || { twitter: '', linkedin: '', instagram: '' },
        success_highlights: initialData?.success_highlights || [],
        challenges: initialData?.challenges || [],
        milestones: initialData?.milestones || []
    })

    const [tagInput, setTagInput] = useState('')
    const [investorInput, setInvestorInput] = useState('')

    // Auto-generate slug from name if slug is empty
    useEffect(() => {
        if (!initialData && formData.name && !formData.slug) {
            setFormData(prev => ({
                ...prev,
                slug: prev.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
            }))
        }
    }, [formData.name, initialData, formData.slug])

    // --- Array Helpers ---

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
        setFormData(prev => ({ ...prev, tags: prev.tags?.filter(tag => tag !== tagToRemove) }))
    }

    const handleAddInvestor = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && investorInput.trim()) {
            e.preventDefault()
            const newInv = investorInput.trim()
            if (!formData.investors?.includes(newInv)) {
                setFormData(prev => ({ ...prev, investors: [...(prev.investors || []), newInv] }))
            }
            setInvestorInput('')
        }
    }

    const removeInvestor = (invToRemove: string) => {
        setFormData(prev => ({ ...prev, investors: prev.investors?.filter(i => i !== invToRemove) }))
    }

    // --- JSON Array Helpers ---

    const addMilestone = () => {
        setFormData(prev => ({
            ...prev,
            milestones: [...(prev.milestones || []), { date: '', title: '', description: '' }]
        }))
    }

    const updateMilestone = (index: number, field: string, value: string) => {
        const newMilestones = [...(formData.milestones || [])]
        newMilestones[index] = { ...newMilestones[index], [field]: value }
        setFormData(prev => ({ ...prev, milestones: newMilestones }))
    }

    const removeMilestone = (index: number) => {
        setFormData(prev => ({ ...prev, milestones: prev.milestones?.filter((_, i) => i !== index) }))
    }

    const addHighlight = () => {
        setFormData(prev => ({
            ...prev,
            success_highlights: [...(prev.success_highlights || []), { title: '', description: '' }]
        }))
    }

    const updateHighlight = (index: number, field: string, value: string) => {
        const newHighlights = [...(formData.success_highlights || [])]
        newHighlights[index] = { ...newHighlights[index], [field]: value }
        setFormData(prev => ({ ...prev, success_highlights: newHighlights }))
    }

    const removeHighlight = (index: number) => {
        setFormData(prev => ({ ...prev, success_highlights: prev.success_highlights?.filter((_, i) => i !== index) }))
    }

    // --- Submit Handler ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (initialData?.id) {
                const { error } = await supabase
                    .from('startups')
                    .update(formData)
                    .eq('id', initialData.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('startups')
                    .insert([formData])
                if (error) throw error
            }

            router.push('/admin/startups')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto bg-white border border-stone-200 shadow-sm relative">
            {/* Tabs Header */}
            <div className="flex border-b border-stone-200 bg-stone-50 sticky top-0 z-10">
                <button type="button" onClick={() => setActiveTab('basic')} className={`px-6 py-4 font-bold text-sm uppercase tracking-wide ${activeTab === 'basic' ? 'bg-white border-b-2 border-black text-black' : 'text-stone-500 hover:text-black'}`}>Basic Info</button>
                <button type="button" onClick={() => setActiveTab('story')} className={`px-6 py-4 font-bold text-sm uppercase tracking-wide ${activeTab === 'story' ? 'bg-white border-b-2 border-black text-black' : 'text-stone-500 hover:text-black'}`}>The Story</button>
                <button type="button" onClick={() => setActiveTab('highlights')} className={`px-6 py-4 font-bold text-sm uppercase tracking-wide ${activeTab === 'highlights' ? 'bg-white border-b-2 border-black text-black' : 'text-stone-500 hover:text-black'}`}>Highlights & Milestones</button>
                <button type="button" onClick={() => setActiveTab('funding')} className={`px-6 py-4 font-bold text-sm uppercase tracking-wide ${activeTab === 'funding' ? 'bg-white border-b-2 border-black text-black' : 'text-stone-500 hover:text-black'}`}>Funding & Social</button>
            </div>

            <div className="p-8">
                {error && <div className="bg-red-50 text-red-600 p-4 mb-6 border border-red-100">{error}</div>}

                {/* BASIC INFO TAB */}
                {activeTab === 'basic' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Startup Name *</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Slug (URL) *</label>
                            <input type="text" value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black font-mono text-sm" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Website URL</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-3 text-stone-400" size={16} />
                                <input type="url" value={formData.website_url || ''} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} className="w-full p-3 pl-10 bg-stone-50 border border-stone-200 outline-none focus:border-black" placeholder="https://..." />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Elevator Pitch (One-Liner)</label>
                            <input type="text" value={formData.elevator_pitch || ''} onChange={(e) => setFormData({ ...formData, elevator_pitch: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black" placeholder="e.g. Uber for Tractors" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-stone-400" size={16} />
                                <input type="text" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full p-3 pl-10 bg-stone-50 border border-stone-200 outline-none focus:border-black" />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Short Description (SEO)</label>
                            <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black h-24" placeholder="Brief summary for cards and SEO..." />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Tags</label>
                            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black mb-2" placeholder="Press Enter to add tag" />
                            <div className="flex flex-wrap gap-2">
                                {formData.tags?.map(tag => (
                                    <span key={tag} className="bg-stone-200 text-xs px-2 py-1 rounded flex items-center gap-1">{tag}<button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">×</button></span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* STORY TAB */}
                {activeTab === 'story' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Founded Year</label>
                                <input type="number" value={formData.founded_year || ''} onChange={(e) => setFormData({ ...formData, founded_year: parseInt(e.target.value) })} className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Team Size</label>
                                <select value={formData.team_size || ''} onChange={(e) => setFormData({ ...formData, team_size: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black">
                                    <option value="">Select Size</option>
                                    <option value="1-10">1-10</option>
                                    <option value="11-50">11-50</option>
                                    <option value="51-200">51-200</option>
                                    <option value="200+">200+</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Founders</label>
                                <input type="text" value={formData.founder_names || ''} onChange={(e) => setFormData({ ...formData, founder_names: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black" placeholder="Jane Doe, John Smith" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Long Description (Markdown Story)</label>
                            <textarea value={formData.long_description || ''} onChange={(e) => setFormData({ ...formData, long_description: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black h-96 font-mono text-sm" placeholder="# Our Story\n\nWrite the full company profile here..." />
                        </div>
                    </div>
                )}

                {/* HIGHLIGHTS TAB */}
                {activeTab === 'highlights' && (
                    <div className="space-y-8">
                        {/* Highlights Section */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Success Highlights</label>
                                <button type="button" onClick={addHighlight} className="text-xs font-bold uppercase flex items-center gap-1 text-agri-green"><Plus size={14} /> Add Highlight</button>
                            </div>
                            <div className="space-y-4">
                                {formData.success_highlights?.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-start bg-stone-50 p-4 border border-stone-100">
                                        <div className="flex-grow space-y-2">
                                            <input type="text" value={item.title} onChange={(e) => updateHighlight(idx, 'title', e.target.value)} className="w-full p-2 border border-stone-200 text-sm font-bold" placeholder="Title (e.g. 1 Million Farmers)" />
                                            <textarea value={item.description} onChange={(e) => updateHighlight(idx, 'description', e.target.value)} className="w-full p-2 border border-stone-200 text-sm h-20" placeholder="Description..." />
                                        </div>
                                        <button type="button" onClick={() => removeHighlight(idx)} className="text-stone-400 hover:text-red-500"><X size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Milestones Section */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-stone-500">Timeline / Milestones</label>
                                <button type="button" onClick={addMilestone} className="text-xs font-bold uppercase flex items-center gap-1 text-agri-green"><Plus size={14} /> Add Milestone</button>
                            </div>
                            <div className="space-y-4 relative border-l-2 border-stone-100 ml-4 pl-6">
                                {formData.milestones?.map((item, idx) => (
                                    <div key={idx} className="relative group">
                                        <div className="absolute -left-[33px] top-4 w-4 h-4 rounded-full bg-stone-200 group-hover:bg-agri-green transition-colors"></div>
                                        <div className="flex gap-4 items-start bg-stone-50 p-4 border border-stone-100">
                                            <div className="w-32 flex-shrink-0">
                                                <input type="text" value={item.date} onChange={(e) => updateMilestone(idx, 'date', e.target.value)} className="w-full p-2 border border-stone-200 text-sm font-bold" placeholder="Date (e.g. 2023)" />
                                            </div>
                                            <div className="flex-grow space-y-2">
                                                <input type="text" value={item.title} onChange={(e) => updateMilestone(idx, 'title', e.target.value)} className="w-full p-2 border border-stone-200 text-sm font-bold" placeholder="Milestone Title" />
                                                <textarea value={item.description} onChange={(e) => updateMilestone(idx, 'description', e.target.value)} className="w-full p-2 border border-stone-200 text-sm h-16" placeholder="Details..." />
                                            </div>
                                            <button type="button" onClick={() => removeMilestone(idx)} className="text-stone-400 hover:text-red-500"><X size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* FUNDING TAB */}
                {activeTab === 'funding' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Funding Stage</label>
                                <input type="text" value={formData.funding_stage || ''} onChange={(e) => setFormData({ ...formData, funding_stage: e.target.value })} className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black" placeholder="e.g. Series A" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Funding Amount</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 text-stone-400" size={16} />
                                    <input type="text" value={formData.funding_amount || ''} onChange={(e) => setFormData({ ...formData, funding_amount: e.target.value })} className="w-full p-3 pl-10 bg-stone-50 border border-stone-200 outline-none focus:border-black" placeholder="e.g. $5M" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Investors</label>
                            <input type="text" value={investorInput} onChange={(e) => setInvestorInput(e.target.value)} onKeyDown={handleAddInvestor} className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black mb-2" placeholder="Press Enter to add investor" />
                            <div className="flex flex-wrap gap-2">
                                {formData.investors?.map(inv => (
                                    <span key={inv} className="bg-stone-100 border border-stone-200 text-xs px-2 py-1 flex items-center gap-1">{inv}<button type="button" onClick={() => removeInvestor(inv)} className="hover:text-red-500">×</button></span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Social Links</label>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 flex justify-center"><LinkIcon size={16} className="text-stone-400" /></div>
                                    <input type="text" value={formData.social_links?.twitter || ''} onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, twitter: e.target.value } })} className="flex-grow p-2 bg-stone-50 border border-stone-200 text-sm" placeholder="Twitter URL" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 flex justify-center"><LinkIcon size={16} className="text-stone-400" /></div>
                                    <input type="text" value={formData.social_links?.linkedin || ''} onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, linkedin: e.target.value } })} className="flex-grow p-2 bg-stone-50 border border-stone-200 text-sm" placeholder="LinkedIn URL" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 flex justify-center"><LinkIcon size={16} className="text-stone-400" /></div>
                                    <input type="text" value={formData.social_links?.instagram || ''} onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, instagram: e.target.value } })} className="flex-grow p-2 bg-stone-50 border border-stone-200 text-sm" placeholder="Instagram URL" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-stone-100">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.is_featured || false} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4 text-agri-green" />
                                <span className="text-sm font-bold uppercase tracking-wider">Feature this startup?</span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between p-8 border-t border-stone-200 bg-stone-50">
                <button type="button" onClick={() => router.back()} className="px-6 py-3 font-bold uppercase tracking-widest text-stone-500 hover:text-black transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-agri-green transition-colors disabled:opacity-50">{loading ? 'Saving...' : (initialData ? 'Update Profile' : 'Create Profile')}</button>
            </div>
        </form>
    )
}
