/**
 * Restructure Sub-topics Migration
 *
 * Reorganises sub-topics to align with the VCAA study design and re-classifies
 * every question using Claude, including multi-subtopic tagging.
 *
 * Usage:
 *   tsx --env-file=.env.local scripts/restructure-subtopics.ts --dry-run
 *   tsx --env-file=.env.local scripts/restructure-subtopics.ts
 */

import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";

const prisma = new PrismaClient();

// ─── Topic IDs (from lib/topics-config.ts — these are stable) ────────────────

const TOPIC_IDS: Record<string, string> = {
  "Algebra, Number, and Structure":          "cmmuq9gcp000e5pjsa0l9l742",
  "Functions, Relations, and Graphs":        "cmn63mova000e1zyi0vv8lukz",
  "Calculus":                                "cmmuq9eru00015pjsmpbjocik",
  "Data Analysis, Probability, and Statistics": "cmmuq9h8w000l5pjsuia1hoc8",
};

// ─── New taxonomy ────────────────────────────────────────────────────────────

const NEW_TAXONOMY: Record<string, string[]> = {
  "Algebra, Number, and Structure": [
    "Polynomial Equations",
    "Exponential Equations",
    "Logarithmic Equations",
    "Trigonometric Equations",
    "Simultaneous Equations",
    "Exponent and Logarithm Laws",
  ],
  "Functions, Relations, and Graphs": [
    "Polynomial Functions",
    "Exponential Functions",
    "Logarithmic Functions",
    "Trigonometric Functions",
    "Rational Functions",
    "Domain and Range",
    "Transformations",
    "Inverse Functions",
    "Composite Functions",
  ],
  "Calculus": [
    "Differentiation",
    "Chain Rule",
    "Product Rule",
    "Quotient Rule",
    "Tangents and Normals",
    "Rates of Change",
    "Stationary Points and Curve Sketching",
    "Optimisation",
    "Antidifferentiation",
    "Definite Integrals",
    "Area Under Curves",
    "Fundamental Theorem of Calculus",
  ],
  "Data Analysis, Probability, and Statistics": [
    "Probability Rules",
    "Conditional Probability",
    "Discrete Random Variables",
    "Binomial Distribution",
    "Continuous Random Variables",
    "Normal Distribution",
    "Confidence Intervals",
    "Sample Proportions and Sampling",
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildTaxonomyPrompt(): string {
  return Object.entries(NEW_TAXONOMY)
    .map(([topic, subs]) => `- ${topic}: ${subs.join(", ")}`)
    .join("\n");
}

// ─── Classification ─────────────────────────────────────────────────────────

interface ClassificationResult {
  questionId: string;
  topic: string;
  subtopics: string[];
}

interface QuestionForClassification {
  id: string;
  content: string;
  marks: number;
  questionNumber: number;
  part: string | null;
  currentTopic: string;
  currentSubtopics: string[];
}

async function classifyBatch(
  client: Anthropic,
  questions: QuestionForClassification[],
  examLabel: string,
): Promise<ClassificationResult[]> {
  const questionsJson = questions.map((q) => ({
    id: q.id,
    content: q.content,
    marks: q.marks,
    questionNumber: q.questionNumber,
    part: q.part,
    currentTopic: q.currentTopic,
    currentSubtopics: q.currentSubtopics,
  }));

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    system: `You are an expert VCE Mathematical Methods classifier. Given exam questions, assign each to the correct topic and 1-3 subtopics from the taxonomy below.

TAXONOMY:
${buildTaxonomyPrompt()}

RULES:
1. Each question gets exactly ONE topic and 1-3 subtopics (all subtopics must belong to the assigned topic)
2. The primary/most relevant subtopic comes first in the array
3. Add secondary subtopics only if the question GENUINELY requires that skill
4. Cross-topic subtopics are NOT allowed — all subtopics must be from the same topic
5. If a question involves solving an equation (e.g. "solve for x"), use the appropriate Equations subtopic under "Algebra, Number, and Structure"
6. If a question asks about function properties, graphing, domain/range, or transformations, use "Functions, Relations, and Graphs"
7. If a question involves derivatives, integrals, or rates of change, use "Calculus"
8. If a question involves probability, distributions, or statistical inference, use "Data Analysis, Probability, and Statistics"

Return ONLY a JSON array. No markdown, no code fences, no explanation.`,
    messages: [
      {
        role: "user",
        content: `Classify these ${examLabel} questions. Return JSON array of { "questionId": "...", "topic": "...", "subtopics": ["...", ...] }

Questions:
${JSON.stringify(questionsJson, null, 2)}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error(`No text response for ${examLabel}`);
  }

  const raw = textBlock.text
    .trim()
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  try {
    return JSON.parse(raw);
  } catch {
    console.error(`  Failed to parse response for ${examLabel}. Raw output:`);
    console.error(raw.slice(0, 500));
    throw new Error(`JSON parse failed for ${examLabel}`);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  if (dryRun) {
    console.log("🔍 DRY RUN — no changes will be made\n");
  }

  // ── 1. Create new subtopics ──
  console.log("📦 Step 1: Creating new subtopics...");

  // Build a slug → subtopic ID map for later use
  const subtopicIdMap: Record<string, string> = {}; // "topicName|subtopicName" → id

  for (const [topicName, subtopics] of Object.entries(NEW_TAXONOMY)) {
    const topicId = TOPIC_IDS[topicName];
    if (!topicId) throw new Error(`Unknown topic: ${topicName}`);

    for (let i = 0; i < subtopics.length; i++) {
      const name = subtopics[i];
      const slug = slugify(name);

      if (dryRun) {
        console.log(`   [DRY] Would upsert subtopic: ${topicName} → ${name}`);
        subtopicIdMap[`${topicName}|${name}`] = `dry-${slug}`;
      } else {
        const sub = await prisma.subtopic.upsert({
          where: { topicId_slug: { topicId, slug } },
          update: { name, order: i },
          create: { name, slug, topicId, order: i },
          select: { id: true },
        });
        subtopicIdMap[`${topicName}|${name}`] = sub.id;
        console.log(`   ✅ ${topicName} → ${name} (${sub.id})`);
      }
    }
  }

  // ── 2. Fetch all questions ──
  console.log("\n📥 Step 2: Fetching all questions...");

  const allQuestions = await prisma.question.findMany({
    select: {
      id: true,
      content: true,
      marks: true,
      questionNumber: true,
      part: true,
      topicId: true,
      topic: { select: { name: true } },
      subtopics: { select: { name: true } },
      exam: { select: { year: true, examType: true } },
    },
    orderBy: [
      { exam: { year: "asc" } },
      { exam: { examType: "asc" } },
      { questionNumber: "asc" },
    ],
  });

  console.log(`   Found ${allQuestions.length} questions`);

  // Group by exam
  const byExam = new Map<string, typeof allQuestions>();
  for (const q of allQuestions) {
    const key = `${q.exam.year}-${q.exam.examType}`;
    if (!byExam.has(key)) byExam.set(key, []);
    byExam.get(key)!.push(q);
  }

  console.log(`   Grouped into ${byExam.size} exam batches`);

  // ── 3. Re-classify via Claude ──
  console.log("\n🤖 Step 3: Re-classifying questions via Claude...");

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not set");
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const allResults: ClassificationResult[] = [];
  let batchNum = 0;

  for (const [examKey, questions] of byExam) {
    batchNum++;
    console.log(`\n   [${batchNum}/${byExam.size}] Classifying ${examKey} (${questions.length} questions)...`);

    const batch: QuestionForClassification[] = questions.map((q) => ({
      id: q.id,
      content: q.content,
      marks: q.marks,
      questionNumber: q.questionNumber,
      part: q.part,
      currentTopic: q.topic.name,
      currentSubtopics: q.subtopics.map((s) => s.name),
    }));

    try {
      const results = await classifyBatch(client, batch, examKey);
      allResults.push(...results);
      console.log(`   ✅ Got ${results.length} classifications`);
    } catch (err) {
      console.error(`   ❌ Failed: ${(err as Error).message}`);
      // Continue with other batches
    }

    // Rate limit delay
    if (batchNum < byExam.size) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  console.log(`\n   Total classifications: ${allResults.length} / ${allQuestions.length}`);

  // ── 4. Validate classifications ──
  console.log("\n🔍 Step 4: Validating classifications...");

  const validTopics = new Set(Object.keys(NEW_TAXONOMY));
  const validSubtopicsByTopic = new Map(
    Object.entries(NEW_TAXONOMY).map(([t, subs]) => [t, new Set(subs)])
  );

  let validCount = 0;
  let invalidCount = 0;
  const validResults: ClassificationResult[] = [];

  for (const result of allResults) {
    if (!validTopics.has(result.topic)) {
      console.warn(`   ⚠️  Invalid topic "${result.topic}" for question ${result.questionId}`);
      invalidCount++;
      continue;
    }

    const validSubs = validSubtopicsByTopic.get(result.topic)!;
    const filteredSubs = result.subtopics.filter((s) => validSubs.has(s));

    if (filteredSubs.length === 0) {
      console.warn(`   ⚠️  No valid subtopics for question ${result.questionId}: ${result.subtopics.join(", ")}`);
      invalidCount++;
      continue;
    }

    validResults.push({ ...result, subtopics: filteredSubs });
    validCount++;
  }

  console.log(`   Valid: ${validCount}, Invalid: ${invalidCount}`);

  // ── 5. Apply updates ──
  console.log("\n💾 Step 5: Applying updates...");

  let topicChanges = 0;
  let subtopicChanges = 0;

  for (const result of validResults) {
    const newTopicId = TOPIC_IDS[result.topic];
    const newSubtopicIds = result.subtopics
      .map((name) => subtopicIdMap[`${result.topic}|${name}`])
      .filter(Boolean);

    if (dryRun) {
      // Find current state for logging
      const current = allQuestions.find((q) => q.id === result.questionId);
      if (current) {
        const topicChanged = current.topic.name !== result.topic;
        const oldSubs = current.subtopics.map((s) => s.name).sort().join(", ");
        const newSubs = result.subtopics.sort().join(", ");
        const subsChanged = oldSubs !== newSubs;

        if (topicChanged || subsChanged) {
          const qLabel = `Q${current.questionNumber}${current.part || ""} (${current.exam.year} ${current.exam.examType})`;
          if (topicChanged) {
            console.log(`   [DRY] ${qLabel}: topic ${current.topic.name} → ${result.topic}`);
            topicChanges++;
          }
          if (subsChanged) {
            console.log(`   [DRY] ${qLabel}: subtopics [${oldSubs}] → [${newSubs}]`);
            subtopicChanges++;
          }
        }
      }
    } else {
      await prisma.question.update({
        where: { id: result.questionId },
        data: {
          topicId: newTopicId,
          subtopics: {
            set: newSubtopicIds.map((id) => ({ id })),
          },
        },
      });
    }
  }

  if (dryRun) {
    console.log(`\n   [DRY] Would change ${topicChanges} topic assignments`);
    console.log(`   [DRY] Would change ${subtopicChanges} subtopic assignments`);
  } else {
    console.log(`   ✅ Updated ${validResults.length} questions`);
  }

  // ── 6. Cleanup orphaned subtopics ──
  console.log("\n🧹 Step 6: Cleaning up orphaned subtopics...");

  const orphanedSubtopics = await prisma.subtopic.findMany({
    where: { questions: { none: {} } },
    select: { id: true, name: true, topic: { select: { name: true } } },
  });

  // Only delete subtopics that are NOT in the new taxonomy
  const newSubtopicNames = new Set(Object.values(NEW_TAXONOMY).flat());

  for (const sub of orphanedSubtopics) {
    if (newSubtopicNames.has(sub.name)) continue; // Keep new taxonomy subtopics even if empty

    if (dryRun) {
      console.log(`   [DRY] Would delete orphaned: ${sub.topic.name} → ${sub.name}`);
    } else {
      await prisma.subtopic.delete({ where: { id: sub.id } });
      console.log(`   🗑️  Deleted: ${sub.topic.name} → ${sub.name}`);
    }
  }

  // ── 7. Summary ──
  console.log("\n📊 Final summary:");
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { questions: true } },
      subtopics: {
        orderBy: { order: "asc" },
        include: { _count: { select: { questions: true } } },
      },
    },
  });

  for (const t of topics) {
    console.log(`\n  ${t.order}. ${t.name} (${t._count.questions} questions)`);
    for (const s of t.subtopics) {
      console.log(`     ${s._count.questions > 0 ? "●" : "○"} ${s.name} (${s._count.questions})`);
    }
  }
}

main()
  .catch((e) => {
    console.error("\n❌ Fatal error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
