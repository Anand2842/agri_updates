export function calculateReadingTime(html: string | undefined | null): number {
    if (!html) return 1;
    // Strip HTML tags to get pure text
    const text = html.replace(/<[^>]+>/g, ' ');
    // Count words
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    // Assume average reading speed of 200 words per minute
    const readingTime = Math.ceil(wordCount / 200);
    return Math.max(1, readingTime); // Minimum 1 minute read
}
