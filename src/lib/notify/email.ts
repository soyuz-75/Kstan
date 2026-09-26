export type Email = { to: string[]; subject: string; text: string; html: string; replyTo?: string };

/** Sends through the Resend REST API. Logs instead when RESEND_API_KEY is missing. */
export async function sendEmail(email: Email): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || email.to.length === 0) {
    console.info(`[notify:email] (not configured) to=${email.to.join(",") || "-"} subject=${email.subject}\n${email.text}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Козацький Стан <booking@k-stan.vn.ua>",
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
      reply_to: email.replyTo,
    }),
  });
  if (!res.ok) throw new Error(`Resend API ${res.status}: ${await res.text()}`);
}

export function staffRecipients(): string[] {
  return (process.env.NOTIFY_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
