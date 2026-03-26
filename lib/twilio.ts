export function isTwilioConfigured() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER)
}

export async function sendTwilioSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER

  if (!sid || !token || !from) {
    return { error: "Twilio is not configured" }
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64")
  const payload = new URLSearchParams({
    To: to,
    From: from,
    Body: body,
  })

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload,
  })

  const data = await response.json()
  if (!response.ok) {
    return { error: data?.message || "Failed to send SMS" }
  }

  return { error: null, sid: data.sid }
}
