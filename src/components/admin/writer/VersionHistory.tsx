'use client';

import React, { useState } from 'react';
import { History, RotateCcw, Plus, Clock } from 'lucide-react';
import { WriterFormData } from './types';

export interface VersionSnapshot {
    id: string;
    timestamp: number;
    title: string;
    content: string;
    wordCount: number;
    author: string;
    note?: string;
}

interface VersionHistoryProps {
    formData: WriterFormData;
    storyId?: string;
    onRestore: (snapshot: VersionSnapshot) => void;
}

function formatSnapshotTime(ts: number) {
    return new Date(ts).toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

export default function VersionHistory({ formData, storyId = 'new', onRestore }: VersionHistoryProps) {
    const storageKey = `story_snapshots_${storyId}`;

    const [snapshots, setSnapshots] = useState<VersionSnapshot[]>(() => {
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

    const [noteInput, setNoteInput] = useState('');

    const saveSnapshotsToStorage = (list: VersionSnapshot[]) => {
        setSnapshots(list);
        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, JSON.stringify(list));
        }
    };

    const handleCreateSnapshot = () => {
        if (!formData.content && !formData.title) return;

        const plainText = (formData.content || '').replace(/<[^>]*>/g, ' ').trim();
        const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;

        const newSnapshot: VersionSnapshot = {
            id: `snap_${Date.now()}`,
            timestamp: Date.now(),
            title: formData.title || 'Untitled',
            content: formData.content || '',
            wordCount: words,
            author: formData.author_name || 'Staff',
            note: noteInput.trim() || undefined,
        };

        const updated = [newSnapshot, ...snapshots.slice(0, 19)]; // Keep up to 20 snapshots
        saveSnapshotsToStorage(updated);
        setNoteInput('');
    };

    const handleRestoreClick = (snap: VersionSnapshot) => {
        if (window.confirm(`Restore version from ${new Date(snap.timestamp).toLocaleTimeString()} (${snap.wordCount} words)? Current canvas content will be replaced.`)) {
            onRestore(snap);
        }
    };

    return (
        <div className="space-y-4">
            {/* Create manual snapshot bar */}
            <div className="space-y-2 pb-3 border-b border-stone-100">
                <input
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Snapshot label (e.g. Before AI Polish)..."
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-stone-900"
                />
                <button
                    type="button"
                    onClick={handleCreateSnapshot}
                    className="w-full py-1.5 px-3 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Version Snapshot</span>
                </button>
            </div>

            {/* Snapshots List */}
            <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Saved Snapshots ({snapshots.length})
                </span>

                {snapshots.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-stone-200 rounded-xl">
                        <History className="w-5 h-5 text-stone-300 mx-auto mb-1" />
                        <p className="text-xs text-stone-400 font-medium">No snapshots yet</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">Click above to save your first snapshot</p>
                    </div>
                ) : (
                    <div className="divide-y divide-stone-100 border border-stone-200/80 rounded-xl overflow-hidden">
                        {snapshots.map((snap) => (
                            <div key={snap.id} className="p-3 hover:bg-stone-50 transition-colors group">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3 h-3 text-stone-400" />
                                            <span className="text-xs font-semibold text-stone-800">
                                                {formatSnapshotTime(snap.timestamp)}
                                            </span>
                                        </div>
                                        {snap.note && (
                                            <p className="text-xs font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                                                {snap.note}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-400">
                                            <span>{snap.wordCount} words</span>
                                            <span>·</span>
                                            <span>by {snap.author}</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRestoreClick(snap)}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors shrink-0"
                                        title="Restore this version"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>Restore</span>
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
