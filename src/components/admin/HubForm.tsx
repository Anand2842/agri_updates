'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Hub {
    id?: string;
    slug: string;
    title: string;
    description: string;
    h1: string;
    intro: string;
    filter_tag: string;
    filter_category: string;
    related_hubs: string[];
    is_active: boolean;
}

interface HubFormProps {
    initialData?: Hub;
}

export default function HubForm({ initialData }: HubFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<Hub>({
        slug: initialData?.slug || '',
        title: initialData?.title || '',
        description: initialData?.description || '',
        h1: initialData?.h1 || '',
        intro: initialData?.intro || '',
        filter_tag: initialData?.filter_tag || '',
        filter_category: initialData?.filter_category || 'Jobs',
        related_hubs: initialData?.related_hubs || [],
        is_active: initialData?.is_active ?? true,
    });

    const [relatedHubsInput, setRelatedHubsInput] = useState(
        initialData?.related_hubs?.join(', ') || ''
    );

    // Auto-generate slug from title
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            // Auto-generate slug if it's empty or was auto-generated
            slug: prev.slug === '' || prev.slug === generateSlug(prev.title)
                ? generateSlug(title)
                : prev.slug,
            // Auto-fill h1 if empty
            h1: prev.h1 === '' ? title : prev.h1,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Parse related hubs from comma-separated string
        const related_hubs = relatedHubsInput
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        const payload = {
            ...formData,
            related_hubs,
        };

        try {
            const url = initialData?.id
                ? `/api/hubs/${initialData.id}`
                : '/api/hubs';

            const method = initialData?.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save hub');
            }

            router.push('/admin/hubs');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Title */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                    Title *
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="e.g., Agriculture Jobs in Karnataka 2024"
                    className="w-full px-4 py-3 border border-stone-200 rounded focus:outline-none focus:border-black"
                    required
                />
                <p className="text-xs text-stone-400 mt-1">SEO title shown in browser tab and search results</p>
            </div>

            {/* Slug */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                    Slug (URL Path) *
                </label>
                <div className="flex items-center gap-2">
                    <span className="text-stone-400">/</span>
                    <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="agriculture-jobs-karnataka"
                        className="flex-1 px-4 py-3 border border-stone-200 rounded focus:outline-none focus:border-black font-mono"
                        required
                    />
                </div>
                <p className="text-xs text-stone-400 mt-1">URL-friendly identifier (auto-generated from title)</p>
            </div>

            {/* H1 Heading */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                    Page Heading (H1) *
                </label>
                <input
                    type="text"
                    value={formData.h1}
                    onChange={(e) => setFormData(prev => ({ ...prev, h1: e.target.value }))}
                    placeholder="Agriculture Jobs in Karnataka"
                    className="w-full px-4 py-3 border border-stone-200 rounded focus:outline-none focus:border-black"
                    required
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                    Meta Description
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Find the latest agriculture jobs in Karnataka..."
                    rows={2}
                    className="w-full px-4 py-3 border border-stone-200 rounded focus:outline-none focus:border-black"
                />
                <p className="text-xs text-stone-400 mt-1">Shown in search engine results (150-160 chars recommended)</p>
            </div>

            {/* Intro */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                    Intro Text
                </label>
                <textarea
                    value={formData.intro}
                    onChange={(e) => setFormData(prev => ({ ...prev, intro: e.target.value }))}
                    placeholder="Explore agricultural opportunities in Karnataka state..."
                    rows={3}
                    className="w-full px-4 py-3 border border-stone-200 rounded focus:outline-none focus:border-black"
                />
                <p className="text-xs text-stone-400 mt-1">Displayed below the heading on the hub page</p>
            </div>

            <hr className="border-stone-200" />

            {/* Filter Tag */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                    Filter Tag *
                </label>
                <input
                    type="text"
                    value={formData.filter_tag}
                    onChange={(e) => setFormData(prev => ({ ...prev, filter_tag: e.target.value }))}
                    placeholder="e.g., Karnataka, Sales, Internship"
                    className="w-full px-4 py-3 border border-stone-200 rounded focus:outline-none focus:border-black"
                    required
                />
                <p className="text-xs text-stone-400 mt-1">Jobs with this tag will appear in this hub. Must match exactly.</p>
            </div>

            {/* Filter Category */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                    Filter Category
                </label>
                <select
                    value={formData.filter_category}
                    onChange={(e) => setFormData(prev => ({ ...prev, filter_category: e.target.value }))}
                    className="w-full px-4 py-3 border border-stone-200 rounded focus:outline-none focus:border-black bg-white"
                >
                    <option value="Jobs">Jobs</option>
                    <option value="Fellowships">Fellowships</option>
                    <option value="Research">Research</option>
                    <option value="Events">Events</option>
                </select>
            </div>

            {/* Related Hubs */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                    Related Hubs
                </label>
                <input
                    type="text"
                    value={relatedHubsInput}
                    onChange={(e) => setRelatedHubsInput(e.target.value)}
                    placeholder="agriculture-sales-jobs, bsc-agriculture-jobs"
                    className="w-full px-4 py-3 border border-stone-200 rounded focus:outline-none focus:border-black font-mono text-sm"
                />
                <p className="text-xs text-stone-400 mt-1">Comma-separated slugs of related hubs to show in sidebar</p>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-5 h-5 accent-agri-green"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-stone-700">
                    Active (visible on frontend)
                </label>
            </div>

            <hr className="border-stone-200" />

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-black text-white px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-agri-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Saving...' : initialData?.id ? 'Update Hub' : 'Create Hub'}
                </button>
                <button
                    type="button"
                    onClick={() => router.push('/admin/hubs')}
                    className="bg-stone-100 text-stone-600 px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-stone-200 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
