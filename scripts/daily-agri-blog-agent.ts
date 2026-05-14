import fs from 'node:fs/promises'
import path from 'node:path'
import OpenAI from 'openai'
import {
  createBlogDraft,
  listRecentPosts,
  scheduleBlogPost,
  uploadBlogImage,
} from '../mcp/src/tools.js'

type FeedCandidate = {
  title: string
  sourceUrl?: string
  sourceName?: string
  summary: string
  date?: string
  category: string
  entities: string[]
}

type GeneratedArticle = {
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  imagePrompt: string
}

type RunResult = {
  processed: number
  created: Array<{ id: string; title: string; scheduled_for: string }>
  skipped: Array<{ title: string; reason: string }>
  failed: Array<{ title: string; error: string }>
  dryRun: boolean
}

const DEFAULT_QUERY = 'from:onboarding@resend.dev to:aanand.ak15@gmail.com newer_than:2d'
const DEFAULT_IMAGE_MODEL = 'gpt-image-2'
const CATEGORIES = ['Research', 'Jobs', 'Grants', 'News', 'Startups', 'Warnings', 'Conferences']

function argValue(name: string) {
  const prefix = `--${name}=`
  const match = process.argv.find((arg) => arg.startsWith(prefix))
  return match?.slice(prefix.length)
}

function hasFlag(name: string) {
  return process.argv.includes(`--${name}`)
}

function env(name: string, fallback?: string) {
  return process.env[name] || fallback
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function parseCsv(text: string) {
  const rows: string[][] = []
  let cell = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"' && next === '"') {
      cell += '"'
      i += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim())
      cell = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1
      row.push(cell.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  row.push(cell.trim())
  if (row.some(Boolean)) rows.push(row)
  return rows
}

function headerValue(record: Record<string, string>, names: string[]) {
  const normalized = Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key.toLowerCase().replace(/[^a-z0-9]/g, ''), value]),
  )
  for (const name of names) {
    const value = normalized[name.toLowerCase().replace(/[^a-z0-9]/g, '')]
    if (value) return value
  }
  return ''
}

function inferCategory(text: string) {
  if (/hiring|vacancy|recruitment|job|walk.?in|position/i.test(text)) return 'Jobs'
  if (/grant|subsidy|scheme|funding|scholarship|yojana/i.test(text)) return 'Grants'
  if (/startup|funding round|seed round|founder|agritech/i.test(text)) return 'Startups'
  if (/warning|alert|advisory|pest|disease|ban|recall/i.test(text)) return 'Warnings'
  if (/conference|webinar|summit|workshop|seminar/i.test(text)) return 'Conferences'
  if (/research|study|icar|journal|scientist|technology/i.test(text)) return 'Research'
  return 'News'
}

function extractEntities(text: string) {
  const words = text.match(/\b[A-Z][A-Za-z0-9&.-]*(?:\s+[A-Z][A-Za-z0-9&.-]*){0,4}\b/g) || []
  return Array.from(new Set(words.filter((word) => word.length > 3))).slice(0, 10)
}

function candidateFromRecord(record: Record<string, string>): FeedCandidate | null {
  const title = headerValue(record, ['title', 'headline', 'news title', 'article title'])
  const summary = headerValue(record, ['summary', 'description', 'excerpt', 'content', 'details'])
  const sourceUrl = headerValue(record, ['url', 'source url', 'link', 'article url'])
  const sourceName = headerValue(record, ['source', 'source name', 'publisher'])
  const date = headerValue(record, ['date', 'published', 'published at'])
  const joined = `${title} ${summary} ${sourceName}`

  if (!title || stripHtml(`${summary} ${sourceUrl}`).length < 40) return null

  return {
    title: stripHtml(title).slice(0, 180),
    sourceUrl: sourceUrl || undefined,
    sourceName: sourceName || undefined,
    summary: stripHtml(summary || title).slice(0, 1200),
    date: date || undefined,
    category: inferCategory(joined),
    entities: extractEntities(joined),
  }
}

function parseCsvCandidates(text: string) {
  const rows = parseCsv(text)
  if (rows.length < 2) return []
  const headers = rows[0]
  return rows
    .slice(1)
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] || ''])))
    .map(candidateFromRecord)
    .filter((candidate): candidate is FeedCandidate => Boolean(candidate))
}

function parseHtmlCandidates(text: string) {
  const links = Array.from(text.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi))
  const candidates = links.reduce<FeedCandidate[]>((items, match) => {
      const title = stripHtml(match[2])
      const sourceUrl = match[1]
      if (!title || title.length < 12 || !/^https?:\/\//i.test(sourceUrl)) return items
      items.push({
        title: title.slice(0, 180),
        sourceUrl,
        sourceName: new URL(sourceUrl).hostname.replace(/^www\./, ''),
        summary: title,
        category: inferCategory(title),
        entities: extractEntities(title),
      })
      return items
    }, [])

  if (candidates.length > 0) return candidates

  const plain = stripHtml(text)
  return plain
    .split(/\n{2,}|(?=\b(?:Title|Headline|Source|URL):)/i)
    .map((chunk) => stripHtml(chunk))
    .filter((chunk) => chunk.length > 80)
    .map((chunk) => ({
      title: chunk.split(/[.!?]/)[0].slice(0, 180),
      summary: chunk.slice(0, 1200),
      category: inferCategory(chunk),
      entities: extractEntities(chunk),
    }))
}

async function readCandidatesFromInput(inputPath: string) {
  const raw = inputPath === '-' ? await readStdin() : await fs.readFile(inputPath, 'utf8')
  const ext = path.extname(inputPath).toLowerCase()

  if (ext === '.json') {
    const parsed = JSON.parse(raw)
    const items = Array.isArray(parsed) ? parsed : parsed.items || parsed.candidates || []
    return items.map(candidateFromRecord).filter((candidate: FeedCandidate | null): candidate is FeedCandidate => Boolean(candidate))
  }

  if (ext === '.csv') return parseCsvCandidates(raw)
  const csvCandidates = parseCsvCandidates(raw)
  if (csvCandidates.length > 0) return csvCandidates
  return [...parseCsvCandidates(raw), ...parseHtmlCandidates(raw)]
}

async function readStdin() {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf8')
}

function normalizeForSimilarity(text: string) {
  return stripHtml(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3)
}

function jaccard(a: string[], b: string[]) {
  const setA = new Set(a)
  const setB = new Set(b)
  const intersection = [...setA].filter((word) => setB.has(word)).length
  const union = new Set([...setA, ...setB]).size
  return union === 0 ? 0 : intersection / union
}

function duplicateReason(candidate: FeedCandidate, posts: any[]) {
  const candidateTokens = normalizeForSimilarity(`${candidate.title} ${candidate.summary} ${candidate.entities.join(' ')}`)
  for (const post of posts) {
    const postTokens = normalizeForSimilarity(`${post.title || ''} ${post.excerpt || ''} ${(post.tags || []).join(' ')}`)
    const score = jaccard(candidateTokens, postTokens)
    if (score >= 0.42) return `similar to existing post "${post.title}" (${score.toFixed(2)})`
    if (candidate.sourceUrl && String(post.content || '').includes(candidate.sourceUrl)) return `source URL already used by "${post.title}"`
  }
  return null
}

function qualifies(candidate: FeedCandidate) {
  const text = `${candidate.title} ${candidate.summary}`
  if (text.length < 100) return 'not enough substance'
  if (!/agri|farm|crop|soil|seed|fertili[sz]er|rural|food|horticulture|dairy|icar|apeda|mandi|pesticide|weather|irrigation|startup|subsidy|scheme/i.test(text)) {
    return 'not clearly agriculture-related'
  }
  if (/crypto|betting|casino|adult|celebrity gossip/i.test(text)) return 'excluded topic'
  return null
}

function tomorrowSchedule(index: number) {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(8 + Math.min(index * 2, 10), 30, 0, 0)
  return date.toISOString()
}

function fallbackArticle(candidate: FeedCandidate): GeneratedArticle {
  const sourceLine = candidate.sourceUrl
    ? `<p><strong>Source:</strong> <a href="${candidate.sourceUrl}" rel="nofollow noopener" target="_blank">${candidate.sourceName || candidate.sourceUrl}</a></p>`
    : ''

  return {
    title: candidate.title,
    excerpt: candidate.summary.slice(0, 157).trim() + (candidate.summary.length > 157 ? '...' : ''),
    content: `
      <p>${candidate.summary}</p>
      <h2>Why this matters</h2>
      <p>This update may affect farmers, agribusiness teams, students, researchers, and policy watchers tracking Indian agriculture opportunities.</p>
      <h2>What to watch next</h2>
      <p>Readers should verify the official source, track implementation details, and compare this update with related Agri Updates coverage before taking action.</p>
      ${sourceLine}
    `,
    category: CATEGORIES.includes(candidate.category) ? candidate.category : 'News',
    tags: Array.from(new Set(['agriculture', candidate.category, ...candidate.entities])).slice(0, 8),
    imagePrompt: `Create a clean Agri Updates blog hero image for: ${candidate.title}. Use an India-first agriculture news style, modern editorial layout, green and earth-tone palette, realistic field/agritech visual, no misleading text.`,
  }
}

async function generateArticle(candidate: FeedCandidate, relatedPosts: any[], openai: OpenAI | null) {
  if (!openai) return fallbackArticle(candidate)

  const response = await openai.responses.create({
    model: env('AGRI_TEXT_MODEL', 'gpt-5.4-mini')!,
    input: [
      {
        role: 'system',
        content:
          'You write Agri Updates articles. Return strict JSON with title, excerpt, content, category, tags, imagePrompt. Content must be HTML, SEO-friendly, human, factual, source-attributed, and include natural internal backlinks from the related post list when relevant.',
      },
      {
        role: 'user',
        content: JSON.stringify({ candidate, relatedPosts: relatedPosts.slice(0, 20) }),
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'agri_article',
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['title', 'excerpt', 'content', 'category', 'tags', 'imagePrompt'],
          properties: {
            title: { type: 'string' },
            excerpt: { type: 'string' },
            content: { type: 'string' },
            category: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            imagePrompt: { type: 'string' },
          },
        },
      },
    },
  })

  const text = response.output_text
  return JSON.parse(text) as GeneratedArticle
}

async function generateImage(article: GeneratedArticle, openai: OpenAI | null) {
  if (!openai) return null

  const image = await openai.images.generate({
    model: env('AGRI_IMAGE_MODEL', DEFAULT_IMAGE_MODEL)!,
    prompt: article.imagePrompt,
    size: '1536x1024',
    quality: 'medium',
  })

  return image.data?.[0]?.b64_json || null
}

async function main() {
  const dryRun = hasFlag('dry-run') || env('AGRI_DRY_RUN') === '1'
  const inputPath = argValue('input') || env('AGRI_FEED_INPUT_FILE')
  const gmailQuery = env('AGRI_FEED_GMAIL_QUERY', DEFAULT_QUERY)
  const openaiKey = env('OPENAI_API_KEY')
  const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null
  const result: RunResult = { processed: 0, created: [], skipped: [], failed: [], dryRun }

  if (!dryRun && !openaiKey) {
    throw new Error('OPENAI_API_KEY is required for live article rewriting and image generation. Run with --dry-run to test parsing/dedupe only.')
  }

  if (!inputPath) {
    throw new Error(
      `No feed input found. Save the Gmail HTML/CSV feed to a file and run --input=/path/to/feed.csv. Intended Gmail query: ${gmailQuery}`,
    )
  }

  const candidates = await readCandidatesFromInput(inputPath)
  const recentPosts = await listRecentPosts({ limit: 50 })
  result.processed = candidates.length

  for (const candidate of candidates) {
    const qualificationReason = qualifies(candidate)
    if (qualificationReason) {
      result.skipped.push({ title: candidate.title, reason: qualificationReason })
      continue
    }

    const dupe = duplicateReason(candidate, recentPosts)
    if (dupe) {
      result.skipped.push({ title: candidate.title, reason: dupe })
      continue
    }

    try {
      const article = await generateArticle(candidate, recentPosts, openai)
      const scheduledFor = tomorrowSchedule(result.created.length)

      if (dryRun) {
        result.created.push({ id: 'dry-run', title: article.title, scheduled_for: scheduledFor })
        continue
      }

      const imageBase64 = await generateImage(article, openai)
      const uploadedImage = imageBase64
        ? await uploadBlogImage({
            base64: imageBase64,
            filename: `${article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 70)}.png`,
            content_type: 'image/png',
          })
        : null

      const post = await createBlogDraft({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        category: CATEGORIES.includes(article.category) ? article.category : candidate.category,
        tags: article.tags,
        image_url: uploadedImage?.public_url,
        author_name: 'Agri Updates Automation',
        status: 'draft',
        source: 'daily_agri_blog_agent',
        source_url: candidate.sourceUrl,
        source_name: candidate.sourceName,
        canonical_url: candidate.sourceUrl,
        dedupe_key: candidate.sourceUrl || `${candidate.title}:${candidate.sourceName || ''}`,
      })

      const scheduled = await scheduleBlogPost({ post_id: post.id, scheduled_for: scheduledFor })
      result.created.push({ id: post.id, title: post.title, scheduled_for: String(scheduled.scheduled_for) })
    } catch (error: any) {
      result.failed.push({ title: candidate.title, error: error?.message || String(error) })
    }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
