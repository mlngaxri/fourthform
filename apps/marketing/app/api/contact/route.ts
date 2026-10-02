export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO || !process.env.EMAIL_FROM) return Response.json({ error: "Online enquiries are not available yet." }, { status: 503 });
  const origin = req.headers.get("origin");
  if (!origin || origin !== new URL(req.url).origin) return Response.json({ error: "Open the enquiry form on the Fourthform website." }, { status: 403 });
  if (Number(req.headers.get("content-length") || 0) > 15000) return Response.json({ error: "Your message is too long." }, { status: 413 });
  try {
    const input = await req.text();
    if (input.length > 15000) return Response.json({ error: "Your message is too long." }, { status: 413 });
    const body = JSON.parse(input);
    if (body.website) return Response.json({ received: true });
    const { name, email, message, key } = body;
    if (typeof name !== "string" || !name.trim() || name.length > 100 || typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof message !== "string" || message.trim().length < 10 || message.length > 3000 || typeof key !== "string" || !/^[0-9a-f-]{36}$/i.test(key)) return Response.json({ error: "Check your name, email and message before sending." }, { status: 400 });
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `fourthform-enquiry-${key}` }, body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [process.env.CONTACT_TO], reply_to: email, subject: "Fourthform project enquiry", text: `From: ${name.trim()}\nEmail: ${email}\n\n${message.trim()}` }), signal: AbortSignal.timeout(15000) });
    if (!response.ok) return Response.json({ error: "Your enquiry was not accepted. Please try again." }, { status: 502 });
    return Response.json({ received: true });
  } catch { return Response.json({ error: "Your enquiry could not be sent. Please try again." }, { status: 502 }); }
}
