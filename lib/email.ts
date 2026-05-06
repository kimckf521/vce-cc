import { Resend } from "resend";

/**
 * Email helper for sending transactional email via Resend.
 *
 * Env vars required at runtime (optional in dev — falls back to console log):
 *   RESEND_API_KEY      — API key from https://resend.com
 *   RESEND_FROM_EMAIL   — verified sender address (e.g. "ATAR Hero <noreply@yourdomain.com>")
 *
 * Optional:
 *   REPORT_TO_EMAIL     — destination for user-submitted reports
 */

export type EmailAttachment = {
  /** File name shown in the email client. */
  filename: string;
  /** Raw bytes of the attachment. Encoded to base64 before sending. */
  content: Buffer | Uint8Array;
  /** MIME type (e.g. "image/png"). */
  contentType?: string;
};

export type SendEmailArgs = {
  to: string;
  subject: string;
  /** Plain-text body. HTML is generated automatically from this. */
  text: string;
  /** Optional HTML body. Overrides the auto-generated HTML if provided. */
  html?: string;
  /** Reply-To header — typically set to the submitting user's email. */
  replyTo?: string;
  /** Optional file attachments. */
  attachments?: EmailAttachment[];
};

export type SendEmailResult =
  | { ok: true; id: string | null }
  | { ok: false; error: string };

/**
 * Send an email via Resend. In development, if RESEND_API_KEY is missing,
 * the email is logged to the server console instead of being sent so you
 * can verify the flow without API keys.
 */
export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  // Dev fallback: log to console so the endpoint still succeeds without keys
  if (!apiKey || !from) {
    // eslint-disable-next-line no-console
    console.info(
      "[email] RESEND_API_KEY or RESEND_FROM_EMAIL not set — logging email instead of sending.\n",
      {
        to: args.to,
        subject: args.subject,
        replyTo: args.replyTo,
        text: args.text,
        attachments: args.attachments?.map((a) => ({
          filename: a.filename,
          contentType: a.contentType,
          bytes: a.content.byteLength,
        })),
      },
    );
    return { ok: true, id: null };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: args.to,
      subject: args.subject,
      text: args.text,
      html: args.html ?? textToBasicHtml(args.text),
      replyTo: args.replyTo,
      attachments: args.attachments?.map((a) => ({
        filename: a.filename,
        content: Buffer.isBuffer(a.content) ? a.content : Buffer.from(a.content),
        contentType: a.contentType,
      })),
    });

    if (result.error) {
      // Log the full Resend error so it shows up in runtime logs even if
      // downstream callers truncate it. Resend's error object actually
      // exposes more than the typed surface (name, statusCode), so we
      // serialise the whole thing alongside the typed message field.
      const errorJson = JSON.stringify(result.error);
      // eslint-disable-next-line no-console
      console.error(
        "[email] Resend API rejected send. from=%s to=%s message=%s full=%s",
        from,
        args.to,
        result.error.message,
        errorJson,
      );
      return {
        ok: false,
        error: `${result.error.message} | ${errorJson}`,
      };
    }
    return { ok: true, id: result.data?.id ?? null };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      "[email] Unexpected exception calling Resend. from=%s to=%s err=%o",
      from,
      args.to,
      err,
    );
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

/** Convert a plain-text string to a minimal HTML body with line breaks preserved. */
function textToBasicHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<pre style="font-family: ui-sans-serif, system-ui, sans-serif; font-size: 14px; white-space: pre-wrap; word-wrap: break-word;">${escaped}</pre>`;
}
