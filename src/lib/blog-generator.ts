
export interface GeneratedPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  keywords: string[];
  job_details?: {
    company?: string;
    location?: string;
    salary_range?: string;
    job_type?: string;
    application_link?: string;
    email?: string;
    contact?: string;
  };
}

export class BlogGenerator {

  static generate(rawText: string): GeneratedPost {
    const cleanText = this.cleanInput(rawText);
    const lines = cleanText.split('\n').filter(line => line.trim().length > 0);

    // DETECTOR LOGIC
    // 1. Job Post
    if (/Urgent|Hiring|Vacancy|Walk-in|Job|Position|Role|Salary/i.test(cleanText)) {
      return this.generateJobPost(cleanText, lines);
    }

    // 2. Events / Webinars
    if (/Webinar|Conference|Summit|Workshop|Zoom|Speaker|Register/i.test(cleanText)) {
      return this.generateEventPost(cleanText, lines);
    }

    // 3. Schemes / Grants / Subsidies
    if (/Subsidy|Grant|Scholarship|Scheme|Funding|Eligibility|Apply/i.test(cleanText)) {
      return this.generateSchemePost(cleanText, lines);
    }

    // 4. Standard Fallback
    return this.generateStandardPost(cleanText, lines);
  }

  private static cleanInput(text: string): string {
    return text
      .replace(/Forwardeded message/gi, '')
      .replace(/Forwarded/gi, '')
      .replace(/[*_]{2,}/g, '') // Remove long lines of **** or ____
      .replace(/[^\S\r\n]+$/gm, '') // Trim trailing spaces
      .trim();
  }

  private static smartExtract(text: string, patterns: RegExp[]): string | null {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        // Cleaning: Remove leading/trailing non-alphanumeric (except standard punctuation inside)
        // Remove start bullets, arrows, colons
        return match[1].trim()
          .replace(/^[:\-\*>&=]+/, '') // Remove "->", ":", "*", ">", "=", etc. at start
          .trim();
      }
    }
    return null;
  }

  private static generateStandardPost(cleanText: string, lines: string[]): GeneratedPost {
    const suggestedTitle = lines[0]?.substring(0, 100) || "New Agri Update";
    const paragraphs = cleanText.split('\n').filter(p => p.length > 50).map(p => `<p class="mb-4">${p}</p>`).join('');

    const contentHtml = `
      <div class="agri-post-content font-sans text-stone-800">
        <div class="bg-gradient-to-r from-stone-100 to-white p-6 rounded-xl border border-stone-200 mb-8">
            <p class="text-xl font-light italic text-stone-600">"${lines[1] || lines[0] || "Latest update."}"</p>
        </div>

        <div class="prose prose-lg max-w-none text-stone-700">
            ${paragraphs || cleanText.split('\n').map(p => `<p>${p}</p>`).join('')}
        </div>

        <hr className="my-8 border-stone-200" />
        
        <h3 class="text-2xl font-bold text-agri-green mb-4">Agri Updates Analysis</h3>
        <p class="mb-4">This development is significant for the sector. It offers new opportunities for growth and modernization.</p>
        
        <div class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500 my-6">
            <h4 class="font-bold text-blue-900 mb-2">Key Highlights</h4>
             <ul class="list-disc pl-5 space-y-2 text-blue-800">
                <li><strong>Impact:</strong> High relevance for the farming community.</li>
                <li><strong>Action:</strong> Review the details and apply/participate if eligible.</li>
            </ul>
        </div>

        <h3 class="text-2xl font-bold text-agri-green mb-4">FAQ</h3>
        <details class="mb-4 group bg-white rounded-lg border border-stone-200 shadow-sm">
          <summary class="font-bold cursor-pointer p-4 hover:bg-stone-50 transition-colors flex justify-between items-center">
            <span>What is the source of this news?</span>
            <span class="transform group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div class="p-4 border-t border-stone-200 text-stone-600">
            <p>This update is curated from recent announcements and community reports.</p>
          </div>
        </details>
      </div>`;

    return {
      title: suggestedTitle,
      slug: this.createSlug(suggestedTitle),
      excerpt: (lines[1] || "Latest Update").substring(0, 160),
      category: "News",
      keywords: ["Agriculture", "News", "Update"],
      content: contentHtml
    };
  }

  private static generateEventPost(cleanText: string, lines: string[]): GeneratedPost {
    const date = this.smartExtract(cleanText, [/(?:Date|On)\s*[:\-\*]*\s*([^\n]+)/i, /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*,?\s*\d{4})/i]);
    const time = this.smartExtract(cleanText, [/(?:Time|At)\s*[:\-\*]*\s*([^\n]+)/i]);
    const venue = this.smartExtract(cleanText, [/(?:Venue|Location|Platform|Where)\s*[:\-\*]*\s*([^\n]+)/i, /(Zoom|Google Meet|Teams)/i]);
    const miscLink = this.smartExtract(cleanText, [/(?:Link|Register|Url)\s*[:\-\*]*\s*(https?:\/\/[^\s]+)/i]);

    // Attempt to find a better title than just the first line if the first line is generic
    let title = lines[0].substring(0, 100);
    if (/Forwarded/i.test(title)) title = lines[1]?.substring(0, 100) || "Upcoming Agri Event";

    const contentHtml = `
      <div class="agri-event">
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-6 mb-8 rounded-r-xl shadow-sm">
             <div class="flex items-center gap-3 mb-2">
                <span class="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Event</span>
                <span class="text-sm text-blue-600 font-semibold uppercase tracking-wide">Webinar / Conference</span>
             </div>
            <h1 class="font-serif text-2xl font-bold text-blue-900 leading-tight">${title}</h1>
        </div>

        <div class="grid md:grid-cols-2 gap-6 mb-8">
            <div class="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <p class="text-sm text-stone-500 uppercase tracking-wider font-bold mb-1">When</p>
                <div class="flex items-center gap-2">
                   <span class="text-2xl">🗓️</span>
                   <div>
                       <p class="font-bold text-stone-800">${date || "Date to be announced"}</p>
                       <p class="text-sm text-stone-600">${time || "Time TBD"}</p>
                   </div>
                </div>
            </div>
             <div class="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <p class="text-sm text-stone-500 uppercase tracking-wider font-bold mb-1">Where</p>
                <div class="flex items-center gap-2">
                   <span class="text-2xl">📍</span>
                   <div>
                       <p class="font-bold text-stone-800">${venue || "Online / Check details"}</p>
                       <p class="text-sm text-blue-600 underline truncate w-48">${miscLink ? "Registration Link Available" : "Link below"}</p>
                   </div>
                </div>
            </div>
        </div>

        <h2 class="text-2xl font-bold text-stone-800 mb-4 border-b pb-2">Event Details</h2>
        <div class="prose prose-stone max-w-none mb-8 bg-stone-50 p-6 rounded-xl">
             ${cleanText.split('\n').filter(l => l.length > 20).map(p => `<p>${p}</p>`).join('')}
        </div>

        <div class="my-8 text-center bg-stone-900 text-white p-8 rounded-2xl shadow-lg">
             <h3 class="text-xl font-bold mb-4">Ready to Join?</h3>
             <p class="mb-6 text-stone-300">Don't miss this opportunity to connect with experts.</p>
             <button class="bg-agri-green hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-md">
                ${miscLink ? `<a href="${miscLink}" target="_blank" rel="noopener">Register Now ↗</a>` : "Registration Link in Description"}
             </button>
        </div>
      </div>`;

    return {
      title: `Event: ${title}`,
      slug: this.createSlug(title),
      excerpt: `Join the upcoming event "${title}" on ${date || 'upcoming date'}. Check details & register.`,
      category: "Events",
      keywords: ["Event", "Webinar", "Agriculture", "Workshop"],
      content: contentHtml
    };
  }

  private static generateSchemePost(cleanText: string, lines: string[]): GeneratedPost {
    const benefit = this.smartExtract(cleanText, [/(?:Subsidy|Amount|Grant|Benefit)\s*[:\-\*]*\s*([^\n]+)/i, /(\d+%\s+subsidy)/i, /(Rs\.?\s*[\d,]+\/?-?)/i]);
    const eligibility = this.smartExtract(cleanText, [/(?:Eligibility|Who|Criteria)\s*[:\-\*]*\s*([^\n]+)/i]);
    const deadline = this.smartExtract(cleanText, [/(?:Deadline|Last Date|Valid till|End Date)\s*[:\-\*]*\s*([^\n]+)/i]);

    let title = lines[0].substring(0, 100);
    if (/Forwarded/i.test(title)) title = lines[1]?.substring(0, 100) || "New Government Scheme";

    const contentHtml = `
      <div class="agri-scheme">
        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8 rounded-r-xl">
            <div class="flex items-center gap-2 mb-2">
                <span class="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded uppercase">Government Scheme</span>
            </div>
            <h1 class="font-serif text-2xl font-bold text-stone-900">${title}</h1>
             <p class="mt-2 text-stone-600">A new opportunity for farmers and agri-entrepreneurs.</p>
        </div>

        <div class="bg-white border rounded-xl shadow-sm overflow-hidden mb-8">
            <div class="bg-stone-50 px-6 py-4 border-b border-stone-100">
                <h3 class="font-bold text-stone-800">Scheme Highlights</h3>
            </div>
            <div class="p-6 grid gap-6">
                <div class="flex items-start gap-4">
                    <div class="bg-green-100 p-2 rounded-full text-green-600">💰</div>
                    <div>
                        <p class="text-sm text-stone-500 font-bold uppercase">Benefit / Subsidy</p>
                        <p class="text-lg font-bold text-green-700">${benefit || "See details below"}</p>
                    </div>
                </div>
                 <div class="flex items-start gap-4">
                    <div class="bg-blue-100 p-2 rounded-full text-blue-600">👥</div>
                    <div>
                        <p class="text-sm text-stone-500 font-bold uppercase">Eligibility</p>
                        <p class="text-stone-800">${eligibility || "Check guidelines"}</p>
                    </div>
                </div>
                 <div class="flex items-start gap-4">
                    <div class="bg-red-100 p-2 rounded-full text-red-600">⏳</div>
                    <div>
                        <p class="text-sm text-stone-500 font-bold uppercase">Deadline</p>
                        <p class="text-red-600 font-bold">${deadline || "Apply Soon"}</p>
                    </div>
                </div>
            </div>
        </div>

         <h2 class="text-2xl font-bold text-stone-800 mb-4">Full Guidelines</h2>
         <div class="prose prose-stone max-w-none bg-stone-50 p-6 rounded-xl text-sm font-mono whitespace-pre-wrap text-stone-700">
            ${cleanText}
         </div>
      </div>`;

    return {
      title: `Scheme: ${title}`,
      slug: this.createSlug(title),
      excerpt: `New scheme announced: ${title}. Subsidy: ${benefit || 'Available'}. Check eligibility.`,
      category: "Schemes",
      keywords: ["Scheme", "Subsidy", "Grant", "Agriculture"],
      content: contentHtml
    };
  }

  private static createSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now().toString().slice(-4);
  }

  private static generateJobPost(cleanText: string, lines: string[]): GeneratedPost {
    // Smart Extraction
    const position = this.smartExtract(cleanText, [
      /(?:Position|Role|Post|Hiring For)\s*[:\-\*]*\s*([^\n]+)/i,
      /Hiring(?:[:\-\s]+)(.+?)\s+(?:at|@|for)/i, // Capture "Hiring Manager at..." (relaxed colon)
      /Urgent Requirement\s+(?:at|for)?\s*(.*?)(?:\s+Position|\s+Location|\s+Qualification|\s*$)/i,
      /Hiring(?:[:\-\s]+)([^\n]+)/i
    ]) || "Agri Professional";

    // Improve Company Extraction
    const company = this.smartExtract(cleanText, [
      /(?:Company|Organization|Org)(?:\s+Name)?\s*[:\-\*]*\s*([^\n]+)/i,
      /(?:Hiring|Vacancy|Opening).*?(?:at|@|for)\s+([A-Za-z0-9\s\.]+?)(?:\n|$|\.)/i, // Capture "Hiring X at Company"
      /([A-Za-z0-9\s]+)\s+is hiring/i, // Capture "X is hiring"
      // Catch "Urgent Requirement [Company] Position" pattern
      /Urgent Requirement\s+(?!for|at\b)(.*?)(?:\s+Position|\s+Location|\s+Qualification)/i
    ]) || "Leading Agri Organization";

    // Location: Stop if it hits another keyword
    const location = this.smartExtract(cleanText, [
      /(?:Location|Place|HQ|City|Loc)\s*[:\-\*]*\s*([^\n]*?)(?=\s*(?:\n|Qualification|Experience|Job|Contact|Salary|Description|$))/i,
      /in\s+([A-Za-z]+(?:(?:\s|,\s)[A-Za-z]+)*?)(?:\.|\n|$)/i // Capture "in Pune" or "in Mumbai"
    ]) || "India";

    const experience = this.smartExtract(cleanText, [/(?:Experience|Exp)\s*[:\-\*]*\s*([^\n]+)/i]);
    const qualification = this.smartExtract(cleanText, [/(?:Qualification|Degree|Education)s?\s*[:\-\*]*\s*([^\n]+)/i]);

    // Contact: Look for numbers more aggressively
    const contact = this.smartExtract(cleanText, [
      /(?:Contact|Mobile|Call|WhatsApp).{0,60}?([0-9]{10}|[0-9]{5}\s[0-9]{5})/i,
      /(\d{10})/ // Fallback to just finding a 10-digit number
    ]);
    const email = this.smartExtract(cleanText, [/(?:Email|Send CV)(?:\s+to)?\s*[:\-\*]*\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i, /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i]);

    const title = `Hiring: ${position} at ${company}`;

    const contentHtml = `
      <div class="agri-job-alert">
        <div class="bg-green-50 border-l-4 border-agri-green p-6 mb-8 rounded-r-xl">
             <div class="flex items-center gap-2 mb-2">
                <span class="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded uppercase">Job Alert</span>
            </div>
            <h1 class="text-2xl font-bold text-stone-900 leading-tight">${title}</h1>
            <p class="mt-2 text-stone-600">A new career opportunity has been released. Check details below.</p>
        </div>

        <h2 class="text-xl font-bold text-stone-800 mb-4">Job Overview</h2>
        <div class="overflow-x-auto mb-8 shadow-sm border border-stone-200 rounded-lg">
          <table class="w-full text-left border-collapse">
            <tbody class="divide-y divide-stone-100">
              <tr class="bg-stone-50">
                <td class="px-6 py-4 w-1/3 text-xs font-bold text-stone-500 uppercase tracking-wider">Position</td>
                <td class="px-6 py-4 text-lg font-bold text-stone-900">${position}</td>
              </tr>
              <tr class="bg-white">
                <td class="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Company</td>
                <td class="px-6 py-4 font-medium text-stone-800">${company}</td>
              </tr>
              <tr class="bg-stone-50">
                <td class="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Location</td>
                <td class="px-6 py-4 font-medium text-stone-800">${location}</td>
              </tr>
              <tr class="bg-white">
                <td class="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Experience</td>
                <td class="px-6 py-4 text-stone-800">${experience || "Not Specified"}</td>
              </tr>
              <tr class="bg-stone-50">
                <td class="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Qualification</td>
                <td class="px-6 py-4 text-stone-800">${qualification || "Not Specified"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 class="text-xl font-bold text-stone-800 mb-4">Description</h2>
        <div class="prose prose-stone max-w-none bg-stone-50 p-6 rounded-xl text-stone-700 whitespace-pre-line font-mono text-sm leading-relaxed">
          ${lines.filter(line =>
      !/^(?:Position|Role|Post|Hiring For|Urgent Requirement|Company|Organization|Org|Location|Place|HQ|City|Experience|Exp|Qualification|Degree|Education|Contact|Mobile|Call|WhatsApp|Email|Send CV|Job Overview)/i.test(line)
    ).join('\n')}
        </div>

        <!-- Content Strategy: Original Analysis Placeholder -->
        <h2 class="text-xl font-bold text-stone-800 mb-4 mt-8 flex items-center gap-2">
            Details & Analysis
            <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-normal">Editor's Note</span>
        </h2>
        <div class="prose prose-stone max-w-none text-stone-600 mb-8">
            <p><strong>Resource for Applicants:</strong> This opportunity at ${company} aligns with current industry trends. Applicants are advised to highlight relevant experience in...</p>
            <p><em>(Editor: Add 500+ words of original analysis here, focusing on the company culture, interview tips for this role, and how it fits into the broader agri-market.)</em></p>
        </div>

        <div class="my-8">
             <div class="bg-stone-900 text-white p-8 rounded-2xl shadow-xl text-center">
                 <h3 class="text-2xl font-bold mb-6">How to Apply</h3>
                 <div class="flex flex-col md:flex-row gap-4 justify-center items-center">
                    ${contact ? `
                        <div class="bg-stone-800 px-6 py-3 rounded-lg flex items-center gap-3">
                            <span>📞</span>
                            <span class="font-mono text-lg">${contact}</span>
                        </div>
                    ` : ''}
                    ${email ? `
                        <div class="bg-stone-800 px-6 py-3 rounded-lg flex items-center gap-3">
                            <span>📧</span>
                            <a href="mailto:${email}" class="font-mono text-lg underline decorataion-agri-green decoration-2 underline-offset-4">${email}</a>
                        </div>
                    ` : ''}
                 </div>
                 ${!contact && !email ? '<p class="text-stone-400">Please check the description above for application details.</p>' : ''}
                 <p class="text-xs text-stone-500 mt-6">Mention "Agri Updates" when you apply to increase visibility.</p>
             </div>
        </div>

         <h3 class="font-bold text-lg mb-4">Frequently Asked Questions</h3>
        <details class="mb-2 group bg-white border rounded-lg">
          <summary class="font-bold cursor-pointer p-4 hover:bg-stone-50 flex justify-between">
            <span>Is this a verified job?</span>
             <span class="transform group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div class="p-4 border-t text-sm text-stone-600">
            <p>We source jobs from trusted networks, but please verify directly with the employer before making payments or sharing sensitive documents.</p>
          </div>
        </details>
      </div>
        `;

    return {
      title: title,
      slug: this.createSlug(title),
      excerpt: `Urgent Hiring: ${position} at ${company}. Location: ${location}. Check eligibility and apply.`,
      category: "Jobs",
      keywords: ["Job", "Hiring", position, "Agriculture Jobs", location],
      content: contentHtml,
      job_details: {
        company: company,
        location: location,
        job_type: "Full-time", // Default estimate
        email: email || undefined,
        application_link: email ? `mailto:${email}` : undefined,
        contact: contact || undefined
      }
    };
  }

}
