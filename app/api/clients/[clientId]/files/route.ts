import { NextResponse } from "next/server"
import { createServerSupabaseClient, isSupabaseServerConfigured } from "@/lib/supabase/server"

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024
const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "client-files"

type StoredClientFile = {
  id: string
  name: string
  file_type: string | null
  size: number | null
  url: string | null
  created_at: string
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_")
}

async function getAuthorizedClient(clientId: string) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), supabase, user: null }
  }

  const { data: client, error } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("user_id", user.id)
    .single()

  if (error || !client) {
    return { error: NextResponse.json({ error: "Client not found" }, { status: 404 }), supabase, user }
  }

  return { error: null, supabase, user }
}

export async function GET(_request: Request, { params }: { params: { clientId: string } }) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 })
  }

  const { clientId } = params
  const authResult = await getAuthorizedClient(clientId)
  if (authResult.error) return authResult.error

  const { supabase } = authResult
  const { data, error } = await supabase
    .from("client_files")
    .select("id, name, file_type, size, url, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data || []) as StoredClientFile[]
  const files = await Promise.all(
    rows.map(async (row) => {
      const path = row.url || ""
      let downloadUrl: string | null = null

      if (path) {
        const { data: signed, error: signedError } = await supabase.storage
          .from(DEFAULT_BUCKET)
          .createSignedUrl(path, 60 * 60)

        if (!signedError) {
          downloadUrl = signed.signedUrl
        }
      }

      return {
        id: row.id,
        name: row.name,
        type: row.file_type || "Unknown",
        size: row.size || 0,
        uploadedAt: row.created_at,
        downloadUrl,
      }
    }),
  )

  return NextResponse.json({ files })
}

export async function POST(request: Request, { params }: { params: { clientId: string } }) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 })
  }

  const { clientId } = params
  const authResult = await getAuthorizedClient(clientId)
  if (authResult.error || !authResult.user) return authResult.error

  const { supabase, user } = authResult

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required" }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large. Max size is 25MB." }, { status: 400 })
  }

  const safeName = sanitizeFileName(file.name)
  const filePath = `${user.id}/${clientId}/${Date.now()}-${safeName}`

  const { error: uploadError } = await supabase.storage.from(DEFAULT_BUCKET).upload(filePath, file, {
    cacheControl: "3600",
    contentType: file.type || "application/octet-stream",
    upsert: false,
  })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: record, error: insertError } = await supabase
    .from("client_files")
    .insert({
      client_id: clientId,
      user_id: user.id,
      name: file.name,
      file_type: file.type || "application/octet-stream",
      size: file.size,
      url: filePath,
    })
    .select("id, name, file_type, size, url, created_at")
    .single()

  if (insertError || !record) {
    await supabase.storage.from(DEFAULT_BUCKET).remove([filePath])
    return NextResponse.json({ error: insertError?.message || "Failed to store file metadata" }, { status: 500 })
  }

  const { data: signed } = await supabase.storage.from(DEFAULT_BUCKET).createSignedUrl(filePath, 60 * 60)

  return NextResponse.json({
    file: {
      id: record.id,
      name: record.name,
      type: record.file_type || "Unknown",
      size: record.size || 0,
      uploadedAt: record.created_at,
      downloadUrl: signed?.signedUrl || null,
    },
  })
}
