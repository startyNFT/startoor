import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Startoor <onboarding@resend.dev>";

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!resend) {
    console.log("[resend not configured] Email would have been sent:", {
      to: params.to,
      subject: params.subject,
    });
    return { id: "dev-no-send", skipped: true };
  }

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });

  if (result.error) {
    console.error("Resend error:", result.error);
    throw new Error(`Failed to send email: ${result.error.message}`);
  }

  return { id: result.data?.id ?? "unknown", skipped: false };
}
