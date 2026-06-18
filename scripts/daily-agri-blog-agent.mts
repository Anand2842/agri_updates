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
} from '../mcp/src/backend.ts'

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

type CreatedResult = {
  id: string
  title: string
  status: 'scheduled' | 'pending_review'
  scheduled_for: string | null
  reason?: string
}

type RunResult = {
  processed: number
  created: CreatedResult[]
  skipped: Array<{ title: string; reason: string }>
  duplicates: Array<{ title: string; reason: string }>
  failed: Array<{ title: string; error: string }>
  dryRun: boolean
}

type PreparedArticle = {
  article: GeneratedArticle
  status: 'scheduled' | 'pending_review'
  reviewReason?: string
}

const DEFAULT_QUERY = 'from:onboarding@resend.dev to:aanand.ak15@gmail.com newer_than:2d'
const DEFAULT_IMAGE_MODEL = 'gpt-image-2'
const CATEGORIES = ['Research', 'Jobs', 'Grants', 'News', 'Startups', 'Warnings', 'Conferences']
const GMAIL_CONFIG_DIR = path.join(os.homedir(), '.gmail-mcp')
const DEFAULT_MAX_POSTS_PER_RUN = 5

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

export function parseEnvFile(text: string) {
  const entries: Record<string, string> = {}

  for (const rawLine of text.split(/\r?\n/)) {
    const trimmed = rawLine.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const normalized = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed
    const firstEquals = normalized.indexOf('=')
    if (firstEquals <= 0) continue

    const key = normalized.slice(0, firstEquals).trim()
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue

    let value = normalized.slice(firstEquals + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    entries[key] = value
  }

  return entries
}

async function loadAutomationEnvFiles(cwd = process.cwd()) {
  const mergedEntries: Record<string, string> = {}

  for (const filename of ['.env', '.env.local']) {
    const filePath = path.join(cwd, filename)

    try {
      const fileContents = await fs.readFile(filePath, 'utf8')
      Object.assign(mergedEntries, parseEnvFile(fileContents))
    } catch (error: any) {
      if (error?.code !== 'ENOENT') throw error
    }
  }

  for (const [key, value] of Object.entries(mergedEntries)) {
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
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
    return items
      .map(candidateFromRecord)
      .filter((candidate: FeedCandidate | null): candidate is FeedCandidate => Boolean(candidate))
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

const MCP_ENDPOINT = 'https://twzhczgmcwuusldowyim.supabase.co/functions/v1/news-mcp'
const MCP_BEARER = 'mcp_QK8hXbz0upfk75yRz_VLIK_HWTYvahq1'

async function readCandidatesFromMcp(): Promise<FeedCandidate[]> {
  const response = await fetch(MCP_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MCP_BEARER}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'list_latest',
        arguments: {},
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`MCP endpoint returned ${response.status}: ${await response.text()}`)
  }

  const rpc = await response.json() as any
  const content = rpc.result?.content
  if (!Array.isArray(content)) {
    throw new Error(`MCP response missing content array: ${JSON.stringify(rpc)}`)
  }

  const textBlock = content.find((block: any) => block.type === 'text')
  if (!textBlock?.text) {
    throw new Error(`MCP response missing text content: ${JSON.stringify(content)}`)
  }

  const items = JSON.parse(textBlock.text)
  const list = Array.isArray(items) ? items : items.items || items.articles || []

  const candidates = list.map((item: any): FeedCandidate | null => {
    const title = item.title
    if (!title) return null

    const tag = item.tag || ''
    const joined = `${title} ${item.summary || ''} ${tag}`

    return {
      title: stripHtml(String(title)).slice(0, 180),
      sourceUrl: item.url || undefined,
      sourceName: item.source || undefined,
      summary: stripHtml(String(item.summary || title)).slice(0, 1200),
      date: item.published_at || undefined,
      category: CATEGORIES.includes(inferCategory(joined)) ? inferCategory(joined) : inferCategory(tag),
      entities: extractEntities(joined),
    }
  })

  return candidates.filter((c: FeedCandidate | null): c is FeedCandidate => Boolean(c))
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
    if (candidate.sourceUrl && String(post.dedupe_key || '') === candidate.sourceUrl) return `source URL already used by "${post.title}"`
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

export function parseMaxPostsPerRun(value?: string) {
  if (!value) return DEFAULT_MAX_POSTS_PER_RUN
  if (value === 'all-qualified') return Number.POSITIVE_INFINITY
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_POSTS_PER_RUN
}

function maxPostsPerRun() {
  const value = env('AGRI_MAX_POSTS_PER_RUN', String(DEFAULT_MAX_POSTS_PER_RUN))
  return parseMaxPostsPerRun(value)
}

export function scheduleTimestampForIndex(index: number) {
  const slotsPerDay = 6
  const daysOffset = Math.floor(index / slotsPerDay)
  const slotIndex = index % slotsPerDay
  const date = new Date()
  date.setDate(date.getDate() + 1 + daysOffset)
  date.setHours(8 + slotIndex * 2, 30, 0, 0)
  return date.toISOString()
}

function qualifies(candidate: FeedCandidate) {
  const text = `${candidate.title} ${candidate.summary}`
  if (text.length < 100) return 'not enough substance'
  if (/sample grant proposal|proposal template|template for/i.test(text)) return 'template or sample content'
  if (
    !/agri|farm|crop|soil|seed|fertili[sz]er|rural|food|horticulture|dairy|icar|apeda|mandi|pesticide|weather|irrigation|startup|subsidy|scheme/i.test(
      text,
    )
  ) {
    return 'not clearly agriculture-related'
  }
  if (/crypto|betting|casino|adult|celebrity gossip/i.test(text)) return 'excluded topic'
  return null
}

function sourceAttributionLine(candidate: FeedCandidate) {
  if (!candidate.sourceUrl) return ''
  const label = escapeHtml(candidate.sourceName || candidate.sourceUrl)
  return `<p><strong>Source:</strong> <a href="${candidate.sourceUrl}" rel="nofollow noopener" target="_blank">${label}</a></p>`
}

function fallbackRelevanceParagraph(candidate: FeedCandidate) {
  const text = `${candidate.title} ${candidate.summary}`.toLowerCase()

  if (/grant|funding|call for proposals|subsidy|programme|program/i.test(text)) {
    return 'For agriculture organisations, researchers, startups, and producer groups, the immediate relevance is where grant capital or public support may become available and which farming priorities are being funded.'
  }

  if (/fertili[sz]er|input cost|urea|dap|potash/i.test(text)) {
    return 'For farmers and input suppliers, the agriculture angle is direct because fertiliser availability and pricing can influence sowing plans, working capital needs, and crop margins.'
  }

  if (/trade|export|import|tariff|shipment|procure/i.test(text)) {
    return 'The agriculture significance is tied to how trade or procurement changes can move crop demand, input flows, and price signals across farm and agribusiness markets.'
  }

  if (/weather|climate|drought|rain|irrigation|heat/i.test(text)) {
    return 'For growers and rural planners, the key issue is how weather and climate conditions could affect field operations, water use, and crop risk management.'
  }

  if (/research|study|scientist|variet|seed|technology|innovation/i.test(text)) {
    return 'The practical agriculture relevance comes from how the reported research or technology could influence crop performance, farm management, or the next cycle of advisory and extension work.'
  }

  return 'The agriculture relevance comes from the operational, funding, or market signal this item gives to farmers, agribusiness operators, and rural institutions following sector developments.'
}

export function buildFallbackArticle(candidate: FeedCandidate): GeneratedArticle {
  const sourceLabel = escapeHtml(candidate.sourceName || candidate.sourceUrl || 'the original source')
  const sourceLead = candidate.sourceName
    ? `${escapeHtml(candidate.sourceName)} reports that ${escapeHtml(candidate.summary)}`
    : escapeHtml(candidate.summary)
  const dateParagraph = candidate.date
    ? `<p>The feed marks this item with the date ${escapeHtml(candidate.date)}, which helps place the update in the current agriculture news cycle.</p>`
    : ''
  const entities = candidate.entities.length > 0
    ? `<p>The item references ${escapeHtml(candidate.entities.slice(0, 6).join(', '))}, indicating the stakeholders or institutions most directly connected to the update.</p>`
    : ''

  return {
    title: candidate.title,
    excerpt: candidate.summary.slice(0, 156).trim() + (candidate.summary.length > 156 ? '...' : ''),
    content: `
      <p>${sourceLead}.</p>
      <p>${escapeHtml(fallbackRelevanceParagraph(candidate))}</p>
      ${dateParagraph}
      ${entities}
      <p>This fallback article is based only on the incoming feed item, so any follow-up reporting should verify added details against the original publication by ${sourceLabel}.</p>
      ${sourceAttributionLine(candidate)}
    `,
    category: CATEGORIES.includes(candidate.category) ? candidate.category : 'News',
    tags: Array.from(new Set(['agriculture', candidate.category, ...candidate.entities])).slice(0, 8),
    imagePrompt: `Create a clean Agri Updates blog hero image for: ${candidate.title}. Use an India-first agriculture news style, modern editorial layout, green and earth-tone palette, realistic field/agritech visual, no misleading text.`,
  }
}

export function buildReviewDraft(candidate: FeedCandidate, reviewReason: string): GeneratedArticle {
  const entities = candidate.entities.length > 0 ? escapeHtml(candidate.entities.slice(0, 6).join(', ')) : 'None detected'
  const dateLine = candidate.date ? `<p><strong>Feed date:</strong> ${escapeHtml(candidate.date)}</p>` : ''

  return {
    title: candidate.title,
    excerpt: `Held for review: ${candidate.summary.slice(0, 132).trim()}${candidate.summary.length > 132 ? '...' : ''}`,
    content: `
      <p><strong>Automation note:</strong> This draft was held for editorial review because ${escapeHtml(reviewReason)}.</p>
      <h2>Source Summary</h2>
      <p>${escapeHtml(candidate.summary)}</p>
      <h2>Review Checklist</h2>
      <p>Rewrite this item with source-grounded facts, named stakeholders, dates, numbers, and a concrete agriculture angle before publishing.</p>
      <p><strong>Detected entities:</strong> ${entities}</p>
      ${dateLine}
      ${sourceAttributionLine(candidate)}
    `,
    category: CATEGORIES.includes(candidate.category) ? candidate.category : 'News',
    tags: Array.from(new Set(['agriculture', 'pending-review', candidate.category, ...candidate.entities])).slice(0, 8),
    imagePrompt: `Create a clean Agri Updates blog hero image for: ${candidate.title}. Use an India-first agriculture news style, modern editorial layout, green and earth-tone palette, realistic field/agritech visual, no misleading text.`,
  }
}

const GENERIC_SECTION_PATTERNS = [
  /<h2>\s*why this matters\s*<\/h2>/i,
  /<h2>\s*what to watch next\s*<\/h2>/i,
  /<h2>\s*key takeaways\s*<\/h2>/i,
  /<h2>\s*bottom line\s*<\/h2>/i,
]

const BOILERPLATE_LANGUAGE_PATTERNS = [
  /this update may affect farmers, agribusiness teams, students, researchers, and policy watchers/i,
  /readers should verify the official source, track implementation details, and compare this update/i,
  /before taking action/i,
  /tracking indian agriculture opportunities/i,
]

export function validateGeneratedArticle(article: GeneratedArticle, candidate: FeedCandidate) {
  const issues: string[] = []
  const contentText = stripHtml(article.content)
  const contentLower = article.content.toLowerCase()
  const candidateTokens = new Set(normalizeForSimilarity(`${candidate.title} ${candidate.summary} ${candidate.entities.join(' ')}`))
  const articleTokens = new Set(normalizeForSimilarity(`${article.title} ${article.excerpt} ${contentText}`))
  const sharedTokenCount = [...candidateTokens].filter((token) => articleTokens.has(token)).length
  const hasSourceAttribution =
    (candidate.sourceName && new RegExp(candidate.sourceName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(contentText)) ||
    (candidate.sourceUrl && article.content.includes(candidate.sourceUrl))

  if (contentText.length < 220) issues.push('article body is too thin for publication')
  if (GENERIC_SECTION_PATTERNS.some((pattern) => pattern.test(article.content))) issues.push('contains generic section headings')
  if (BOILERPLATE_LANGUAGE_PATTERNS.some((pattern) => pattern.test(contentLower))) issues.push('contains boilerplate advisory language')
  if (sharedTokenCount < 6) issues.push('article is weakly grounded in the source summary')
  if (candidate.sourceUrl && !hasSourceAttribution) issues.push('missing source attribution in article body')

  return issues
}

async function prepareArticle(candidate: FeedCandidate, relatedPosts: any[], openai: OpenAI | null): Promise<PreparedArticle> {
  if (!openai) {
    const article = fallbackArticle(candidate)
    const issues = validateGeneratedArticle(article, candidate)

    if (issues.length === 0) {
      return { article, status: 'scheduled' }
    }

    const reviewReason = `fallback article validation failed: ${issues.join('; ')}`
    return {
      article: buildReviewDraft(candidate, reviewReason),
      status: 'pending_review',
      reviewReason,
    }
  }

  try {
    const article = await generateArticle(candidate, relatedPosts, openai)
    const issues = validateGeneratedArticle(article, candidate)
    if (issues.length > 0) {
      const reviewReason = issues.join('; ')
      return {
        article: buildReviewDraft(candidate, reviewReason),
        status: 'pending_review',
        reviewReason,
      }
    }

    return { article, status: 'scheduled' }
  } catch (error: any) {
    const reviewReason = `AI article generation failed: ${error?.message || String(error)}`
    return {
      article: buildReviewDraft(candidate, reviewReason),
      status: 'pending_review',
      reviewReason,
    }
  }
}

function scheduledCount(items: CreatedResult[]) {
  return items.filter((item) => item.status === 'scheduled').length
}

function createdResult(id: string, title: string, status: 'scheduled' | 'pending_review', scheduled_for: string | null, reason?: string): CreatedResult {
  return reason ? { id, title, status, scheduled_for, reason } : { id, title, status, scheduled_for }
}

function aiWritingPrompt(candidate: FeedCandidate, relatedPosts: any[]) {
  return [
    'Write a publishable Agri Updates article as strict JSON with title, excerpt, content, category, tags, imagePrompt.',
    'The article must be HTML and grounded only in the provided candidate feed item and related posts.',
    'Use 3 to 6 short paragraphs with concrete facts from the source summary, title, source metadata, and feed date when available.',
    'Name the source in the article body when source metadata is available and include a source link in the closing paragraph.',
    'Explain the agriculture relevance with specific stakeholders, markets, crops, inputs, policy, trade, research, or farm operations mentioned by the source.',
    'Do not invent facts, quotes, statistics, dates, locations, or outcomes that are not supported by the candidate data.',
    'Do not use generic sections or phrases such as "Why this matters", "What to watch next", "Key takeaways", "Bottom line", "This update may affect...", or "Readers should verify...".',
    'Do not write vague audience advice or generic disclaimers.',
    'Use natural internal backlinks only when a provided related post is genuinely relevant.',
    '',
    `Candidate: ${JSON.stringify(candidate)}`,
    `Related posts: ${JSON.stringify(relatedPosts.slice(0, 20))}`,
  ].join('\n')
}

function reviewStatusForWrite(status: 'scheduled' | 'pending_review') {
  return status === 'scheduled' ? 'draft' : 'pending_review'
}

function scheduledTimestampForResult(result: RunResult, prepared: PreparedArticle) {
  if (prepared.status !== 'scheduled') return null
  return scheduleTimestampForIndex(scheduledCount(result.created))
}

function shouldCreateImage(prepared: PreparedArticle, skipImages: boolean) {
  return prepared.status === 'scheduled' && !skipImages
}

function fallbackArticle(candidate: FeedCandidate): GeneratedArticle {
  return buildFallbackArticle(candidate)
}

async function generateArticle(candidate: FeedCandidate, relatedPosts: any[], openai: OpenAI | null) {
  if (!openai) return fallbackArticle(candidate)

  const response = await openai.responses.create({
    model: env('AGRI_TEXT_MODEL', 'gpt-5.4-mini')!,
    input: [
      {
        role: 'system',
        content:
          'You write Agri Updates articles. Follow the user instructions exactly and return strict JSON with title, excerpt, content, category, tags, imagePrompt. Content must be HTML, factual, source-attributed, specific, and ready to publish without generic filler.',
      },
      {
        role: 'user',
        content: aiWritingPrompt(candidate, relatedPosts),
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
  await loadAutomationEnvFiles()

  const dryRun = hasFlag('dry-run') || env('AGRI_DRY_RUN') === '1'
  const inputPath = argValue('input') || env('AGRI_FEED_INPUT_FILE')
  const gmailQuery = env('AGRI_FEED_GMAIL_QUERY', DEFAULT_QUERY)!
  const openaiKey = env('OPENAI_API_KEY')
  const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null
  const skipImages = hasFlag('skip-images') || env('AGRI_SKIP_IMAGES') === '1' || !openai
  const result: RunResult = { processed: 0, created: [], skipped: [], duplicates: [], failed: [], dryRun }

  const feedSource = env('AGRI_FEED_SOURCE', inputPath ? 'file' : 'gmail')

  let fatalError = false

  try {
    let candidates: FeedCandidate[]
    if (inputPath) {
      candidates = await readCandidatesFromInput(inputPath)
    } else if (feedSource === 'mcp') {
      candidates = await readCandidatesFromMcp()
    } else {
      candidates = await readCandidatesFromGmail(gmailQuery)
    }
    const recentPosts = await listRecentPosts({ limit: Number(env('AGRI_DEDUPE_POST_LOOKBACK', '500')) })
    const acceptedCandidates: FeedCandidate[] = []
    const maxPosts = maxPostsPerRun()
    result.processed = candidates.length

    for (const candidate of candidates) {
      const qualificationReason = qualifies(candidate)
      if (qualificationReason) {
        result.skipped.push({ title: candidate.title, reason: qualificationReason })
        continue
      }

      const existingDupe = duplicateReason(candidate, recentPosts)
      if (existingDupe) {
        result.duplicates.push({ title: candidate.title, reason: existingDupe })
        continue
      }

      const runDupe = similarCandidateReason(candidate, acceptedCandidates)
      if (runDupe) {
        result.duplicates.push({ title: candidate.title, reason: runDupe })
        continue
      }

      try {
        const prepared = await prepareArticle(candidate, recentPosts, openai)
        const scheduledFor = scheduledTimestampForResult(result, prepared)
        acceptedCandidates.push(candidate)

        if (dryRun) {
          result.created.push(createdResult('dry-run', prepared.article.title, prepared.status, scheduledFor, prepared.reviewReason))
          if (result.created.length >= maxPosts) break
          continue
        }

        const imageBase64 = shouldCreateImage(prepared, skipImages) ? await generateImage(prepared.article, openai) : null
        const uploadedImage = imageBase64
          ? await uploadBlogImage({
              base64: imageBase64,
              filename: `${prepared.article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 70)}.png`,
              content_type: 'image/png',
            })
          : null

        const post = await createBlogDraft({
          title: prepared.article.title,
          content: prepared.article.content,
          excerpt: prepared.article.excerpt,
          category: CATEGORIES.includes(prepared.article.category) ? prepared.article.category : candidate.category,
          tags: prepared.article.tags,
          image_url: uploadedImage?.public_url,
          author_name: 'Agri Updates Automation',
          status: reviewStatusForWrite(prepared.status),
          source: 'daily_agri_blog_agent',
          source_url: candidate.sourceUrl,
          source_name: candidate.sourceName,
          canonical_url: candidate.sourceUrl,
          dedupe_key: candidate.sourceUrl || `${candidate.title}:${candidate.sourceName || ''}`,
        })

        if (prepared.status === 'pending_review') {
          result.created.push(createdResult(post.id, post.title, 'pending_review', null, prepared.reviewReason))
        } else {
          const scheduled = await scheduleBlogPost({ post_id: post.id, scheduled_for: scheduledFor! })
          result.created.push(createdResult(post.id, post.title, 'scheduled', String(scheduled.scheduled_for)))
        }

        if (result.created.length >= maxPosts) break
      } catch (error: any) {
        result.failed.push({ title: candidate.title, error: error?.message || String(error) })
      }
    }
  } catch (error: any) {
    const message = error?.message || String(error)

    if (!message.startsWith('No Gmail feed emails matched query:') && !message.startsWith('MCP endpoint returned')) {
      fatalError = true
      result.failed.push({
        title: inputPath ? path.basename(inputPath) : 'automation',
        error: message,
      })
    }
  }

  console.log(JSON.stringify(result, null, 2))

  if (fatalError) {
    process.exitCode = 1
  }
}

if ((import.meta as any).main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
}
