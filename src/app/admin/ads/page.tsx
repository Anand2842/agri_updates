'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Ad } from '@/types/database';
import Link from 'next/link';
import { Plus, Trash2, Edit, Eye, MousePointer2 } from 'lucide-react';
import Image from 'next/image';

export default function AdsIndexPage() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        const { data, error } = await supabase
            .from('ads')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setAds(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this ad?')) return;

        const { error } = await supabase
            .from('ads')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting ad');
        } else {
            setAds(ads.filter(ad => ad.id !== id));
        }
    };

    const toggleStatus = async (ad: Ad) => {
        const { error } = await supabase
            .from('ads')
            .update({ is_active: !ad.is_active })
            .eq('id', ad.id);

        if (error) {
            alert('Error updating status');
        } else {
            fetchAds();
        }
    };

    if (loading) return <div className="p-8 text-center text-stone-500">Loading Ads...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold mb-2">Ad Manager</h1>
                    <p className="text-stone-500">Manage banner advertisements and placements.</p>
                </div>
                <Link
                    href="/admin/ads/new"
                    className="bg-black text-white px-6 py-2 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-agri-green transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Ad
                </Link>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                            <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-stone-500">Creative</th>
                            <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-stone-500">Placement</th>
                            <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-stone-500">Stats</th>
                            <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-stone-500">Status</th>
                            <th className="text-right p-4 text-xs font-bold uppercase tracking-widest text-stone-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {ads.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-stone-400 italic">
                                    No ads found. Create your first campaign!
                                </td>
                            </tr>
                        ) : (
                            ads.map(ad => (
                                <tr key={ad.id} className="hover:bg-stone-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-24 h-16 bg-stone-100 rounded overflow-hidden flex-shrink-0 border border-stone-200">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-stone-900">{ad.title}</h3>
                                                <a href={ad.link_url} target="_blank" className="text-xs text-blue-600 hover:underline truncate max-w-[200px] block">
                                                    {ad.link_url}
                                                </a>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase tracking-wide">
                                            {ad.placement}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 text-xs text-stone-600">
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" /> {ad.views.toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MousePointer2 className="w-3 h-3" /> {ad.clicks.toLocaleString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleStatus(ad)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${ad.is_active
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                                                }`}
                                        >
                                            {ad.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* <Link href={`/admin/ads/${ad.id}`} className="p-2 text-stone-400 hover:text-black hover:bg-stone-100 rounded">
                                                <Edit className="w-4 h-4" />
                                            </Link> */}
                                            <button
                                                onClick={() => handleDelete(ad.id)}
                                                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
