# Getting Your Supabase Service Role Key

To complete the webhook setup, you need to add your Supabase service role key to `.env.local`.

## Steps:

### 1. Get your service role key

Go to your Supabase dashboard:
- **URL**: https://supabase.com/dashboard/project/ulqzicqxnaygfergqrbe/settings/api
- Look for **"Project API keys"** section
- Copy the **`service_role`** key (the long JWT token)

> [!CAUTION]
> The service_role key bypasses all RLS policies. NEVER expose it in client-side code or commit it to version control!

### 2. Add it to .env.local

Replace the empty value in your `.env.local` file:

```bash
# Current (line 7):
SUPABASE_SERVICE_ROLE_KEY=

# Change to (replace with your actual key):
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscXppY3F4bmF5Z2ZlcmdxcmJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzY0NTMzNSwiZXhwIjoyMDUzMjIxMzM1fQ.ABC123...YOUR_ACTUAL_KEY
```

**Quick command** (run from project root):
```bash
# Edit .env.local and paste your service role key on line 7
nano .env.local
```

### 3. Restart dev server

Press `Ctrl+C` in your terminal running `npm run dev`, then:
```bash
npm run dev
```

### 4. Test the webhook

Once the server restarts with the new environment variables loaded:
```bash
./test-webhook.sh ZC9cCLKR0JoWhnFd/9bwIjVIKbvOtUDYCyuznQH9w6Q=
```

---

**Current status:**
- ✅ `PLANTSAATHI_API_KEY` is configured
- ⏳ `SUPABASE_SERVICE_ROLE_KEY` needs to be added (currently empty)
