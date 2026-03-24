// netlify/functions/telnyx-status.js
// Forwards Telnyx delivery status events to /api/telnyx/webhook
exports.handler = async (event) => {
  try {
    const baseUrl =
      process.env.URL ||
      process.env.DEPLOY_URL ||
      process.env.SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL;

    if (baseUrl) {
      await fetch(`${baseUrl.replace(/\/$/, "")}/api/telnyx/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: event.body || "{}",
      });
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }
};
