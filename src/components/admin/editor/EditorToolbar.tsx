import { type Editor } from '@tiptap/react'
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Quote,
    Code,
    Minus,
    Link as LinkIcon,
    Image as ImageIcon,
    Table as TableIcon,
    Rows,
    Columns,
    Trash2,
    Undo,
    Redo,
    Type
} from 'lucide-react'

interface EditorToolbarProps {
    editor: Editor | null;
    onImageUpload: () => void;
}

export default function EditorToolbar({ editor, onImageUpload }: EditorToolbarProps) {
    if (!editor) {
        return null
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        if (url === null) return // cancelled
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    // Helper for Button Styles
    const ToolbarBtn = ({
        onClick,
        isActive = false,
        disabled = false,
        children,
        title
    }: {
        onClick: () => void,
        isActive?: boolean,
        disabled?: boolean,
        children: React.ReactNode,
        title: string
    }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            type="button"
            className={`
                p-2 rounded-md transition-all duration-200 
                flex items-center justify-center
                ${isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                    : 'text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800'}
                ${disabled ? 'opacity-30 cursor-not-allowed hidden' : ''}
            `}
        >
            {children}
        </button>
    )

    // Vertical Divider
    const Divider = () => (
        <div className="w-px h-6 bg-stone-200 mx-1 self-center" />
    )

    return (
        <div className="sticky top-0 z-[50] w-full bg-white/95 backdrop-blur-sm border-b border-stone-200 px-3 py-2 flex items-center flex-wrap gap-1 shadow-sm transition-all">

            {/* History Group */}
            <div className="flex gap-0.5">
                <ToolbarBtn
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    title="Undo"
                >
                    <Undo className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    title="Redo"
                >
                    <Redo className="w-4 h-4" />
                </ToolbarBtn>
            </div>

            <Divider />

            {/* Text Style Group */}
            <div className="flex gap-0.5">
                <div className="flex items-center gap-1 bg-stone-50 rounded-lg p-0.5">
                    <ToolbarBtn
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editor.can().chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Bold (Cmd+B)"
                    >
                        <Bold className="w-4 h-4 text-inherit" strokeWidth={2.5} />
                    </ToolbarBtn>
                    <ToolbarBtn
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Italic (Cmd+I)"
                    >
                        <Italic className="w-4 h-4" />
                    </ToolbarBtn>
                    <ToolbarBtn
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        title="Underline (Cmd+U)"
                    >
                        <Underline className="w-4 h-4" />
                    </ToolbarBtn>
                    <ToolbarBtn
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        title="Strikethrough"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </ToolbarBtn>
                </div>
            </div>

            <Divider />

            {/* Heading Group */}
            <div className="flex gap-0.5">
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    isActive={editor.isActive('paragraph')}
                    title="Normal Text"
                >
                    <Type className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="w-5 h-5" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="w-5 h-5" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 className="w-5 h-5" />
                </ToolbarBtn>
            </div>

            <Divider />

            {/* Alignment Group */}
            <div className="flex gap-0.5 hidden sm:flex">
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    title="Align Left"
                >
                    <AlignLeft className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    title="Align Center"
                >
                    <AlignCenter className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    title="Align Right"
                >
                    <AlignRight className="w-4 h-4" />
                </ToolbarBtn>
            </div>

            <Divider />

            {/* List Group */}
            <div className="flex gap-0.5">
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </ToolbarBtn>
            </div>

            <Divider />

            {/* Inserts Group */}
            <div className="flex gap-0.5">
                <ToolbarBtn
                    onClick={setLink}
                    isActive={editor.isActive('link')}
                    title="Insert Link"
                >
                    <LinkIcon className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={onImageUpload}
                    title="Insert Image"
                >
                    <ImageIcon className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    title="Insert Table"
                >
                    <TableIcon className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Quote"
                >
                    <Quote className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    title="Code Block"
                >
                    <Code className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Divider"
                >
                    <Minus className="w-4 h-4" />
                </ToolbarBtn>
            </div>

            {/* Contextual Table Tools */}
            {editor.isActive('table') && (
                <>
                    <Divider />
                    <div className="flex gap-0.5 bg-indigo-50 rounded-lg p-0.5 border border-indigo-100 animate-in fade-in slide-in-from-top-1">
                        <ToolbarBtn
                            onClick={() => editor.chain().focus().addRowAfter().run()}
                            title="Add Row"
                            isActive
                        >
                            <Rows className="w-4 h-4" />
                        </ToolbarBtn>
                        <ToolbarBtn
                            onClick={() => editor.chain().focus().addColumnAfter().run()}
                            title="Add Col"
                            isActive
                        >
                            <Columns className="w-4 h-4" />
                        </ToolbarBtn>
                        <ToolbarBtn
                            onClick={() => editor.chain().focus().deleteTable().run()}
                            title="Delete Table"
                            isActive
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </ToolbarBtn>
                    </div>
                </>
            )}
        </div>
    )
}
