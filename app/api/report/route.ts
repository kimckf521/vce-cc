import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReportSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail, type EmailAttachment } from "@/lib/email";

const CATEGORY_LABELS: Record<string, string> = {
  BUG: "Bug report",
  FEATURE_REQUEST: "Feature request",
  CONTENT_ERROR: "Content error",
  ACCOUNT_BILLING: "Account / billing",
  OTHER: "Other",
};

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB each
const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20 MB total
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
]);

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  // Rate-limit: 5 reports per user per 5 minutes — stops accidental spam but
  // allows a user to file a few legitimate issues in quick succession.
  const limited = rateLimit(`report:${user.id}`, { maxRequests: 5, windowMs: 5 * 60_000 });
  if (limited) return limited;

  // Parse body: JSON (no attachments) or multipart/form-data (with images)
  const contentType = req.headers.get("content-type") ?? "";
  let rawCategory: unknown;
  let rawDescription: unknown;
  const attachments: EmailAttachment[] = [];

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    if (!form) return errorJson("Invalid form data", 400);

    rawCategory = form.get("category");
    rawDescription = form.get("description");

    const files = form.getAll("images").filter((v): v is File => v instanceof File);
    if (files.length > MAX_IMAGES) {
      return errorJson(`You can attach up to ${MAX_IMAGES} images.`, 400);
    }

    let total = 0;
    for (const file of files) {
      if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
        return errorJson(`"${file.name}" is not a supported image type.`, 400);
      }
      if (file.size > MAX_IMAGE_BYTES) {
        return errorJson(
          `"${file.name}" is larger than ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} MB.`,
          400,
        );
      }
      total += file.size;
      if (total > MAX_TOTAL_BYTES) {
        return errorJson(
          `Total attachment size exceeds ${Math.round(MAX_TOTAL_BYTES / 1024 / 1024)} MB.`,
          400,
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: file.name || "attachment",
        content: buffer,
        contentType: file.type,
      });
    }
  } else {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return errorJson("Invalid JSON body", 400);
    rawCategory = (body as Record<string, unknown>).category;
    rawDescription = (body as Record<string, unknown>).description;
  }

  const parsed = createReportSchema.safeParse({
    category: rawCategory,
    description: rawDescription,
  });
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const msg =
      fieldErrors.description?.[0] ??
      fieldErrors.category?.[0] ??
      "Invalid input";
    return errorJson(msg, 400);
  }

  const { category, description } = parsed.data;

  // Pull display name for context in the email
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, role: true },
  });

  // Default support address. Can be overridden per-environment via REPORT_TO_EMAIL
  // (useful for staging or if the support inbox ever moves).
  const to = process.env.REPORT_TO_EMAIL ?? "support@atarhero.com.au";

  const userEmail = user.email ?? "(no email)";
  const userName = dbUser?.name ?? "(no name)";
  const categoryLabel = CATEGORY_LABELS[category] ?? category;

  const attachmentLine =
    attachments.length > 0
      ? `Attached:  ${attachments.length} image${attachments.length === 1 ? "" : "s"}`
      : `Attached:  none`;

  const subject = `[Report · ${categoryLabel}] from ${userName}`;
  const text = [
    `A new report has been submitted.`,
    ``,
    `From:      ${userName} <${userEmail}>`,
    `User ID:   ${user.id}`,
    `Role:      ${dbUser?.role ?? "STUDENT"}`,
    `Category:  ${categoryLabel}`,
    `Submitted: ${new Date().toISOString()}`,
    attachmentLine,
    ``,
    `---`,
    ``,
    description,
  ].join("\n");

  const result = await sendEmail({
    to,
    subject,
    text,
    replyTo: user.email ?? undefined,
    attachments: attachments.length > 0 ? attachments : undefined,
  });

  if (!result.ok) {
    // eslint-disable-next-line no-console
    console.error("[report] Failed to send report email:", result.error);
    return errorJson("Could not send report. Please try again later.", 500);
  }

  return NextResponse.json({ ok: true });
}
