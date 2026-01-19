'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/admin/ImageUpload'; // Reusing existing component

export default function NewAdPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        image_url: '',
        link_url: '',
        placement: 'banner',
        start_date: '',
        end_date: '',
        is_active: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('ads')
                .insert([{
                    ...formData,
                    start_date: formData.start_date || new Date().toISOString(),
                    end_date: formData.end_date || null
                }]);

            if (error) throw error;

            router.push('/admin/ads');
            router.refresh();
        } catch (error: any) {
            alert('Error creating ad: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="font-serif text-3xl font-bold mb-8">Create New Ad</h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 border border-stone-200 rounded-xl shadow-sm space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Campaign Title</label>
                        <input
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black"
                            placeholder="e.g. Summer Sale Banner"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Destination URL</label>
                        <input
                            required
                            type="url"
                            value={formData.link_url}
                            onChange={e => setFormData({ ...formData, link_url: e.target.value })}
                            className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black font-mono text-sm"
                            placeholder="https://example.com/promo"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Placement</label>
                        <select
                            value={formData.placement}
                            onChange={e => setFormData({ ...formData, placement: e.target.value })}
                            className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black"
                        >
                            <option value="banner">Main Banner (Horizontal)</option>
                            <option value="sidebar">Sidebar (Square/Vertical)</option>
                            <option value="in-content">In-Content (Horizontal)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Start Date (Optional)</label>
                        <input
                            type="datetime-local"
                            value={formData.start_date}
                            onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                            className="w-full p-3 bg-stone-50 border border-stone-200 outline-none focus:border-black"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Banner Image</label>
                    <ImageUpload
                        value={formData.image_url}
                        onChange={url => setFormData({ ...formData, image_url: url })}
                    />
                    <p className="text-xs text-stone-400 mt-2">
                        Recommended sizes: Banner (728x90 or 1200x200), Sidebar (300x250 or 300x600).
                    </p>
                </div>

                <div className="flex gap-4 border-t border-stone-100 pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-agri-green transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Ad Campaign'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-8 py-3 font-bold uppercase tracking-widest hover:bg-stone-100 transition-colors"
                    >
                        Cancel
                    </button>
                </div>

            </form>
        </div>
    );
}
