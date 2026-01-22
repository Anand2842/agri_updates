'use client';

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useState } from 'react'
import { Trash2, StickyNote, Clock, AlertCircle } from 'lucide-react'

const STORAGE_KEY = 'admin_scratchpad_content';
const TIMESTAMP_KEY = 'admin_scratchpad_last_active';
const EXPIRY_MS = 60 * 60 * 1000; // 1 Hour

export default function Scratchpad() {
    const [lastActive, setLastActive] = useState<number | null>(null);
    const [isExpired, setIsExpired] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: { class: 'max-w-full rounded' }
            }),
            Placeholder.configure({
                placeholder: 'Temporary scratchpad... (valid for 1h)',
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-sm prose-stone focus:outline-none min-h-[150px] p-3 text-sm leading-snug',
            },
        },
        onUpdate: ({ editor }) => {
            const now = Date.now();
            localStorage.setItem(STORAGE_KEY, editor.getHTML());
            localStorage.setItem(TIMESTAMP_KEY, now.toString());
            setLastActive(now);
            setIsExpired(false);
        },
        immediatelyRender: false,
    });

    // Load State
    useEffect(() => {
        if (!editor) return;

        const storedContent = localStorage.getItem(STORAGE_KEY);
        const storedTime = localStorage.getItem(TIMESTAMP_KEY);

        if (storedContent && storedTime) {
            const time = parseInt(storedTime, 10);
            const now = Date.now();

            if (now - time > EXPIRY_MS) {
                // Expired
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(TIMESTAMP_KEY);
                setIsExpired(true);
            } else {
                // Valid
                editor.commands.setContent(storedContent);
                setLastActive(time);
            }
        }
    }, [editor]);

    const handleClear = () => {
        if (confirm('Clear scratchpad? This cannot be undone.')) {
            editor?.commands.clearContent();
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(TIMESTAMP_KEY);
            setLastActive(null);
        }
    };

    // Calculate time remaining for UI (rough)
    const minutesLeft = lastActive ? Math.max(0, 60 - Math.floor((Date.now() - lastActive) / 60000)) : 60;

    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-yellow-100/50 p-3 border-b border-yellow-200 flex justify-between items-center">
                <div className="flex items-center gap-2 text-yellow-800">
                    <StickyNote className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Scratchpad</span>
                </div>
                <div className="flex items-center gap-3">
                    {lastActive && (
                        <div className="flex items-center gap-1 text-[10px] text-yellow-700" title="Expires in...">
                            <Clock className="w-3 h-3" />
                            <span>{minutesLeft}m left</span>
                        </div>
                    )}
                    <button
                        onClick={handleClear}
                        className="text-yellow-700 hover:text-red-600 transition-colors"
                        title="Clear Notes"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {isExpired && (
                <div className="bg-red-50 p-2 text-[10px] text-red-600 flex items-center gap-2 border-b border-red-100 animate-in slide-in-from-top">
                    <AlertCircle className="w-3 h-3" />
                    Previous notes expired (1h timeout).
                </div>
            )}

            <div className="bg-yellow-50/30">
                <EditorContent editor={editor} />
            </div>

            <div className="p-2 border-t border-yellow-200 bg-yellow-100/30 text-[9px] text-yellow-600 text-center">
                Data stored locally. Updates refresh 1h timer.
            </div>
        </div>
    )
}
