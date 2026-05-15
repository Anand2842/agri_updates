# Agri Updates MCP

Local stdio MCP server for creating and scheduling Agri Updates blog posts from AI tools such as Claude Desktop, Codex, Cursor, and other MCP clients.

## Setup

```bash
cd mcp
npm install
npm run build
```

Required environment variables can be loaded from the repo root `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Optional write controls:

```bash
MCP_WRITE_TOKEN=...
MCP_ADMIN_TOKEN=...
```

If no MCP token is configured, local tools can write without a token. For shared or remote usage, set tokens.

## Claude Desktop Example

```json
{
  "mcpServers": {
    "agri-updates": {
      "command": "node",
      "args": ["/Users/anand/Downloads/agri_updates/mcp/dist/src/server.js"],
      "env": {
        "MCP_WRITE_TOKEN": "your-write-token",
        "MCP_ADMIN_TOKEN": "your-admin-token"
      }
    }
  }
}
```

## Tools

- `list_recent_posts`
- `search_posts`
- `get_blog_post`
- `create_blog_draft`
- `create_blog_from_raw_update`
- `upload_blog_image`
- `attach_image_to_post`
- `schedule_blog_post`
- `publish_blog_post`

## Daily Automation

The repo also includes a nightly worker for Gmail-fed article production:

```bash
npm run automation:daily-agri -- --input=/path/to/feed.csv --dry-run
npm run automation:daily-agri -- --dry-run
```

Defaults:

```bash
AGRI_FEED_GMAIL_QUERY="from:onboarding@resend.dev to:aanand.ak15@gmail.com newer_than:2d"
AGRI_IMAGE_MODEL=gpt-image-2
AGRI_TEXT_MODEL=gpt-5.4-mini
AGRI_SKIP_IMAGES=1
AGRI_MAX_POSTS_PER_RUN=5
```

When `--input` is omitted, the worker reads the newest matching Gmail feed through the OAuth token created by the Gmail MCP auth flow in `~/.gmail-mcp/`. It also accepts CSV, HTML, JSON, or stdin (`--input=-`). It deduplicates against recent Agri Updates posts and within the current feed, skips non-agri items, creates SEO-ready article drafts, uploads generated images when `OPENAI_API_KEY` is available, and schedules qualified posts for the next day.
