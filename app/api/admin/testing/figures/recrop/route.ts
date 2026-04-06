import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { isAdminRole } from "@/lib/utils";
import { execFile } from "child_process";
import { join } from "path";

const ARTIFACTS_DIR = join(process.cwd(), ".figure-artifacts");

export async function POST(req: NextRequest) {
  if (process.env.VERCEL) {
    const extractorUrl = process.env.EXTRACTOR_API_URL;
    if (!extractorUrl) {
      return NextResponse.json(
        { error: "Recrop requires the remote extractor server." },
        { status: 503 }
      );
    }

    // Proxy to remote extractor
    const body = await req.json();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const apiKey = process.env.EXTRACTOR_API_KEY;
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    const remoteRes = await fetch(`${extractorUrl}/api/recrop`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await remoteRes.json().catch(() => ({ error: "Remote recrop failed" }));
    return NextResponse.json(data, { status: remoteRes.status });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = rateLimit(`admin-figures-recrop:${user.id}`, {
    maxRequests: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!isAdminRole(dbUser?.role))
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

    // Rewrite artifact URLs
    if (data.item) {
      const rewrite = (url: string | null) =>
        url?.replace(/^\/artifacts\//, "/api/admin/testing/figures/artifacts/") ?? null;
      data.item.imageUrl = rewrite(data.item.imageUrl);
      data.item.downloadUrl = rewrite(data.item.downloadUrl);
      if (data.item.tableUrl) data.item.tableUrl = rewrite(data.item.tableUrl);
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
