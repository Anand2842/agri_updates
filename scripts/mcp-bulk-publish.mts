#!/usr/bin/env node --experimental-strip-types
/**
 * MCP Bulk Publisher - Fetch 15 high-quality articles from MCP and publish them
 * 
 * Usage:
 *   node --experimental-strip-types scripts/mcp-bulk-publish.mts
 *   node --experimental-strip-types scripts/mcp-bulk-publish.mts --dry-run
 */

import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createBlogDraft, listRecentPosts, publishBlogPost } from '../mcp/src/backend.ts'

const MCP_ENDPOINT = 'https://twzhczgmcwuusldowyim.supabase.co/functions/v1/news-mcp'
const MCP_BEARER = 'mcp_QK8hXbz0upfk75yRz_VLIK_HWTYvahq1'

type MCPArticle = {
  id: string
  title: string
  summary: string
  url: string
  source: string
  tag: string
  score: number
  published_at: string
}

type CategoryConfig = {
  mcpTag: string
  blogCategory: string
  count: number
}

const CATEGORIES: CategoryConfig[] = [
  { mcpTag: 'MARKET', blogCategory: 'News', count: 5 },
  { mcpTag: 'POLICY', blogCategory: 'News', count: 5 },
  { mcpTag: 'RESEARCH', blogCategory: 'Research', count: 5 },
  { mcpTag: 'CLIMATE', blogCategory: 'News', count: 5 },
  { mcpTag: 'STARTUP', blogCategory: 'Startups', count: 5 },
  { mcpTag: 'FUNDING', blogCategory: 'Startups', count: 5 },
]

function hasFlag(name: string) {
  return process.argv.includes(`--${name}`)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function callMcpTool(toolName: string, args: Record<string, unknown> = {}) {
  const response = await fetch(MCP_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MCP_BEARER}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
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

  return JSON.parse(textBlock.text)
}

async function fetchArticlesByCategory(tag: string, limit: number): Promise<MCPArticle[]> {
  console.log(`  Fetching ${limit} articles with tag=${tag}...`)
  
  const result = await callMcpTool('search_news', {
    query: '',
    tag: tag,
    min_score: 7,
    limit: limit,
  })

  const articles = Array.isArray(result) ? result : result.items || result.articles || []
  return articles.slice(0, limit) as MCPArticle[]
}

async function fetchLatestArticles(limit: number): Promise<MCPArticle[]> {
  console.log(`  Fetching ${limit} latest articles...`)
  
  const result = await callMcpTool('list_latest', {
    limit: limit,
  })

  const articles = Array.isArray(result) ? result : result.items || result.articles || []
  return articles as MCPArticle[]
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) + '-' + Date.now().toString().slice(-4)
}

function generateExcerpt(summary: string, maxLen = 156): string {
  const clean = stripHtml(summary)
  return clean.length > maxLen ? clean.slice(0, maxLen - 3).trim() + '...' : clean
}

function generateContent(article: MCPArticle): string {
  const escapedTitle = escapeHtml(article.title)
  const escapedSummary = escapeHtml(article.summary)
  const sourceName = escapeHtml(article.source || 'the original source')
  const sourceUrl = article.url || ''
  const tagDisplay = escapeHtml(article.tag || 'General')
  
  const paragraphs = escapedSummary
    .split(/\.\s+/)
    .filter(p => p.trim().length > 20)
    .map(p => `<p class="mb-4">${p.trim()}.</p>`)
    .join('\n')

  return `
<article class="agri-news-post">
  <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-600 mb-8">
    <div class="flex items-center gap-3 mb-2">
      <span class="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">${tagDisplay}</span>
      <span class="text-sm text-green-700 font-semibold">Agriculture News</span>
    </div>
    <h1 class="text-2xl font-bold text-stone-900 mb-2">${escapedTitle}</h1>
    <p class="text-stone-600 text-sm">Published by ${sourceName}</p>
  </div>

  <div class="prose prose-stone max-w-none text-stone-700 leading-relaxed mb-8">
    ${paragraphs || `<p>${escapedSummary}</p>`}
  </div>

  <div class="bg-stone-50 p-6 rounded-xl border border-stone-200 mb-8">
    <h2 class="text-xl font-bold text-stone-800 mb-4">Why This Matters for Indian Agriculture</h2>
    <p class="text-stone-700">
      This development from ${sourceName} has significant implications for India's agriculture sector. 
      The update covers ${tagDisplay.toLowerCase()} trends that affect farmers, agribusinesses, 
      researchers, and policymakers across the country.
    </p>
    ${sourceUrl ? `
    <p class="mt-4">
      <strong>Source:</strong> <a href="${escapeHtml(sourceUrl)}" rel="nofollow noopener" target="_blank" class="text-green-700 hover:text-green-800 underline">${sourceName}</a>
    </p>` : ''}
  </div>

  <div class="bg-green-50 p-4 rounded-lg border border-green-200">
    <p class="text-sm text-green-800">
      <strong>Tags:</strong> agriculture, ${tagDisplay.toLowerCase()}, indian farming
    </p>
  </div>
</article>
`
}

function generateTags(article: MCPArticle): string[] {
  const baseTags = ['agriculture', 'india']
  const categoryTag = article.tag?.toLowerCase() || 'news'
  const sourceTag = article.source?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''
  
  const tags = [...baseTags, categoryTag]
  if (sourceTag && sourceTag.length > 2) tags.push(sourceTag)
  
  return [...new Set(tags)].slice(0, 8)
}

async function main() {
  const dryRun = hasFlag('dry-run')
  console.log('=== MCP Bulk Publisher ===')
  console.log(`Mode: ${dryRun ? 'DRY RUN (no writes)' : 'LIVE (will publish)'}`)
  console.log('')

  // Fetch articles from all categories
  const allArticles: Array<{ article: MCPArticle; config: CategoryConfig }> = []
  const failedFetches: Array<{ tag: string; error: string }> = []

  for (const config of CATEGORIES) {
    try {
      const articles = await fetchArticlesByCategory(config.mcpTag, config.count)
      console.log(`  ✓ Got ${articles.length} articles for ${config.mcpTag}`)
      
      for (const article of articles) {
        allArticles.push({ article, config })
      }
    } catch (error: any) {
      console.error(`  ✗ Failed to fetch ${config.mcpTag}: ${error.message}`)
      failedFetches.push({ tag: config.mcpTag, error: error.message })
    }
  }

  // If we don't have enough articles, fetch from latest to supplement
  if (allArticles.length < 15) {
    console.log('\nSupplementing with latest articles...')
    try {
      const latestArticles = await fetchLatestArticles(20)
      const categoryMap: Record<string, CategoryConfig> = {
        MARKET: { mcpTag: 'MARKET', blogCategory: 'News', count: 1 },
        POLICY: { mcpTag: 'POLICY', blogCategory: 'News', count: 1 },
        RESEARCH: { mcpTag: 'RESEARCH', blogCategory: 'Research', count: 1 },
        CLIMATE: { mcpTag: 'CLIMATE', blogCategory: 'News', count: 1 },
        STARTUP: { mcpTag: 'STARTUP', blogCategory: 'Startups', count: 1 },
      }
      
      for (const article of latestArticles) {
        if (allArticles.length >= 15) break
        const tag = article.tag?.toUpperCase() || ''
        const config = categoryMap[tag] || { mcpTag: tag, blogCategory: 'News', count: 1 }
        allArticles.push({ article, config })
      }
      console.log(`  ✓ Got ${latestArticles.length} additional latest articles`)
    } catch (error: any) {
      console.error(`  ✗ Failed to fetch latest: ${error.message}`)
      failedFetches.push({ tag: 'LATEST', error: error.message })
    }
  }

  console.log(`\nTotal articles fetched: ${allArticles.length}`)
  
  if (allArticles.length === 0) {
    console.error('No articles fetched. Exiting.')
    process.exit(1)
  }

  // Deduplicate by URL
  const seenUrls = new Set<string>()
  const uniqueArticles = allArticles.filter(({ article }) => {
    if (!article.url || seenUrls.has(article.url)) return false
    seenUrls.add(article.url)
    return true
  })

  console.log(`Unique articles: ${uniqueArticles.length}`)

  // Check for duplicates against existing posts
  const recentPosts = await listRecentPosts({ limit: 200 })
  const existingTitles = new Set(recentPosts.map(p => p.title?.toLowerCase() || ''))
  const existingUrls = new Set(recentPosts.map(p => {
    const match = p.content?.match(/href="([^"]+)"/)
    return match?.[1] || ''
  }).filter(Boolean))

  const publishable = uniqueArticles.filter(({ article }) => {
    const titleLower = article.title.toLowerCase()
    if (existingTitles.has(titleLower)) {
      console.log(`  Skipping duplicate title: ${article.title}`)
      return false
    }
    if (article.url && existingUrls.has(article.url)) {
      console.log(`  Skipping duplicate URL: ${article.url}`)
      return false
    }
    return true
  })

  console.log(`Publishable after dedup: ${publishable.length}`)

  // Publish articles
  const results = {
    published: [] as Array<{ id: string; title: string; category: string; slug: string }>,
    failed: [] as Array<{ title: string; error: string }>,
  }

  for (const { article, config } of publishable.slice(0, 15)) {
    const slug = generateSlug(article.title)
    const content = generateContent(article)
    const excerpt = generateExcerpt(article.summary)
    const tags = generateTags(article)

    console.log(`\nPublishing: ${article.title}`)
    console.log(`  Category: ${config.blogCategory}`)

    if (dryRun) {
      console.log(`  [DRY RUN] Would publish with slug: ${slug}`)
      results.published.push({ id: 'dry-run', title: article.title, category: config.blogCategory, slug })
      continue
    }

    try {
      const post = await createBlogDraft({
        title: article.title,
        content: content,
        excerpt: excerpt,
        category: config.blogCategory,
        tags: tags,
        author_name: 'Agri Updates Editorial',
        status: 'published',
        source: 'mcp_bulk_publish',
        source_url: article.url,
        source_name: article.source,
      })

      // Publish immediately
      await publishBlogPost({ post_id: post.id })

      results.published.push({ id: post.id, title: article.title, category: config.blogCategory, slug: post.slug })
      console.log(`  ✓ Published: ${post.slug}`)
    } catch (error: any) {
      console.error(`  ✗ Failed: ${error.message}`)
      results.failed.push({ title: article.title, error: error.message })
    }
  }

  // Report
  console.log('\n=== Results ===')
  console.log(`Total fetched: ${allArticles.length}`)
  console.log(`Published: ${results.published.length}`)
  console.log(`Failed: ${results.failed.length}`)
  console.log(`Failed fetches: ${failedFetches.length}`)

  if (results.published.length > 0) {
    console.log('\nPublished articles:')
    for (const p of results.published) {
      console.log(`  - [${p.category}] ${p.title}`)
    }
  }

  if (results.failed.length > 0) {
    console.log('\nFailed articles:')
    for (const f of results.failed) {
      console.log(`  - ${f.title}: ${f.error}`)
    }
  }

  if (failedFetches.length > 0) {
    console.log('\nFailed fetches:')
    for (const f of failedFetches) {
      console.log(`  - ${f.tag}: ${f.error}`)
    }
  }

  console.log('\nDone!')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
