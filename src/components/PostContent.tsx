import React from 'react';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

interface PostContentProps {
    html: string;
    canonicalUrl?: string;
}

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as unknown as Window);

export default function PostContent({ html, canonicalUrl }: PostContentProps) {
    const clean = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'img', 'blockquote', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'details', 'summary', 'span', 'hr', 'br'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel', 'class', 'className', 'style']
    });

    return (
        <article className="w-full max-w-full overflow-hidden">
            <div
                className="prose prose-stone prose-lg max-w-none break-words
          [&_table]:w-full [&_table]:table-auto [&_table]:border-collapse
          [&_td]:px-4 [&_td]:py-3 [&_td]:text-left [&_td]:align-top
          [&_tr]:border-b [&_tr]:border-stone-100
          [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-4
          [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2
          [&_p]:mb-4 [&_p]:leading-relaxed
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
          [&_li]:mb-2
          [&_a]:text-agri-green [&_a]:underline [&_a]:underline-offset-2
          [&_strong]:font-bold
          [&_details]:bg-white [&_details]:border [&_details]:rounded-lg [&_details]:mb-4
          [&_summary]:p-4 [&_summary]:font-bold [&_summary]:cursor-pointer
        "
                dangerouslySetInnerHTML={{ __html: clean }}
            />
            <hr className="my-8 border-stone-200" />
            <div className="p-6 bg-stone-50 border border-stone-200 rounded-lg">
                <p className="font-bold text-stone-700 mb-2">Disclaimer</p>
                <p className="text-stone-600 text-sm leading-relaxed">
                    Agri Updates shares opportunities sourced from trusted networks. Applicants are advised to verify all details directly with the issuing organisation before submission.
                </p>
            </div>
        </article>
    );
}
