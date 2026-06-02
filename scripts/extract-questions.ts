/**
 * VCE Question Extractor — multi-subject pipeline.
 *
 * Reads exam PDFs and uses Claude to extract structured question data
 * (topic + subtopic tags, difficulty, marks, content). Output JSON is
 * consumed by seed-questions.ts.
 *
 * Usage:
 *   npm run extract -- --subject vce-methods    --pdf ./exams/.../2024-mm1.pdf
 *   npm run extract -- --subject vce-specialist --pdf ./exams/.../2024-sm1.pdf
 *   npm run extract -- --subject vce-specialist --folder ./exams/vce/math/specialist_mathematics/questions
 *   npm run extract -- --subject vce-specialist                                       # folder defaults to the subject's questions/
 *
 * Defaults to --subject vce-methods if omitted (backwards-compatible).
 *
 * Output: JSON files in ./scripts/output/, named `<year>-<EXAM_TYPE>-<subject-slug>.json`
 *         (Methods JSON files written WITHOUT a subject suffix to keep the
 *          existing seeded data importable without renaming.)
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import {
  getSubjectConfig,
  getSubjectFolder,
  parsePaperFilename,
  type SubjectExtractionConfig,
} from "./subject-extraction-config";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExtractedQuestion {
  questionNumber: number;
  part: string | null; // "a", "b", "c", or null
  marks: number;
  content: string; // Question text (LaTeX for math, e.g. $f(x) = x^2$)
  topic: string;
  subtopics: string[]; // 1-3 subtopics per question
  difficulty: "EASY" | "MEDIUM" | "HARD";
  imageDescription: string | null; // Describe any diagrams if present
}

interface ExtractedExam {
  year: number;
  examType: "EXAM_1" | "EXAM_2";
  /** URL slug of the subject this exam belongs to. Read by seed-questions.ts
   * to set Question.subjectId / Exam.subjectId on the new rows. */
  subjectSlug: string;
  questions: ExtractedQuestion[];
}

// ─── System Prompt (per-subject) ─────────────────────────────────────────────

function buildSystemPrompt(cfg: SubjectExtractionConfig): string {
  return `You are an expert VCE (Victorian Certificate of Education) ${cfg.displayName} exam analyser.
Your task is to extract ALL questions from a ${cfg.displayName} exam PDF.

Rules:
1. Extract EVERY question and sub-part — do not skip any
2. For math expressions, use LaTeX format wrapped in dollar signs: $f(x) = x^2 + 3x - 2$
3. For displayed equations (on their own line), use double dollar signs: $$\\int_0^1 x^2 \\, dx$$
4. If a question references a diagram/graph, describe it briefly in imageDescription
5. Assign the most appropriate topic from the list provided
6. Assign 1-3 subtopics as an array. Use the primary skill first, then add secondary skills if the question genuinely requires them. Most questions need 1-2 subtopics; use 3 only when truly warranted
7. Estimate difficulty: EASY (straightforward recall/application), MEDIUM (multi-step), HARD (complex/unfamiliar)
8. For multiple choice questions (Exam 2 Section A), still extract them as individual questions
9. Parts are labelled "a", "b", "c", "d" etc. If a question has no parts, set part to null
10. Always include the mark allocation for each question/part

${cfg.topicTaxonomyPrompt}

Return ONLY valid JSON — no markdown, no explanation, no code fences.`;
}

// ─── Extraction Function ──────────────────────────────────────────────────────

async function extractQuestionsFromPDF(
  pdfPath: string,
  year: number,
  examType: "EXAM_1" | "EXAM_2",
  cfg: SubjectExtractionConfig
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
    system: buildSystemPrompt(cfg),
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
            text: `This is the ${cfg.displayName} ${year} Exam ${examType === "EXAM_1" ? "1" : "2"}.

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
      "subtopics": ["Differentiation"],
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

  let extracted: Omit<ExtractedExam, "subjectSlug">;
  try {
    extracted = JSON.parse(jsonText);
  } catch {
    const outputDir = path.join(__dirname, "output");
    fs.mkdirSync(outputDir, { recursive: true });
    const debugPath = path.join(
      outputDir,
      `debug-${year}-${examType}-${cfg.urlSlug}.txt`
    );
    fs.writeFileSync(debugPath, rawText);
    throw new Error(
      `Failed to parse JSON response. Raw output saved to ${debugPath}`
    );
  }

  console.log(`✅ Extracted ${extracted.questions.length} questions`);
  return { ...extracted, subjectSlug: cfg.urlSlug };
}

// ─── Output filename ──────────────────────────────────────────────────────────

/**
 * Methods (the original subject) writes JSON without a slug suffix so the
 * existing seed pipeline keeps working unchanged: `2024-EXAM_1.json`. New
 * subjects get a slug-suffixed name to disambiguate: `2024-EXAM_1-vce-specialist.json`.
 *
 * This is purely a filesystem convenience — the seed script reads the
 * `subjectSlug` field inside the JSON to know which subject to seed into.
 */
function outputFilename(
  year: number,
  examType: "EXAM_1" | "EXAM_2",
  urlSlug: string
): string {
  return urlSlug === "vce-methods"
    ? `${year}-${examType}.json`
    : `${year}-${examType}-${urlSlug}.json`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY environment variable is not set.");
    console.error("   Add it to .env.local or export it in your terminal.\n");
    process.exit(1);
  }

  // ── Resolve --subject (default: vce-methods) ──
  const subjectIdx = args.indexOf("--subject");
  const subjectSlug = subjectIdx !== -1 ? args[subjectIdx + 1] : "vce-methods";
  const cfg = getSubjectConfig(subjectSlug);
  console.log(`📚 Subject: ${cfg.displayName} (${cfg.urlSlug})`);

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
      const parsed = parsePaperFilename(path.basename(pdfPath), cfg.urlSlug);
      if (!parsed) {
        console.error(
          `❌ Could not determine year/exam from filename for subject "${cfg.urlSlug}".`
        );
        console.error(
          `   Expected: 2024-${cfg.examPrefix}1.pdf (or pass --year and --exam flags).`
        );
        process.exit(1);
      }
      ({ year, examType } = parsed);
    }

    const result = await extractQuestionsFromPDF(pdfPath, year, examType, cfg);
    const outFile = path.join(outputDir, outputFilename(year, examType, cfg.urlSlug));
    fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
    console.log(`\n💾 Saved: ${outFile}`);
    printSummary(result);
    return;
  }

  // ── Folder mode (defaults to the subject's questions/ folder) ──
  const folderIdx = args.indexOf("--folder");
  const folderPath = folderIdx !== -1
    ? args[folderIdx + 1]
    : getSubjectFolder(cfg.urlSlug, "questions");

  if (!fs.existsSync(folderPath)) {
    console.error(`❌ Folder not found: ${folderPath}`);
    console.error(
      `   For subject "${cfg.urlSlug}", drop PDFs into ${getSubjectFolder(cfg.urlSlug, "questions")}`
    );
    process.exit(1);
  }

  const pdfs = fs
    .readdirSync(folderPath)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    // Skip solution PDFs (those have -sol.pdf suffix)
    .filter((f) => !f.toLowerCase().includes("-sol."))
    .sort();

  if (pdfs.length === 0) {
    console.error(`❌ No question PDFs found in: ${folderPath}`);
    process.exit(1);
  }

  console.log(`\n📁 Found ${pdfs.length} PDF(s) in ${folderPath}`);

  const results: ExtractedExam[] = [];
  const failed: string[] = [];

  for (const pdf of pdfs) {
    const parsed = parsePaperFilename(pdf, cfg.urlSlug);
    if (!parsed) {
      console.warn(`⚠️  Skipping (can't parse filename for ${cfg.urlSlug}): ${pdf}`);
      console.warn(`   Expected format: 2024-${cfg.examPrefix}1.pdf`);
      continue;
    }

    try {
      const result = await extractQuestionsFromPDF(
        path.join(folderPath, pdf),
        parsed.year,
        parsed.examType,
        cfg
      );
      const outFile = path.join(outputDir, outputFilename(parsed.year, parsed.examType, cfg.urlSlug));
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

  console.log(`\n✅ Done: ${results.length} succeeded, ${failed.length} failed`);
  if (failed.length > 0) {
    console.log("Failed files:", failed);
  }
}

function printSummary(exam: ExtractedExam) {
  const byTopic: Record<string, number> = {};
  const bySubtopic: Record<string, number> = {};
  for (const q of exam.questions) {
    byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;
    for (const st of q.subtopics) {
      bySubtopic[st] = (bySubtopic[st] || 0) + 1;
    }
  }

  const avgSubtopics = exam.questions.length
    ? (exam.questions.reduce((s, q) => s + q.subtopics.length, 0) / exam.questions.length).toFixed(1)
    : "0";

  console.log(`\n📊 Summary: ${exam.year} ${exam.examType} (${exam.subjectSlug})`);
  console.log(`   Total questions: ${exam.questions.length}`);
  console.log(`   Total marks: ${exam.questions.reduce((s, q) => s + q.marks, 0)}`);
  console.log(`   Avg subtopics per question: ${avgSubtopics}`);
  console.log(`   By topic:`);
  for (const [topic, count] of Object.entries(byTopic).sort()) {
    console.log(`     ${topic}: ${count}`);
  }
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err.message);
  process.exit(1);
});
