/**
 * Supabase server client - uses service role key for server-side only operations.
 * NEVER import this in client components - it exposes the service role key.
 */
import { createClient } from "@supabase/supabase-js"
import { getSupabaseAdminEnv, isSupabaseFullyConfigured } from "@/lib/supabase/env"

function getSupabaseClient() {
  const env = getSupabaseAdminEnv()
  if (!env) return null
  return createClient(env.url, env.serviceRoleKey)
}

export const supabase = getSupabaseClient()

export function isSupabaseConfigured(): boolean {
  return isSupabaseFullyConfigured()
}
