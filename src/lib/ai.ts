
import OpenAI from 'openai';

const apiKey = process.env.GROQ_API_KEY;
const baseURL = process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1';
const modelName = process.env.AI_MODEL || 'openai/gpt-oss-120b';

const client = new OpenAI({
    apiKey: apiKey || 'dummy', // Prevent crash if missing, handled below
    baseURL: baseURL,
});

const POLISH_PROMPT = `
You are an expert SEO Content Editor. Your goal is to rewrite the input text to be visually spacious, highly readable, and optimized for search engines, while being FACTUALLY EXACT.

STRICT RULES (Adhere or Fail):
1.  **ZERO HALLUCINATION**: You must NOT change, invent, or approximate any numbers, salaries, dates, eligibility criteria, or names. If a salary is "5-8 LPA", it stays "5-8 LPA". If a date is "25th Jan", it stays "25th Jan".
2.  **Anti-Clustering**:
    *   Break content into short, punchy paragraphs (max 2-3 sentences).
    *   Use bullet points (<ul>/<li>) liberally for requirements, highlights, or steps.
    *   Add vertical whitespace by ensuring tags like <p> and <ul> are distinct.
3.  **SEO Optimization**:
    *   Use <h2> for main section headers (e.g., "Job Overview", "Eligibility", "How to Apply").
    *   Identify and naturally include relevant keywords from the context.
5.  **Summary Table**: At the very end, append a strictly formatted HTML table (\`<table>\`) summarizing the key details (e.g., Role, Company, Location, Deadline, Eligibility). Use clear headers and data cells.
6.  **Formatting**: Return ONLY clean HTML body content (<h2>, <p>, <ul>, <li>, <strong>, <table>). No <html>, <head>, or markdown backticks.

Input Text:
`;

function basicPolish(text: string): string {
    // 1. Clean "Forwarded" junk
    let clean = text
        .replace(/Forwarded message/gi, '')
        .replace(/From:.*$/gm, '')
        .replace(/Date:.*$/gm, '')
        .replace(/Subject:.*$/gm, '')
        .replace(/To:.*$/gm, '')
        .trim();

    // 2. Fix spacing
    clean = clean
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n') // Max 2 newlines
        .replace(/[ \t]+/g, ' ');   // Max 1 space

    // 3. Sentence capitalization
    clean = clean.replace(/(^\w|[.!?]\s+\w)/g, letter => letter.toUpperCase());

    // 4. Convert bullets to HTML list
    const lines = clean.split('\n');
    let html = '';
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        const isBullet = /^[-*•]\s+/.test(line);

        if (isBullet) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            html += `<li>${line.replace(/^[-*•]\s+/, '')}</li>`;
        } else {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            // Heuristic: Short lines might be headers
            if (line.length < 50 && !line.endsWith('.') && i < lines.length - 1) {
                html += `<h3>${line}</h3>`;
            } else {
                html += `<p>${line}</p>`;
            }
        }
    }
    if (inList) html += '</ul>';

    return html;
}

export async function polishContent(text: string): Promise<string> {
    if (!apiKey) {
        console.warn('No AI API Key found. Using basic polish.');
        return basicPolish(text);
    }

    try {
        const response = await client.chat.completions.create({
            model: modelName,
            messages: [
                { role: 'system', content: POLISH_PROMPT },
                { role: 'user', content: text }
            ],
            temperature: 0.1,
        });

        let polishedText = response.choices[0]?.message?.content || '';

        // Cleanup
        polishedText = polishedText.replace(/^```html\s*/i, '').replace(/\s*```$/, '');

        return polishedText || basicPolish(text);
    } catch (error) {
        console.error('AI Polish failed:', error);
        return basicPolish(text);
    }
}
