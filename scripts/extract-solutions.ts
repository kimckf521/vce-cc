/**
 * VCE Mathematical Methods — Solution Extractor
 *
 * Reads solution PDFs from exams/solutions/ and extracts per-question solutions
 * using Claude, outputting JSON files ready for seeding.
 *
 * File naming: {year}-mm{1|2}-sol.pdf  e.g. 2016-mm1-sol.pdf
 *
 * Usage:
 *   npm run extract-solutions -- --file 2016-mm1-sol.pdf
 *   npm run extract-solutions -- --folder ./exams/solutions
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

interface ExtractedSolution {
  questionNumber: number;
  part: string | null;
  content: string; // Full worked solution in LaTeX markdown
}

interface ExtractedSolutions {
  year: number;
  examType: "EXAM_1" | "EXAM_2";
  solutions: ExtractedSolution[];
}

const SYSTEM_PROMPT = `You are an expert VCE (Victorian Certificate of Education) Mathematical Methods exam solution analyser.
Your task is to extract the worked solution for EVERY question from a VCE Math Methods solution/answers PDF.

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

async function extractSolutionsFromPDF(
  pdfPath: string,
  year: number,
  examType: "EXAM_1" | "EXAM_2"
): Promise<ExtractedSolutions> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  console.log(`\n📄 Reading: ${path.basename(pdfPath)}`);
  const base64Pdf = fs.readFileSync(pdfPath).toString("base64");

  console.log(`🤖 Sending to Claude (this may take 30-60 seconds)...`);

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
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
            text: `This is the worked solutions for VCE Mathematical Methods ${year} Exam ${examType === "EXAM_1" ? "1" : "2"}.

Extract ALL solutions and return them as a JSON object with this exact structure:
{
  "year": ${year},
  "examType": "${examType}",
  "solutions": [
    {
      "questionNumber": 1,
      "part": "a",
      "content": "**Step 1** *(1 mark)*\\n\\nApply the quotient rule where $u = \\\\cos(x)$ and $v = x^2 + 2$.\\n\\n**Step 2** *(1 mark)*\\n\\n$$\\\\frac{dy}{dx} = \\\\frac{-\\\\sin(x)(x^2+2) - 2x\\\\cos(x)}{(x^2+2)^2}$$"
    },
    {
      "questionNumber": 1,
      "part": "b",
      "content": "..."
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

  let extracted: ExtractedSolutions;
  try {
    extracted = JSON.parse(jsonText);
  } catch {
    const debugPath = path.join(__dirname, "output", `debug-solutions-${year}-${examType}.txt`);
    fs.writeFileSync(debugPath, textBlock.text);
    throw new Error(`Failed to parse JSON. Raw output saved to ${debugPath}`);
  }

  console.log(`✅ Extracted ${extracted.solutions.length} solutions`);
  return extracted;
}

function parseFilename(filename: string): { year: number; examType: "EXAM_1" | "EXAM_2" } | null {
  const match = filename.match(/^(\d{4})-mm([12])-sol\.pdf$/i);
  if (!match) return null;
  return { year: parseInt(match[1]), examType: match[2] === "1" ? "EXAM_1" : "EXAM_2" };
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY not set in .env.local");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const outputDir = path.join(path.dirname(__filename), "output");
  fs.mkdirSync(outputDir, { recursive: true });

  // Single file mode
  if (args.includes("--file")) {
    const filename = args[args.indexOf("--file") + 1];
    const parsed = parseFilename(filename);
    if (!parsed) {
      console.error(`❌ Could not parse filename: ${filename}`);
      console.error(`   Expected format: 2016-mm1-sol.pdf`);
      process.exit(1);
    }

    const pdfPath = path.join(process.cwd(), "exams", "solutions", filename);
    if (!fs.existsSync(pdfPath)) {
      console.error(`❌ File not found: ${pdfPath}`);
      process.exit(1);
    }

    const result = await extractSolutionsFromPDF(pdfPath, parsed.year, parsed.examType);
    const outFile = path.join(outputDir, `${parsed.year}-${parsed.examType}-solutions.json`);
    fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
    console.log(`\n💾 Saved: ${outFile}`);
    return;
  }

  // Folder mode
  const folderPath = args.includes("--folder")
    ? args[args.indexOf("--folder") + 1]
    : path.join(process.cwd(), "exams", "solutions");

  const files = fs.readdirSync(folderPath)
    .filter((f) => f.toLowerCase().endsWith("-sol.pdf"))
    .sort();

  if (files.length === 0) {
    console.error(`❌ No solution PDFs found in: ${folderPath}`);
    process.exit(1);
  }

  console.log(`\n📁 Found ${files.length} solution PDF(s)`);
  for (const file of files) {
    const parsed = parseFilename(file);
    if (!parsed) { console.warn(`⚠️  Skipping: ${file}`); continue; }

    const result = await extractSolutionsFromPDF(path.join(folderPath, file), parsed.year, parsed.examType);
    const outFile = path.join(outputDir, `${parsed.year}-${parsed.examType}-solutions.json`);
    fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
    console.log(`💾 Saved: ${outFile}`);
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n✅ Done!\n");
}

main().catch((err) => { console.error("\n❌", err.message); process.exit(1); });
