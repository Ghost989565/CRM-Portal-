import { NextResponse } from "next/server"
import { createServerSupabaseClient, isSupabaseServerConfigured } from "@/lib/supabase/server"

const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "client-files"

type ProfileRecord = {
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  title: string | null
  avatar_url: string | null
}

type ProfilePayload = {
  firstName?: string
  lastName?: string
  phone?: string
  title?: string
}

function normalize(value?: string) {
  const next = value?.trim()
  return next ? next : null
}

async function getSignedAvatarUrl(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, path: string | null) {
  if (!path) return null

  const { data, error } = await supabase.storage.from(DEFAULT_BUCKET).createSignedUrl(path, 60 * 60)
  if (error) return null

  return data.signedUrl
}

export async function GET() {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 })
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("first_name, last_name, email, phone, title, avatar_url")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const profile = (data || {}) as Partial<ProfileRecord>
  const avatarPath = profile.avatar_url || user.user_metadata?.avatar_url || null
  const avatarSignedUrl = await getSignedAvatarUrl(supabase, avatarPath)

  return NextResponse.json({
    profile: {
      firstName: profile.first_name || user.user_metadata?.first_name || "",
      lastName: profile.last_name || user.user_metadata?.last_name || "",
      email: profile.email || user.email || "",
      phone: profile.phone || "",
      title: profile.title || "Agent",
      avatarPath,
      avatarUrl: avatarSignedUrl,
    },
  })
}

export async function PATCH(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 })
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = (await request.json()) as ProfilePayload

    const firstName = normalize(payload.firstName)
    const lastName = normalize(payload.lastName)
    const phone = normalize(payload.phone)
    const title = normalize(payload.title) || "Agent"

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        email: user.email || null,
        phone,
        title,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    })

    if (authUpdateError) {
      return NextResponse.json({ error: authUpdateError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 })
  }
}
