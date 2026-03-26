import { NextResponse } from "next/server"
import { createServerSupabaseClient, isSupabaseServerConfigured } from "@/lib/supabase/server"
import { isTwilioConfigured, sendTwilioSms } from "@/lib/twilio"

type SendMessagePayload = {
  clientId?: string
  message?: string
  to?: string
}

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 })
  }

  try {
    const payload = (await request.json()) as SendMessagePayload
    const clientId = payload.clientId?.trim()
    const message = payload.message?.trim() || "Quick follow-up from Pantheon CRM."

    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, first_name, last_name, phone")
      .eq("id", clientId)
      .eq("user_id", user.id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const phone = payload.to?.trim() || client.phone || ""
    if (!phone) {
      return NextResponse.json({ error: "Client phone number is missing" }, { status: 400 })
    }

    if (!isTwilioConfigured()) {
      return NextResponse.json({
        ok: false,
        configured: false,
        phone,
        fallbackUri: `sms:${phone}`,
        message: "Twilio is not configured. Falling back to device SMS app.",
      })
    }

    const smsResult = await sendTwilioSms(phone, message)
    if (smsResult.error) {
      return NextResponse.json({ error: smsResult.error }, { status: 502 })
    }

    await supabase.from("contact_logs").insert({
      client_id: client.id,
      user_id: user.id,
      type: "text",
      outcome: `SMS sent to ${client.first_name} ${client.last_name}`,
      notes: message,
    })

    await supabase.from("clients").update({ last_contact: new Date().toISOString() }).eq("id", client.id)

    return NextResponse.json({
      ok: true,
      configured: true,
      sid: smsResult.sid,
      phone,
    })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
