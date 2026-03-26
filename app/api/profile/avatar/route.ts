import { NextResponse } from "next/server"
import { createServerSupabaseClient, isSupabaseServerConfigured } from "@/lib/supabase/server"

const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "client-files"
const MAX_AVATAR_SIZE = 2 * 1024 * 1024

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_")
}

export async function POST(request: Request) {
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

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Please select an image" }, { status: 400 })
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return NextResponse.json({ error: "Image is too large. Max size is 2MB." }, { status: 400 })
  }

  const safeName = sanitizeFileName(file.name)
  const path = `${user.id}/profile/${Date.now()}-${safeName}`

  const { error: uploadError } = await supabase.storage.from(DEFAULT_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, avatar_url: path, email: user.email || null, updated_at: new Date().toISOString() }, { onConflict: "id" })

  if (updateError) {
    await supabase.storage.from(DEFAULT_BUCKET).remove([path])
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await supabase.auth.updateUser({
    data: {
      avatar_url: path,
    },
  })

  const { data: signedData, error: signedError } = await supabase.storage.from(DEFAULT_BUCKET).createSignedUrl(path, 60 * 60)
  if (signedError) {
    return NextResponse.json({ error: signedError.message }, { status: 500 })
  }

  return NextResponse.json({
    avatarPath: path,
    avatarUrl: signedData.signedUrl,
  })
}
