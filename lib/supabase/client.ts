import { createBrowserClient, type SupabaseClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

export function createClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.")
  }

  return createBrowserClient(supabaseUrl!, supabaseAnonKey!)
}

export function createOptionalClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!)
}
