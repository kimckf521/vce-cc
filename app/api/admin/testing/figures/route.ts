import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { isAdminRole } from "@/lib/utils";
import { execFile } from "child_process";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const ARTIFACTS_DIR = join(process.cwd(), ".figure-artifacts");

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = rateLimit(`admin-figures:${user.id}`, {
    maxRequests: 10,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!isAdminRole(dbUser?.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as File | null;
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "A PDF file is required" },
        { status: 400 }
      );
    }

    // Save uploaded PDF to temp file
    const tempDir = join(tmpdir(), `vce-figures-${randomUUID()}`);
    await mkdir(tempDir, { recursive: true });
    const tempPdf = join(tempDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempPdf, buffer);

    // Ensure artifacts directory exists
    await mkdir(ARTIFACTS_DIR, { recursive: true });

    // Run Python extractor as subprocess
    const scriptPath = join(
      process.cwd(),
      "scripts",
      "figure-extract-cli.py"
    );

    const result = await new Promise<string>((resolve, reject) => {
      execFile(
        "python3",
        [scriptPath, "--file", tempPdf, "--artifacts-dir", ARTIFACTS_DIR],
        {
          maxBuffer: 50 * 1024 * 1024, // 50MB for large outputs
          timeout: 120_000, // 2 minute timeout
          env: {
            ...process.env,
            PATH: `/opt/homebrew/bin:${process.env.PATH}`,
          },
        },
        (error, stdout, stderr) => {
          if (error) {
            console.error("[figure-extract] stderr:", stderr);
            reject(new Error(stderr || error.message));
            return;
          }
          resolve(stdout);
        }
      );
    });

    const data = JSON.parse(result);

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 500 });
    }

    // Rewrite artifact URLs to use our API route
    const rewrite = (url: string | null) => {
      if (!url) return null;
      // Original: /artifacts/{jobId}/pages/page-001.png
      // Rewrite to: /api/admin/testing/figures/artifacts/{jobId}/pages/page-001.png
      return url.replace(
        /^\/artifacts\//,
        "/api/admin/testing/figures/artifacts/"
      );
    };

    for (const page of data.pages || []) {
      page.imageUrl = rewrite(page.imageUrl);
    }
    for (const item of data.items || []) {
      item.imageUrl = rewrite(item.imageUrl);
      item.downloadUrl = rewrite(item.downloadUrl);
      if (item.tableUrl) item.tableUrl = rewrite(item.tableUrl);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[figure-extract] Error:", err);
    return NextResponse.json(
      {
        error: "Extraction failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
