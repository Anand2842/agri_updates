import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {
  attachImageToPost,
  createBlogDraft,
  getBlogPost,
  scheduleBlogPost,
  uploadBlogImage,
} from '../src/tools.js'
import { hasServiceRoleKey } from '../src/supabase.js'

if (!hasServiceRoleKey) {
  console.error(`
SUPABASE_SERVICE_ROLE_KEY is missing.

The MCP can read posts with the public anon key, but image upload, draft creation,
and scheduling require the service-role key because these operations bypass RLS.

Add this to /Users/anand/Downloads/agri_updates/.env.local:

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

You can get it from:
https://supabase.com/dashboard/project/ulqzicqxnaygfergqrbe/settings/api

Then rerun:
cd /Users/anand/Downloads/agri_updates/mcp
npm run test:post
`)
  process.exit(1)
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f4f0e8"/>
  <rect x="60" y="60" width="1080" height="510" rx="32" fill="#1f4d2b"/>
  <text x="110" y="210" fill="#f6f0dc" font-family="Arial, sans-serif" font-size="58" font-weight="700">Agri Updates MCP Test</text>
  <text x="110" y="295" fill="#d7e8a4" font-family="Arial, sans-serif" font-size="34">Draft created through Codex tooling</text>
  <text x="110" y="372" fill="#ffffff" font-family="Arial, sans-serif" font-size="28">Image upload + post creation + scheduling check</text>
  <circle cx="1010" cy="420" r="82" fill="#d7e8a4"/>
  <path d="M970 425c38-88 103-116 158-114-24 66-74 111-158 114Z" fill="#f6f0dc"/>
</svg>`

const imagePath = path.join(os.tmpdir(), `agri-updates-mcp-test-${Date.now()}.svg`)
await fs.writeFile(imagePath, svg)

const image = await uploadBlogImage({
  file_path: imagePath,
  filename: 'agri-updates-mcp-test.svg',
  content_type: 'image/svg+xml',
})

const created = await createBlogDraft({
  title: `Codex MCP Test Draft ${new Date().toISOString()}`,
  content: `
    <p>This is a controlled test draft created through the new Agri Updates MCP implementation.</p>
    <p>It validates that an AI tool can create blog content, upload an image, and schedule the post without using the admin UI.</p>
    <p>The post is intentionally scheduled far in the future so it will not appear publicly during normal verification.</p>
  `,
  excerpt: 'Controlled MCP test draft for Agri Updates blog publishing workflow.',
  category: 'Research',
  tags: ['mcp', 'codex-test', 'automation'],
  image_url: image.public_url,
  author_name: 'Codex MCP',
  status: 'draft',
  source: 'mcp_test',
})

await attachImageToPost({
  post_id: created.id,
  image_url: image.public_url,
})

const scheduled = await scheduleBlogPost({
  post_id: created.id,
  scheduled_for: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
})

const fetched = await getBlogPost({ id: created.id })

console.log(JSON.stringify({ image, created, scheduled, fetched }, null, 2))
