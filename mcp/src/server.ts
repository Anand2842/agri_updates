#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  attachImageSchema,
  attachImageToPost,
  createBlogDraft,
  createBlogDraftSchema,
  createBlogFromRawUpdate,
  createFromRawSchema,
  getBlogPost,
  getPostSchema,
  listRecentPosts,
  listRecentSchema,
  publishBlogPost,
  publishSchema,
  scheduleBlogPost,
  scheduleSchema,
  textResult,
  uploadBlogImage,
  uploadImageSchema,
} from './tools.js'

const server = new McpServer({
  name: 'agri-updates',
  version: '0.1.0',
})

server.registerTool(
  'list_recent_posts',
  {
    title: 'List recent posts',
    description: 'List recent Agri Updates posts for duplicate checks, internal links, and editorial context.',
    inputSchema: listRecentSchema,
  },
  async (input) => textResult(await listRecentPosts(input)),
)

server.registerTool(
  'get_blog_post',
  {
    title: 'Get blog post',
    description: 'Fetch a blog post by id or slug.',
    inputSchema: getPostSchema,
  },
  async (input) => textResult(await getBlogPost(input)),
)

server.registerTool(
  'create_blog_draft',
  {
    title: 'Create blog draft',
    description: 'Create a draft or pending-review blog post in Agri Updates.',
    inputSchema: createBlogDraftSchema,
  },
  async (input) => textResult(await createBlogDraft(input)),
)

server.registerTool(
  'create_blog_from_raw_update',
  {
    title: 'Create blog from raw update',
    description: 'Convert raw agri update text into a structured draft using local parsing rules.',
    inputSchema: createFromRawSchema,
  },
  async (input) => textResult(await createBlogFromRawUpdate(input)),
)

server.registerTool(
  'upload_blog_image',
  {
    title: 'Upload blog image',
    description: 'Upload an image from a local file, URL, or base64 payload to Supabase Storage.',
    inputSchema: uploadImageSchema,
  },
  async (input) => textResult(await uploadBlogImage(input)),
)

server.registerTool(
  'attach_image_to_post',
  {
    title: 'Attach image to post',
    description: 'Set the image_url field for an existing post.',
    inputSchema: attachImageSchema,
  },
  async (input) => textResult(await attachImageToPost(input)),
)

server.registerTool(
  'schedule_blog_post',
  {
    title: 'Schedule blog post',
    description: 'Mark a post as scheduled for automatic publishing by the existing cron endpoint.',
    inputSchema: scheduleSchema,
  },
  async (input) => textResult(await scheduleBlogPost(input)),
)

server.registerTool(
  'publish_blog_post',
  {
    title: 'Publish blog post',
    description: 'Immediately publish a post. Requires MCP_ADMIN_TOKEN when configured.',
    inputSchema: publishSchema,
  },
  async (input) => textResult(await publishBlogPost(input)),
)

const transport = new StdioServerTransport()
await server.connect(transport)
