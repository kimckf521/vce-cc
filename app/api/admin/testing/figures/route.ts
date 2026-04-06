import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { isAdminRole } from "@/lib/utils";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { execFile } from "child_process";
import { writeFile, mkdir, readFile, readdir, stat } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const ARTIFACTS_DIR = join(process.cwd(), ".figure-artifacts");
const BUCKET = "extraction";

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as File | null;
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "A PDF file is required" },
        { status: 400 }
      );
    }

    // On Vercel: proxy to remote extractor server (no local filesystem)
    const extractorUrl = process.env.EXTRACTOR_API_URL;
    if (process.env.VERCEL) {
      if (!extractorUrl) {
        return NextResponse.json(
          {
            error:
              "PDF extraction requires the remote extractor server. " +
              "Set EXTRACTOR_API_URL in Vercel environment variables, or extract locally.",
          },
          { status: 503 }
        );
      }

      // Forward PDF to remote extractor
      const remoteForm = new FormData();
      remoteForm.append("pdf", file);

      const headers: Record<string, string> = {};
      const apiKey = process.env.EXTRACTOR_API_KEY;
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

      const remoteRes = await fetch(`${extractorUrl}/api/extract`, {
        method: "POST",
        headers,
        body: remoteForm,
      });

      if (!remoteRes.ok) {
        const err = await remoteRes.json().catch(() => ({ error: "Remote extraction failed" }));
        return NextResponse.json(
          { error: err.error || "Remote extraction failed" },
          { status: remoteRes.status }
        );
      }

      const data = await remoteRes.json();
      return NextResponse.json(data);
    }

    // Local extraction: save PDF to temp file and run Python
    const tempDir = join(tmpdir(), `vce-figures-${randomUUID()}`);
    await mkdir(tempDir, { recursive: true });
    const tempPdf = join(tempDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempPdf, buffer);
    await mkdir(ARTIFACTS_DIR, { recursive: true });

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
          maxBuffer: 50 * 1024 * 1024,
          timeout: 120_000,
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

    // Upload artifacts to Supabase Storage if configured
    const useSupabase = supabaseUrl && serviceRoleKey;
    let adminClient: ReturnType<typeof createSupabaseAdmin> | null = null;

    if (useSupabase) {
      adminClient = createSupabaseAdmin(supabaseUrl, serviceRoleKey);
      // Ensure bucket exists
      await adminClient.storage.createBucket(BUCKET, { public: true }).catch(() => {});

      const jobId = data.jobId as string;
      const jobDir = join(ARTIFACTS_DIR, jobId);

      // Upload all files in the job directory recursively
      const uploadFile = async (filePath: string, storagePath: string) => {
        try {
          const fileData = await readFile(filePath);
          const ext = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();
          const contentType =
            ext === ".png" ? "image/png" :
            ext === ".csv" ? "text/csv" :
            ext === ".json" ? "application/json" :
            "application/octet-stream";

          await adminClient!.storage
            .from(BUCKET)
            .upload(storagePath, fileData, { contentType, upsert: true });
        } catch {
          // Skip files that fail to upload
        }
      };

      const uploadDir = async (dirPath: string, storagePrefix: string) => {
        try {
          const entries = await readdir(dirPath);
          for (const entry of entries) {
            const fullPath = join(dirPath, entry);
            const s = await stat(fullPath);
            if (s.isDirectory()) {
              await uploadDir(fullPath, `${storagePrefix}/${entry}`);
            } else {
              // Upload all files including source PDF (needed for recrop)
              await uploadFile(fullPath, `${storagePrefix}/${entry}`);
            }
          }
        } catch {
          // Skip directories that don't exist
        }
      };

      await uploadDir(jobDir, `jobs/${jobId}`);

      // Rewrite URLs to Supabase public URLs
      const rewriteToSupabase = (url: string | null): string | null => {
        if (!url) return null;
        // Original: /artifacts/{jobId}/pages/page-001.png
        const match = url.match(/^\/artifacts\/(.+)$/);
        if (!match) return url;
        const { data: { publicUrl } } = adminClient!.storage
          .from(BUCKET)
          .getPublicUrl(`jobs/${match[1]}`);
        return publicUrl;
      };

      for (const page of data.pages || []) {
        page.imageUrl = rewriteToSupabase(page.imageUrl);
      }
      for (const item of data.items || []) {
        item.imageUrl = rewriteToSupabase(item.imageUrl);
        item.downloadUrl = rewriteToSupabase(item.downloadUrl);
        if (item.tableUrl) item.tableUrl = rewriteToSupabase(item.tableUrl);
      }
    } else {
      // Fallback: rewrite to local API route (dev only)
      const rewriteToLocal = (url: string | null) => {
        if (!url) return null;
        return url.replace(
          /^\/artifacts\//,
          "/api/admin/testing/figures/artifacts/"
        );
      };

      for (const page of data.pages || []) {
        page.imageUrl = rewriteToLocal(page.imageUrl);
      }
      for (const item of data.items || []) {
        item.imageUrl = rewriteToLocal(item.imageUrl);
        item.downloadUrl = rewriteToLocal(item.downloadUrl);
        if (item.tableUrl) item.tableUrl = rewriteToLocal(item.tableUrl);
      }
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
