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
        const extracted = match[1].trim()
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

  // Fallback extraction from original text
  private static extractFromOriginalText(text: string, fieldType: string): string | null {
    const cleanedText = text
      .replace(/\*([^*]+)\*/g, '$1') // Remove bold asterisks
      .replace(/#\s*/g, '') // Remove hashtags before text
      .replace(/[:\-]+\s*[:\->]+/g, ':'); // Normalize ": ->" patterns

    switch (fieldType.toLowerCase()) {
      case 'position':
        const positionPatterns = [
          /Position\s*[-—]+\s*([A-Za-z0-9\s/]+?)(?:\s(?:at|Location|from)|\n|\*|$)/i,
          /(?:Position|Role|Designation)\s*[:\-\s]*([A-Za-z0-9\s/\-,&]+?)(?:\s(?:at|Location)|\n|\*|$)/i,
          /Hiring\s*:\s*(?:[-—]\s*)?([A-Za-z0-9\s/\-,&]+?)(?:\sat|\n|$)/i,
          /(?:POSITION|Position)\s*[-:*]+\s*([A-Za-z\s()&\/]+?)(?:\n|$)/i,
          /(?:Hiring|HIRING)[:,\s*-]+\s*([A-Za-z\s()&\/]+?)(?:\s+at\s*|\n|$)/i,
        ];
        for (const pattern of positionPatterns) {
          const match = cleanedText.match(pattern);
          if (match) {
            const value = (match[1] || match[0]).trim().replace(/^[:\-*\s]+|[:\-*\s]+$/g, '');
            if (value.length >= 2 && value.length < 80) return value;
          }
        }
        break;

      case 'company':
        const companyPatterns = [
          /(?:Company\s+Name|Company|Organization|Employer|Organisation)\s*[:\-\s]*\**([^\n\r*]+?)(?:\s*(?:Location|Position|Salary|Experience)|\*|\n|\r|$)/i,
          /([A-Za-z0-9\s&.'-]+?(?:Pvt\.?\s*Ltd\.?|Private\s+Limited|Limited|Ltd\.?|Corp\.?|Inc\.?|Agro|Fertilizers|Seeds|Chemicals|Crop\s+Science|Sciences))/i,
        ];
        for (const pattern of companyPatterns) {
          const match = cleanedText.match(pattern);
          if (match && match[1]) {
            let value = match[1].trim().replace(/^[:\-*\s]+|[:\-*\s]+$/g, '');
            // Clean any trailing field keywords that might have slipped in
            value = value.replace(/\s*(?:Position|Location|Salary|Experience|Qualification|Deadline|Contact).*$/i, '').trim();
            if (value.length > 3 && value.length < 80 && !/^(Company|Organization|Private|The)$/i.test(value)) {
              return value;
            }
          }
        }
        break;

      case 'location':
        const locationPatterns = [
          /Location\s*[-:]+\s*([A-Za-z0-9\s,.-]+?)(?:\s*(?:https?|Height|Weight|http|\*|\n|$))/i,
          /LOCATION\s*[-:]+\s*#?\s*([A-Za-z]+(?:\s*[-–]\s*[A-Za-z\s]+)*?)(?:\s*\.\s*(?:Salary|Experience)|$)/i,
          /(?:Place|City|District|State)\s*[:*\-]+\s*([A-Za-z\s,().\-]+?)(?:\n|$)/i,
        ];
        for (const pattern of locationPatterns) {
          const match = cleanedText.match(pattern);
          if (match && match[1]) {
            let value = match[1].trim().replace(/^[:\-*#\s]+|[:\-*#\s]+$/g, '');
            value = value.replace(/\s*(?:For|Experience|Salary|Qualification|\.|\n).*$/i, '').trim();
            if (value.length > 2 && value.length < 100 && !/^(Pan\s*India|India|Location)$/i.test(value)) {
              return value;
            }
          }
        }
        break;

      case 'salary':
        const salaryPatterns = [
          /(?:Salary|CTC|Compensation|Package)\s*[:*\-]+\s*([^.\n]{3,50})(?:\.|Age\s+Limit|\n|$)/i,
          /(₹[\d,\s\-–to]+(?:per\s+month|per\s+annum|LPA|lac|PM|PA)?)/i,
          /(Rs\.?\s*[\d,\s\-–to]+(?:per\s+month|per\s+annum|LPA|lac)?)/i,
          /(As\s+Per\s+Industry\s+Standard)/i,
        ];
        for (const pattern of salaryPatterns) {
          const match = cleanedText.match(pattern);
          if (match) {
            let value = (match[1] || match[0]).trim().replace(/^[:\-*\s]+|[:\-*\s]+$/g, '');
            value = value.substring(0, 60).replace(/[.\s,]+$/, '');
            if (value.length > 2 && value.length < 60) return value;
          }
        }
        break;

      case 'experience':
        const experiencePatterns = [
          /(?:Minimum|Min|Max)\s*[:*\-]?\s*(\d+(?:\+?|\s*(?:to|-|–)\s*\d+)?\s*years?)/i,
          /((?:Minimum\s*)?\d+(?:\+?|\s*(?:to|-|–)\s*\d+)?\s*years?(?:'?s?)?\s*(?:experience|exp)?)/i,
        ];
        for (const pattern of experiencePatterns) {
          const match = cleanedText.match(pattern);
          if (match && match[1]) {
            let value = match[1].trim().replace(/^[:\-*\s]+|[:\-*\s]+$/g, '');
            value = value.replace(/\s*(?:on\s+Company|will\s+be|Salary|Requirement|Qualification|Description).*$/i, '').trim();
            if (value.length > 2) return value;
          }
        }
        break;

      case 'qualification':
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
            if (value.length > 3) return value;
          }
        }
        break;

      case 'deadline':
        const deadlinePatterns = [
          /(?:Deadline|Last\s+Date|Apply\s+Before|before)\s*[:*\-]?\s*(\d{1,2}[\s\/\-]*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]*\d{2,4})/i,
          /(\d{1,2}[\-\/\.]\d{1,2}[\-\/\.]\d{2,4})/,
        ];
        for (const pattern of deadlinePatterns) {
          const match = cleanedText.match(pattern);
          if (match && match[1]) {
            const value = match[1].trim().replace(/^[:\-*\s]+|[:\-*\s]+$/g, '');
            if (value.length > 3) return value;
          }
        }
        break;

      case 'email':
        const emailMatches = cleanedText.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/gi);
        if (emailMatches && emailMatches.length > 0) {
          for (const email of emailMatches) {
            if (!email.includes('example') && !email.includes('test')) return email;
          }
          return emailMatches[0];
        }
        return null;

      case 'contact':
        const phonePatterns = [
          /(?:Contact|Phone|Call|Mobile)\s*[:*\-]+\s*(\+?91[-\s]?\d{10}|\d{10})/i,
          /(\d{10})/,
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
    const suggestedTitle = lines[0]?.substring(0, 100).replace(/[*#]/g, '').trim() || "Agri Sector Update";
    const paragraphs = lines
      .filter(p => p.trim().length > 20)
      .map(p => `<p>${this.formatLine(p)}</p>`)
      .join('');

    const contentHtml = `
<h2>Latest Updates & Key Details</h2>
${paragraphs || `<p>${cleanText}</p>`}
    `.trim();

    return {
      title: suggestedTitle,
      slug: this.createSlug(suggestedTitle),
      excerpt: (lines[1] || lines[0] || "Latest Update").replace(/[*#]/g, '').trim().substring(0, 160),
      category: "News",
      keywords: ["Agriculture", "News", "Update", "Agri Sector"],
      content: contentHtml
    };
  }

  private static generateEventPost(cleanText: string, lines: string[]): GeneratedPost {
    const date = this.smartExtract(cleanText, [
      /\b(?:Date|Dated|On)\s*[:\-\*]+\s*([^\n\r]+)/i,
      /\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*,?\s*\d{4})/i
    ]) || "To be announced";

    const time = this.smartExtract(cleanText, [
      /\b(?:Time|Timing|At)\s*[:\-\*]+\s*([^\n\r]+)/i,
      /\b(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)(?:\s*IST)?)/i
    ]) || "TBD";

    const venue = this.smartExtract(cleanText, [
      /\b(?:Venue|Location|Platform|Where)\s*[:\-\*]+\s*([^\n\r]+)/i,
      /\b(Zoom Meeting|Google Meet|Microsoft Teams|Zoom|Teams)\b/i
    ]) || "Online";

    const miscLink = this.smartExtract(cleanText, [
      /\b(?:Link|Register|Registration|Url|Form)\s*[:\-\*]+\s*(https?:\/\/[^\s]+)/i,
      /(https?:\/\/[^\s]+)/i
    ]);

    let title = lines[0].replace(/[*#]/g, '').trim().substring(0, 100);
    if (/Forwarded/i.test(title)) title = lines[1]?.replace(/[*#]/g, '').trim().substring(0, 100) || "Upcoming Agri Event";

    const detailParagraphs = lines
      .filter(l => l.trim().length > 20 && !/\b(?:Date|Time|Venue|Platform|Register|Link)\b/i.test(l))
      .map(p => `<p>${this.formatLine(p)}</p>`)
      .join('');

    const contentHtml = `
<h2>Event Overview</h2>
<table>
  <tbody>
    <tr><td><strong>Date</strong></td><td>${date}</td></tr>
    <tr><td><strong>Time</strong></td><td>${time}</td></tr>
    <tr><td><strong>Location / Platform</strong></td><td>${venue}</td></tr>
  </tbody>
</table>

<h2>About This Event</h2>
${detailParagraphs || `<p>${cleanText}</p>`}

<h2>Registration Information</h2>
<p>${miscLink ? `Register online using the official link: <a href="${miscLink}" target="_blank" rel="noopener noreferrer">${miscLink}</a>` : 'Please check the contact details in the description to secure your spot.'}</p>
    `.trim();

    return {
      title: `Event: ${title}`,
      slug: this.createSlug(title),
      excerpt: `Join the upcoming event "${title}" on ${date}. Check full details and registration.`,
      category: "Events",
      keywords: ["Event", "Webinar", "Agriculture", "Workshop"],
      content: contentHtml
    };
  }

  private static generateSchemePost(cleanText: string, lines: string[]): GeneratedPost {
    const benefit = this.smartExtract(cleanText, [
      /\b(?:Subsidy|Subsidy\s+Amount|Grant|Financial\s+Assistance|Benefit)\s*[:\-\*]+\s*([^\n\r]+)/i,
      /\b(\d+%\s+subsidy)/i,
      /(Rs\.?\s*[\d,]+\/?-?)/i
    ]) || "Subsidy & Grant Available";

    const eligibility = this.smartExtract(cleanText, [
      /\b(?:Eligibility|Criteria|Target\s+Beneficiaries|Who\s+can\s+apply)\s*[:\-\*]+\s*([^\n\r]+)/i
    ]) || "Check full eligibility guidelines";

    const deadline = this.smartExtract(cleanText, [
      /\b(?:Deadline|Last\s+Date|Valid\s+till|End\s+Date|Apply\s+before)\s*[:\-\*]+\s*([^\n\r]+)/i
    ]) || "Apply soon";

    let title = lines[0].replace(/[*#]/g, '').trim().substring(0, 100);
    if (/Forwarded/i.test(title)) title = lines[1]?.replace(/[*#]/g, '').trim().substring(0, 100) || "New Government Scheme & Subsidy";

    const detailParagraphs = lines
      .filter(l => l.trim().length > 20 && !/\b(?:Subsidy|Amount|Grant|Eligibility|Deadline|Criteria)\b/i.test(l))
      .map(p => `<p>${this.formatLine(p)}</p>`)
      .join('');

    const contentHtml = `
<h2>Scheme Highlights</h2>
<table>
  <tbody>
    <tr><td><strong>Benefit / Subsidy</strong></td><td>${benefit}</td></tr>
    <tr><td><strong>Eligibility</strong></td><td>${eligibility}</td></tr>
    <tr><td><strong>Last Date to Apply</strong></td><td>${deadline}</td></tr>
  </tbody>
</table>

<h2>Scheme Guidelines & Objectives</h2>
${detailParagraphs || `<p>${cleanText}</p>`}

<h2>How to Apply</h2>
<p>Interested farmers and applicants can submit their application through official agricultural portal or district agriculture office.</p>
    `.trim();

    return {
      title: `Scheme: ${title}`,
      slug: this.createSlug(title),
      excerpt: `New scheme: ${title}. Subsidy: ${benefit}. Check eligibility and application process.`,
      category: "Grants",
      keywords: ["Scheme", "Subsidy", "Grant", "Agriculture", "Funding"],
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
    // Check if AI output has structured block
    const structuredMatch = cleanText.match(/---BEGIN STRUCTURED DATA---([\s\S]*?)---END STRUCTURED DATA---/i);

    let position = "Agricultural Professional";
    let company = "Hiring Organization";
    let location = "As per advertisement";
    let salary = "Not Disclosed";
    let experience = "Relevant Experience";
    let qualification = "Graduation in Agriculture / Allied Science";
    let deadline: string | null = null;
    let email: string | null = null;
    let contact: string | null = null;

    if (structuredMatch) {
      const structuredBlock = structuredMatch[1];
      const extractField = (fieldName: string): string | null => {
        const regex = new RegExp(`${fieldName}:\\s*(.+?)(?:\\n|$)`, 'i');
        const match = structuredBlock.match(regex);
        if (match && match[1]) {
          const value = match[1].trim();
          if (value === 'Not provided' || value === 'Not specified' || value === 'Not Disclosed') return null;
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
      // Fallback extraction
      position = this.extractFromOriginalText(cleanText, 'position') || this.smartExtract(cleanText, [
        /(?:Position|Role|Post|Hiring For|Vacancy for)[\s:*-]+([A-Za-z\s()&/]+?)(?:\n|at|@|-|$)/i,
      ]) || position;

      company = this.extractFromOriginalText(cleanText, 'company') || this.smartExtract(cleanText, [
        /(?:Company|Employer)[\s:*-]+([A-Za-z0-9\s.&']+?(?:Ltd|Pvt|Corp)[^,\n]*)/i,
      ]) || company;

      location = this.extractFromOriginalText(cleanText, 'location') || this.smartExtract(cleanText, [
        /(?:Location|Place|City|State|Region)[\s:*-]+([A-Za-z\s(),\-]+?)(?:\n|$)/i,
      ]) || location;

      salary = this.extractFromOriginalText(cleanText, 'salary') || this.smartExtract(cleanText, [
        /(?:Salary|CTC|Compensation|Package)[\s:*-]+([^.\n]{3,50})(?:\.|Age\s+Limit|\n|$)/i,
      ]) || salary;

      experience = this.extractFromOriginalText(cleanText, 'experience') || this.smartExtract(cleanText, [
        /(?:Experience|Exp|Minimum Experience)[\s:*-]+([^\n]+?)(?:\n|$)/i,
      ]) || experience;

      qualification = this.extractFromOriginalText(cleanText, 'qualification') || this.smartExtract(cleanText, [
        /(?:Qualification|Degree|Education|Eligibility)[\s:*-]+([^\n]+?)(?:\n|$)/i,
      ]) || qualification;

      deadline = this.extractFromOriginalText(cleanText, 'deadline');
      email = this.extractFromOriginalText(cleanText, 'email');
      contact = this.extractFromOriginalText(cleanText, 'contact');
    }

    const title = `${position} – Job Opening at ${company} (${location})`;

    // Filter out structured block markers and metadata lines
    const descriptionParagraphs = lines
      .filter(l => l.length > 20 && !/^(?:POSITION|COMPANY|LOCATION|SALARY|EXPERIENCE|QUALIFICATION|DEADLINE|CONTACT|---)/i.test(l))
      .slice(0, 8)
      .map(p => `<p>${this.formatLine(p)}</p>`)
      .join('');

    // CLEAN SEMANTIC HTML (Natively editable in Tiptap)
    const contentHtml = `
<h2>About This Opportunity</h2>
${descriptionParagraphs || `<p>We are hiring for the position of <strong>${position}</strong> at <strong>${company}</strong>.</p>`}

<h2>Job Overview</h2>
<table>
  <tbody>
    <tr><td><strong>Position</strong></td><td>${position}</td></tr>
    <tr><td><strong>Company</strong></td><td>${company}</td></tr>
    <tr><td><strong>Location</strong></td><td>${location}</td></tr>
    <tr><td><strong>Salary / Compensation</strong></td><td>${salary}</td></tr>
    ${deadline ? `<tr><td><strong>Last Date to Apply</strong></td><td>${deadline}</td></tr>` : ''}
  </tbody>
</table>

<h2>Eligibility & Qualifications</h2>
<ul>
  <li><strong>Qualification:</strong> ${qualification}</li>
  <li><strong>Experience:</strong> ${experience}</li>
</ul>

<h2>How to Apply</h2>
<p>Interested and eligible candidates can submit their resume or reach out using the official contact details below:</p>
<ul>
  ${contact ? `<li><strong>Phone / Mobile:</strong> ${contact}</li>` : ''}
  ${email ? `<li><strong>Email Address:</strong> <a href="mailto:${email}">${email}</a></li>` : ''}
</ul>
    `.trim();

    return {
      title: title,
      slug: this.createSlug(title),
      excerpt: `Job opening for ${position} at ${company}, ${location}. Qualification: ${qualification}. Apply before ${deadline || 'deadline'}.`,
      category: "Jobs",
      keywords: ["Job", "Hiring", position, "Agriculture Jobs", location, company],
      content: contentHtml,
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
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^\s*].*?)\*/g, '<strong>$1</strong>')
      .replace(/^\s*[-*]\s+(.*)/, '• $1')
      .trim();
  }
}
