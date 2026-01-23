'use client';

import React, { useState, useEffect } from 'react';

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
                '<div class="my-8 p-6 bg-agri-green/5 border border-agri-green/20 rounded-lg text-stone-700 text-sm font-medium"><span class="block font-bold text-agri-green uppercase tracking-widest text-xs mb-2">Pro Tip</span>$1</div>'
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

    return (
        <article className="w-full max-w-full overflow-hidden">
            <div
                className="prose prose-lg prose-stone max-w-none mx-auto break-words
          text-[19px] leading-[1.8]
          prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-charcoal
          prose-p:text-stone-800 prose-p:mb-8
          prose-a:text-agri-green prose-a:font-bold prose-a:no-underline hover:prose-a:underline hover:prose-a:text-agri-light
          prose-img:rounded-xl prose-img:shadow-lg prose-img:my-12 prose-img:w-full
          prose-strong:text-charcoal prose-strong:font-bold
          [&_table]:w-full [&_table]:table-auto [&_table]:border-collapse [&_table]:my-12
          [&_td]:border-b [&_td]:border-stone-200 [&_td]:px-4 [&_td]:py-4 [&_td]:align-top
          [&_th]:bg-stone-50 [&_th]:border-b-2 [&_th]:border-stone-200 [&_th]:px-4 [&_th]:py-4 [&_th]:text-left [&_th]:font-black [&_th]:uppercase [&_th]:text-xs [&_th]:tracking-widest
          [&_h2]:text-3xl [&_h2]:mt-20 [&_h2]:mb-8 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-stone-100
          [&_h3]:text-2xl [&_h3]:mt-12 [&_h3]:mb-4
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-8 [&_ul]:space-y-2
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-8 [&_ol]:space-y-2
          [&_blockquote]:border-l-4 [&_blockquote]:border-agri-green [&_blockquote]:pl-8 [&_blockquote]:italic [&_blockquote]:text-2xl [&_blockquote]:text-stone-700 [&_blockquote]:font-serif [&_blockquote]:my-12 [&_blockquote]:bg-transparent
        "
                style={{ wordBreak: 'normal', overflowWrap: 'anywhere', hyphens: 'auto' }}
                dangerouslySetInnerHTML={{ __html: cleanHtml }}
            />
            <hr className="my-8 border-stone-200" />
            <div className="p-6 bg-stone-50 border border-stone-200 rounded-lg">
                <p className="font-bold text-stone-700 mb-2 font-serif">Disclaimer</p>
                <p className="text-stone-600 text-sm leading-relaxed">
                    Agri Updates shares opportunities sourced from trusted networks. Applicants are advised to verify all details directly with the issuing organisation before submission.
                </p>
            </div>
        </article>
    );
}
