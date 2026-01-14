'use client'

import { useState } from 'react'
import { updateDisplayLocation } from '@/app/actions/update-display-location'
import { Loader2 } from 'lucide-react'

interface Props {
    postId: string
    initialLocation: string
}

export default function DisplayLocationSelector({ postId, initialLocation }: Props) {
    const [loading, setLoading] = useState(false)
    const [location, setLocation] = useState(initialLocation || 'standard')

    const handleChange = async (newLocation: string) => {
        setLoading(true)
        setLocation(newLocation) // Optimistic update

        const res = await updateDisplayLocation(postId, newLocation)

        if (!res.success) {
            // Revert on failure
            setLocation(initialLocation)
            alert('Failed to update location')
        }
        setLoading(false)
    }

    const options = [
        { value: 'standard', label: 'Standard' },
        { value: 'hero', label: 'Hero (Top)' },
        { value: 'featured', label: 'Featured' },
        { value: 'trending', label: 'Trending' },
        { value: 'dont_miss', label: "Don't Miss" },
    ]

    return (
        <div className="relative">
            <select
                value={location}
                onChange={(e) => handleChange(e.target.value)}
                disabled={loading}
                className={`
                    appearance-none w-full bg-transparent text-xs font-bold uppercase tracking-widest cursor-pointer py-1 pr-6 border-b border-transparent hover:border-stone-300 focus:outline-none
                    ${location === 'hero' ? 'text-purple-600' :
                        location === 'trending' ? 'text-blue-600' :
                            location === 'featured' ? 'text-agri-green' : 'text-stone-500'}
                `}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {loading && <Loader2 className="w-3 h-3 animate-spin absolute right-0 top-1 text-stone-400" />}
        </div>
    )
}
