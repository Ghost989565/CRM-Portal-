// netlify/functions/twilio-status.js
exports.handler = async (event) => {
  try {
    const params = new URLSearchParams(event.body || "");
    const MessageSid = params.get("MessageSid");
    const MessageStatus = params.get("MessageStatus");

    console.log("Status callback:", { MessageSid, MessageStatus });

    // TODO: update message status in Supabase later

    return { statusCode: 200, body: "ok" };
  } catch (e) {
    console.error(e);
    return { statusCode: 200, body: "ok" };
  }
};
