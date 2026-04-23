import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

const CONTACT_TO = process.env.CONTACT_TO_EMAIL ?? "support@atarhero.com.au";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email").max(200),
  message: z.string().trim().min(10, "Please write a longer message").max(5000, "Message is too long"),
  // Honeypot — bots tend to fill every field. We accept any value here
  // and silently drop the submission below if it's non-empty.
  website: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // Rate limit by IP — anyone (logged-out included) can submit.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anon";
  const limited = rateLimit(`contact:${ip}`, { maxRequests: 5, windowMs: 60 * 60 * 1000 }); // 5 / hour / IP
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  // Silently drop honeypot hits — they're bots.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const { name, email, message } = parsed.data;

  // 1. Persist to DB first — this is the source of truth even if email fails
  const record = await prisma.contactMessage.create({
    data: { name, email, message },
  });

  // 2. Send notification email to the team. Never fail the request if email
  //    delivery fails — the row is already in the DB.
  const submittedAt = record.createdAt.toLocaleString("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Australia/Melbourne",
  });

  const textBody = [
    `New contact form submission from ${name}`,
    "",
    `Name:    ${name}`,
    `Email:   ${email}`,
    `When:    ${submittedAt} (Melbourne)`,
    "",
    "Message:",
    message,
    "",
    "—",
    `Reply directly to this email to respond — it'll go to ${email}.`,
  ].join("\n");

  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h2 style="font-size: 18px; margin: 0 0 16px; color: #111827;">New contact form submission</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
        <tr>
          <td style="padding: 6px 0; color: #6b7280; width: 80px;">Name</td>
          <td style="padding: 6px 0; color: #111827;"><strong>${escape(name)}</strong></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">Email</td>
          <td style="padding: 6px 0;"><a href="mailto:${escape(email)}" style="color: #2563eb;">${escape(email)}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">When</td>
          <td style="padding: 6px 0; color: #6b7280;">${escape(submittedAt)} (Melbourne)</td>
        </tr>
      </table>
      <div style="background: #f9fafb; border-left: 3px solid #2563eb; padding: 14px 16px; border-radius: 6px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word;">${escape(message)}</div>
      <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">Reply directly to this email to respond — it'll go to ${escape(email)}.</p>
    </div>
  `;

  // Fire-and-forget — don't block the response on email delivery
  void sendEmail({
    to: CONTACT_TO,
    subject: `New contact form: ${name}`,
    text: textBody,
    html: htmlBody,
    replyTo: email, // Hitting "Reply" sends back to the customer
  }).then((result) => {
    if (!result.ok) {
      // eslint-disable-next-line no-console
      console.error(`[contact] Email send failed for ${record.id}:`, result.error);
    }
  });

  return NextResponse.json({ ok: true });
}
