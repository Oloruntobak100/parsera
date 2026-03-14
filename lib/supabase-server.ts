import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type ScrapeResultRow = {
  id: string
  created_at: string
  url: string
  prompt: string | null
  attributes: unknown
  mode: string
  proxy_country: string | null
  cookies: unknown
  result: unknown
  status: string
  error_message: string | null
  credits_used: number | null
}

let _client: SupabaseClient | null = null

/** Server-only: service role bypasses RLS. Never import in client components. */
export function getServiceSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  if (!_client) {
    _client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return _client
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}
