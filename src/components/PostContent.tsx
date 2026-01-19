import React from 'react';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

interface PostContentProps {
    html: string;
    // canonicalUrl prop removed as it was unused
}

const window = new JSDOM('').window;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DOMPurify = createDOMPurify(window as any);

export default function PostContent({ html }: PostContentProps) {
    // Helper to format plain text content into paragraphs and sanitize non-breaking spaces
    // Only applies if the content doesn't look like HTML
    const formattedHtml = React.useMemo(() => {
        if (!html) return '';

        // CRITICAL: Replace non-breaking spaces with regular spaces to allow word wrapping
        let content = html
            .replace(/&nbsp;/gi, ' ')  // HTML entity
            .replace(/\u00A0/g, ' ')   // Unicode non-breaking space
            .replace(/\u2007/g, ' ')   // Figure space
            .replace(/\u202F/g, ' ');  // Narrow non-breaking space

        // If it looks like HTML, return as is (sanitization happens next)
        if (/<[a-z][\s\S]*>/i.test(content)) return content;

        // Otherwise, split by newlines and wrap in <p>
        return content
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => `<p>${line.trim()}</p>`)
            .join('');
    }, [html]);

    const clean = DOMPurify.sanitize(formattedHtml, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'img', 'blockquote', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'details', 'summary', 'span', 'hr', 'br', 'pre', 'code'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel', 'class', 'className', 'style', 'width', 'height']
    });

    return (
        <article className="w-full max-w-full overflow-hidden">
            <div
                className="prose prose-lg prose-stone max-w-none break-words
          prose-headings:font-serif prose-headings:font-bold
          prose-a:text-agri-green prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-xl prose-img:shadow-sm
          [&_table]:w-full [&_table]:table-auto [&_table]:border-collapse [&_table]:my-8
          [&_td]:border [&_td]:border-stone-200 [&_td]:px-4 [&_td]:py-3 [&_td]:align-top
          [&_th]:bg-stone-50 [&_th]:border [&_th]:border-stone-200 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-bold
          [&_h1]:text-3xl [&_h1]:mb-6
          [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-4
          [&_h3]:text-xl [&_h3]:mt-8 [&_h3]:mb-3
          [&_p]:mb-6 [&_p]:leading-relaxed
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6
          [&_li]:mb-2
          [&_blockquote]:border-l-4 [&_blockquote]:border-agri-green [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:bg-stone-50 [&_blockquote]:py-2
        "
                style={{ wordBreak: 'normal', overflowWrap: 'anywhere', hyphens: 'auto' }}
                dangerouslySetInnerHTML={{ __html: clean }}
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
