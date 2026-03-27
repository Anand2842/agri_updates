'use client';

import { useState, useEffect } from 'react';

interface PostContentProps {
    html: string;
}

function unwrapElement(element: Element) {
    const parent = element.parentNode;
    if (!parent) return;

    while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
    }

    parent.removeChild(element);
}

function stripUnderlineStyles(styleValue: string | null) {
    if (!styleValue) return null;

    const cleaned = styleValue
        .replace(/text-decoration(?:-line|-style|-color|-thickness)?\s*:[^;]+;?/gi, '')
        .replace(/text-underline-offset\s*:[^;]+;?/gi, '')
        .trim()
        .replace(/;\s*;/g, ';')
        .replace(/^;|;$/g, '')
        .trim();

    return cleaned || null;
}

function normalizeEditorialMarkup(content: string) {
    if (typeof DOMParser === 'undefined') {
        return content;
    }

    const doc = new DOMParser().parseFromString(`<div data-post-root="true">${content}</div>`, 'text/html');
    const root = doc.body.firstElementChild;

    if (!root) {
        return content;
    }

    root.querySelectorAll('u').forEach((element) => {
        unwrapElement(element);
    });

    root.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
        const cleanedStyle = stripUnderlineStyles(element.getAttribute('style'));
        if (cleanedStyle) {
            element.setAttribute('style', cleanedStyle);
        } else {
            element.removeAttribute('style');
        }
    });

    root.querySelectorAll('a').forEach((anchor) => {
        const href = (anchor.getAttribute('href') || '').trim();
        const normalizedHref = href.toLowerCase();
        const text = (anchor.textContent || '').trim();
        const classes = `${anchor.getAttribute('class') || ''} ${anchor.getAttribute('className') || ''}`.toLowerCase();

        const hasMeaningfulHref =
            Boolean(href) &&
            normalizedHref !== '#' &&
            !normalizedHref.startsWith('javascript:');
        const isMeaningfulExternal = /^(https?:\/\/|mailto:|tel:)/i.test(href);
        const isMeaningfulInternal = /^\/(blog|updates|jobs|internships|startups|search|author|newsletter)\b/i.test(href);
        const isDownloadLink = /\.(pdf|docx?|xlsx?|csv)([#?].*)?$/i.test(href);
        const looksLikeCta =
            /(apply|register|subscribe|download|learn more|read more|official|source)/i.test(text) ||
            /(button|btn|cta|inline-block|rounded|bg-|shadow)/.test(classes);

        if (!hasMeaningfulHref || (!isMeaningfulExternal && !isMeaningfulInternal && !isDownloadLink && !looksLikeCta)) {
            unwrapElement(anchor);
        }
    });

    return root.innerHTML;
}

export default function PostContent({ html }: PostContentProps) {
    const [cleanHtml, setCleanHtml] = useState<string>('');

    useEffect(() => {
        // Only import and run DOMPurify on the client
        import('dompurify').then((DOMPurify) => {
            const purify = DOMPurify.default || DOMPurify;

            if (!html) {
                setCleanHtml('');
                return;
            }

            // Replace non-breaking spaces with regular spaces
            let content = html
                .replace(/&nbsp;/gi, ' ')
                .replace(/\u00A0/g, ' ')
                .replace(/\u2007/g, ' ')
                .replace(/\u202F/g, ' ');

            // If it looks like HTML, sanitize as is
            // Otherwise, wrap in paragraphs
            if (!/\<[a-z][\s\S]*\>/i.test(content)) {
                content = content
                    .split('\n')
                    .filter((line: string) => line.trim() !== '')
                    .map((line: string) => `<p>${line.trim()}</p>`)
                    .join('');
            }

            // --- Shortcode Processing ---

            // 1. Stat Box: [[stat: 40L | Maximum Grant]]
            // Regex captures: $1 = Value, $2 = Label
            content = content.replace(
                /\[\[stat:\s*(.*?)\s*\|\s*(.*?)\]\]/g,
                '<div class="my-12 p-8 border-2 border-stone-200 rounded-xl text-center bg-white"><div class="text-4xl md:text-5xl font-black text-agri-green mb-2 leading-none">$1</div><div class="text-xs font-bold uppercase tracking-widest text-stone-400">$2</div></div>'
            );

            // 2. Gold Quote: [[gold: Quote text...]]
            content = content.replace(
                /\[\[gold:\s*(.*?)\]\]/g,
                '<blockquote class="border-l-4 border-[#C9A961] pl-8 italic text-2xl text-stone-700 font-serif my-12 bg-transparent">$1</blockquote>'
            );

            // 3. Tip Box: [[tip: Tip text...]]
            content = content.replace(
                /\[\[tip:\s*(.*?)\]\]/g,
                '<div class="my-8 p-5 bg-[#f1f8ff] border border-blue-100 rounded-lg flex gap-3 text-stone-700 text-sm font-medium"><svg class="w-5 h-5 text-[#0b5ed7] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><div><span class="block font-bold text-[#0b5ed7] uppercase tracking-widest text-xs mb-1">Safety Tip</span>$1</div></div>'
            );

            // 5. REMOVE heading numbers completely: <h2>2.1 Title</h2> -> <h2>Title</h2>
            // Matches: Any header tag + any number pattern (digits + dots) at start + whitespace
            content = content.replace(
                /(<h[2-4][^>]*>(?:\s*<[a-z]+[^>]*>)*)(\s*\d+(\.\d+)*\.?)(\s+)/gi,
                '$1'
            );

            // 6. REMOVE H1 tags entirely (as title is already in header)
            content = content.replace(/<h1[^>]*>.*?<\/h1>/gi, '');

            // 7. Refine 'Hot Opportunity' Status Badge
            // Matches: [[status: Hot Opportunity]] or [[status: Urgent]]
            content = content.replace(
                /\[\[status:\s*(.*?)\]\]/g,
                '<div class="my-6 flex justify-center"><span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider border border-red-100 shadow-sm"><span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>$1</span></div>'
            );

            // 6. Pull Quote: [[pullquote: Quote text...]]
            content = content.replace(
                /\[\[pullquote:\s*(.*?)\]\]/g,
                '<div class="my-12 py-8 border-t border-b border-stone-200 text-center"><blockquote class="text-2xl md:text-3xl font-serif italic text-stone-700 max-w-[600px] mx-auto leading-relaxed !border-0 !pl-0 !bg-transparent">"$1"</blockquote></div>'
            );

            // 7. Key Facts Grid: [[keyfacts: 1,943 | Startups | 146cr | Grant | 24 | R-ABIs | 5 | Partners]]
            content = content.replace(
                /\[\[keyfacts:\s*(.*?)\]\]/g,
                (match: string, facts: string) => {
                    const items = facts.split('|').map((s: string) => s.trim());
                    const pairs = [];
                    for (let i = 0; i < items.length; i += 2) {
                        if (items[i] && items[i + 1]) {
                            pairs.push('<div class="text-center"><div class="text-2xl font-bold text-agri-green">' + items[i] + '</div><div class="text-xs text-stone-500 uppercase tracking-wider">' + items[i + 1] + '</div></div>');
                        }
                    }
                    return '<div class="my-10 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-agri-green/5 rounded-xl border border-agri-green/10">' + pairs.join('') + '</div>';
                }
            );

            // 8. Add section dividers before H2 (except the first one)
            let h2Count = 0;
            content = content.replace(/<h2/g, () => {
                h2Count++;
                if (h2Count > 1) {
                    return '<hr class="section-divider" /><h2';
                }
                return '<h2';
            });

            // 9. Manual Ad Breakpoints: [[ad:mid]] -> Split Marker
            // We use a specific, unlikely string to split on later
            content = content.replace(
                /\[\[ad:mid\]\]/g,
                '<!--__AD_MID_BREAK__-->'
            );

            // 4. Primary Button: [[button: Apply Now | https://...]]
            content = content.replace(
                /\[\[button:\s*(.*?)\s*\|\s*(.*?)\]\]/g,
                '<div class="my-10 text-center"><a href="$2" class="inline-block px-8 py-4 bg-agri-green text-white !text-white font-bold uppercase tracking-widest text-sm rounded-lg shadow-md hover:bg-agri-dark hover:shadow-lg hover:!text-white transition-all duration-200 !no-underline">$1</a></div>'
            );

            // 5. Render-Time Normalization (Remove Hallucinated Brand Fillers)
            // Strip entire block-level elements containing the branded lead-in + optional date
            content = content.replace(/<(p|div|span|em|strong|i)[^>]*>[^<]*Updated\s+for\s+Agri\s+Updates[^<]*<\/\1>/gi, '');
            // Strip standalone instances including trailing dates like "/ January 2026"
            content = content.replace(/Updated\s+for\s+Agri\s+Updates\s*[\/\-–—]?\s*(?:January|February|March|April|May|June|July|August|September|October|November|December)?\s*\d{0,4}/gi, '');
            // Catch any remaining bare instances
            content = content.replace(/Updated\s+for\s+Agri\s+Updates/gi, '');
            // Neutralize branded author references in body text
            content = content.replace(/Agri\s+Updates?\s+Editor/gi, 'Editorial Desk');
            content = content.replace(/Agri\s+Updates?\s+Desk/gi, 'Editorial Desk');
            // Strip empty paragraphs left behind after cleanup
            content = content.replace(/<p[^>]*>\s*<\/p>/gi, '');

            // Harden imported HTML so malformed links or inline underline styles
            // cannot turn the whole article into link-like text.
            content = normalizeEditorialMarkup(content);

            const clean = purify.sanitize(content, {
                ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'img', 'blockquote', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'details', 'summary', 'span', 'hr', 'br', 'pre', 'code', 'iframe'],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel', 'class', 'className', 'style', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'],
                FORBID_TAGS: ['u']
            });

            setCleanHtml(clean);
        });
    }, [html]);

    // Show loading skeleton while sanitizing
    if (!cleanHtml && html) {
        return (
            <article className="w-full max-w-full overflow-hidden animate-pulse">
                <div className="space-y-4">
                    <div className="h-6 bg-stone-200 rounded w-3/4"></div>
                    <div className="h-4 bg-stone-200 rounded w-full"></div>
                    <div className="h-4 bg-stone-200 rounded w-5/6"></div>
                </div>
            </article>
        );
    }

    return (
        <article className="w-full max-w-full overflow-hidden">
            <div
                className="
                    prose-article
                    prose prose-stone max-w-none mx-auto
                    text-[18px] leading-[1.9] text-stone-700 font-normal
                    
                    prose-headings:font-serif prose-headings:text-[#111]
                    [&_h2]:text-[26px] [&_h2]:sm:text-[32px] [&_h2]:font-bold [&_h2]:tracking-tight
                    [&_h2]:mt-16 [&_h2]:mb-6 [&_h2]:leading-[1.25]
                    [&_h3]:text-[22px] [&_h3]:sm:text-[24px] [&_h3]:font-bold [&_h3]:tracking-tight
                    [&_h3]:mt-12 [&_h3]:mb-4 [&_h3]:text-stone-800 [&_h3]:leading-snug
                    [&_h4]:text-[18px] [&_h4]:font-semibold [&_h4]:mt-8 [&_h4]:mb-3 [&_h4]:text-stone-800
                    
                    prose-p:text-stone-700 prose-p:mb-8 prose-p:font-normal
                    
                    prose-a:text-agri-green prose-a:font-medium prose-a:no-underline
                    hover:prose-a:underline hover:prose-a:decoration-agri-green
                    hover:prose-a:underline-offset-4 hover:prose-a:text-agri-dark
                    
                    prose-img:rounded-xl prose-img:my-10 prose-img:w-full prose-img:shadow-sm
                    
                    prose-strong:text-stone-900 prose-strong:font-bold
                    
                    [&_ul]:list-none [&_ul]:pl-0 [&_ul]:mb-8 [&_ul]:space-y-4
                    [&_ul>li]:relative [&_ul>li]:pl-6 [&_ul>li]:text-stone-700
                    [&_ul>li]:before:content-['•'] [&_ul>li]:before:absolute [&_ul>li]:before:left-0
                    [&_ul>li]:before:text-stone-400 [&_ul>li]:before:font-bold
                    
                    [&_ol]:list-none [&_ol]:pl-0 [&_ol]:mb-8 [&_ol]:space-y-4 [&_ol]:counter-reset-[item]
                    [&_ol>li]:relative [&_ol>li]:pl-8 [&_ol>li]:text-stone-700
                    [&_ol>li]:before:absolute [&_ol>li]:before:left-0 [&_ol>li]:before:text-stone-400
                    [&_ol>li]:before:font-semibold [&_ol>li]:before:text-[15px]
                    
                    [&_ul_ul]:mt-3 [&_ul_ul]:mb-0 [&_ol_ol]:mt-3 [&_ol_ol]:mb-0
                    [&_ul_ul>li]:before:content-['◦'] [&_ul_ul>li]:before:text-stone-400
                    
                    [&_blockquote]:border-l-4 [&_blockquote]:border-stone-900 
                    [&_blockquote]:pl-6 [&_blockquote]:py-2 [&_blockquote]:italic 
                    [&_blockquote]:text-[22px] [&_blockquote]:text-stone-800 [&_blockquote]:font-serif
                    [&_blockquote]:my-10 [&_blockquote]:bg-stone-50 [&_blockquote]:pr-6
                    
                    [&>p:first-of-type::first-letter]:float-left 
                    [&>p:first-of-type::first-letter]:text-[5.5rem] 
                    [&>p:first-of-type::first-letter]:pr-4
                    [&>p:first-of-type::first-letter]:mr-2
                    [&>p:first-of-type::first-letter]:font-serif 
                    [&>p:first-of-type::first-letter]:font-bold 
                    [&>p:first-of-type::first-letter]:text-stone-900 
                    [&>p:first-of-type::first-letter]:leading-[0.75] 
                    [&>p:first-of-type::first-letter]:mt-3
                "
                style={{ wordBreak: 'normal', overflowWrap: 'anywhere' }}
                dangerouslySetInnerHTML={{ __html: cleanHtml.replace(/<!--__AD_MID_BREAK__-->/g, '') }}
            />
        </article>
    );
}
