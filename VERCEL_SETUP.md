# Vercel Deployment - Environment Variables Setup

## Issue

Deployment failed because environment variables are not configured on Vercel.

## Required Environment Variables

You need to add these to your Vercel project:

### 1. NEXT_PUBLIC_SUPABASE_URL
```
https://ulqzicqxnaygfergqrbe.supabase.co
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscXppY3F4bmF5Z2ZlcmdxcmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTg0MjIsImV4cCI6MjA4MzAzNDQyMn0.AEpnTVooBNfjdFW77Q6Pp_I56rMVuILyjW4R-u__dEI
```

### 3. SUPABASE_SERVICE_ROLE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscXppY3F4bmF5Z2ZlcmdxcmJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ1ODQyMiwiZXhwIjoyMDgzMDM0NDIyfQ.gJWgDe0CD8OvpdWt_70SGd0ibxFbGjTGIvhztfa-AYg
```

### 4. PLANTSAATHI_API_KEY
```
ZC9cCLKR0JoWhnFd/9bwIjVIKbvOtUDYCyuznQH9w6Q=
```

## How to Add Them

### Option 1: Via Vercel CLI (Fastest)

```bash
# Set environment variables via CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://ulqzicqxnaygfergqrbe.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscXppY3F4bmF5Z2ZlcmdxcmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTg0MjIsImV4cCI6MjA4MzAzNDQyMn0.AEpnTVooBNfjdFW77Q6Pp_I56rMVuILyjW4R-u__dEI

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscXppY3F4bmF5Z2ZlcmdxcmJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ1ODQyMiwiZXhwIjoyMDgzMDM0NDIyfQ.gJWgDe0CD8OvpdWt_70SGd0ibxFbGjTGIvhztfa-AYg

vercel env add PLANTSAATHI_API_KEY production
# Paste: ZC9cCLKR0JoWhnFd/9bwIjVIKbvOtUDYCyuznQH9w6Q=
```

### Option 2: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/stufi339s-projects/blog/settings/environment-variables

2. Add each variable:
   - Click "Add New"
   - Enter variable name
   - Paste value
   - Select "Production" environment
   - Click "Save"

3. Repeat for all 4 variables

## After Adding Variables

Redeploy:
```bash
vercel --prod
```

Or trigger a new deployment from the Vercel dashboard.
