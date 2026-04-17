'use client'

import { useState } from 'react'
import { ShieldAlert, FileText, FileVideo, FileCode, Presentation, ChevronDown, ChevronUp, Eye } from 'lucide-react'

interface WarningAttachmentViewerProps {
    url: string
    type: 'pdf' | 'ppt' | 'html' | 'video' | string | null
    title?: string
}

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    pdf: { label: 'PDF Document', icon: FileText, color: 'text-red-600' },
    ppt: { label: 'Presentation', icon: Presentation, color: 'text-orange-500' },
    html: { label: 'HTML Document', icon: FileCode, color: 'text-blue-600' },
    video: { label: 'Video', icon: FileVideo, color: 'text-purple-600' },
}

function getViewerUrl(url: string, type: string | null): string | null {
    if (type === 'pdf') {
        // Google Docs Viewer — strips download button
        return `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(url)}`
    }
    if (type === 'ppt') {
        // Google Slides Viewer
        return `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(url)}`
    }
    if (type === 'html') {
        // Direct URL in a sandboxed iframe
        return url
    }
    return null // video handled separately
}

export default function WarningAttachmentViewer({ url, type, title }: WarningAttachmentViewerProps) {
    const [expanded, setExpanded] = useState(false)
    const [loaded, setLoaded] = useState(false)

    if (!url || !type) return null

    const meta = TYPE_META[type] || { label: 'Attachment', icon: FileText, color: 'text-stone-600' }
    const MetaIcon = meta.icon
    const viewerUrl = getViewerUrl(url, type)

    return (
        <div className="my-8 border border-amber-200 rounded-xl overflow-hidden bg-amber-50/50 shadow-sm">
            {/* Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-200">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-amber-700">
                            View Only
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MetaIcon className={`w-4 h-4 ${meta.color}`} />
                        <span className="text-sm font-semibold text-stone-700">
                            {title || `Official ${meta.label}`}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => setExpanded(prev => !prev)}
                    className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 px-3 py-1.5 rounded-lg transition-colors hover:bg-stone-50"
                >
                    <Eye className="w-3.5 h-3.5" />
                    {expanded ? (
                        <>Hide <ChevronUp className="w-3.5 h-3.5" /></>
                    ) : (
                        <>View Document <ChevronDown className="w-3.5 h-3.5" /></>
                    )}
                </button>
            </div>

            {/* Disclaimer Banner */}
            <div className="px-4 py-2.5 bg-amber-100/70 border-b border-amber-200 flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <p className="text-[11px] text-amber-800 font-medium leading-snug">
                    This document is official reference material. Downloading is <strong>disabled</strong> to protect content integrity. Read online only.
                </p>
            </div>

            {/* Viewer Area */}
            {expanded && (
                <div className="relative bg-stone-100">
                    {/* Loading State */}
                    {!loaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 z-10 min-h-[400px]">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs text-stone-500 font-medium">Loading document…</span>
                            </div>
                        </div>
                    )}

                    {/* === VIDEO === */}
                    {type === 'video' && (
                        <div className="p-2 bg-black">
                            {/* Transparent overlay trick: blocks right-click save on video */}
                            <div className="relative">
                                <video
                                    src={url}
                                    controls
                                    controlsList="nodownload nofullscreen"
                                    disablePictureInPicture
                                    onContextMenu={(e) => e.preventDefault()}
                                    onLoadedData={() => setLoaded(true)}
                                    className="w-full max-h-[520px] rounded-lg"
                                    style={{ outline: 'none' }}
                                >
                                    Your browser does not support the video tag.
                                </video>
                                {/* Invisible overlay to block right-click */}
                                <div
                                    className="absolute inset-0 z-10 pointer-events-none select-none"
                                    onContextMenu={(e) => e.preventDefault()}
                                    style={{ userSelect: 'none' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* === PDF / PPT (Google Docs Viewer) === */}
                    {(type === 'pdf' || type === 'ppt') && viewerUrl && (
                        <div
                            className="relative"
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <iframe
                                src={viewerUrl}
                                className="w-full border-0"
                                style={{ height: '600px', minHeight: '400px' }}
                                title="Document Viewer"
                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                                onLoad={() => setLoaded(true)}
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* === HTML (sandboxed iframe) === */}
                    {type === 'html' && viewerUrl && (
                        <div
                            className="relative"
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <iframe
                                src={viewerUrl}
                                className="w-full border-0 bg-white"
                                style={{ height: '600px', minHeight: '400px' }}
                                title="HTML Document Viewer"
                                sandbox="allow-scripts allow-same-origin"
                                referrerPolicy="no-referrer"
                                onLoad={() => setLoaded(true)}
                                loading="lazy"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Collapsed placeholder */}
            {!expanded && (
                <div className="px-4 py-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-white border border-stone-200 flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <MetaIcon className={`w-6 h-6 ${meta.color}`} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-stone-800">
                            {title || `Official ${meta.label} Attached`}
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">
                            Click &ldquo;View Document&rdquo; to read inline — downloading is not permitted
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
