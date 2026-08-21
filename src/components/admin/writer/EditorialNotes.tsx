'use client';

import React, { useState } from 'react';
import { MessageSquare, Plus, CheckCircle, Trash2 } from 'lucide-react';
import { UserRole } from '@/lib/auth';

export interface EditorialNote {
    id: string;
    text: string;
    authorName: string;
    role: string;
    timestamp: number;
    resolved: boolean;
    tag?: 'feedback' | 'todo' | 'fact_check' | 'approval';
}

interface EditorialNotesProps {
    storyId?: string;
    authorName: string;
    userRole: UserRole;
}

export default function EditorialNotes({ storyId = 'new', authorName, userRole }: EditorialNotesProps) {
    const storageKey = `story_editorial_notes_${storyId}`;

    const [notes, setNotes] = useState<EditorialNote[]>(() => {
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                try {
                    return JSON.parse(raw);
                } catch {
                    return [];
                }
            }
        }
        return [];
    });

    const [inputText, setInputText] = useState('');
    const [selectedTag, setSelectedTag] = useState<'feedback' | 'todo' | 'fact_check' | 'approval'>('feedback');

    const saveNotes = (updated: EditorialNote[]) => {
        setNotes(updated);
        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, JSON.stringify(updated));
        }
    };

    const handleAddNote = () => {
        if (!inputText.trim()) return;

        const newNote: EditorialNote = {
            id: `note_${Date.now()}`,
            text: inputText.trim(),
            authorName: authorName || 'Editor',
            role: userRole,
            timestamp: Date.now(),
            resolved: false,
            tag: selectedTag,
        };

        saveNotes([newNote, ...notes]);
        setInputText('');
    };

    const handleToggleResolve = (id: string) => {
        const updated = notes.map(n => n.id === id ? { ...n, resolved: !n.resolved } : n);
        saveNotes(updated);
    };

    const handleDeleteNote = (id: string) => {
        saveNotes(notes.filter(n => n.id !== id));
    };

    const getTagBadge = (tag?: string) => {
        switch (tag) {
            case 'todo':
                return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">To-Do</span>;
            case 'fact_check':
                return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-800">Fact-Check</span>;
            case 'approval':
                return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-green-100 text-green-800">Approval</span>;
            default:
                return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700">Note</span>;
        }
    };

    return (
        <div className="space-y-4">
            {/* Add note form */}
            <div className="space-y-2 pb-3 border-b border-stone-100">
                <textarea
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Leave an editorial review note..."
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-stone-900"
                />

                <div className="flex items-center justify-between gap-2">
                    <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value as typeof selectedTag)}
                        className="p-1 text-xs bg-stone-50 border border-stone-200 rounded-md font-semibold text-stone-700"
                    >
                        <option value="feedback">Feedback Note</option>
                        <option value="todo">Action To-Do</option>
                        <option value="fact_check">Fact Check</option>
                        <option value="approval">Editorial Sign-off</option>
                    </select>

                    <button
                        type="button"
                        onClick={handleAddNote}
                        className="px-3 py-1 bg-stone-900 text-white rounded-md text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" />
                        <span>Post Note</span>
                    </button>
                </div>
            </div>

            {/* Notes List */}
            <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Internal Collaboration ({notes.length})
                </span>

                {notes.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-stone-200 rounded-xl">
                        <MessageSquare className="w-5 h-5 text-stone-300 mx-auto mb-1" />
                        <p className="text-xs text-stone-400 font-medium">No editorial notes yet</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">Use notes for review feedback & proofreading</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className={`p-3 rounded-xl border transition-all ${
                                    note.resolved ? 'bg-stone-50/60 border-stone-200 opacity-60' : 'bg-white border-stone-200 shadow-2xs'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        {getTagBadge(note.tag)}
                                        <span className="text-xs font-bold text-stone-900">{note.authorName}</span>
                                        <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">({note.role})</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteNote(note.id)}
                                        className="text-stone-300 hover:text-red-500 transition-colors p-0.5"
                                        title="Delete note"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>

                                <p className={`text-xs text-stone-800 leading-relaxed ${note.resolved ? 'line-through' : ''}`}>
                                    {note.text}
                                </p>

                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                                    <span className="text-[10px] text-stone-400">
                                        {new Date(note.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleResolve(note.id)}
                                        className={`text-[10px] font-semibold flex items-center gap-1 ${
                                            note.resolved ? 'text-stone-500 hover:text-stone-800' : 'text-green-700 hover:text-green-800'
                                        }`}
                                    >
                                        <CheckCircle className="w-3 h-3" />
                                        <span>{note.resolved ? 'Mark Pending' : 'Resolve'}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
