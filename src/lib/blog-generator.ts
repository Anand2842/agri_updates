
export interface GeneratedPost {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    keywords: string[];
}

export class BlogGenerator {

    static generate(rawText: string): GeneratedPost {
        // 1. Basic Cleaning
        const cleanText = rawText.trim();

        // 2. Identify Title (First line or sensible guess)
        const lines = cleanText.split('\n').filter(l => l.trim().length > 0);
        const suggestedTitle = lines[0]?.substring(0, 100) || "New Agri Update";

        // 3. Generate Slug
        const slug = suggestedTitle
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // 4. Generate Content Structure
        // We will wrap the raw text in a nice structure and add placeholders for the "Value Add" sections

        const contentHtml = `
      <div class="agri-post-content">
        <p class="intro-text">
          <strong>Summary:</strong> ${lines[1] || "A major update has been announced regarding this topic."}
        </p>

        <h2>Detailed Report</h2>
        <div class="raw-content">
          ${cleanText.split('\n').map(p => `<p>${p}</p>`).join('')}
        </div>

        <hr />

        <h2>Agri Updates Analysis</h2>
        <p>
          This development marks a significant step for the sector. 
          <em>(Editor's Note: Add specific analysis here about impact on farmers/students).</em>
        </p>

        <h3>Key Takeaways</h3>
        <table class="w-full border-collapse border border-stone-300 my-4">
          <thead>
            <tr class="bg-stone-100">
              <th class="border border-stone-300 p-2 text-left">Feature/Aspect</th>
              <th class="border border-stone-300 p-2 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-stone-300 p-2 font-bold">Primary Benefit</td>
              <td class="border border-stone-300 p-2">Direct impact on productivity</td>
            </tr>
            <tr>
              <td class="border border-stone-300 p-2 font-bold">Target Audience</td>
              <td class="border border-stone-300 p-2">Students, Researchers, Farmers</td>
            </tr>
            <tr>
              <td class="border border-stone-300 p-2 font-bold">Action Required</td>
              <td class="border border-stone-300 p-2">Apply/Review before deadline</td>
            </tr>
          </tbody>
        </table>

        <h3>Frequently Asked Questions (FAQ)</h3>
        <details class="mb-4 group">
          <summary class="font-bold cursor-pointer list-none flex items-center justify-between p-4 bg-stone-50 rounded">
            <span>Who is eligible for this?</span>
            <span class="transform group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div class="p-4 border border-stone-50 border-t-0">
            <p>Please refer to the official guidelines mentioned above. Generally, it is open to...</p>
          </div>
        </details>

        <div class="ad-placeholder bg-stone-100 p-4 text-center text-xs text-stone-500 uppercase tracking-widest my-8">
            (Ad Space / Call to Action)
        </div>
      </div>
    `;

        return {
            title: suggestedTitle,
            slug: slug,
            excerpt: (lines[1] || "").substring(0, 160),
            category: "Research", // Default, logic could be added to detect keywords
            keywords: ["Agriculture", "Update", "News"],
            content: contentHtml
        };
    }
}
