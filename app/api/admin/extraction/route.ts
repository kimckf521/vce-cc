import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
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
  const auth = await requireAuthenticatedUser();
  if (auth.response) return { response: auth.response } as const;
  if (!isAdminRole(auth.dbUser.role)) {
    return {
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    } as const;
  }
  return { authUser: auth.user } as const;
}

interface FileEntry {
  path: string;
  name: string;
  subfolder: string;
  url: string;
  size: number | null;
}

interface FolderGroup {
  name: string;
  examLabel: string;
  files: FileEntry[];
}

/**
 * GET — list uploaded extraction images grouped by session.
 */
export async function GET() {
  const adminCheck = await requireAdmin();
  if ("response" in adminCheck) return adminCheck.response;

  const admin = getAdminClient();
  if (!admin)
    return NextResponse.json(
      { error: "Storage not configured" },
      { status: 500 }
    );

  const folders: FolderGroup[] = [];

  // List sessions/ folder (uploaded via Upload All / Upload Selected)
  const { data: sessionFolders } = await admin.storage
    .from(BUCKET)
    .list("sessions", { limit: 200, sortBy: { column: "name", order: "asc" } });

  for (const folder of sessionFolders || []) {
    if (folder.id) continue;

    const slug = folder.name;
    // Convert slug back to label: "2016-exam-1" → "2016 Exam 1"
    const examLabel = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const files: FileEntry[] = [];

    const { data: sessionFiles } = await admin.storage
      .from(BUCKET)
      .list(`sessions/${slug}`, {
        limit: 500,
        sortBy: { column: "name", order: "asc" },
      });

    if (sessionFiles) {
      for (const f of sessionFiles) {
        if (!f.id) continue;
        const path = `sessions/${slug}/${f.name}`;
        const {
          data: { publicUrl },
        } = admin.storage.from(BUCKET).getPublicUrl(path);

        files.push({
          path,
          name: f.name,
          subfolder: "figures",
          url: publicUrl,
          size: f.metadata?.size ?? null,
        });
      }
    }

    if (files.length > 0) {
      folders.push({ name: slug, examLabel, files });
    }
  }

  return NextResponse.json({ folders });
}

/**
 * DELETE — remove files from the extraction bucket and clear matching DB imageUrl.
 */
export async function DELETE(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if ("response" in adminCheck) return adminCheck.response;

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

  const publicUrls = paths.map((p) => {
    const {
      data: { publicUrl },
    } = admin.storage.from(BUCKET).getPublicUrl(p);
    return publicUrl;
  });

  const { error: delError } = await admin.storage.from(BUCKET).remove(paths);
  if (delError) {
    return NextResponse.json(
      { error: `Delete failed: ${delError.message}` },
      { status: 500 }
    );
  }

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
