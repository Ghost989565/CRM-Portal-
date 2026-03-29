import { createBrowserClient, type SupabaseClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

export function isSupabaseConfigured() {
  if (!supabaseUrl || !supabaseAnonKey) return false
  if (!/^https?:\/\//.test(supabaseUrl)) return false
  return true
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
