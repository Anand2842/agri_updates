import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { google } from 'googleapis'
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

type SourceContext = {
  url?: string
  title?: string
  description?: string
  text: string
  wordCount: number
  facts: string[]
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
const GMAIL_CONFIG_DIR = path.join(os.homedir(), '.gmail-mcp')
const DEFAULT_WRITING_SKILL_PATH = path.join(process.cwd(), 'skills', 'agri-blog-writer', 'SKILL.md')

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/&mdash;/gi, '-')
    .replace(/&ndash;/gi, '-')
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

function sentenceSplit(text: string) {
  return decodeHtmlEntities(text)
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 45 && sentence.length <= 280)
}

function extractMeta(html: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patterns = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${escaped}["'][^>]*>`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return stripHtml(decodeHtmlEntities(match[1]))
  }
  return ''
}

function extractJsonLdArticleBody(html: string) {
  const scripts = Array.from(html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi))
  for (const script of scripts) {
    try {
      const parsed = JSON.parse(decodeHtmlEntities(script[1].trim()))
      const items = Array.isArray(parsed) ? parsed : [parsed]
      const queue = [...items]
      while (queue.length > 0) {
        const item = queue.shift()
        if (!item || typeof item !== 'object') continue
        if (typeof item.articleBody === 'string') return stripHtml(item.articleBody)
        for (const value of Object.values(item)) {
          if (Array.isArray(value)) queue.push(...value)
          else if (value && typeof value === 'object') queue.push(value)
        }
      }
    } catch {
      // Ignore invalid JSON-LD blocks and fall back to visible article extraction.
    }
  }
  return ''
}

function extractReadableText(html: string) {
  const articleBody = extractJsonLdArticleBody(html)
  if (articleBody.length > 300) return articleBody

  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<(p|h1|h2|h3|li|blockquote)[^>]*>/gi, '\n')
    .replace(/<\/(p|h1|h2|h3|li|blockquote)>/gi, '\n')

  const lines = cleaned
    .split(/\n+/)
    .map((line) => stripHtml(decodeHtmlEntities(line)))
    .filter((line) => line.length > 45)
    .filter((line) => !/subscribe|advertisement|sign in|read more|download app|follow us/i.test(line))

  return Array.from(new Set(lines)).join(' ')
}

async function fetchSourceContext(candidate: FeedCandidate): Promise<SourceContext> {
  if (!candidate.sourceUrl) {
    const fallbackText = candidate.summary || candidate.title
    return {
      text: fallbackText,
      wordCount: normalizeForSimilarity(fallbackText).length,
      facts: sentenceSplit(fallbackText).slice(0, 6),
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), Number(env('AGRI_SOURCE_FETCH_TIMEOUT_MS', '12000')))

  try {
    const response = await fetch(candidate.sourceUrl, {
      signal: controller.signal,
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })
    if (!response.ok) throw new Error(`source returned HTTP ${response.status}`)

    const html = await response.text()
    const title = extractMeta(html, 'og:title') || stripHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || candidate.title)
    const description = extractMeta(html, 'description') || extractMeta(html, 'og:description')
    const text = extractReadableText(html)
    const factPool = sentenceSplit(`${description}. ${text}`)
    const facts = factPool
      .filter((sentence) => /\d|price|farmer|crop|fertili[sz]er|policy|market|supply|government|export|import|production/i.test(sentence))
      .slice(0, 10)

    return {
      url: candidate.sourceUrl,
      title,
      description,
      text,
      wordCount: normalizeForSimilarity(text).length,
      facts: facts.length > 0 ? facts : factPool.slice(0, 8),
    }
  } catch (error: any) {
    const fallbackText = candidate.summary || candidate.title
    return {
      url: candidate.sourceUrl,
      title: candidate.title,
      description: candidate.summary,
      text: fallbackText,
      wordCount: normalizeForSimilarity(fallbackText).length,
      facts: sentenceSplit(fallbackText).slice(0, 6),
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function loadWritingSkill() {
  const skillPath = env('AGRI_WRITING_SKILL_PATH', DEFAULT_WRITING_SKILL_PATH)!
  try {
    return await fs.readFile(skillPath, 'utf8')
  } catch {
    return ''
  }
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

function parseCsvCandidates(text: string): FeedCandidate[] {
  const rows = parseCsv(text)
  if (rows.length < 2) return []
  const headers = rows[0]
  return rows
    .slice(1)
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] || ''])))
    .map(candidateFromRecord)
    .filter((candidate): candidate is FeedCandidate => Boolean(candidate))
}

function parseHtmlCandidates(text: string): FeedCandidate[] {
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

function decodeGmailBody(data?: string | null) {
  if (!data) return ''
  return Buffer.from(data, 'base64url').toString('utf8')
}

function collectGmailParts(part: any, parts: any[] = []) {
  if (!part) return parts
  parts.push(part)
  for (const child of part.parts || []) collectGmailParts(child, parts)
  return parts
}

async function readJsonFile<T>(filePath: string) {
  return JSON.parse(await fs.readFile(filePath, 'utf8')) as T
}

async function createGmailClient() {
  const oauthPath = env('GMAIL_OAUTH_PATH', path.join(GMAIL_CONFIG_DIR, 'gcp-oauth.keys.json'))!
  const tokenPath = env('GMAIL_CREDENTIALS_PATH', path.join(GMAIL_CONFIG_DIR, 'credentials.json'))!
  const oauth = await readJsonFile<any>(oauthPath)
  const token = await readJsonFile<any>(tokenPath)
  const clientConfig = oauth.installed || oauth.web

  if (!clientConfig?.client_id || !clientConfig?.client_secret) {
    throw new Error(`Invalid Gmail OAuth config at ${oauthPath}`)
  }

  const auth = new google.auth.OAuth2(
    clientConfig.client_id,
    clientConfig.client_secret,
    clientConfig.redirect_uris?.[0] || 'http://localhost:3000/oauth2callback',
  )
  auth.setCredentials(token)
  return google.gmail({ version: 'v1', auth })
}

async function readCandidatesFromGmail(query: string) {
  const gmail = await createGmailClient()
  const search = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: Number(env('AGRI_GMAIL_MAX_EMAILS', '1')),
  })
  const messages = search.data.messages || []

  if (messages.length === 0) {
    throw new Error(`No Gmail feed emails matched query: ${query}`)
  }

  const rawFeeds: string[] = []

  for (const message of messages) {
    if (!message.id) continue
    const detail = await gmail.users.messages.get({ userId: 'me', id: message.id, format: 'full' })
    const parts = collectGmailParts(detail.data.payload)

    for (const part of parts) {
      const mimeType = String(part.mimeType || '').toLowerCase()
      const filename = String(part.filename || '')
      const isFeedLike =
        mimeType.includes('text/html') ||
        mimeType.includes('text/csv') ||
        mimeType.includes('application/csv') ||
        /\.(csv|html?)$/i.test(filename)

      if (!isFeedLike) continue

      if (part.body?.attachmentId) {
        const attachment = await gmail.users.messages.attachments.get({
          userId: 'me',
          messageId: message.id,
          id: part.body.attachmentId,
        })
        rawFeeds.push(decodeGmailBody(attachment.data.data))
      } else {
        rawFeeds.push(decodeGmailBody(part.body?.data))
      }
    }

    if (rawFeeds.length === 0 && detail.data.snippet) rawFeeds.push(detail.data.snippet)
  }

  const candidates = rawFeeds.flatMap((raw) => {
    const csvCandidates = parseCsvCandidates(raw)
    return csvCandidates.length > 0 ? csvCandidates : parseHtmlCandidates(raw)
  })

  const seen = new Set<string>()
  return candidates.filter((candidate) => {
    const key = `${candidate.sourceUrl || ''}:${candidate.title}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
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

function articleWordCount(text: string) {
  return stripHtml(text).split(/\s+/).filter((word) => /[A-Za-z0-9]/.test(word)).length
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
  const candidateTitle = stripHtml(candidate.title).toLowerCase()
  for (const post of posts) {
    const postTitle = stripHtml(post.title || '').toLowerCase()
    if (candidateTitle && postTitle && candidateTitle === postTitle) return `same title as existing post "${post.title}"`

    const titleScore = jaccard(normalizeForSimilarity(candidate.title), normalizeForSimilarity(post.title || ''))
    if (titleScore >= 0.82) return `near-identical title to existing post "${post.title}" (${titleScore.toFixed(2)})`

    const postTokens = normalizeForSimilarity(`${post.title || ''} ${post.excerpt || ''} ${(post.tags || []).join(' ')}`)
    const score = jaccard(candidateTokens, postTokens)
    if (score >= 0.42) return `similar to existing post "${post.title}" (${score.toFixed(2)})`
    if (candidate.sourceUrl && String(post.content || '').includes(candidate.sourceUrl)) return `source URL already used by "${post.title}"`
  }
  return null
}

function similarCandidateReason(candidate: FeedCandidate, accepted: FeedCandidate[]) {
  const candidateTokens = normalizeForSimilarity(`${candidate.title} ${candidate.summary} ${candidate.entities.join(' ')}`)
  for (const previous of accepted) {
    if (candidate.sourceUrl && previous.sourceUrl && candidate.sourceUrl === previous.sourceUrl) {
      return `same source URL as "${previous.title}"`
    }

    const previousTokens = normalizeForSimilarity(`${previous.title} ${previous.summary} ${previous.entities.join(' ')}`)
    const score = jaccard(candidateTokens, previousTokens)
    if (score >= 0.38) return `near-duplicate of feed item "${previous.title}" (${score.toFixed(2)})`
  }
  return null
}

function maxPostsPerRun() {
  const value = env('AGRI_MAX_POSTS_PER_RUN', 'all-qualified')
  if (!value || value === 'all-qualified') return Number.POSITIVE_INFINITY
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : Number.POSITIVE_INFINITY
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

function sourceHasEnoughContext(candidate: FeedCandidate, source: SourceContext) {
  const summaryWords = normalizeForSimilarity(candidate.summary).length
  return source.wordCount >= 120 || source.facts.length >= 3 || summaryWords >= 90
}

function paragraph(text: string) {
  return `<p>${escapeHtml(text)}</p>`
}

function factList(facts: string[]) {
  if (facts.length === 0) return ''
  return `<ul>${facts.map((fact) => `<li>${escapeHtml(fact.replace(/\s+/g, ' ').trim())}</li>`).join('')}</ul>`
}

function fallbackArticle(candidate: FeedCandidate, source: SourceContext): GeneratedArticle {
  const facts = source.facts.slice(0, 7)
  const sourceLabel = candidate.sourceName || (candidate.sourceUrl ? new URL(candidate.sourceUrl).hostname.replace(/^www\./, '') : 'the source report')
  const primaryDetail = source.description || facts[0] || candidate.summary
  const sourceLine = candidate.sourceUrl
    ? `<p><strong>Source:</strong> <a href="${candidate.sourceUrl}" rel="nofollow noopener" target="_blank">${candidate.sourceName || candidate.sourceUrl}</a></p>`
    : ''
  const tags = Array.from(new Set(['agriculture', candidate.category, ...candidate.entities, sourceLabel.split('.')[0]])).slice(0, 8)
  const title = candidate.title.length > 90 ? candidate.title.slice(0, 87).trim() + '...' : candidate.title

  return {
    title,
    excerpt: stripHtml(primaryDetail).slice(0, 157).trim() + (stripHtml(primaryDetail).length > 157 ? '...' : ''),
    content: `
      ${paragraph(`${candidate.title} is a development worth tracking for India's agriculture economy because it connects directly with input costs, farm planning, procurement decisions, and the wider policy environment around food production.`)}
      ${paragraph(primaryDetail)}
      <h2>Key details from the report</h2>
      ${factList(facts)}
      <h2>Why it matters for farmers and agri businesses</h2>
      ${paragraph(`For farmers, the practical concern is not only the headline event but how it may affect prices, availability, working capital, sowing choices, and local advisory decisions over the coming season. Input-heavy crops and regions that depend on timely supply chains can feel the impact first when fertilizer, seed, credit, weather, or procurement signals change.`)}
      ${paragraph(`For agri businesses, cooperatives, FPOs, dealers, and policy watchers, this update is a signal to monitor procurement costs, inventory planning, import dependence, government support measures, and the next official clarification. A small change at the policy or wholesale level can quickly move into retail availability and farmer sentiment.`)}
      <h2>How to read this update on the ground</h2>
      ${paragraph(`At the field level, the useful question is whether the news changes availability, timing, or cost for the farmer. A national procurement or market update may take days or weeks to show up in local supply channels. Farmers should therefore rely on official advisories, local agriculture officers, cooperative updates, and trusted dealers instead of reacting only to the headline.`)}
      ${paragraph(`For readers following the rural economy, this is also a reminder that global commodity shocks can become local farming issues. Fertilizer, fuel, freight, weather, and procurement policy often move together. A credible agriculture article should connect those dots without exaggerating what is already confirmed.`)}
      <h2>What readers should watch next</h2>
      ${paragraph(`The next useful checkpoints are official government statements, updated price notifications, company or ministry clarifications, and field-level reports from major producing states. Readers should also compare this update with mandi trends, input dealer feedback, and crop-specific advisories before making operational decisions.`)}
      <h2>Agri Updates view</h2>
      ${paragraph(`This story should be treated as a source-backed market and policy update, not as standalone advice. Agri Updates will track follow-up developments and connect them with related farming, agribusiness, and rural economy stories as more verified information becomes available.`)}
      ${sourceLine}
    `,
    category: CATEGORIES.includes(candidate.category) ? candidate.category : 'News',
    tags,
    imagePrompt: `Create a clean Agri Updates blog hero image for: ${candidate.title}. Use an India-first agriculture news style, modern editorial layout, green and earth-tone palette, realistic field/agritech visual, no misleading text.`,
  }
}

async function generateArticle(candidate: FeedCandidate, relatedPosts: any[], openai: OpenAI | null, source: SourceContext, writingSkill: string) {
  if (!sourceHasEnoughContext(candidate, source)) {
    throw new Error('insufficient source context for a full article')
  }

  if (!openai) {
    const article = fallbackArticle(candidate, source)
    const plainWords = articleWordCount(article.content)
    if (plainWords < Number(env('AGRI_MIN_ARTICLE_WORDS', '450'))) {
      throw new Error(`fallback article too short (${plainWords} words)`)
    }
    return article
  }

  const response = await openai.responses.create({
    model: env('AGRI_TEXT_MODEL', 'gpt-5.4-mini')!,
    input: [
      {
        role: 'system',
        content:
          `You write Agri Updates articles. Return strict JSON with title, excerpt, content, category, tags, imagePrompt. Content must be HTML, SEO-friendly, human, factual, source-attributed, and include natural internal backlinks from the related post list when relevant. Never publish a thin summary. Follow this local writing skill:\n\n${writingSkill}`,
      },
      {
        role: 'user',
        content: JSON.stringify({ candidate, source, relatedPosts: relatedPosts.slice(0, 20) }),
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
  const article = JSON.parse(text) as GeneratedArticle
  const plainWords = articleWordCount(article.content)
  if (plainWords < Number(env('AGRI_MIN_ARTICLE_WORDS', '450'))) {
    throw new Error(`generated article too short (${plainWords} words)`)
  }
  return article
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
  const gmailQuery = env('AGRI_FEED_GMAIL_QUERY', DEFAULT_QUERY)!
  const openaiKey = env('OPENAI_API_KEY')
  const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null
  const skipImages = hasFlag('skip-images') || env('AGRI_SKIP_IMAGES') === '1' || !openai
  const result: RunResult = { processed: 0, created: [], skipped: [], failed: [], dryRun }

  const candidates = inputPath ? await readCandidatesFromInput(inputPath) : await readCandidatesFromGmail(gmailQuery)
  const recentPosts = await listRecentPosts({ limit: 50 })
  const acceptedCandidates: FeedCandidate[] = []
  const maxPosts = maxPostsPerRun()
  const writingSkill = await loadWritingSkill()
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

    const runDupe = similarCandidateReason(candidate, acceptedCandidates)
    if (runDupe) {
      result.skipped.push({ title: candidate.title, reason: runDupe })
      continue
    }

    try {
      const source = await fetchSourceContext(candidate)
      if (!sourceHasEnoughContext(candidate, source)) {
        result.skipped.push({ title: candidate.title, reason: 'insufficient source context for a full article' })
        continue
      }

      const article = await generateArticle(candidate, recentPosts, openai, source, writingSkill)
      const scheduledFor = tomorrowSchedule(result.created.length)
      acceptedCandidates.push(candidate)

      if (dryRun) {
        result.created.push({ id: 'dry-run', title: article.title, scheduled_for: scheduledFor })
        if (result.created.length >= maxPosts) break
        continue
      }

      const imageBase64 = skipImages ? null : await generateImage(article, openai)
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
      if (result.created.length >= maxPosts) break
    } catch (error: any) {
      const message = error?.message || String(error)
      if (/too short|insufficient source context/i.test(message)) {
        result.skipped.push({ title: candidate.title, reason: message })
      } else {
        result.failed.push({ title: candidate.title, error: message })
      }
    }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
