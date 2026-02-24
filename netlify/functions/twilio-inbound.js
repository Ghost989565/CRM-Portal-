// netlify/functions/twilio-inbound.js
exports.handler = async (event) => {
  try {
    // Twilio sends x-www-form-urlencoded by default
    const params = new URLSearchParams(event.body || "");
    const From = params.get("From");       // sender (client)
    const To = params.get("To");           // your Twilio number
    const Body = params.get("Body");       // message text
    const MessageSid = params.get("MessageSid");

    console.log("Inbound SMS:", { From, To, Body, MessageSid });

    // TODO: save to Supabase here (later)
    // For now: just return TwiML (valid response)
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/xml" },
      body: twiml,
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 200, body: "" }; // Twilio just needs 200
  }
};
