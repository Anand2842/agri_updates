
import OpenAI from 'openai';

const apiKey = process.env.GROQ_API_KEY;
const baseURL = process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1';
const modelName = process.env.AI_MODEL || 'openai/gpt-oss-120b';

const client = new OpenAI({
    apiKey: apiKey || 'dummy', // Prevent crash if missing, handled below
    baseURL: baseURL,
});

const POLISH_PROMPT = `
You are an expert SEO Content Editor & Data Structor. Your goal is to transform messy, unstructured text (like WhatsApp forwards, raw emails, or job descriptions) into a **clean, professional, and high-ranking blog post**.

### CORE OBJECTIVES:
1.  **Detect Context**: Is this a Job? Scholarship? Event? General News?
2.  **Professional Formatting**: Remove all emojis, "URGENT", "HURRY", phone numbers (unless official HR contact), and marketing fluff.
3.  **Fact Preservation**: NEVER change numbers, dates, salaries, or eligibility criteria. If uncertain, keep original text.
4.  **Structure**: Use semantic HTML (<h2>, <p>, <ul>, <li>).
5.  **SEO Emphasis**: **Bold** (Example: <strong>5-8 LPA</strong>) important keywords, numbers, dates, and locations to improve scannability.
6.  **Natural Keyword Integration**: Weave in relevant keywords naturally throughout the content for better SEO (e.g., job titles, skills, locations, industry terms).

### STRICT OUTPUT RULES:
- **NO** <html>, <head>, or markdown backticks. Return ONLY the body content.
- **NO** inline styles or classes. Use clean tags.
- **Micro-Paragraphs**: Keep paragraphs under 3 sentences for readability.
- **Lists**: Use <ul> for qualifications, responsibilities, or steps.

### ENHANCED SEO KEYWORD INTEGRATION:
For job postings, naturally include relevant keywords such as:
- **Job-specific**: career opportunity, job opening, employment, vacancy, position, role
- **Industry-specific**: For agriculture jobs - agri business, farming industry, horticulture sector, crop management, agricultural technology
- **Location-based**: Include city + state/region (e.g., "Coimbatore, Tamil Nadu")
- **Skills/Qualifications**: degree programs, educational requirements, professional skills
- **Work type**: remote work, work from home, hybrid employment, flexible jobs
- **Experience level**: entry-level jobs, fresher positions, experienced professionals

### SPECIFIC INSTRUCTIONS FOR JOB POSTINGS:
If the input looks like a job/internship/fellowship:
1.  **Standard Headers**: Use these <h2> headers where applicable: "Job Overview", "Key Responsibilities", "Eligibility Criteria", "Salary & Benefits", "How to Apply".
2.  **Consolidate Data**: Group scattered info (e.g., "Location: X" mentioned twice) into one specific section.
3.  **Natural Keyword Flow**: Integrate industry keywords naturally (e.g., "Exciting agriculture career opportunity in Coimbatore, Tamil Nadu" instead of just "Job in Coimbatore").
4.  **Summary Table (MANDATORY)**: At the very end, append a <table> summarizing:
    *   Role / Position
    *   Company / Organization
    *   Location (and if Remote)
    *   Salary (if disclosed)
    *   Deadline (if disclosed)
    *   Link (if available - use "Apply Here" for URLs. If WhatsApp/Email, display the number/email labelled "via WhatsApp" or "via Email")

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
        const line = lines[i].trim();
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
