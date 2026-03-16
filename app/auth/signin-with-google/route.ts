import { createClient } from "@/lib/supabase/server"
import { hasSupabaseBrowserEnv } from "@/lib/supabase/env"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const next = requestUrl.searchParams.get("next") ?? "/portal"
  const forwardedHost = request.headers.get("x-forwarded-host")
  const origin = forwardedHost
    ? `${request.headers.get("x-forwarded-proto") ?? "https"}://${forwardedHost}`
    : requestUrl.origin

  if (!hasSupabaseBrowserEnv()) {
    return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }
  if (data.url) {
    return NextResponse.redirect(data.url)
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}
