import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Underline } from '@tiptap/extension-underline'
import { TextAlign } from '@tiptap/extension-text-align'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Typography } from '@tiptap/extension-typography'
import { useEffect, useRef } from 'react'
import EditorToolbar from './EditorToolbar'

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    onImageUpload?: (file: File) => Promise<string>
    isEditable?: boolean
    onEditorReady?: (editor: any) => void
}

export default function RichTextEditor({ content, onChange, onImageUpload, isEditable = true, onEditorReady }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Typography,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Image,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Placeholder.configure({
                placeholder: 'Start writing your amazing content...',
            }),
        ],
        content,
        editable: isEditable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        onCreate: ({ editor }) => {
            if (onEditorReady) onEditorReady(editor)
        },
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-lg prose-stone max-w-none focus:outline-none min-h-[500px] p-8 bg-white selection:bg-indigo-100',
            },
        },
    })

    // Update content if it changes externally (careful with infinite loops, usually only on mount or reset)
    // Tiptap handles this well usually, but if we need to reset:
    /*
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])
    */
    // The above effect causes cursor jumps. Better to trust local state or only update if drastically different.
    // For this use case (form input), we generally only initialize. 
    // If the user "Polishes" content, existing content is replaced.
    // So we DO need to listen to external content changes, but maybe only if they are significantly different?
    // Let's implement a check.

    useEffect(() => {
        if (editor && content) {
            // Check if content is different (simple check)
            // This is tricky with Tiptap. 
            // Usually simpler to just set content on mount, and if the parent updates IT (like Polish), we use a helper.
            // Let's stick to initial content or manual replacement key.
            // But 'Polish' feature updates the state. So we SHOULD update editor.

            const currentContent = editor.getHTML()
            if (currentContent === content) return // No change

            // If completely different (e.g. Polish), set it. 
            // To avoid cursor jumping on every keystroke, we rely on the fact that 
            // onChange updates the parent, so parent 'content' will match 'currentContent'.
            // The only time they mismatch is if Parent updates it INDEPENDENTLY of onChange (e.g. 'Polish' button).

            // To be safe, we can compare text length or just do it. 
            // But standard controlled input pattern in Tiptap is:
            // Only update if the passed content is not what we just emitted.

            // actually, simple equality check is usually enough to prevent loops
            // checks if content is radically different (hacky but works for Polish)
            if (Math.abs(currentContent.length - content.length) > 10 || !currentContent.includes(content.substring(0, 20))) {
                editor.commands.setContent(content)
            }
        }
    }, [content, editor])

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageTrigger = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && onImageUpload && editor) {
            try {
                const url = await onImageUpload(file)
                editor.chain().focus().setImage({ src: url }).run()
            } catch (error) {
                console.error("Image upload failed", error)
                alert("Failed to upload image")
            }
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <EditorToolbar editor={editor} onImageUpload={handleImageTrigger} />
            <EditorContent editor={editor} />
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
        </div>
    )
}
