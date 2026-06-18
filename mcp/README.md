# Agri Updates MCP Service

This directory contains the submission-ready, tool-only MCP service for ChatGPT.

## What It Does

- Exposes public read tools for published Agri Updates posts.
- Exposes OAuth-protected write tools for creating drafts, handling images, and scheduling posts.
- Reuses the main site's Supabase data, storage bucket, and scheduled publishing pipeline.
- Runs over stateless Streamable HTTP at `/mcp`, which makes it suitable for a separate deployment target such as `mcp.agriupdates.online`.

## Tool Surface

Public:

- `search_published_posts`
- `get_published_post`
- `list_recent_published_posts`

Admin-only via Supabase OAuth:

- `create_draft_post`
- `generate_post_image`
- `upload_post_image`
- `attach_post_image`
- `schedule_post`

Not exposed in the public ChatGPT app:

- raw update generation
- immediate publish
- draft lookup
- local file-path uploads

## Auth Model

- Resource server metadata is served from `/.well-known/oauth-protected-resource/mcp`.
- Authorization server metadata points to Supabase Auth.
- Public read tools work without authentication.
- Write tools require a valid Supabase OAuth bearer token.
- Write tools are additionally limited to users who resolve to `admin` through the shared role logic in `/Users/anand/Downloads/agri_updates/src/lib/staff-access.ts`.

Current Supabase OAuth limitation:

- Custom scopes are not currently supported by Supabase OAuth 2.1, so this service uses standard identity scopes: `openid`, `email`, and `profile`.
- Admin gating is enforced by identity and role checks, not by a custom `editorial.write` scope.

## Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` or `SITE_URL`
- `MCP_BASE_URL`

Optional:

- `OPENAI_API_KEY`
- `OPENAI_IMAGE_MODEL`
- `MCP_SUPPORT_URL`
- `MCP_PRIVACY_URL`
- `MCP_HOST`
- `MCP_PORT`
- `MCP_ALLOWED_HOSTS`
- `SUPABASE_OAUTH_ISSUER`

Recommended production values:

- `MCP_BASE_URL=https://mcp.agriupdates.online/mcp`
- `MCP_SUPPORT_URL=https://www.agriupdates.online/contact`
- `MCP_PRIVACY_URL=https://www.agriupdates.online/privacy`
- `MCP_ALLOWED_HOSTS=mcp.agriupdates.online`

## Local Run

From the repo root:

```bash
npm run mcp:start
```

For stdio:

```bash
npm run mcp:stdio
```

For contract tests:

```bash
npm run mcp:test
```

## Deployment Notes

- Deploy this `mcp/` directory as a separate service/project from the main Next.js site.
- Point a stable custom domain such as `mcp.agriupdates.online` at that service.
- Keep the main Next.js app deployed separately because it hosts the OAuth consent page at `/oauth/consent`.
- The MCP server is stateless, so it can run behind a load balancer or serverless platform as long as the deployment supports ordinary HTTP POST handling.

## Main Site Changes Required By This Service

The main site now includes:

- `/oauth/consent`
- `/oauth/consent/decision`
- login redirect preservation for OAuth consent handoff
- shared staff role logic for both the site and the MCP service

## ChatGPT Developer Mode Checklist

1. Enable Supabase OAuth 2.1 and register the ChatGPT app client in Supabase.
2. Configure the client to request `openid email profile`.
3. Deploy the main site and the MCP service.
4. Confirm `/.well-known/oauth-protected-resource/mcp` resolves on the MCP domain.
5. Add the hosted MCP URL in ChatGPT Developer Mode.
6. Verify unauthenticated read calls work.
7. Verify ChatGPT prompts for OAuth on the first write call.
8. Verify non-admin accounts are denied.
9. Verify admin accounts can create a draft, attach an image, and schedule a post.

## App Metadata Inputs

- Suggested display name: `Agri Updates Publishing`
- Suggested icon: `https://www.agriupdates.online/logo.png`
- Privacy URL: `https://www.agriupdates.online/privacy`
- Support URL: `https://www.agriupdates.online/contact`
