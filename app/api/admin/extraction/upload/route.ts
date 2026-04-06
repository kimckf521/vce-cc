import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

const BUCKET = "extraction";

// Extend timeout for bulk uploads
export const maxDuration = 60;

/**
 * POST — upload/copy extraction images to a named session in the extraction bucket.
 *
 * Body: { sessionName, imageUrls: string[], labels: string[] }
 *
 * Images are copied from their current Supabase location (jobs/) to sessions/{slug}/.
 * If a URL is not in the same bucket, falls back to download + re-upload.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!isAdminRole(dbUser?.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Supabase storage not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { sessionName, imageUrls, labels } = body as {
      sessionName: string;
      imageUrls: string[];
      labels: string[];
    };

    if (!sessionName || !imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "sessionName and imageUrls are required" },
        { status: 400 }
      );
    }

    const slug = sessionName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const adminClient = createSupabaseAdmin(supabaseUrl, serviceRoleKey);

    await adminClient.storage
      .createBucket(BUCKET, { public: true })
      .catch(() => {});

    // Extract the bucket public URL prefix to detect same-bucket files
    const bucketPrefix = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/`;

    let uploaded = 0;
    let failed = 0;

    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      const label = labels?.[i] || `figure-${i + 1}`;
      const safeLabel = label.replace(/[^a-zA-Z0-9_-]/g, "");
      const destPath = `sessions/${slug}/${safeLabel}.png`;

      try {
        if (imageUrl.startsWith(bucketPrefix)) {
          // Same bucket — use copy (fast, no download needed)
          const sourcePath = imageUrl.slice(bucketPrefix.length);
          const { error: copyError } = await adminClient.storage
            .from(BUCKET)
            .copy(sourcePath, destPath);

          if (copyError) {
            // Copy failed (maybe dest exists) — try with upsert via download
            const imgRes = await fetch(imageUrl);
            if (!imgRes.ok) { failed++; continue; }
            const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
            await adminClient.storage.from(BUCKET).upload(destPath, imgBuffer, {
              contentType: "image/png",
              upsert: true,
            });
          }
        } else {
          // Different source — download and upload
          const imgRes = await fetch(imageUrl);
          if (!imgRes.ok) { failed++; continue; }
          const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
          await adminClient.storage.from(BUCKET).upload(destPath, imgBuffer, {
            contentType: "image/png",
            upsert: true,
          });
        }
        uploaded++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({
      sessionName,
      slug,
      uploaded,
      failed,
    });
  } catch (err) {
    console.error("[extraction-upload] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
