'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Ad } from '@/types/database';
import Image from 'next/image';
import Link from 'next/link';

interface AdBannerProps {
    placement: 'banner' | 'sidebar' | 'in-content';
    className?: string;
}

export default function AdBanner({ placement, className = '' }: AdBannerProps) {
    const [ad, setAd] = useState<Ad | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchAd = async () => {
            try {
                // Fetch a random active ad for this placement
                // Note: 'random' in Supabase without RPC is tricky, so we fetch active ones and pick one JS-side
                // For scale, use an RPC 'get_random_ad'
                const { data, error } = await supabase
                    .from('ads')
                    .select('*')
                    .eq('is_active', true)
                    .eq('placement', placement)
                    .lte('start_date', new Date().toISOString()) // Started
                    .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`); // Not ended

                if (error) throw error;

                if (data && data.length > 0) {
                    // Simple client-side randomizer
                    const randomAd = data[Math.floor(Math.random() * data.length)];
                    setAd(randomAd);

                    // TODO: Increment View Count (requires RPC for security)
                }
            } catch (error) {
                console.error('Error fetching ad:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAd();
    }, [placement, supabase]);

    if (loading) return <div className={`w-full bg-stone-50 animate-pulse rounded-lg ${className}`} style={{ height: placement === 'banner' ? 90 : 250 }}></div>;

    if (!ad) {
        // Fallback or "Advertise Here"
        return (
            <div className={`w-full bg-stone-50 border border-dashed border-stone-200 flex flex-col items-center justify-center p-4 rounded-lg text-center ${className}`}>
                <p className="font-bold uppercase tracking-widest text-xs text-stone-400 mb-1">Advertisement</p>
                <Link href="/contact" className="text-agri-green text-xs font-bold hover:underline">
                    Advertise with us
                </Link>
            </div>
        );
    }

    return (
        <div className={`w-full relative group ${className}`}>
            <p className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest text-stone-300 z-10">
                Advertisement
            </p>
            <Link
                href={ad.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative overflow-hidden rounded-lg hover:opacity-95 transition-opacity"
                onClick={() => {
                    // TODO: Increment Click Count
                }}
            >
                {/* We use standard img for external banners to avoid Next.js Image domain config issues, 
                    unless we configure it. For now, assuming external URLs. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-auto object-cover"
                    style={{ maxHeight: placement === 'sidebar' ? '600px' : '300px' }}
                />
            </Link>
        </div>
    );
}
