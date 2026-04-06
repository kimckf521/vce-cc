import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { isAdminRole } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = rateLimit(`admin-diagrams:${user.id}`, { maxRequests: 20, windowMs: 60_000 });
  if (limited) return limited;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!isAdminRole(dbUser?.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });

  const body = await req.json();
  const { pageImage, pageNumber, pdfName } = body;

  if (!pageImage || !pageNumber) {
    return NextResponse.json({ error: "pageImage and pageNumber are required" }, { status: 400 });
  }

  const prompt = `You are analyzing page ${pageNumber} of a VCE Mathematical Methods exam PDF ("${pdfName || "unknown"}").

TASK: Identify every graph, diagram, chart, or visual figure on this page. Return precise bounding boxes.

CRITICAL RULES FOR BOUNDING BOXES:
- x, y, w, h are percentages of the FULL PAGE dimensions (0-100).
- x,y is the TOP-LEFT corner of the diagram.
- The bounding box must be TIGHT around the visual content — include only the graph/diagram itself, its axes, labels, and tick marks.
- Do NOT include surrounding question text, answer lines, blank space, "marks" annotations, or any content below/above the diagram.
- Be PRECISE. Look carefully at where the diagram starts and ends. Even a few percent off will crop the wrong region.
- For MCQ questions with multiple option graphs (A, B, C, D): return ONE entry with extractionMethod "page_crop" covering ALL the option graphs together as a group. Set the question to the MCQ question number.

WHAT TO DETECT:
- Function graphs (curves plotted on axes)
- Empty coordinate grids/planes (for student sketching)
- Scatter plots, bar charts, statistical displays
- Geometric diagrams (shapes, triangles, circles)
- Normal distribution curves
- Tree diagrams, probability diagrams

WHAT TO SKIP (do NOT detect these):
- Blank answer lines / writing spaces
- Page headers, footers, question numbers alone
- Tables of values (text-based tables)
- Formulas or equations in text

For each diagram, return:
- x, y, w, h: bounding box as page percentages (be precise!)
- question: the question number (e.g. "3", "5a", "12")
- type: one of "function_graph" | "cartesian_grid" | "complex_diagram" | "statistical_chart" | "geometric"
- description: brief description of what the diagram shows
- extractionMethod: choose ONE:
  - "grid_json" — ONLY for completely empty coordinate grids with no curves drawn (just axes and gridlines where students will sketch)
  - "page_crop" — for ALL other diagrams. This is the DEFAULT and safest option. Use this for any graph that has curves, points, shading, annotations, or any complexity.
- suggestedConfig: ONLY when extractionMethod is "grid_json":
  {"xMin": <number>, "xMax": <number>, "yMin": <number>, "yMax": <number>}
  Read the axis labels carefully to get exact values.
  For ALL other methods, set to null.

NOTE: Do NOT use "function_json" extraction method. It is unreliable. Always use "page_crop" for graphs with curves.

Return ONLY a valid JSON array. No markdown fences, no explanation. If no diagrams on this page, return [].

Example output:
[
  {"x": 5, "y": 32, "w": 42, "h": 28, "question": "3a", "type": "cartesian_grid", "description": "Empty Cartesian plane for sketching, axes from -3 to 4 on x and -2 to 6 on y", "extractionMethod": "grid_json", "suggestedConfig": {"xMin": -3, "xMax": 4, "yMin": -2, "yMax": 6}},
  {"x": 8, "y": 15, "w": 50, "h": 35, "question": "5", "type": "function_graph", "description": "Graph of f(x) = x^3 - 2x with turning points marked", "extractionMethod": "page_crop", "suggestedConfig": null},
  {"x": 10, "y": 55, "w": 70, "h": 30, "question": "12", "type": "function_graph", "description": "MCQ options A-D showing four transformed function graphs", "extractionMethod": "page_crop", "suggestedConfig": null}
]`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: pageImage,
              },
            },
            { type: "text", text: prompt },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `Claude API error: ${response.status}`, details: err }, { status: 502 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "[]";

    // Extract JSON array from response
    const match = text.match(/\[[\s\S]*\]/);
    const diagrams = match ? JSON.parse(match[0]) : [];

    return NextResponse.json({ diagrams, pageNumber });
  } catch (err) {
    return NextResponse.json({ error: "Failed to analyze page", details: String(err) }, { status: 500 });
  }
}
