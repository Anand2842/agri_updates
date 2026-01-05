# Webhook API Setup Instructions

## Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Supabase Service Role Key (for server-side operations that bypass RLS)
# ⚠️ NEVER expose this key to the client! Only use in API routes
# Get this from: Supabase Dashboard → Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# API Key for Webhook Authentication
# This key is required for external services to POST opportunities to /api/posts
# Generate a secure random key (e.g., using: openssl rand -base64 32)
PLANTSAATHI_API_KEY=your-secure-api-key-here
```

## Existing Variables

Make sure you already have these configured:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Generating a Secure API Key

Run this command to generate a secure random API key:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `PLANTSAATHI_API_KEY`.

## Testing the Webhook

Once configured, test the endpoint with:

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PLANTSAATHI_API_KEY" \
  -d '{
    "title": "Software Engineer at AgriTech Startup",
    "category": "Jobs",
    "company": "GreenHarvest Technologies",
    "location": "Bangalore, India",
    "job_type": "Full-time",
    "salary_range": "₹8-12 LPA",
    "application_link": "https://example.com/apply",
    "content": "We are looking for a passionate software engineer...",
    "tags": ["engineering", "agritech", "full-time"]
  }'
```

## Webhook URL for External Services

- **Local Development**: `http://localhost:3000/api/posts`
- **Production**: `https://your-website.com/api/posts`

**Authorization Header**: `Bearer YOUR_PLANTSAATHI_API_KEY`

## Supported Fields

The webhook accepts any combination of these fields:

### Core Fields
- `title` (required) - Post title
- `excerpt` - Short description
- `content` - Full content/description
- `category` - e.g., "Jobs", "Scholarships", "Grants", "Fellowships", "Conferences"
- `tags` - Array of tags
- `author_name` - Defaults to "Agri Updates"

### Opportunity-Specific Fields
- `company` - Organization name
- `location` - Location/city
- `job_type` - e.g., "Full-time", "Part-time", "Contract"
- `salary_range` - Compensation range
- `application_link` - URL to apply

### Media & Meta
- `image_url` / `cover_image` - Cover image URL
- `is_active` - Defaults to `true`
- `is_featured` - Boolean
- `display_location` - Layout position

**Note**: The `slug` and `published_at` fields are auto-generated.
