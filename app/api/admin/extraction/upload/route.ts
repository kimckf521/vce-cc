import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

const BUCKET = "extraction";

/**
 * POST — upload extraction images to a named session in the extraction bucket.
 *
 * Body: { sessionName, imageUrls: string[], labels: string[] }
 *
 * sessionName: e.g. "2016 Exam 1", "2016 Exam 1 Solution"
 * imageUrls: Supabase public URLs of extracted images (from jobs/ artifacts)
 * labels: corresponding labels for each image (e.g. "Q8", "Q3a")
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

    // Create a slug from the session name
    const slug = sessionName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const adminClient = createSupabaseAdmin(supabaseUrl, serviceRoleKey);

    // Ensure bucket exists
    await adminClient.storage
      .createBucket(BUCKET, { public: true })
      .catch(() => {});

    let uploaded = 0;
    let failed = 0;

    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      const label = labels?.[i] || `figure-${i + 1}`;
      const safeLabel = label.replace(/[^a-zA-Z0-9_-]/g, "");

      try {
        // Download the image from its current Supabase URL
        const imgRes = await fetch(imageUrl);
        if (!imgRes.ok) {
          failed++;
          continue;
        }

        const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
        const storagePath = `sessions/${slug}/${safeLabel}.png`;

        await adminClient.storage.from(BUCKET).upload(storagePath, imgBuffer, {
          contentType: "image/png",
          upsert: true,
        });

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
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
