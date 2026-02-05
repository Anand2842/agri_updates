
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
        let extracted = match[1].trim()
          .replace(/^[:\-\*>&=]+/, '') // Remove "->", ":", "*", ">", "=", etc. at start
          .trim();

        // Reject generic placeholders
        if (extracted.startsWith('/') ||
          /^(?:Position|Organization|Company|Job Title|Location|Place)$/i.test(extracted) ||
          extracted.includes('{') || extracted.includes('<')) {
          continue;
        }

        return extracted;
      }
    }
    return null;
  }

  // Validates if a field contains pollution (other field labels mixed in)
  private static isFieldPolluted(value: string): boolean {
    if (!value || value.length < 2) return true;
    const pollutionKeywords = [
      'POSITION', 'COMPANY', 'LOCATION', 'SALARY', 'EXPERIENCE', 'QUALIFICATION', 'DEADLINE', 'CONTACT',
      'Position:', 'Company:', 'Location:', 'Salary:', 'Experience:', 'Qualification:', 'Deadline:',
      'Organization', 'Job Title', 'Not Disclosed', 'Not specified', 'Not provided',
      '---BEGIN', '---END', 'STRUCTURED DATA'
    ];
    return pollutionKeywords.some(keyword => value.includes(keyword)) ||
      /^[^a-zA-Z]+$/.test(value) ||  // Only non-letters
      value.length > 100;             // Way too long, probably garbage
  }

  // Enhanced fallback extraction when structured data parsing fails
  private static extractFromOriginalText(text: string, fieldType: string): string | null {
    // Pre-clean common WhatsApp formatting: remove asterisks around text, normalize separators
    const cleanedText = text
      .replace(/\*([^*]+)\*/g, '$1') // Remove bold asterisks
      .replace(/#\s*/g, '') // Remove hashtags before text
      .replace(/[:\-]+\s*[:\->]+/g, ':'); // Normalize ": ->" patterns

    switch (fieldType.toLowerCase()) {
      case 'position':
        // Look for job titles - enhanced patterns for WhatsApp-style forwards
        const positionPatterns = [
          // Match "Position —PO" (em dash format) - allow Location as terminator
          /Position\s*[-—]+\s*([A-Za-z0-9\s/]+?)(?:\s(?:at|Location|from)|\n|\*|$)/i,
          // Specific capture for "Position - Sales Officer"
          /(?:Position|Role|Designation)\s*[:\-\s]*([A-Za-z0-9\s/\-,&]+?)(?:\s(?:at|Location)|\n|\*|$)/i,
          // Capture "Hiring: —PO" (handle dash separator)
          /Hiring\s*:\s*(?:[-—]\s*)?([A-Za-z0-9\s/\-,&]+?)(?:\sat|\n|$)/i,
          // Capture position from "Position Name at Company"
          /([A-Za-z0-9\s/\-,&]+?)\s+at\s+(?:looking|searching|hiring)/i,
          /(?:POSITION|Position)\s*[-:*]+\s*([A-Za-z\s()&\/]+?)(?:\n|$)/i,
          /(?:Hiring|HIRING)[:,\s*-]+\s*([A-Za-z\s()&\/]+?)(?:\s+at\s*|\n|$)/i,
          /(?:URGENT REQUIREMENT|Vacancy)[\s:*-]+([A-Za-z\s()&\/]+?)(?:\n|$)/i,
          /(?:sales officer|territory manager|area manager|zonal manager|marketing manager|field officer|agronomist|agricultural officer)/i,
        ];
        for (const pattern of positionPatterns) {
          const match = cleanedText.match(pattern);
          if (match) {
            const value = (match[1] || match[0]).trim().replace(/^[:\-*\s]+|[:\-*\s]+$/g, '');
            if (value.length >= 2 && value.length < 80) {
              return value;
            }
          }
        }
        break;

      case 'company':
        // Enhanced company detection - handles "Organization : *Company Name*" format
        // IMPORTANT: cleanedText has asterisks REMOVED, so patterns must NOT expect them around the name
        const companyPatterns = [
          // Match "Organization : Company Name" (asterisks removed)
          /Organization\s*[:\-\s]*([A-Za-z0-9\s.&]+?)(?:\s(?:POSITION|Location|Chennai)|\n|$)/i,
          // Match "Organization : *Company Name*" (original text fallback just in case, but cleanedText won't have it)
          /Organization\s*[:\-\s]*\*([^*]+)\*/i,
          // Match "Company Name -Value" pattern
          /Company\s+Name\s*[:\-]*\s*[:\-]\s*([A-Za-z0-9\s().]+?)(?: \*|\n|$)/i,
          // Generic Company Name pattern
          /([A-Za-z0-9\s&]+(?:Pvt|Private|Limited|Ltd|Corp|Inc|Group|Solution|System|Technology|Farm|Agro)[^*.]{0,20})/i,
          // Standard patterns
          /(?:Company|Organization|Employer)\s*[:\-\s]*\**( [A-Za-z0-9\s.&()]+?)(?: \*|\n|$)/i,
          /at\s+([A-Z][A-Za-z0-9\s.&()]+(?:Pvt|Private|Limited|Ltd|Corp|Inc|Group|Solution|System|Technology|Farm|Agro)[A-Za-z0-9\s.&()]*?)(?: \sat|\n|\.|$)/,
          // Match "Organization/Company :" followed by company name ending in Ltd/Pvt
          /(?:Organization|Organisation|Company|Employer)\s*[:*\-]+\s*([A-Za-z][A-Za-z0-9\s.&'()]+?(?:Ltd\.?|Pvt\.?\s*Ltd\.?|Private\s+Limited|Corporation|Corp|Inc|LLC))/i,
          // Match company name with "crops science" or similar
          /([A-Za-z][A-Za-z0-9\s.&'()]+(?:crops\s+science|agri\s*chem|fertilizer)[A-Za-z0-9\s.&'()]*(?:Ltd\.?|Pvt\.?\s*Ltd\.?))/i,
          // Fallback: company name with standard suffixes
          /([A-Za-z][A-Za-z0-9\s.&'()]{5,}(?:pvt\.?\s+ltd|Ltd\.?|private limited))/i,
        ];
        for (const pattern of companyPatterns) {
          const match = cleanedText.match(pattern);
          if (match && match[1]) {
            const value = match[1].trim().replace(/^[:\-*\s]+|[:\-*\s]+$/g, '');
            // Reject common false positives
            if (value.length > 5 && value.length < 80 &&
              !/^(Company|Organization|Private|The|This|before|trusted|making)$/i.test(value) &&
              !value.includes('verify') && !value.includes('payment')) {
              return value;
            }
          }
        }
        break;

      case 'location':
        // Enhanced location detection - handles inline and multiline formats
        const locationPatterns = [
          // Match "*Location- Value" format (Acsen style) and "*Location - Value"
          /Location\s*[-:]+\s*([A-Za-z0-9\s,.-]+?)(?:\s*(?:https?|Height|Weight|http|\*|\n|$))/i,
          // Match "LOCATION - # CityName- Description" format (inline with dot or period after)
          /LOCATION\s*[-:]+\s*#?\s*([A-Za-z]+(?:\s*[-–]\s*[A-Za-z\s]+)*?)(?:\s*\.\s*(?:Salary|Experience)|$)/i,
          // Match "Location # Yavatmal-" format
          /(?:Location|LOCATION)\s+#\s*([A-Za-z]+(?:\s*[-–]\s*[A-Za-z\s]+)*)/i,
          // Standard patterns
          /(?:LOCATION|Location)\s*[-:*#]+\s*([A-Za-z\s,().\-]+?)(?:\.?\s*Experience|\n(?:Experience)|Salary|$)/i,
          /(?:Place|City|District|State)\s*[:*\-]+\s*([A-Za-z\s,().\-]+?)(?:\n|$)/i,
          /(?:covering\s+(?:whole\s+)?(?:district|area|region)?)\s*[:.\-]*\s*([A-Za-z\s,().\-]+)/i,
          /#\s*([A-Za-z]+(?:\s*[-–]\s*[A-Za-z\s]+)?)/i, // Hashtag locations
        ];
        for (const pattern of locationPatterns) {
          const match = cleanedText.match(pattern);
          if (match && match[1]) {
            let value = match[1].trim().replace(/^[:\-*#\s]+|[:\-*#\s]+$/g, '');
            // Clean trailing labels and text
            value = value.replace(/\s*(?:For|Experience|Salary|Qualification|\.|\n).*$/i, '').trim();
            // Skip if the value looks like a generic placeholder
            if (value.length > 2 && value.length < 100 && !/^(Pan\s*India|India|Location)$/i.test(value)) {
              return value;
            }
          }
        }
        break;

      case 'salary':
        // Enhanced salary detection - with length limits
        const salaryPatterns = [
          // Match "Salary : value" up to first period or "Age Limit"
          /(?:Salary|CTC|Compensation|Package)\s*[:*\-]+\s*([^.\n]{3,50})(?:\.|Age\s+Limit|\n|$)/i,
          // Match rupee amounts
          /(₹[\d,\s\-–to]+(?:per\s+month|per\s+annum|LPA|lac|PM|PA)?)/i,
          /(Rs\.?\s*[\d,\s\-–to]+(?:per\s+month|per\s+annum|LPA|lac)?)/i,
          // Match standard phrases
          /(As\s+Per\s+Industry\s+Standard)/i,
          /(Negotiable|Attractive\s+Package|Best\s+in\s+Industry)/i,
        ];
        for (const pattern of salaryPatterns) {
          const match = cleanedText.match(pattern);
          if (match) {
            let value = (match[1] || match[0]).trim().replace(/^[:\-*\s]+|[:\-*\s]+$/g, '');
            // Limit length and clean trailing punctuation
            value = value.substring(0, 60).replace(/[.\s,]+$/, '');
            if (value.length > 2 && value.length < 60) {
              return value;
            }
          }
        }
        break;

      case 'experience':
        // Enhanced experience detection
        const experiencePatterns = [
          // Prioritize specific "Minimum X years" patterns
          /(?:Minimum|Min|Max)\s*[:*\-]?\s*(\d+(?:\+?|\s*(?:to|-|–)\s*\d+)?\s*years?)/i,
          /((?:Minimum\s*)?\d+(?:\+?|\s*(?:to|-|–)\s*\d+)?\s*years?(?:'?s?)?\s*(?:experience|exp)?)/i,
        ];
        for (const pattern of experiencePatterns) {
          const match = cleanedText.match(pattern);
          if (match && match[1]) {
            let value = match[1].trim().replace(/^[:\-*\s]+|[:\-*\s]+$/g, '');
            // Clean trailing text
            value = value.replace(/\s*(?:on\s+Company|will\s+be|Salary|Requirement|Qualification|Description).*$/i, '').trim();

            // Reject if it looks like a phone number (M.+)
            if (value.startsWith('M.') || /^\+?\d[\d\-\s]+$/.test(value)) {
              continue;
            }

            if (value.length > 2) {
              return value;
            }
          }
        }
        break;

      case 'qualification':
        // Enhanced qualification detection
        const qualificationPatterns = [
          /(?:Qualification|Degree|Education|Eligibility)\s*[:*\-]+\s*([^\n]+?)(?:\n|Note|$)/i,
          /(B\.?Sc\.?\s*(?:Agri(?:culture)?\.?)?(?:\s*\/\s*M\.?Sc\.?\s*Agri(?:culture)?\.?)?)/i,
          /(M\.?Sc\.?\s*(?:Agri(?:culture)?\.?)?)/i,
          /(Diploma\s+in\s+[A-Za-z\s]+)/i,
          /(MBA\s*[-–\/]?\s*(?:Agri(?:business)?|Marketing)?)/i,
        ];
        for (const pattern of qualificationPatterns) {
          const match = cleanedText.match(pattern);
          if (match && match[1]) {
            const value = match[1].trim().replace(/^[:\-*\s]+|[:\-*\s]+$/g, '');
            if (value.length > 3) {
              return value;
            }
          }
        }
        break;

      case 'deadline':
        // Enhanced deadline detection - handles "before 15 Jan 2026"
        const deadlinePatterns = [
          /(?:Deadline|Last\s+Date|Apply\s+Before|before)\s*[:*\-]?\s*(\d{1,2}[\s\/\-]*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]*\d{2,4})/i,
          /(?:Deadline|Last\s+Date|Apply\s+Before)\s*[:*\-]+\s*([^\n]+?)(?:\n|$)/i,
          /before\s+(\d{1,2}[\s\/\-]*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]*\d{2,4})/i,
          /(\d{1,2}[\-\/\.]\d{1,2}[\-\/\.]\d{2,4})/,
        ];
        for (const pattern of deadlinePatterns) {
          const match = cleanedText.match(pattern);
          if (match && match[1]) {
            const value = match[1].trim().replace(/^[:\-*\s]+|[:\-*\s]+$/g, '');
            if (value.length > 3) {
              return value;
            }
          }
        }
        break;

      case 'email':
        // Extract ALL email addresses - return first valid one
        const emailMatches = cleanedText.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/gi);
        if (emailMatches && emailMatches.length > 0) {
          // Return first non-generic email
          for (const email of emailMatches) {
            if (!email.includes('example') && !email.includes('test')) {
              return email;
            }
          }
          return emailMatches[0];
        }
        return null;

      case 'contact':
        // Extract phone numbers - Indian format
        const phonePatterns = [
          /(?:Contact|Phone|Call|Mobile)\s*[:*\-]+\s*(\+?91[-\s]?\d{10}|\d{10})/i,
          /(\d{10})/,
          /(\d{5}[\s\-]?\d{5})/,
        ];
        for (const pattern of phonePatterns) {
          const match = cleanedText.match(pattern);
          if (match && match[1]) {
            return match[1].replace(/[\s\-]/g, '');
          }
        }
        return null;
    }

    return null;
  }

  private static generateStandardPost(cleanText: string, lines: string[]): GeneratedPost {
    const suggestedTitle = lines[0]?.substring(0, 100) || "New Agri Update";
    const paragraphs = cleanText.split('\n').filter(p => p.length > 50).map(p => `<p class="mb-4">${this.formatLine(p)}</p>`).join('');

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
      content: contentHtml + this.getDisclaimerHtml()
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
      content: contentHtml + this.getDisclaimerHtml()
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
      content: contentHtml + this.getDisclaimerHtml()
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
    // --- PRIORITY 1: Parse AI Structured Data Block ---
    const structuredMatch = cleanText.match(/---BEGIN STRUCTURED DATA---([\s\S]*?)---END STRUCTURED DATA---/i);

    // DEBUG: Log if structured data block exists
    if (!structuredMatch) {
      console.warn('WARNING: No structured data block found in AI output. This may cause data loss.');
      console.log('AI Output preview:', cleanText.substring(0, 500));
    }

    let position = "Agricultural Professional";
    let company = "Hiring Organization";
    let location = "As per advertisement";
    let salary = "Not Disclosed";
    let experience = "Relevant Experience";
    let qualification = "As per advertisement";
    let deadline: string | null = null;
    let email: string | null = null;
    let contact: string | null = null;

    if (structuredMatch) {
      const structuredBlock = structuredMatch[1];

      // Parse each line in the structured block
      const extractField = (fieldName: string): string | null => {
        const regex = new RegExp(`${fieldName}:\\s*(.+?)(?:\\n|$)`, 'i');
        const match = structuredBlock.match(regex);
        if (match && match[1]) {
          const value = match[1].trim();
          // Validation: Reject if it contains other field labels (pollution)
          const fieldLabels = ['POSITION', 'COMPANY', 'LOCATION', 'SALARY', 'EXPERIENCE', 'QUALIFICATION', 'DEADLINE', 'CONTACT', 'EMAIL'];
          if (fieldLabels.some(label => value.includes(label + ':'))) {
            return null; // Polluted
          }
          if (value === 'Not provided' || value === 'Not specified' || value === 'Not Disclosed') {
            return null;
          }
          return value;
        }
        return null;
      };

      position = extractField('POSITION') || position;
      company = extractField('COMPANY') || company;
      location = extractField('LOCATION') || location;
      salary = extractField('SALARY') || salary;
      experience = extractField('EXPERIENCE') || experience;
      qualification = extractField('QUALIFICATION') || qualification;
      deadline = extractField('DEADLINE');
      email = extractField('CONTACT_EMAIL');
      contact = extractField('CONTACT_PHONE');
    } else {
      // --- CRITICAL FALLBACK: Extract from original input text ---
      console.warn('CRITICAL: Using fallback extraction - may lose data accuracy');

      // Extract from the ENTIRE original text, not just structured block
      position = this.smartExtract(cleanText, [
        /(?:Position|Role|Post|Hiring For|Vacancy for)[\s:*-]+([A-Za-z\s()&/]+?)(?:\n|at|@|-|$)/i,
        /(?:POSITION|Hiring|Vacancy)[\s:*-]+([A-Za-z\s()&/]+?)(?:\n|at|@|-|$)/i,
        /(?:We are hiring|Looking for)[\s:*-]+([A-Za-z\s()&/]+?)(?:\n|at|@|\.|$)/i,
      ]) || this.extractFromOriginalText(cleanText, 'position') || position;

      // For company, try extractFromOriginalText FIRST since it has "Organization : *Name*" pattern
      company = this.extractFromOriginalText(cleanText, 'company') || this.smartExtract(cleanText, [
        /(?:Company|Employer)[\s:*-]+([A-Za-z0-9\s.&']+?(?:Ltd|Pvt|Corp)[^,\n]*)/i,
      ]) || company;

      location = this.smartExtract(cleanText, [
        /(?:Location|Place|City|State|Region)[\s:*-]+([A-Za-z\s(),\-]+?)(?:\n|$)/i,
      ]) || this.extractFromOriginalText(cleanText, 'location') || location;

      salary = this.extractFromOriginalText(cleanText, 'salary') || this.smartExtract(cleanText, [
        /(?:Salary|CTC|Compensation|Package)[\s:*-]+([^.\n]{3,50})(?:\.|Age\s+Limit|\n|$)/i,
        /(?:₹|Rs\.?)[\d,\s\-]+(?:per month|per annum|LPA)?/i,
      ]) || salary;

      // For experience, try extractFromOriginalText FIRST to avoid greedy generic matching
      experience = this.extractFromOriginalText(cleanText, 'experience') || this.smartExtract(cleanText, [
        /(?:Experience|Exp|Minimum Experience)[\s:*-]+([^\n]+?)(?:\n|$)/i,
      ]) || experience;

      qualification = this.smartExtract(cleanText, [
        /(?:Qualification|Degree|Education|Eligibility)[\s:*-]+([^\n]+?)(?:\n|$)/i,
      ]) || this.extractFromOriginalText(cleanText, 'qualification') || qualification;

      deadline = this.smartExtract(cleanText, [
        /(?:Deadline|Last Date|Apply Before)[\s:*-]+([^\n]+?)(?:\n|$)/i,
      ]) || this.extractFromOriginalText(cleanText, 'deadline');

      email = this.smartExtract(cleanText, [
        /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i,
      ]) || this.extractFromOriginalText(cleanText, 'email');

      contact = this.smartExtract(cleanText, [
        /(\d{10}|\d{5}\s*\d{5})/,
      ]) || this.extractFromOriginalText(cleanText, 'contact');
    }

    // Build Clean Title
    const title = `${position} – Job Opening at ${company} (${location})`;

    // --- SEO-OPTIMIZED CONTENT STRUCTURE ---
    const descriptionParagraphs = lines
      .filter(l => l.length > 20 && !/^(?:POSITION|COMPANY|LOCATION|SALARY|EXPERIENCE|QUALIFICATION|DEADLINE|CONTACT|---)/i.test(l))
      .slice(0, 10)
      .map(p => {
        const formatted = this.formatLine(p);
        return `<p class="mb-4">${formatted}</p>`;
      })
      .join('');

    const contentHtml = `
<article class="agri-job-post" itemscope itemtype="https://schema.org/JobPosting">
  <meta itemprop="title" content="${position}">
  <meta itemprop="datePosted" content="${new Date().toISOString().split('T')[0]}">
  <meta itemprop="hiringOrganization" content="${company}">

  <section class="introduction mb-8">
    <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-agri-green">
      <span class="inline-block bg-agri-green text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">🔥 Hot Opportunity</span>
      <h1 class="text-2xl font-bold text-stone-900 mb-2">${title}</h1>
      <p class="text-stone-600">A new career opportunity is now open. Read the details carefully and apply before the deadline.</p>
    </div>
  </section>

  <section class="about-opportunity mb-8">
    <h2 class="text-xl font-bold text-stone-800 mb-4 border-b pb-2">About This Opportunity</h2>
    <div class="prose prose-stone max-w-none text-stone-700 leading-relaxed">
      ${descriptionParagraphs || '<p>This is an exciting opportunity in the agriculture sector. The employer is looking for motivated candidates to join their team. Please review the details in the Job Overview table below.</p>'}
    </div>
  </section>

  <section class="key-responsibilities mb-8">
    <h2 class="text-xl font-bold text-stone-800 mb-4 border-b pb-2">Key Responsibilities</h2>
    <ul class="list-disc pl-6 space-y-2 text-stone-700">
      <li>Perform duties as assigned by the reporting manager in line with the role of <strong>${position}</strong>.</li>
      <li>Contribute to team goals and organizational objectives.</li>
      <li>Maintain professional conduct and adhere to company policies.</li>
    </ul>
  </section>

  <section class="eligibility mb-8">
    <h2 class="text-xl font-bold text-stone-800 mb-4 border-b pb-2">Eligibility Criteria</h2>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-stone-50 p-4 rounded-lg">
        <p class="text-xs font-bold text-stone-500 uppercase mb-1">Qualification</p>
        <p class="font-medium text-stone-800">${qualification}</p>
      </div>
      <div class="bg-stone-50 p-4 rounded-lg">
        <p class="text-xs font-bold text-stone-500 uppercase mb-1">Experience</p>
        <p class="font-medium text-stone-800">${experience}</p>
      </div>
    </div>
  </section>

  <section class="job-overview-table mb-8">
    <h2 class="text-xl font-bold text-stone-800 mb-4 border-b pb-2">Job Overview</h2>
    <div class="overflow-x-auto shadow-sm border border-stone-200 rounded-lg">
      <table class="w-full text-left border-collapse">
        <tbody>
          <tr class="bg-stone-50"><td class="px-4 py-3 font-bold text-stone-600 w-1/3">Position</td><td class="px-4 py-3 text-stone-900 font-semibold">${position}</td></tr>
          <tr><td class="px-4 py-3 font-bold text-stone-600">Company</td><td class="px-4 py-3">${company}</td></tr>
          <tr class="bg-stone-50"><td class="px-4 py-3 font-bold text-stone-600">Location</td><td class="px-4 py-3">${location}</td></tr>
          <tr><td class="px-4 py-3 font-bold text-stone-600">Salary/CTC</td><td class="px-4 py-3">${salary}</td></tr>
          ${deadline ? `<tr class="bg-stone-50"><td class="px-4 py-3 font-bold text-stone-600">Last Date to Apply</td><td class="px-4 py-3 text-red-600 font-semibold">${deadline}</td></tr>` : ''}
        </tbody>
      </table>
    </div>
  </section>

  <section class="how-to-apply mb-6">
    <h2 class="text-xl font-bold text-stone-800 mb-4 border-b pb-2">How to Apply</h2>
    <div class="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-xl text-center shadow-md border-4 border-white ring-4 ring-red-500/20">
      <h3 class="text-xl font-black uppercase tracking-wider mb-2">🚀 Apply Now</h3>
      <p class="mb-4 text-red-50 font-medium">Don't miss this opportunity! Contact the recruiter directly below:</p>
      
      <div class="flex flex-col sm:flex-row gap-3 justify-center items-center">
        ${contact ? `<a href="tel:${contact}" class="bg-white text-red-700 hover:bg-stone-100 px-6 py-3 rounded-lg flex items-center gap-2 transition-transform hover:-translate-y-1 shadow-sm font-bold group">
            <span class="bg-red-100 p-1 rounded-full group-hover:bg-red-200 text-sm">📞</span>
            <span class="font-mono text-base">${contact}</span>
        </a>` : ''}
        
        ${email ? `<a href="mailto:${email}" class="bg-white text-red-700 hover:bg-stone-100 px-6 py-3 rounded-lg flex items-center gap-2 transition-transform hover:-translate-y-1 shadow-sm font-bold group">
            <span class="bg-red-100 p-1 rounded-full group-hover:bg-red-200 text-sm">📧</span>
            <span class="font-mono text-base">${email}</span>
        </a>` : ''}
      </div>
      
      ${!contact && !email ? '<p class="text-red-200 mt-4 bg-red-800/30 p-2 rounded text-sm">⚠️ Please check the description above for specific application instructions.</p>' : ''}
    </div>
  </section>

  <section class="faq mb-8">
    <h2 class="text-xl font-bold text-stone-800 mb-4 border-b pb-2">Frequently Asked Questions</h2>
    <div class="space-y-3">
      <details class="group bg-white border border-stone-200 rounded-lg shadow-sm">
        <summary class="font-bold cursor-pointer p-4 hover:bg-stone-50 flex justify-between items-center">
          <span>Is this a verified job posting?</span>
          <span class="text-stone-400 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div class="p-4 border-t border-stone-100 text-stone-600 text-sm">
          <p>We source job listings from trusted networks, but we always recommend verifying details directly with the employer before sharing personal documents or making any payments.</p>
        </div>
      </details>
      <details class="group bg-white border border-stone-200 rounded-lg shadow-sm">
        <summary class="font-bold cursor-pointer p-4 hover:bg-stone-50 flex justify-between items-center">
          <span>What is the salary for this role?</span>
          <span class="text-stone-400 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div class="p-4 border-t border-stone-100 text-stone-600 text-sm">
          <p>The salary for this position is <strong>${salary}</strong>. Final compensation may vary based on experience and interview performance.</p>
        </div>
      </details>
      <details class="group bg-white border border-stone-200 rounded-lg shadow-sm">
        <summary class="font-bold cursor-pointer p-4 hover:bg-stone-50 flex justify-between items-center">
          <span>Can freshers apply for this job?</span>
          <span class="text-stone-400 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div class="p-4 border-t border-stone-100 text-stone-600 text-sm">
          <p>The required experience is <strong>${experience}</strong>. Please check the eligibility carefully. If you meet the qualifications, we encourage you to apply.</p>
        </div>
      </details>
    </div>
  </section>

</article>
    `;

    return {
      title: title,
      slug: this.createSlug(title),
      excerpt: `Exciting job opening for ${position} at ${company}, ${location}. Eligibility: ${qualification}. Apply now!`,
      category: "Jobs",
      keywords: ["Job", "Hiring", position, "Agriculture Jobs", location, company],
      content: contentHtml + this.getDisclaimerHtml(),
      job_details: {
        company: company,
        location: location,
        salary_range: salary,
        job_type: "Full-time",
        email: email || undefined,
        application_link: email ? `mailto:${email}` : undefined,
        contact: contact || undefined
      }
    };
  }

  private static formatLine(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold **text**
      .replace(/\*([^\s*].*?)\*/g, '<strong>$1</strong>') // Bold *text* (if not a bullet point)
      .replace(/^\s*[-*]\s+(.*)/, '• $1'); // Standardize list items
  }

  private static getDisclaimerHtml(): string {
    return `
      <hr class="my-8 border-stone-200" />
      <div class="bg-stone-50 p-6 rounded-lg border border-stone-200">
        <p class="font-bold text-stone-700 mb-2">Disclaimer</p>
        <p class="text-stone-600 text-sm">
          Agri Updates shares opportunities sourced from trusted networks. Applicants are advised to verify all details directly with the issuing organisation before submission.
        </p>
      </div>
    `;
  }

}
