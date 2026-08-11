import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * CLAUDE.md law 9: the browser gets VITE_SUPABASE_URL + anon key and nothing else.
 * The Anthropic key and the service-role key live only in /worker.
 *
 * The client is created lazily so the app shell still boots (and `npm run build`
 * still passes) on a machine with no .env.local — T02 wires the real project.
 */

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Copy .env.example to .env.local and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    )
  }
  client ??= createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  })
  return client
}
