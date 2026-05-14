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
- `get_blog_post`
- `create_blog_draft`
- `create_blog_from_raw_update`
- `upload_blog_image`
- `attach_image_to_post`
- `schedule_blog_post`
- `publish_blog_post`
