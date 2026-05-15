import { createClient } from '@supabase/supabase-js'
import { optionalEnv, requireEnv } from './env.js'

const serviceRoleKey = optionalEnv('SUPABASE_SERVICE_ROLE_KEY')
const publishableKey =
  optionalEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || optionalEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY')

if (!serviceRoleKey && !publishableKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
}

export const supabase = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  serviceRoleKey || publishableKey!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

export const hasServiceRoleKey = Boolean(serviceRoleKey)
