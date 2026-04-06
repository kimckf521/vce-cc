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

function pdfNameToLabel(pdfName: string): string {
  const m = pdfName.match(/^(\d{4})-mm([12])(-sol)?\.pdf$/i);
  if (!m) return pdfName.replace(/\.pdf$/i, "");
  const year = m[1];
  const num = m[2];
  const isSol = !!m[3];
  return `${year} Exam ${num}${isSol ? " Solution" : ""}`;
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
  sessionId?: string;
  createdBy?: string;
  createdAt?: string;
  files: FileEntry[];
}

/**
 * GET — list all extraction images grouped by session/exam.
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

  const folders: FolderGroup[] = [];

  // Only show files explicitly uploaded via "Upload to Exam" flow
  // (not raw extraction artifacts from jobs/ folder)
  const { data: topFolders } = await admin.storage
    .from(BUCKET)
    .list("", { limit: 200, sortBy: { column: "name", order: "asc" } });

  for (const folder of topFolders || []) {
    if (folder.id || folder.name === "jobs") continue;

    const folderName = folder.name;
    const m = folderName.match(/^(\d{4})-mm([12])$/);
    const examLabel = m ? `${m[1]} Exam ${m[2]}` : folderName;

    const files: FileEntry[] = [];

    for (const sub of ["questions", "solutions"]) {
      const { data: subFiles } = await admin.storage
        .from(BUCKET)
        .list(`${folderName}/${sub}`, {
          limit: 500,
          sortBy: { column: "name", order: "asc" },
        });

      if (subFiles) {
        for (const f of subFiles) {
          if (!f.id) continue;
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
 * DELETE — remove files from the extraction bucket and clear matching DB imageUrl.
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
