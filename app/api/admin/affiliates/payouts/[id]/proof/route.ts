import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const BUCKET = "payout-proofs";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

/**
 * POST /api/admin/affiliates/payouts/[id]/proof
 * Upload a transaction screenshot/receipt for a payout. Stores the file in
 * Supabase Storage (`payout-proofs` bucket) and saves the public URL on the
 * Payout record. Admin/super-admin only.
 *
 * DELETE — clears the proof URL (does not delete the storage object).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`payout-proof:${ip}`, { maxRequests: 30 });
  if (limited) return limited;

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: payoutId } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Storage is not configured (missing service role key)" },
      { status: 500 }
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "A file is required" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BYTES / 1024 / 1024}MB)` },
      { status: 400 }
    );
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: "Allowed file types: PNG, JPEG, WebP, GIF, PDF" },
      { status: 400 }
    );
  }

  // Make sure the payout exists before uploading anything
  const existing = await prisma.payout.findUnique({
    where: { id: payoutId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Payout not found" }, { status: 404 });
  }

  // Pick an extension; default to .bin if MIME is something unexpected
  const ext = file.type.startsWith("image/")
    ? file.type.split("/")[1]
    : file.type === "application/pdf"
      ? "pdf"
      : "bin";
  const storagePath = `${payoutId}/${randomUUID()}.${ext}`;

  const adminClient = createSupabaseAdmin(supabaseUrl, serviceRoleKey);

  // Ensure bucket exists (auto-create if missing). Uses public bucket so
  // both admin and the influencer can view their proof via the URL.
  const { error: bucketError } = await adminClient.storage.createBucket(
    BUCKET,
    { public: true }
  );
  if (bucketError && !bucketError.message.includes("already exists")) {
    console.warn("[payout-proof] Bucket create warning:", bucketError.message);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await adminClient.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = adminClient.storage.from(BUCKET).getPublicUrl(storagePath);

  await prisma.payout.update({
    where: { id: payoutId },
    data: { proofUrl: publicUrl },
  });

  return NextResponse.json({ ok: true, proofUrl: publicUrl });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id: payoutId } = await params;
  await prisma.payout.update({
    where: { id: payoutId },
    data: { proofUrl: null },
  });
  return NextResponse.json({ ok: true });
}
