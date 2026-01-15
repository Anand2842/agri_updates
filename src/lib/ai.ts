
import OpenAI from 'openai';

const apiKey = process.env.AI_API_KEY || process.env.GROQ_API_KEY; // Fallback to old key if present
const baseURL = process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1';
const modelName = process.env.AI_MODEL || 'xiaomi/mimo-v2-flash:free';

const client = new OpenAI({
    apiKey: apiKey || 'dummy', // Prevent crash if missing, handled below
    baseURL: baseURL,
});

const POLISH_PROMPT = `
You are an expert SEO Content Editor & Data Structurer. Your goal is to transform messy, unstructured text (like WhatsApp forwards, raw emails, or job descriptions) into a **clean, professional, and high-ranking blog post**.

### CORE OBJECTIVES:
1.  **Detect Context**: Is this a Job? Scholarship? Event? General News?
2.  **Professional Formatting**: Remove all excessive emojis, "URGENT", "HURRY", and marketing fluff.
3.  **Fact Preservation**: NEVER change numbers, dates, salaries, or eligibility criteria. If uncertain, keep original text.
4.  **Structure**: Use semantic HTML (<h2>, <p>, <ul>, <li>).
5.  **SEO Emphasis**: **Bold** (<strong>) important keywords, numbers, dates, and locations.

### STRICT OUTPUT RULES:
- **NO** <html>, <head>, or markdown backticks. Return ONLY the body content.
- **NO** inline styles or classes. Use clean tags.
- **Micro-Paragraphs**: Keep paragraphs under 3 sentences.

### 🚨 CRITICAL: DATA PRESERVATION MANDATORY
**NEVER CHANGE**: dates, salaries, experience requirements, qualifications, deadlines, contact info, locations
**EXACT COPYING REQUIRED**: Copy numbers, emails, dates, locations VERBATIM from input

### ⚠️ MANDATORY STRUCTURED FORMAT FOR JOB POSTINGS:
When input contains ANY job posting keywords (Hiring, Vacancy, Position, Salary, Experience), you MUST output EXACTLY this structure FIRST:

---BEGIN STRUCTURED DATA---
POSITION: [COPY EXACT job title from input, e.g., "SALES OFFICER/TERRITORY MANAGER"]
COMPANY: [COPY EXACT company name from input, e.g., "Ramcides crops science pvt Ltd"]
LOCATION: [COPY EXACT location from input, e.g., "Yavatmal- Covering whole district"]
SALARY: [COPY EXACT salary from input, e.g., "As Per Industry Standard"]
EXPERIENCE: [COPY EXACT experience from input, e.g., "Minimum 4 to 5year's in Same area/Territory"]
QUALIFICATION: [COPY EXACT qualification from input, e.g., "B.Sc.Agri./ M. Sc Agri. from Authorised Govt. Agriculture University"]
DEADLINE: [COPY EXACT deadline from input, e.g., "before 15 Jan 2026"]
CONTACT_EMAIL: [COPY EXACT email from input, e.g., "shivshankar.ambhore@ramcides.com"]
CONTACT_PHONE: [COPY EXACT phone from input, or "Not provided"]
---END STRUCTURED DATA---

<h2>About This Opportunity</h2>
<p>[2-3 paragraphs describing the job, company, and role]</p>

<h2>Key Responsibilities</h2>
<ul>
<li>[Responsibility 1]</li>
<li>[Responsibility 2]</li>
</ul>

<h2>Eligibility Criteria</h2>
<ul>
<li>[Qualification]</li>
<li>[Experience requirement]</li>
</ul>

<h2>How to Apply</h2>
<p>[Application instructions with contact details]</p>

### ⚠️ CRITICAL FIELD SEPARATION RULES:
1. **ONE FIELD PER LINE**: Each line must be FIELD_NAME: value ONLY.
2. **NO MIXING**: Never put multiple fields on one line.
   ✅ VALID: "POSITION: Market Development Officer"
   ❌ INVALID: "POSITION: Manager LOCATION: Delhi" (this is WRONG)
3. **COMPLETE VALUES**: Extract the FULL value, not truncated.
   ✅ VALID: "COMPANY: Geeken Chemicals India Ltd"
   ❌ INVALID: "COMPANY: Geeken" (incomplete)
4. **NO FIELD LABELS IN VALUES**: The value should NEVER contain other field names.
   ✅ VALID: "LOCATION: Mirzapur, Uttar Pradesh"
   ❌ INVALID: "LOCATION: Mirzapur Salary Experience" (contaminated)
5. **UNKNOWN = "Not specified"**: If truly unknown, write exactly "Not specified".

### FIELD EXTRACTION PRIORITY:
- POSITION: Look for "Position:", "Role:", "Hiring for:", job title mentions
- COMPANY: Look for "Company:", "Organization:", "at [Company Name]", "[Name] is hiring"
- LOCATION: Look for "Location:", "Place:", city names with state
- SALARY: Look for "Salary:", "CTC:", rupee amounts, "LPA", "per annum"

### 🚨 CRITICAL DATA PRESERVATION - VIOLATION STRICTLY PROHIBITED:
You MUST preserve these fields EXACTLY as they appear in the input. NO MODIFICATIONS ALLOWED:

| Field | Rule | Example |
|-------|------|---------|
| **DATES** | Never modify, reformat, or change any date | "12/01/25" stays "12/01/25", NOT "January 12, 2025" |
| **SALARY** | Never alter salary figures, ranges, or currency | "₹20,000 – ₹30,000" stays EXACTLY the same |
| **EXPERIENCE** | Never change years of experience | "5-7 years" stays "5-7 years" |
| **QUALIFICATION** | Never modify degree requirements | "B.Sc Agriculture" stays EXACTLY the same |
| **CONTACT INFO** | Never change emails or phone numbers | Copy verbatim |
| **LOCATIONS** | Never alter city/state/region | "Mirzapur, Uttar Pradesh" stays EXACTLY the same |

**VERBATIM EXTRACTION**: For salary, deadline, experience, and qualification fields, COPY THE EXACT TEXT from the input. Do not paraphrase, summarize, or reformat.

✅ INPUT: "Salary: ₹25,000 to ₹35,000 per month"
✅ OUTPUT: SALARY: ₹25,000 to ₹35,000 per month

❌ WRONG: SALARY: 25K-35K (this is MODIFICATION - PROHIBITED)

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

// Critical keywords that indicate job posting (use lower temperature)
const CRITICAL_KEYWORDS = [
    'salary', '₹', 'lpa', 'lac', 'per month', 'per annum', 'ctc',
    'experience', 'years', 'yrs', 'freshers',
    'deadline', 'last date', 'apply before',
    'qualification', 'degree', 'b.sc', 'm.sc', 'diploma', 'mba'
];

// Extract critical data points for validation
function extractCriticalData(text: string): { salaries: string[], dates: string[], phones: string[], emails: string[] } {
    return {
        salaries: text.match(/₹[\d,]+(?:\s*[-–to]+\s*₹?[\d,]+)?(?:\s*(?:LPA|lac|per month|per annum|p\.m\.|p\.a\.))?/gi) || [],
        dates: text.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*,?\s*\d{2,4}/gi) || [],
        phones: text.match(/\d{10}|\d{5}\s*\d{5}/g) || [],
        emails: text.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/gi) || [],
    };
}

export async function polishContent(text: string): Promise<string> {
    if (!apiKey) {
        console.warn('No AI API Key found. Using basic polish.');
        return basicPolish(text);
    }

    try {
        // Determine if this is critical content (job posting with salary/dates)
        const lowerText = text.toLowerCase();
        const hasCriticalContent = CRITICAL_KEYWORDS.some(kw => lowerText.includes(kw));

        // Use lower temperature for job postings to maximize consistency
        const temperature = hasCriticalContent ? 0.15 : 0.3;

        // Pre-extract critical data for post-validation
        const originalCriticalData = extractCriticalData(text);

        const response = await client.chat.completions.create({
            model: modelName,
            messages: [
                { role: 'system', content: POLISH_PROMPT },
                { role: 'user', content: text }
            ],
            temperature: temperature,
        });

        let polishedText = response.choices[0]?.message?.content || '';

        // Cleanup
        polishedText = polishedText.replace(/^```html\s*/i, '').replace(/\s*```$/, '');

        // Post-validation: Check if critical data is preserved
        const outputCriticalData = extractCriticalData(polishedText);

        // Log warnings if critical data was lost (but don't reject - AI might have reformatted slightly)
        if (originalCriticalData.salaries.length > 0 && outputCriticalData.salaries.length === 0) {
            console.warn('WARNING: Salary data may have been lost during AI polish');
        }
        if (originalCriticalData.phones.length > 0 && outputCriticalData.phones.length === 0) {
            console.warn('WARNING: Phone number may have been lost during AI polish');
        }

        return polishedText || basicPolish(text);
    } catch (error) {
        console.error('AI Polish failed:', error);
        return basicPolish(text);
    }
}
