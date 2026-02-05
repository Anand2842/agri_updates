import { type Editor } from '@tiptap/react'
import React from 'react'
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
    Type,
    Megaphone,
    Wrench,
    MousePointerClick,
    Grid,
    Flame,
    ShieldCheck,
    Sparkles,
    BarChart3
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

    // Toolkit State
    const [isToolkitOpen, setToolkitOpen] = React.useState(false);
    const toolkitRef = React.useRef<HTMLDivElement>(null);

    // Close toolkit on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (toolkitRef.current && !toolkitRef.current.contains(event.target as Node)) {
                setToolkitOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    interface ToolkitItemProps {
        label: string;
        icon: React.ReactNode;
        template: string;
        desc: string;
    }

    const insertShortcut = (template: string) => {
        editor.chain().focus().insertContent(template).run();
        setToolkitOpen(false);
    }

    const ToolkitItem = ({ label, icon, template, desc }: ToolkitItemProps) => (
        <button
            onClick={() => insertShortcut(template)}
            className="w-full text-left px-4 py-3 hover:bg-stone-50 flex items-start gap-3 transition-colors border-b border-stone-50 last:border-0 group"
        >
            <div className="text-stone-400 group-hover:text-agri-green mt-0.5">{icon}</div>
            <div>
                <div className="font-bold text-sm text-stone-700">{label}</div>
                <div className="text-xs text-stone-400 font-mono mt-0.5">{desc}</div>
            </div>
        </button>
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
                    isActive={editor.isActive('table')}
                >
                    <TableIcon className="w-4 h-4" />
                </ToolbarBtn>

                {/* TOOLKIT DROPDOWN */}
                <div className="relative" ref={toolkitRef}>
                    <button
                        onClick={() => setToolkitOpen(!isToolkitOpen)}
                        className={`
                            p-2 rounded-md transition-all duration-200 
                            flex items-center justify-center gap-2
                            ${isToolkitOpen
                                ? 'bg-agri-green text-white shadow-md ring-1 ring-agri-green'
                                : 'text-stone-600 hover:bg-stone-100 bg-stone-50 border border-stone-200'}
                        `}
                        title="Writer's Toolkit"
                    >
                        <Wrench className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wide hidden sm:inline-block">Toolkit</span>
                    </button>

                    {isToolkitOpen && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right z-[60]">
                            <div className="bg-stone-50 px-4 py-2 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-widest">
                                Insert Shortcodes
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto">
                                <ToolkitItem
                                    label="Ad Break"
                                    icon={<Megaphone className="w-5 h-5" />}
                                    template="[[ad:mid]]"
                                    desc="Inserts a manual advertisement slot."
                                />
                                <ToolkitItem
                                    label="Call to Action Button"
                                    icon={<MousePointerClick className="w-5 h-5" />}
                                    template="[[button: Apply Now | https://example.com]]"
                                    desc="Big green button for links."
                                />
                                <ToolkitItem
                                    label="Key Facts Grid"
                                    icon={<Grid className="w-5 h-5" />}
                                    template="[[keyfacts: 10L | Grant | 50% | Subsidy]]"
                                    desc="2x4 grid for quick stats."
                                />
                                <ToolkitItem
                                    label="Status Badge"
                                    icon={<Flame className="w-5 h-5" />}
                                    template="[[status: Hot Opportunity]]"
                                    desc="Pulsing red badge for urgency."
                                />
                                <ToolkitItem
                                    label="Safety Tip"
                                    icon={<ShieldCheck className="w-5 h-5" />}
                                    template="[[tip: Always verify official sources...]]"
                                    desc="Blue box for warnings/tips."
                                />
                                <ToolkitItem
                                    label="Gold Quote"
                                    icon={<Sparkles className="w-5 h-5" />}
                                    template="[[gold: Agriculture is the future...]]"
                                    desc="Elegant gold sidebar quote."
                                />
                                <ToolkitItem
                                    label="Stat Box"
                                    icon={<BarChart3 className="w-5 h-5" />}
                                    template="[[stat: ₹50,000 | Monthly Salary]]"
                                    desc="Large number with label."
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="ml-1 flex gap-0.5">
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
