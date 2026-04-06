import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const ARTIFACTS_DIR = join(process.cwd(), ".figure-artifacts");

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".csv": "text/csv",
  ".json": "application/json",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filePath = join(ARTIFACTS_DIR, ...segments);

  // Security: ensure path doesn't escape artifacts directory
  const resolved = join(ARTIFACTS_DIR, ...segments);
  if (!resolved.startsWith(ARTIFACTS_DIR)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 403 });
  }

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const data = await readFile(filePath);
    const ext = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Read failed" }, { status: 500 });
  }
}
