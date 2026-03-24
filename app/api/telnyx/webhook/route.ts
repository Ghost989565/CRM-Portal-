/**
 * POST /api/telnyx/webhook
 * Handles Telnyx inbound SMS and delivery status callbacks.
 * Telnyx sends JSON payloads with event data.
 */
import { NextResponse } from "next/server"
import { upsertInboundMessage, updateMessageStatus, normalizeTelnyxStatus } from "@/lib/sms-db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const eventType = body?.data?.event_type
    const payload = body?.data?.payload

    if (!payload) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    // Delivery status callback
    if (eventType === "message.finalized" || eventType === "message.sent" || eventType === "message.failed") {
      const messageSid = payload.id
      const status = payload.to?.[0]?.status ?? payload.status ?? ""
      console.log("[telnyx/webhook] Status callback:", { messageSid, status })
      if (messageSid) {
        await updateMessageStatus(messageSid, normalizeTelnyxStatus(status))
      }
      return NextResponse.json({ ok: true })
    }

    // Inbound SMS
    if (eventType === "message.received") {
      const from = payload.from?.phone_number
      const to = payload.to?.[0]?.phone_number
      const text = payload.text ?? ""
      const messageSid = payload.id

      console.log("[telnyx/webhook] Inbound SMS:", { from, to, text, messageSid })

      if (from && to) {
        await upsertInboundMessage({
          from_phone: from,
          to_phone: to,
          body: text,
          provider_message_id: messageSid ?? "",
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[telnyx/webhook] Error:", err)
    return NextResponse.json({ ok: true })
  }
}
