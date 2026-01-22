import { Editor } from '@tiptap/react'
import { useEffect, useState } from 'react'

interface TableOfContentsProps {
    editor: Editor | null
}

interface TocItem {
    id: string
    text: string
    level: number
}

export default function TableOfContents({ editor }: TableOfContentsProps) {
    const [items, setItems] = useState<TocItem[]>([])

    useEffect(() => {
        if (!editor) return

        const updateToc = () => {
            const newItems: TocItem[] = []
            editor.state.doc.descendants((node) => {
                if (node.type.name === 'heading') {
                    // Normalize ID from text if not present (simple slugify)
                    const text = node.textContent
                    const id = node.attrs.id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

                    if (text) {
                        newItems.push({
                            id,
                            text,
                            level: node.attrs.level
                        })
                    }
                }
            })
            setItems(newItems)
        }

        updateToc()
        editor.on('update', updateToc)

        return () => {
            editor.off('update', updateToc)
        }
    }, [editor])

    if (items.length === 0) return null

    return (
        <div className="bg-stone-50 border border-stone-200 p-4 rounded-lg h-fit sticky top-20">
            <h3 className="font-bold text-xs uppercase tracking-widest text-stone-500 mb-3">Table of Contents</h3>
            <nav>
                <ul className="space-y-2">
                    {items.map((item, index) => (
                        <li key={`${item.id}-${index}`} style={{ paddingLeft: `${(item.level - 1) * 8}px` }}>
                            <a
                                href={`#${item.id}`}
                                onClick={(e) => {
                                    e.preventDefault()
                                    // Verify if the editor content has these IDs rendered. 
                                    // If not, we might need to rely on the editor's scrollIntoView logic or just visual aid for now.
                                    // In a real Tiptap setup, we'd need a custom extension to enforce IDs on headings.
                                    // For now, this visualizes structure.
                                }}
                                className={`block text-xs text-stone-600 hover:text-black hover:underline truncate transition-colors ${item.level === 1 ? 'font-bold' : ''}`}
                            >
                                {item.text}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    )
}
