'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Image as ImageIcon, Upload, X } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
    value: string
    onChange: (url: string) => void
    disabled?: boolean
}

export default function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const file = e.target.files?.[0]
            if (!file) return

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage
                .from('images')
                .getPublicUrl(filePath)

            onChange(data.publicUrl)
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Error uploading image')
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = () => {
        onChange('')
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-stone-200 group">
                        <Image
                            fill
                            src={value}
                            alt="Cover"
                            className="object-cover"
                        />
                        <button
                            onClick={handleRemove}
                            type="button"
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="w-40 h-40 rounded-lg border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 bg-stone-50">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                    </div>
                )}

                <div className="flex-1">
                    <label className={`
                        inline-flex items-center gap-2 px-4 py-2 
                        bg-white border border-stone-300 text-stone-700 
                        font-bold text-xs uppercase tracking-widest 
                        hover:bg-stone-50 cursor-pointer transition-colors
                        ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}>
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading...' : 'Upload Image'}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={disabled || uploading}
                            className="hidden"
                        />
                    </label>
                    <p className="mt-2 text-xs text-stone-500">
                        Recommended size: 1200x630px. Max 5MB.
                    </p>
                </div>
            </div>

            {/* Fallback URL Input */}
            <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Or paste URL</label>
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full text-xs p-2 bg-stone-50 border border-stone-200 text-stone-600 font-mono"
                    placeholder="https://..."
                />
            </div>
        </div>
    )
}
