export interface GeneratedPost {
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  keywords: string[]
  job_details?: {
    company?: string
    location?: string
    salary_range?: string
    job_type?: string
    application_link?: string
    email?: string
    contact?: string
  }
}

function cleanInput(text: string): string {
  return text
    .replace(/Forwardeded message/gi, '')
    .replace(/Forwarded/gi, '')
    .replace(/[*_]{2,}/g, '')
    .replace(/[^\S\r\n]+$/gm, '')
    .trim()
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function titleFromLines(lines: string[]): string {
  const firstUseful = lines.find((line) => /[a-zA-Z]/.test(line) && line.length > 8)
  return (firstUseful || 'Agri Update').replace(/^[-:*\s]+/, '').slice(0, 120)
}

function detectCategory(text: string): string {
  if (/Urgent|Hiring|Vacancy|Walk-in|Job|Position|Role|Salary/i.test(text)) return 'Jobs'
  if (/Webinar|Conference|Summit|Workshop|Speaker|Register/i.test(text)) return 'Conferences'
  if (/Subsidy|Grant|Scholarship|Scheme|Funding|Eligibility|Apply/i.test(text)) return 'Grants'
  if (/Warning|Alert|Advisory|Pest|Disease|Recall|Ban/i.test(text)) return 'Warnings'
  if (/Startup|Founder|Funding round|Seed funding|Series [A-Z]/i.test(text)) return 'Startups'
  return 'Research'
}

function extractJobDetails(text: string): GeneratedPost['job_details'] {
  const patterns: Record<string, RegExp[]> = {
    company: [
      /(?:Company|Organization|Organisation|Employer)\s*[:\-]\s*([^\n]+)/i,
      /at\s+([A-Z][A-Za-z0-9\s.&()]+(?:Pvt|Private|Limited|Ltd|Corp|Inc|Group|Agro|Farm)[^\n,.]*)/i,
    ],
    location: [
      /(?:Location|Place|City|District|State)\s*[:\-]\s*([^\n]+)/i,
      /#\s*([A-Za-z]+(?:\s*[-–]\s*[A-Za-z\s]+)?)/i,
    ],
    salary_range: [
      /(?:Salary|CTC|Compensation|Package)\s*[:\-]\s*([^\n]+)/i,
      /(₹[\d,\s\-–to]+(?:per\s+month|per\s+annum|LPA|lac|PM|PA)?)/i,
    ],
    application_link: [/(https?:\/\/[^\s]+)/i],
  }

  const details: GeneratedPost['job_details'] = {}
  for (const [key, regexes] of Object.entries(patterns)) {
    for (const regex of regexes) {
      const match = text.match(regex)
      if (match?.[1]) {
        details[key as keyof NonNullable<GeneratedPost['job_details']>] = match[1].trim().slice(0, 160)
        break
      }
    }
  }

  if (/intern/i.test(text)) details.job_type = 'Internship'
  else if (/contract/i.test(text)) details.job_type = 'Contract'
  else if (/part[-\s]?time/i.test(text)) details.job_type = 'Part-time'
  else if (Object.keys(details).length > 0) details.job_type = 'Full-time'

  return Object.keys(details).length > 0 ? details : undefined
}

export function generatePostFromRawText(rawText: string): GeneratedPost {
  const cleanText = cleanInput(rawText)
  const lines = cleanText.split('\n').map((line) => line.trim()).filter(Boolean)
  const title = titleFromLines(lines)
  const plain = stripHtml(cleanText)
  const category = detectCategory(cleanText)
  const excerpt = plain.length > 180 ? `${plain.slice(0, 177).trim()}...` : plain
  const paragraphs = lines
    .map((line) => `<p>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
    .join('\n')

  return {
    title,
    slug: generateSlug(title),
    excerpt,
    content: paragraphs,
    category,
    keywords: Array.from(
      new Set(
        plain
          .split(/[^A-Za-z]+/)
          .filter((word) => word.length > 4)
          .slice(0, 12)
          .map((word) => word.toLowerCase()),
      ),
    ),
    job_details: category === 'Jobs' ? extractJobDetails(cleanText) : undefined,
  }
}
