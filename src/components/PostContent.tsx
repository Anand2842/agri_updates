'use client';

import React, { useState, useEffect } from 'react';
import AdBanner from '@/components/ads/AdBanner';

interface PostContentProps {
    html: string;
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

            const clean = purify.sanitize(content, {
                ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'img', 'blockquote', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'details', 'summary', 'span', 'hr', 'br', 'pre', 'code', 'iframe'],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel', 'class', 'className', 'style', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen']
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

    // Split content by the Ad Marker
    const contentParts = cleanHtml.split('<!--__AD_MID_BREAK__-->');

    return (
        <article className="w-full max-w-full overflow-hidden">
            {contentParts.map((part, index) => (
                <React.Fragment key={index}>
                    <div
                        className="
                            prose prose-stone max-w-none mx-auto
                            text-[17px] leading-[1.85] text-stone-600 font-normal
                            
                            /* Headings - Serif for editorial feel, clean black like YourStory */
                            prose-headings:font-serif prose-headings:text-stone-900
                            [&_h2]:text-[24px] [&_h2]:sm:text-[28px] [&_h2]:font-bold [&_h2]:tracking-tight
                            [&_h2]:mt-16 [&_h2]:mb-8 [&_h2]:leading-[1.2]
                            [&_h3]:text-[20px] [&_h3]:sm:text-[22px] [&_h3]:font-bold [&_h3]:tracking-tight
                            [&_h3]:mt-14 [&_h3]:mb-6 [&_h3]:text-stone-800 [&_h3]:leading-snug
                            [&_h4]:text-[16px] [&_h4]:font-medium [&_h4]:mt-8 [&_h4]:mb-3 [&_h4]:text-stone-700
                            
                            /* Paragraphs - MASSIVE spacing like YourStory */
                            prose-p:text-stone-600 prose-p:mb-8 prose-p:font-normal
                            
                            /* Links - subtle but clickable */
                            prose-a:text-agri-green prose-a:font-medium prose-a:no-underline 
                            prose-a:border-b prose-a:border-agri-green/30 
                            hover:prose-a:border-agri-green hover:prose-a:text-agri-dark
                            
                            /* Images */
                            prose-img:rounded-lg prose-img:my-8 prose-img:w-full
                            
                            /* Strong/Bold - subtle emphasis, not shouty */
                            prose-strong:text-stone-800 prose-strong:font-normal
                            
                            /* Lists - refined styling with more breathing room */
                            [&_ul]:list-none [&_ul]:pl-0 [&_ul]:mb-6 [&_ul]:space-y-4
                            [&_ul>li]:relative [&_ul>li]:pl-6 [&_ul>li]:text-stone-600
                            [&_ul>li]:before:content-['•'] [&_ul>li]:before:absolute [&_ul>li]:before:left-0
                            [&_ul>li]:before:text-agri-green [&_ul>li]:before:font-bold
                            
                            /* Numbered Lists */
                            [&_ol]:list-none [&_ol]:pl-0 [&_ol]:mb-6 [&_ol]:space-y-4 [&_ol]:counter-reset-[item]
                            [&_ol>li]:relative [&_ol>li]:pl-8 [&_ol>li]:text-stone-600
                            [&_ol>li]:before:absolute [&_ol>li]:before:left-0 [&_ol>li]:before:text-agri-green
                            [&_ol>li]:before:font-semibold [&_ol>li]:before:text-[15px]
                            
                            /* Nested lists */
                            [&_ul_ul]:mt-3 [&_ul_ul]:mb-0 [&_ol_ol]:mt-3 [&_ol_ol]:mb-0
                            [&_ul_ul>li]:before:content-['◦'] [&_ul_ul>li]:before:text-stone-400
                            
                            /* Blockquotes */
                            [&_blockquote]:border-l-2 [&_blockquote]:border-agri-green/40 
                            [&_blockquote]:pl-5 [&_blockquote]:py-1 [&_blockquote]:italic 
                            [&_blockquote]:text-lg [&_blockquote]:text-stone-500 
                            [&_blockquote]:my-8 [&_blockquote]:bg-transparent
                            
                            /* Drop Cap for the first paragraph (Only for the first part) */
                            ${index === 0 ? `
                            [&>p:first-of-type::first-letter]:float-left 
                            [&>p:first-of-type::first-letter]:text-5xl 
                            [&>p:first-of-type::first-letter]:pr-0
                            [&>p:first-of-type::first-letter]:mr-3
                            [&>p:first-of-type::first-letter]:font-serif 
                            [&>p:first-of-type::first-letter]:font-bold 
                            [&>p:first-of-type::first-letter]:text-agri-green 
                            [&>p:first-of-type::first-letter]:leading-[0.75] 
                            [&>p:first-of-type::first-letter]:mt-1
                            ` : ''}
                        "
                        style={{ wordBreak: 'normal', overflowWrap: 'anywhere' }}
                        dangerouslySetInnerHTML={{ __html: part }}
                    />
                    {/* Render Ad Banner if not the last part */}
                    {index < contentParts.length - 1 && (
                        <div className="my-8">
                            <AdBanner placement="in-content" />
                        </div>
                    )}
                </React.Fragment>
            ))}

            <hr className="my-10 border-stone-100" />
            <div className="p-5 bg-stone-50/50 border border-stone-100 rounded-lg text-sm">
                <p className="font-medium text-stone-500 mb-1">Disclaimer</p>
                <p className="text-stone-400 leading-relaxed">
                    Agri Updates shares opportunities sourced from trusted networks. Applicants are advised to verify all details directly with the issuing organisation.
                </p>
            </div>
        </article>
    );
}
