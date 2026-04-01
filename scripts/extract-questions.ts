/**
 * VCE Mathematical Methods — Question Extractor
 *
 * Usage:
 *   npm run extract -- --pdf ./exams/2023-exam1.pdf --year 2023 --exam 1
 *   npm run extract -- --folder ./exams
 *
 * Output: JSON files in ./scripts/output/
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExtractedQuestion {
  questionNumber: number;
  part: string | null; // "a", "b", "c", or null
  marks: number;
  content: string; // Question text (LaTeX for math, e.g. $f(x) = x^2$)
  topic: string;
  subtopic: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  imageDescription: string | null; // Describe any diagrams if present
}

interface ExtractedExam {
  year: number;
  examType: "EXAM_1" | "EXAM_2";
  questions: ExtractedQuestion[];
}

// ─── VCE Math Methods Topics ──────────────────────────────────────────────────

const TOPICS = `
Valid topics and their subtopics:
- Functions and Graphs → Linear Functions, Quadratic Functions, Polynomial Functions, Power Functions, Exponential Functions, Logarithmic Functions, Circular Functions (sin/cos/tan), Inverse Functions, Transformations
- Calculus → Limits, Differentiation, Product Rule, Quotient Rule, Chain Rule, Integration, Definite Integrals, Areas Under Curves, Antiderivatives
- Algebra → Simultaneous Equations, Inequalities, Partial Fractions, Exponential Equations, Logarithmic Equations
- Probability → Probability Rules, Conditional Probability, Discrete Random Variables, Binomial Distribution, Normal Distribution, Continuous Random Variables, Expected Value, Variance
- Statistics → Sample Proportions, Confidence Intervals, Hypothesis Testing
`;

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert VCE (Victorian Certificate of Education) Mathematical Methods exam analyser.
Your task is to extract ALL questions from a VCE Math Methods exam PDF.

Rules:
1. Extract EVERY question and sub-part — do not skip any
2. For math expressions, use LaTeX format wrapped in dollar signs: $f(x) = x^2 + 3x - 2$
3. For displayed equations (on their own line), use double dollar signs: $$\\int_0^1 x^2 \\, dx$$
4. If a question references a diagram/graph, describe it briefly in imageDescription
5. Assign the most appropriate topic and subtopic from the list provided
6. Estimate difficulty: EASY (straightforward recall/application), MEDIUM (multi-step), HARD (complex/unfamiliar)
7. For multiple choice questions (Exam 2 Section A), still extract them as individual questions
8. Parts are labelled "a", "b", "c", "d" etc. If a question has no parts, set part to null
9. Always include the mark allocation for each question/part

${TOPICS}

Return ONLY valid JSON — no markdown, no explanation, no code fences.`;

// ─── Extraction Function ──────────────────────────────────────────────────────

async function extractQuestionsFromPDF(
  pdfPath: string,
  year: number,
  examType: "EXAM_1" | "EXAM_2"
): Promise<ExtractedExam> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  console.log(`\n📄 Reading: ${path.basename(pdfPath)}`);
  const pdfBytes = fs.readFileSync(pdfPath);
  const base64Pdf = pdfBytes.toString("base64");

  console.log(`🤖 Sending to Claude Opus (this may take 30-60 seconds)...`);

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64Pdf,
            },
          },
          {
            type: "text",
            text: `This is the VCE Mathematical Methods ${year} Exam ${examType === "EXAM_1" ? "1" : "2"}.

Extract ALL questions and return them as a JSON object with this exact structure:
{
  "year": ${year},
  "examType": "${examType}",
  "questions": [
    {
      "questionNumber": 1,
      "part": "a",
      "marks": 2,
      "content": "Find the derivative of $f(x) = x^3 + 2x$",
      "topic": "Calculus",
      "subtopic": "Differentiation",
      "difficulty": "EASY",
      "imageDescription": null
    }
  ]
}

Important: Return ONLY the JSON object. No markdown, no code fences, no extra text.`,
          },
        ],
      },
    ],
  });

  // Extract text from response (skip thinking blocks)
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const rawText = textBlock.text.trim();

  // Parse JSON — strip code fences if Claude added them anyway
  const jsonText = rawText
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  let extracted: ExtractedExam;
  try {
    extracted = JSON.parse(jsonText);
  } catch {
    const outputDir = path.join(__dirname, "output");
    fs.mkdirSync(outputDir, { recursive: true });
    const debugPath = path.join(outputDir, `debug-${year}-${examType}.txt`);
    fs.writeFileSync(debugPath, rawText);
    throw new Error(
      `Failed to parse JSON response. Raw output saved to ${debugPath}`
    );
  }

  console.log(`✅ Extracted ${extracted.questions.length} questions`);
  return extracted;
}

// ─── File Naming Helpers ──────────────────────────────────────────────────────

function parseFilename(filename: string): { year: number; examType: "EXAM_1" | "EXAM_2" } | null {
  // Supports: 2023-exam1.pdf, 2023-mm1.pdf, 2023_exam2.pdf, exam1_2023.pdf, 2023exam1.pdf
  const match = filename.match(/(\d{4}).*(?:exam|mm)[_-]?([12])|(?:exam|mm)[_-]?([12]).*(\d{4})/i);
  if (!match) return null;

  const year = parseInt(match[1] || match[4]);
  const num = parseInt(match[2] || match[3]);

  if (isNaN(year) || isNaN(num)) return null;
  return { year, examType: num === 1 ? "EXAM_1" : "EXAM_2" };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY environment variable is not set.");
    console.error(
      "   Add it to your .env.local or export it in your terminal:\n"
    );
    console.error("   export ANTHROPIC_API_KEY=sk-ant-...\n");
    process.exit(1);
  }

  const outputDir = path.join(path.dirname(__filename), "output");
  fs.mkdirSync(outputDir, { recursive: true });

  // ── Single PDF mode ──
  if (args.includes("--pdf")) {
    const pdfIndex = args.indexOf("--pdf");
    const pdfPath = args[pdfIndex + 1];

    const yearIndex = args.indexOf("--year");
    const examIndex = args.indexOf("--exam");

    if (!pdfPath || !fs.existsSync(pdfPath)) {
      console.error(`❌ PDF not found: ${pdfPath}`);
      process.exit(1);
    }

    let year: number;
    let examType: "EXAM_1" | "EXAM_2";

    if (yearIndex !== -1 && examIndex !== -1) {
      year = parseInt(args[yearIndex + 1]);
      examType = args[examIndex + 1] === "1" ? "EXAM_1" : "EXAM_2";
    } else {
      const parsed = parseFilename(path.basename(pdfPath));
      if (!parsed) {
        console.error(
          "❌ Could not determine year/exam from filename. Use --year and --exam flags."
        );
        console.error(
          "   Example: npm run extract -- --pdf ./exam.pdf --year 2023 --exam 1\n"
        );
        process.exit(1);
      }
      ({ year, examType } = parsed);
    }

    const result = await extractQuestionsFromPDF(pdfPath, year, examType);
    const outFile = path.join(outputDir, `${year}-${examType}.json`);
    fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
    console.log(`\n💾 Saved: ${outFile}`);
    printSummary(result);
    return;
  }

  // ── Folder mode ──
  if (args.includes("--folder")) {
    const folderIndex = args.indexOf("--folder");
    const folderPath = args[folderIndex + 1];

    if (!folderPath || !fs.existsSync(folderPath)) {
      console.error(`❌ Folder not found: ${folderPath}`);
      process.exit(1);
    }

    const pdfs = fs
      .readdirSync(folderPath)
      .filter((f) => f.toLowerCase().endsWith(".pdf"))
      .sort();

    if (pdfs.length === 0) {
      console.error(`❌ No PDF files found in: ${folderPath}`);
      process.exit(1);
    }

    console.log(`\n📁 Found ${pdfs.length} PDF(s) in ${folderPath}`);

    const results: ExtractedExam[] = [];
    const failed: string[] = [];

    for (const pdf of pdfs) {
      const parsed = parseFilename(pdf);
      if (!parsed) {
        console.warn(`⚠️  Skipping (can't parse filename): ${pdf}`);
        console.warn(`   Rename to format: 2023-exam1.pdf or 2023-exam2.pdf`);
        continue;
      }

      try {
        const result = await extractQuestionsFromPDF(
          path.join(folderPath, pdf),
          parsed.year,
          parsed.examType
        );
        const outFile = path.join(outputDir, `${parsed.year}-${parsed.examType}.json`);
        fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
        console.log(`💾 Saved: ${outFile}`);
        results.push(result);
      } catch (err) {
        console.error(`❌ Failed: ${pdf} — ${(err as Error).message}`);
        failed.push(pdf);
      }

      // Small delay between requests to avoid rate limits
      await new Promise((r) => setTimeout(r, 2000));
    }

    // Save combined output
    if (results.length > 0) {
      const combinedPath = path.join(outputDir, "all-questions.json");
      fs.writeFileSync(combinedPath, JSON.stringify(results, null, 2));
      console.log(`\n📦 Combined output: ${combinedPath}`);
    }

    console.log(`\n✅ Done: ${results.length} succeeded, ${failed.length} failed`);
    if (failed.length > 0) {
      console.log("Failed files:", failed);
    }
    return;
  }

  // ── Help ──
  console.log(`
VCE Math Methods Question Extractor
═══════════════════════════════════

Usage:
  npm run extract -- --pdf <path> [--year <year>] [--exam <1|2>]
  npm run extract -- --folder <path>

Examples:
  npm run extract -- --pdf ./exams/2023-exam1.pdf
  npm run extract -- --pdf ./exam.pdf --year 2023 --exam 1
  npm run extract -- --folder ./exams

File naming (for --folder mode):
  2023-exam1.pdf  ✅
  2023-exam2.pdf  ✅
  2022_exam1.pdf  ✅
  exam1-2021.pdf  ✅

Output:
  scripts/output/<year>-<EXAM_TYPE>.json
  scripts/output/all-questions.json  (folder mode only)
  `);
}

function printSummary(exam: ExtractedExam) {
  const byTopic: Record<string, number> = {};
  for (const q of exam.questions) {
    byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;
  }

  console.log(`\n📊 Summary: ${exam.year} ${exam.examType}`);
  console.log(`   Total questions: ${exam.questions.length}`);
  console.log(`   Total marks: ${exam.questions.reduce((s, q) => s + q.marks, 0)}`);
  console.log(`   By topic:`);
  for (const [topic, count] of Object.entries(byTopic).sort()) {
    console.log(`     ${topic}: ${count}`);
  }
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err.message);
  process.exit(1);
});
