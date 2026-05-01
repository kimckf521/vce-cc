import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { isAdminRole } from "@/lib/utils";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { execFile } from "child_process";
import { readFile } from "fs/promises";
import { join } from "path";

const ARTIFACTS_DIR = join(process.cwd(), ".figure-artifacts");
const BUCKET = "extraction";

export async function POST(req: NextRequest) {
  // Use the remote extractor ONLY when explicitly configured. This way:
  //   - Self-hosted with Python available → leave EXTRACTOR_API_URL unset →
  //     runs the local Python path below.
  //   - Vercel/serverless without Python → set EXTRACTOR_API_URL to a server
  //     that runs the figure-extractor module → proxy to it.
  // (The previous auto-detect-Vercel path was forcing the proxy whenever
  // Vercel set its built-in env var, even when no extractor was reachable.)
  const extractorUrl = process.env.EXTRACTOR_API_URL;
  if (extractorUrl) {
    try {
      const body = await req.json();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const apiKey = process.env.EXTRACTOR_API_KEY;
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

      const remoteRes = await fetch(`${extractorUrl}/api/recrop`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const text = await remoteRes.text();
      let data: unknown;
      try {
        data = text ? JSON.parse(text) : { error: "Remote recrop returned empty response" };
      } catch {
        data = { error: "Remote recrop returned non-JSON response", details: text.slice(0, 500) };
      }
      return NextResponse.json(data, { status: remoteRes.status });
    } catch (err) {
      console.error("[figure-recrop] proxy error:", err);
      const message = err instanceof Error ? err.message : String(err);
      const cause =
        err instanceof Error && err.cause
          ? err.cause instanceof Error
            ? `${err.cause.name}: ${err.cause.message}`
            : String(err.cause)
          : null;
      const detail = cause ? `${message} (${cause})` : message;
      return NextResponse.json(
        {
          error: `Failed to reach remote extractor at ${extractorUrl}: ${detail}`,
          details: detail,
        },
        { status: 502 }
      );
    }
  }

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`admin-figures-recrop:${user.id}`, {
    maxRequests: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  if (!isAdminRole(auth.dbUser.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { jobId, pageNumber, box, kind, itemId, labelOverride, existingLabels } = body;

    if (!jobId || !pageNumber || !box) {
      return NextResponse.json(
        { error: "jobId, pageNumber, and box are required" },
        { status: 400 }
      );
    }

    // Call Python recrop function via a small inline script
    const script = `
import json, sys
sys.path.insert(0, "${join(process.cwd(), "scripts").replace(/\\/g, "/")}")
from importlib import import_module
extractor = import_module("figure-extractor")
from pathlib import Path

result = extractor.recrop_pdf_region(
    job_id=${JSON.stringify(jobId)},
    page_number=${pageNumber},
    box=${JSON.stringify(box)},
    kind=${JSON.stringify(kind || "auto")},
    artifacts_root=Path(${JSON.stringify(ARTIFACTS_DIR)}),
    item_id=${itemId ? JSON.stringify(itemId) : "None"},
    label_override=${labelOverride ? JSON.stringify(labelOverride) : '""'},
    existing_labels=${JSON.stringify(existingLabels || [])},
)
print(json.dumps({"item": result}))
`;

    const result = await new Promise<string>((resolve, reject) => {
      execFile(
        "python3",
        ["-c", script],
        {
          maxBuffer: 10 * 1024 * 1024,
          timeout: 30_000,
          env: {
            ...process.env,
            PATH: `/opt/homebrew/bin:${process.env.PATH}`,
          },
        },
        (error, stdout, stderr) => {
          if (error) {
            console.error("[figure-recrop] stderr:", stderr);
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

    if (data.item) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const useSupabase = Boolean(supabaseUrl && serviceRoleKey);

      if (useSupabase) {
        const adminClient = createSupabaseAdmin(supabaseUrl!, serviceRoleKey!);
        await adminClient.storage.createBucket(BUCKET, { public: true }).catch(() => {});

        const uploadCache = new Map<string, string>();
        const uploadAndRewrite = async (
          url: string | null
        ): Promise<string | null> => {
          if (!url) return null;
          const cached = uploadCache.get(url);
          if (cached) return cached;

          const match = url.match(/^\/artifacts\/(.+)$/);
          if (!match) return url;
          const relative = match[1];
          const localPath = join(ARTIFACTS_DIR, relative);
          const storagePath = `jobs/${relative}`;

          try {
            const fileData = await readFile(localPath);
            const ext = localPath.substring(localPath.lastIndexOf(".")).toLowerCase();
            const contentType =
              ext === ".png" ? "image/png" :
              ext === ".pdf" ? "application/pdf" :
              ext === ".csv" ? "text/csv" :
              ext === ".json" ? "application/json" :
              "application/octet-stream";

            await adminClient.storage
              .from(BUCKET)
              .upload(storagePath, fileData, { contentType, upsert: true });
          } catch (err) {
            console.error(`[figure-recrop] upload failed for ${storagePath}:`, err);
            return url;
          }

          const { data: { publicUrl } } = adminClient.storage
            .from(BUCKET)
            .getPublicUrl(storagePath);
          uploadCache.set(url, publicUrl);
          return publicUrl;
        };

        data.item.imageUrl = await uploadAndRewrite(data.item.imageUrl);
        data.item.downloadUrl = await uploadAndRewrite(data.item.downloadUrl);
        if (data.item.tableUrl) {
          data.item.tableUrl = await uploadAndRewrite(data.item.tableUrl);
        }
      } else {
        const rewrite = (url: string | null) =>
          url?.replace(/^\/artifacts\//, "/api/admin/testing/figures/artifacts/") ?? null;
        data.item.imageUrl = rewrite(data.item.imageUrl);
        data.item.downloadUrl = rewrite(data.item.downloadUrl);
        if (data.item.tableUrl) data.item.tableUrl = rewrite(data.item.tableUrl);
      }
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[figure-recrop] Error:", err);
    return NextResponse.json(
      {
        error: "Recrop failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
