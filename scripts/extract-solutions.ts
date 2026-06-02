/**
 * Solution Extractor — multi-subject pipeline.
 *
 * Reads solution PDFs and uses Claude to extract worked solutions with
 * step-by-step mark allocations. Output JSON is consumed by seed-solutions.ts.
 *
 * Usage:
 *   npm run extract-solutions -- --subject vce-methods    --file 2024-mm1-sol.pdf
 *   npm run extract-solutions -- --subject vce-specialist --file 2024-sm1-sol.pdf
 *   npm run extract-solutions -- --subject vce-specialist --folder ./exams/vce/math/specialist_mathematics/solutions
 *   npm run extract-solutions -- --subject vce-specialist                                   # folder defaults to subject's solutions/
 *
 * Defaults to --subject vce-methods if omitted.
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import {
  getSubjectConfig,
  getSubjectFolder,
  parseSolutionFilename,
  type SubjectExtractionConfig,
} from "./subject-extraction-config";

interface ExtractedSolution {
  questionNumber: number;
  part: string | null;
  content: string; // Full worked solution in LaTeX markdown
}

interface ExtractedSolutions {
  year: number;
  examType: "EXAM_1" | "EXAM_2";
  /** URL slug — seed-solutions.ts reads this to scope the exam lookup. */
  subjectSlug: string;
  solutions: ExtractedSolution[];
}

function buildSystemPrompt(cfg: SubjectExtractionConfig): string {
  return `You are an expert VCE (Victorian Certificate of Education) ${cfg.displayName} exam solution analyser.
Your task is to extract the worked solution for EVERY question from a ${cfg.displayName} solution/answers PDF.

Rules:
1. Extract EVERY question and sub-part solution — do not skip any
2. For math expressions, use LaTeX wrapped in dollar signs: $f(x) = x^2 + 3x$
3. For displayed equations on their own line, use double dollar signs: $$\\int_0^1 x^2 \\, dx = \\frac{1}{3}$$
4. Break the solution into clear numbered steps — one sentence or calculation per step
5. Each essential step that earns marks must be labelled using this EXACT format:
   **Step 1** *(1 mark)*

   First sentence of this step.

   Second sentence or equation of this step.

   Third sentence if needed.

   **Step 2** *(1 mark)*

   First sentence of next step.

   Second sentence of next step.
6. CRITICAL: Every single sentence or equation within a step must be on its OWN paragraph — separated by a blank line. NEVER combine multiple sentences into one paragraph.
7. CRITICAL: When a calculation has multiple lines of working (e.g. expanding, then simplifying, then final answer), each line MUST be its own paragraph. For example, instead of writing $A = B = C$ in one line, write:
   $A = B$

   $= C$
8. CRITICAL: When applying differentiation rules (quotient, product, chain rule), you MUST explicitly state all component derivatives. For example:
   - Quotient rule: state $u$, $v$, $u'$, and $v'$ each on their own line before applying the formula
   - Product rule: state both functions and their derivatives before combining
   - Chain rule: state the outer and inner functions and their derivatives
7. There must ALWAYS be a blank line between the **Step N** *(mark)* label and its first sentence
8. There must ALWAYS be a blank line between consecutive steps
9. Parts are labelled "a", "b", "c" etc. If no parts, set part to null
10. Never put the step label and its content on the same line

Return ONLY valid JSON — no markdown, no explanation, no code fences.`;
}

async function extractSolutionsFromPDF(
  pdfPath: string,
  year: number,
  examType: "EXAM_1" | "EXAM_2",
  cfg: SubjectExtractionConfig
): Promise<ExtractedSolutions> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  console.log(`\n📄 Reading: ${path.basename(pdfPath)}`);
  const base64Pdf = fs.readFileSync(pdfPath).toString("base64");

  console.log(`🤖 Sending to Claude (this may take 30-60 seconds)...`);

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 16000,
    system: buildSystemPrompt(cfg),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64Pdf },
          },
          {
            type: "text",
            text: `This is the worked solutions for ${cfg.displayName} ${year} Exam ${examType === "EXAM_1" ? "1" : "2"}.

Extract ALL solutions and return them as a JSON object with this exact structure:
{
  "year": ${year},
  "examType": "${examType}",
  "solutions": [
    {
      "questionNumber": 1,
      "part": "a",
      "content": "**Step 1** *(1 mark)*\\n\\nApply the quotient rule where $u = \\\\cos(x)$ and $v = x^2 + 2$.\\n\\n**Step 2** *(1 mark)*\\n\\n$$\\\\frac{dy}{dx} = \\\\frac{-\\\\sin(x)(x^2+2) - 2x\\\\cos(x)}{(x^2+2)^2}$$"
    }
  ]
}

Return ONLY the JSON object. No markdown, no code fences, no extra text.`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("No text response from Claude");

  const jsonText = textBlock.text.trim()
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  let extracted: Omit<ExtractedSolutions, "subjectSlug">;
  try {
    extracted = JSON.parse(jsonText);
  } catch {
    const debugPath = path.join(
      __dirname,
      "output",
      `debug-solutions-${year}-${examType}-${cfg.urlSlug}.txt`
    );
    fs.writeFileSync(debugPath, textBlock.text);
    throw new Error(`Failed to parse JSON. Raw output saved to ${debugPath}`);
  }

  console.log(`✅ Extracted ${extracted.solutions.length} solutions`);
  return { ...extracted, subjectSlug: cfg.urlSlug };
}

/**
 * Methods solutions JSON gets a slug-free name to keep the existing
 * pipeline import-compatible. New subjects get a slug-suffixed name.
 */
function outputFilename(
  year: number,
  examType: "EXAM_1" | "EXAM_2",
  urlSlug: string
): string {
  return urlSlug === "vce-methods"
    ? `${year}-${examType}-solutions.json`
    : `${year}-${examType}-solutions-${urlSlug}.json`;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY not set in .env.local");
    process.exit(1);
  }

  const args = process.argv.slice(2);

  const subjectIdx = args.indexOf("--subject");
  const subjectSlug = subjectIdx !== -1 ? args[subjectIdx + 1] : "vce-methods";
  const cfg = getSubjectConfig(subjectSlug);
  console.log(`📚 Subject: ${cfg.displayName} (${cfg.urlSlug})`);

  const outputDir = path.join(path.dirname(__filename), "output");
  fs.mkdirSync(outputDir, { recursive: true });

  // ── Single file mode ──
  if (args.includes("--file")) {
    const filename = args[args.indexOf("--file") + 1];
    const parsed = parseSolutionFilename(filename, cfg.urlSlug);
    if (!parsed) {
      console.error(`❌ Could not parse filename: ${filename}`);
      console.error(`   Expected format for ${cfg.urlSlug}: 2024-${cfg.examPrefix}1-sol.pdf`);
      process.exit(1);
    }

    const pdfPath = path.join(
      getSubjectFolder(cfg.urlSlug, "solutions"),
      filename
    );
    if (!fs.existsSync(pdfPath)) {
      console.error(`❌ File not found: ${pdfPath}`);
      process.exit(1);
    }

    const result = await extractSolutionsFromPDF(pdfPath, parsed.year, parsed.examType, cfg);
    const outFile = path.join(outputDir, outputFilename(parsed.year, parsed.examType, cfg.urlSlug));
    fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
    console.log(`\n💾 Saved: ${outFile}`);
    return;
  }

  // ── Folder mode (defaults to subject's solutions/ folder) ──
  const folderIdx = args.indexOf("--folder");
  const folderPath = folderIdx !== -1
    ? args[folderIdx + 1]
    : getSubjectFolder(cfg.urlSlug, "solutions");

  if (!fs.existsSync(folderPath)) {
    console.error(`❌ Folder not found: ${folderPath}`);
    process.exit(1);
  }

  const files = fs.readdirSync(folderPath)
    .filter((f) => f.toLowerCase().endsWith("-sol.pdf"))
    .sort();

  if (files.length === 0) {
    console.error(`❌ No solution PDFs found in: ${folderPath}`);
    process.exit(1);
  }

  console.log(`\n📁 Found ${files.length} solution PDF(s)`);
  for (const file of files) {
    const parsed = parseSolutionFilename(file, cfg.urlSlug);
    if (!parsed) { console.warn(`⚠️  Skipping (can't parse for ${cfg.urlSlug}): ${file}`); continue; }

    const result = await extractSolutionsFromPDF(path.join(folderPath, file), parsed.year, parsed.examType, cfg);
    const outFile = path.join(outputDir, outputFilename(parsed.year, parsed.examType, cfg.urlSlug));
    fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
    console.log(`💾 Saved: ${outFile}`);
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n✅ Done!\n");
}

main().catch((err) => { console.error("\n❌", err.message); process.exit(1); });
