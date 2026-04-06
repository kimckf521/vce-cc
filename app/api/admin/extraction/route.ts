import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

const BUCKET = "extraction";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseAdmin(url, key);
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!isAdminRole(dbUser?.role)) return null;
  return user;
}

/**
 * GET — list all files in the extraction bucket grouped by exam folder.
 */
export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = getAdminClient();
  if (!admin)
    return NextResponse.json(
      { error: "Storage not configured" },
      { status: 500 }
    );

  // List top-level folders (e.g. "2024-mm1", "2024-mm2")
  const { data: topFolders, error: topErr } = await admin.storage
    .from(BUCKET)
    .list("", { limit: 200, sortBy: { column: "name", order: "asc" } });

  if (topErr) {
    return NextResponse.json({ error: topErr.message }, { status: 500 });
  }

  const folders: {
    name: string;
    examLabel: string;
    files: {
      path: string;
      name: string;
      subfolder: string;
      url: string;
      size: number | null;
    }[];
  }[] = [];

  for (const folder of topFolders || []) {
    // Skip non-folders (files at root)
    if (folder.id) continue;

    const folderName = folder.name;
    const m = folderName.match(/^(\d{4})-mm([12])$/);
    const examLabel = m
      ? `${m[1]} Exam ${m[2]}`
      : folderName;

    const files: (typeof folders)[0]["files"] = [];

    // List questions/ and solutions/ subfolders
    for (const sub of ["questions", "solutions"]) {
      const { data: subFiles } = await admin.storage
        .from(BUCKET)
        .list(`${folderName}/${sub}`, {
          limit: 500,
          sortBy: { column: "name", order: "asc" },
        });

      if (subFiles) {
        for (const f of subFiles) {
          if (!f.id) continue; // skip sub-subfolders
          const path = `${folderName}/${sub}/${f.name}`;
          const {
            data: { publicUrl },
          } = admin.storage.from(BUCKET).getPublicUrl(path);

          files.push({
            path,
            name: f.name,
            subfolder: sub,
            url: publicUrl,
            size: f.metadata?.size ?? null,
          });
        }
      }
    }

    if (files.length > 0) {
      folders.push({ name: folderName, examLabel, files });
    }
  }

  return NextResponse.json({ folders });
}

/**
 * DELETE — remove a file from the extraction bucket and clear matching DB imageUrl.
 */
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = getAdminClient();
  if (!admin)
    return NextResponse.json(
      { error: "Storage not configured" },
      { status: 500 }
    );

  const body = await req.json();
  const paths: string[] = Array.isArray(body.paths)
    ? body.paths
    : body.path
      ? [body.path]
      : [];

  if (paths.length === 0) {
    return NextResponse.json(
      { error: "path or paths[] required" },
      { status: 400 }
    );
  }

  // Get public URLs before deleting so we can clear DB references
  const publicUrls = paths.map((p) => {
    const {
      data: { publicUrl },
    } = admin.storage.from(BUCKET).getPublicUrl(p);
    return publicUrl;
  });

  // Delete from storage
  const { error: delError } = await admin.storage.from(BUCKET).remove(paths);
  if (delError) {
    return NextResponse.json(
      { error: `Delete failed: ${delError.message}` },
      { status: 500 }
    );
  }

  // Clear matching imageUrl in Questions and Solutions
  let cleared = 0;
  for (const url of publicUrls) {
    const qResult = await prisma.question.updateMany({
      where: { imageUrl: url },
      data: { imageUrl: null },
    });
    const sResult = await prisma.solution.updateMany({
      where: { imageUrl: url },
      data: { imageUrl: null },
    });
    cleared += qResult.count + sResult.count;
  }

  return NextResponse.json({
    deleted: paths.length,
    dbCleared: cleared,
  });
}
