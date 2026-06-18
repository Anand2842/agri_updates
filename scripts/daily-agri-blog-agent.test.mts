import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildFallbackArticle,
  buildReviewDraft,
  parseEnvFile,
  parseMaxPostsPerRun,
  scheduleTimestampForIndex,
  validateGeneratedArticle,
} from './daily-agri-blog-agent.mts'

const candidate = {
  title: 'U.S. Seeks to Support Farmers with New China Trade Deal, Fertilizer Boosts',
  sourceUrl: 'https://civileats.com/2026/05/24/farmers-china-trade-deal-fertilizer-boosts',
  sourceName: 'civileats.com',
  summary:
    'Civil Eats reports that U.S. officials are pairing a new China trade deal with fertilizer supply measures to support farmers facing higher input costs and export uncertainty.',
  date: '2026-05-24',
  category: 'News',
  entities: ['Civil Eats', 'U.S.', 'China'],
}

test('buildReviewDraft creates a review-only draft without generic publish sections', () => {
  const article = buildReviewDraft(candidate, 'OpenAI article generation was unavailable for this run')

  assert.match(article.excerpt, /^Held for review:/)
  assert.match(article.content, /Automation note:/)
  assert.match(article.content, /Source Summary/)
  assert.match(article.content, /Review Checklist/)
  assert.match(article.content, /civileats\.com/)
  assert.doesNotMatch(article.content, /Why this matters/i)
  assert.doesNotMatch(article.content, /What to watch next/i)
})

test('validateGeneratedArticle rejects boilerplate news brief copy', () => {
  const article = {
    title: candidate.title,
    excerpt: candidate.summary,
    content: `
      <p>${candidate.summary}</p>
      <h2>Why this matters</h2>
      <p>This update may affect farmers, agribusiness teams, students, researchers, and policy watchers tracking Indian agriculture opportunities.</p>
      <h2>What to watch next</h2>
      <p>Readers should verify the official source, track implementation details, and compare this update with related Agri Updates coverage before taking action.</p>
      <p><strong>Source:</strong> <a href="${candidate.sourceUrl}">civileats.com</a></p>
    `,
    category: 'News',
    tags: ['agriculture', 'news'],
    imagePrompt: 'unused',
  }

  const issues = validateGeneratedArticle(article, candidate)

  assert.ok(issues.includes('contains generic section headings'))
  assert.ok(issues.includes('contains boilerplate advisory language'))
})

test('validateGeneratedArticle accepts grounded, attributed copy', () => {
  const article = {
    title: candidate.title,
    excerpt:
      'Civil Eats says U.S. officials are combining a new China trade deal with fertilizer supply support for farmers dealing with higher input costs.',
    content: `
      <p>According to civileats.com, U.S. officials are pairing a new China trade deal with fertilizer supply measures aimed at farmers managing higher input costs and export uncertainty.</p>
      <p>The source summary ties the policy move to fertilizer availability, trade conditions, and on-farm financial pressure rather than broad market commentary.</p>
      <p>For agriculture businesses, the immediate relevance is how fertilizer access and trade terms could affect farm margins, purchasing decisions, and crop planning.</p>
      <p>Agri Updates readers tracking inputs and farm policy should watch whether the measures change fertilizer flows or lower pressure on operating costs.</p>
      <p><strong>Source:</strong> <a href="${candidate.sourceUrl}">civileats.com</a></p>
    `,
    category: 'News',
    tags: ['agriculture', 'fertilizer', 'trade'],
    imagePrompt: 'unused',
  }

  assert.deepEqual(validateGeneratedArticle(article, candidate), [])
})

test('buildFallbackArticle produces source-attributed publishable copy without AI', () => {
  const article = buildFallbackArticle(candidate)

  assert.match(article.content, /civileats\.com/i)
  assert.match(article.content, /Source:/)
  assert.doesNotMatch(article.content, /Why this matters/i)
  assert.deepEqual(validateGeneratedArticle(article, candidate), [])
})

test('parseEnvFile parses simple dotenv content without clobbering shell precedence logic', () => {
  const parsed = parseEnvFile(`
    # comment
    NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
    export SUPABASE_SERVICE_ROLE_KEY="secret-value"
    OPENAI_API_KEY='test-key'
    INVALID LINE
  `)

  assert.deepEqual(parsed, {
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'secret-value',
    OPENAI_API_KEY: 'test-key',
  })
})

test('parseMaxPostsPerRun defaults to capped runs unless explicitly uncapped', () => {
  assert.equal(parseMaxPostsPerRun(undefined), 5)
  assert.equal(parseMaxPostsPerRun('all-qualified'), Number.POSITIVE_INFINITY)
  assert.equal(parseMaxPostsPerRun('12'), 12)
  assert.equal(parseMaxPostsPerRun('0'), 5)
})

test('scheduleTimestampForIndex rolls over to the next day after six slots', () => {
  const first = new Date(scheduleTimestampForIndex(0))
  const sixth = new Date(scheduleTimestampForIndex(5))
  const seventh = new Date(scheduleTimestampForIndex(6))

  assert.equal(first.getUTCHours(), 3)
  assert.equal(first.getUTCMinutes(), 0)
  assert.equal(sixth.getUTCDate(), first.getUTCDate())
  assert.equal(seventh.getUTCHours(), 3)
  assert.equal(seventh.getUTCMinutes(), 0)
  assert.equal(seventh.getTime() - first.getTime(), 24 * 60 * 60 * 1000)
})
