/**
 * Decodes standard HTML entities (like &#039;, &amp;, &quot;, &lt;, &gt;) back to literal characters.
 * Useful for ensuring titles and metadata don't double-encode or render literal entity codes.
 */
export function decodeHtmlEntities(text: string | null | undefined): string {
    if (!text) return '';
    
    const entities: Record<string, string> = {
        '&#039;': "'",
        '&#39;': "'",
        '&apos;': "'",
        '&amp;': '&',
        '&quot;': '"',
        '&lt;': '<',
        '&gt;': '>',
        '&nbsp;': ' ',
        '&rsquo;': '’',
        '&lsquo;': '‘',
        '&rdquo;': '”',
        '&ldquo;': '“',
        '&ndash;': '–',
        '&mdash;': '—'
    };

    return text.replace(/&#?\w+;/g, match => entities[match] || match);
}
