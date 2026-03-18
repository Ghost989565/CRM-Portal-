/**
 * GET /api/meetings/[id]/invite - fetch active invite token (host only)
 * POST /api/meetings/[id]/invite - create or rotate expiring invite token (host only)
 * Body: { expiresInHours?: number, regenerate?: boolean } default 24h, reuse active invite unless regenerate=true
 */
import { NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/supabase"
import { generateInviteToken } from "@/lib/meetings"
import { resolvePresentationActor } from "@/lib/presentation-actor"

async function loadMeeting(
  meetingId: string,
  actor: Awaited<ReturnType<typeof resolvePresentationActor>>
) {
  if (!actor) return null

  const { data: meeting } = await actor.client
    .from("meetings")
    .select("id, host_user_id")
    .eq("id", meetingId)
    .single()

  if (!meeting || meeting.host_user_id !== actor.userId) {
    return null
  }

  return meeting
}

async function loadLatestActiveInvite(
  meetingId: string,
  actor: NonNullable<Awaited<ReturnType<typeof resolvePresentationActor>>>
) {
  const nowIso = new Date().toISOString()
  const { data, error } = await actor.client
    .from("meeting_invites")
    .select("id, invite_token, expires_at, created_at")
    .eq("meeting_id", meetingId)
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(1)
  if (error) {
    console.error("[api/meetings/[id]/invite] loadLatestActiveInvite error:", error)
    return null
  }

  return data?.[0] ?? null
}

function buildJoinUrl(request: Request, token: string) {
  const requestUrl = new URL(request.url)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || requestUrl.origin
  return `${baseUrl.replace(/\/$/, "")}/meet/${encodeURIComponent(token)}`
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: meetingId } = await params
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }
    const actor = await resolvePresentationActor()
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const meeting = await loadMeeting(meetingId, actor)
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    const invite = await loadLatestActiveInvite(meetingId, actor)
    if (!invite) {
      return NextResponse.json({ error: "No active invite" }, { status: 404 })
    }

    return NextResponse.json({
      invite: { id: invite.id, invite_token: invite.invite_token, expires_at: invite.expires_at },
      joinUrl: buildJoinUrl(request, invite.invite_token),
    })
  } catch (err) {
    console.error("[api/meetings/[id]/invite] GET error:", err)
    return NextResponse.json({ error: "Failed to load invite" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: meetingId } = await params
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }
    const actor = await resolvePresentationActor()
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const meeting = await loadMeeting(meetingId, actor)
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    let body: { expiresInHours?: number; regenerate?: boolean }
    try {
      body = await request.json().catch(() => ({}))
    } catch {
      body = {}
    }

    if (!body.regenerate) {
      const existingInvite = await loadLatestActiveInvite(meetingId, actor)
      if (existingInvite) {
        return NextResponse.json({
          invite: {
            id: existingInvite.id,
            invite_token: existingInvite.invite_token,
            expires_at: existingInvite.expires_at,
          },
          joinUrl: buildJoinUrl(request, existingInvite.invite_token),
        })
      }
    }

    const hours = typeof body.expiresInHours === "number" && body.expiresInHours > 0
      ? Math.min(168, body.expiresInHours)
      : 24

    await actor.client.from("meeting_invites").delete().eq("meeting_id", meetingId)

    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000)
    const invite_token = generateInviteToken()

    const { data: invite, error } = await actor.client
      .from("meeting_invites")
      .insert({ meeting_id: meetingId, invite_token, expires_at: expiresAt.toISOString() })
      .select("id, invite_token, expires_at, created_at")
      .single()

    if (error) {
      console.error("[api/meetings/[id]/invite] POST error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      invite: { id: invite.id, invite_token: invite.invite_token, expires_at: invite.expires_at },
      joinUrl: buildJoinUrl(request, invite.invite_token),
    })
  } catch (err) {
    console.error("[api/meetings/[id]/invite] Error:", err)
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 })
  }
}
