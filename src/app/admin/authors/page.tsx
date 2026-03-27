'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Author } from '@/types/database'
import { Plus, Trash2, Pencil, Check, X, Users, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

export default function AuthorsPage() {
    const supabase = createClient()
    const [authors, setAuthors] = useState<Author[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // New author form
    const [newName, setNewName] = useState('')
    const [newBio, setNewBio] = useState('')
    const [newAvatarUrl, setNewAvatarUrl] = useState('')

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editBio, setEditBio] = useState('')
    const [editAvatarUrl, setEditAvatarUrl] = useState('')

    const fetchAuthors = async () => {
        const { data } = await supabase
            .from('authors')
            .select('*')
            .order('name')
        if (data) setAuthors(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchAuthors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const generateSlug = (name: string) =>
        name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const handleCreate = async () => {
        if (!newName.trim()) return
        setSaving(true)
        const slug = generateSlug(newName)
        const { error } = await supabase.from('authors').insert({
            name: newName.trim(),
            slug,
            bio: newBio.trim() || null,
            avatar_url: newAvatarUrl.trim() || null,
            is_active: true,
        })
        if (!error) {
            setNewName('')
            setNewBio('')
            setNewAvatarUrl('')
            await fetchAuthors()
        } else {
            alert('Failed to create author: ' + error.message)
        }
        setSaving(false)
    }

    const handleUpdate = async (id: string) => {
        if (!editName.trim()) return
        setSaving(true)
        const slug = generateSlug(editName)
        const { error } = await supabase.from('authors').update({
            name: editName.trim(),
            slug,
            bio: editBio.trim() || null,
            avatar_url: editAvatarUrl.trim() || null,
        }).eq('id', id)
        if (!error) {
            setEditingId(null)
            await fetchAuthors()
        } else {
            alert('Failed to update: ' + error.message)
        }
        setSaving(false)
    }

    const handleToggleActive = async (author: Author) => {
        await supabase.from('authors').update({ is_active: !author.is_active }).eq('id', author.id)
        await fetchAuthors()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this author? Posts linked to them will keep their text name but lose the link.')) return
        await supabase.from('authors').delete().eq('id', id)
        await fetchAuthors()
    }

    const startEdit = (author: Author) => {
        setEditingId(author.id)
        setEditName(author.name)
        setEditBio(author.bio || '')
        setEditAvatarUrl(author.avatar_url || '')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-stone-400">Loading authors...</div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
                        <Users className="w-8 h-8 text-agri-green" />
                        Authors Directory
                        <span className="text-stone-400 text-lg font-normal">({authors.length})</span>
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">Manage writers and editors featured on the platform.</p>
                </div>
            </div>

            {/* Create Form */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 mb-8 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">Add New Author</h3>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Full Name (e.g. Dr. Jane Doe)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="flex-1 px-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ImageIcon className="w-4 h-4 text-stone-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Avatar URL (optional)"
                                value={newAvatarUrl}
                                onChange={(e) => setNewAvatarUrl(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Short bio (appears at bottom of posts)"
                            value={newBio}
                            onChange={(e) => setNewBio(e.target.value)}
                            className="flex-[2] px-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                        <button
                            onClick={handleCreate}
                            disabled={saving || !newName.trim()}
                            className="flex items-center justify-center gap-2 flex-1 md:flex-none bg-agri-green text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-agri-dark transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            Add Author
                        </button>
                    </div>
                </div>
                {newName.trim() && (
                    <p className="text-xs text-stone-400 mt-3 text-right">
                        Will be accessible at: <code className="bg-stone-100 px-1.5 py-0.5 rounded">/author/{generateSlug(newName)}</code>
                    </p>
                )}
            </div>

            {/* Authors Table */}
            <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-widest text-[10px] border-b border-stone-200">
                        <tr>
                            <th className="p-4 w-16">Avatar</th>
                            <th className="p-4">Name & Slug</th>
                            <th className="p-4 hidden md:table-cell w-2/5">Bio</th>
                            <th className="p-4 text-center">Active</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {authors.map((author) => (
                            <tr key={author.id} className="group hover:bg-stone-50 transition-colors">
                                <td className="p-4">
                                    <div className="w-10 h-10 rounded-full relative overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                                        <Image
                                            src={author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=2D5016&color=fff&size=40`}
                                            alt={author.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </td>
                                <td className="p-4">
                                    {editingId === author.id ? (
                                        <input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="px-2 py-1 border border-agri-green rounded text-sm w-full font-bold mb-1"
                                            autoFocus
                                            placeholder="Name"
                                        />
                                    ) : (
                                        <div className="font-bold text-stone-800">{author.name}</div>
                                    )}
                                    <code className="text-[10px] text-stone-400 block mt-1">/author/{author.slug}</code>
                                </td>
                                <td className="p-4 hidden md:table-cell">
                                    {editingId === author.id ? (
                                        <div className="space-y-2">
                                            <input
                                                value={editBio}
                                                onChange={(e) => setEditBio(e.target.value)}
                                                className="px-2 py-1 border border-agri-green rounded text-sm w-full"
                                                placeholder="Bio"
                                            />
                                            <input
                                                value={editAvatarUrl}
                                                onChange={(e) => setEditAvatarUrl(e.target.value)}
                                                className="px-2 py-1 border border-agri-green rounded text-sm w-full"
                                                placeholder="Avatar URL"
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-stone-500 text-xs line-clamp-2">{author.bio || '—'}</span>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => handleToggleActive(author)}
                                        className={`w-10 h-6 rounded-full transition-colors relative ${author.is_active ? 'bg-green-500' : 'bg-stone-300'}`}
                                    >
                                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${author.is_active ? 'left-[18px]' : 'left-0.5'}`} />
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        {editingId === author.id ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdate(author.id)}
                                                    disabled={saving}
                                                    className="p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                                                    title="Save"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="p-2 bg-stone-100 text-stone-500 rounded-lg hover:bg-stone-200 transition-colors"
                                                    title="Cancel"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => startEdit(author)}
                                                    className="p-2 text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(author.id)}
                                                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {authors.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-stone-400">
                                    No authors yet. Add one above.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
