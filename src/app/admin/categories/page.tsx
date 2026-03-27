'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Category } from '@/types/database'
import { Plus, Trash2, Pencil, Check, X, Tag } from 'lucide-react'

export default function CategoriesPage() {
    const supabase = createClient()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // New category form
    const [newName, setNewName] = useState('')
    const [newDescription, setNewDescription] = useState('')

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editDescription, setEditDescription] = useState('')

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('categories')
            .select('*')
            .order('name')
        if (data) setCategories(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const generateSlug = (name: string) =>
        name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const handleCreate = async () => {
        if (!newName.trim()) return
        setSaving(true)
        const slug = generateSlug(newName)
        const { error } = await supabase.from('categories').insert({
            name: newName.trim(),
            slug,
            description: newDescription.trim() || null,
            is_active: true,
        })
        if (!error) {
            setNewName('')
            setNewDescription('')
            await fetchCategories()
        } else {
            alert('Failed to create category: ' + error.message)
        }
        setSaving(false)
    }

    const handleUpdate = async (id: string) => {
        if (!editName.trim()) return
        setSaving(true)
        const slug = generateSlug(editName)
        const { error } = await supabase.from('categories').update({
            name: editName.trim(),
            slug,
            description: editDescription.trim() || null,
        }).eq('id', id)
        if (!error) {
            setEditingId(null)
            await fetchCategories()
        } else {
            alert('Failed to update: ' + error.message)
        }
        setSaving(false)
    }

    const handleToggleActive = async (cat: Category) => {
        await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id)
        await fetchCategories()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this category? Posts using it will keep their category text but it won\'t appear in filters.')) return
        await supabase.from('categories').delete().eq('id', id)
        await fetchCategories()
    }

    const startEdit = (cat: Category) => {
        setEditingId(cat.id)
        setEditName(cat.name)
        setEditDescription(cat.description || '')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-stone-400">Loading categories...</div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
                        <Tag className="w-8 h-8 text-agri-green" />
                        Categories
                        <span className="text-stone-400 text-lg font-normal">({categories.length})</span>
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">Manage content categories used across the platform.</p>
                </div>
            </div>

            {/* Create Form */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 mb-8 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">Add New Category</h3>
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Category name (e.g. Policy)"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                    <input
                        type="text"
                        placeholder="Short description (optional)"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                    <button
                        onClick={handleCreate}
                        disabled={saving || !newName.trim()}
                        className="flex items-center gap-2 bg-agri-green text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-agri-dark transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        Add Category
                    </button>
                </div>
                {newName.trim() && (
                    <p className="text-xs text-stone-400 mt-2">
                        Slug: <code className="bg-stone-100 px-1.5 py-0.5 rounded">{generateSlug(newName)}</code>
                    </p>
                )}
            </div>

            {/* Categories Table */}
            <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-widest text-[10px] border-b border-stone-200">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Slug</th>
                            <th className="p-4 hidden md:table-cell">Description</th>
                            <th className="p-4 text-center">Active</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {categories.map((cat) => (
                            <tr key={cat.id} className="group hover:bg-stone-50 transition-colors">
                                <td className="p-4">
                                    {editingId === cat.id ? (
                                        <input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="px-2 py-1 border border-agri-green rounded text-sm w-full"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="font-bold text-stone-800">{cat.name}</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <code className="text-xs bg-stone-100 px-2 py-1 rounded text-stone-500">{cat.slug}</code>
                                </td>
                                <td className="p-4 hidden md:table-cell">
                                    {editingId === cat.id ? (
                                        <input
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            className="px-2 py-1 border border-agri-green rounded text-sm w-full"
                                        />
                                    ) : (
                                        <span className="text-stone-500 text-xs">{cat.description || '—'}</span>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => handleToggleActive(cat)}
                                        className={`w-10 h-6 rounded-full transition-colors relative ${cat.is_active ? 'bg-green-500' : 'bg-stone-300'}`}
                                    >
                                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${cat.is_active ? 'left-[18px]' : 'left-0.5'}`} />
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        {editingId === cat.id ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdate(cat.id)}
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
                                                    onClick={() => startEdit(cat)}
                                                    className="p-2 text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
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

                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-stone-400">
                                    No categories yet. Add one above.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
