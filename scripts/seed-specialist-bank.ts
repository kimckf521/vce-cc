/**
 * Specialist Mathematics question-bank seeder (ID-targeted).
 *
 * The shared scripts/generate-question-set.ts upserts QuestionSet by NAME,
 * which would collide across subjects (Methods + Specialist both have a
 * "1st Generated Question Set"). This script targets the Specialist
 * placeholder by ID instead, so we never touch Methods's set by accident.
 *
 * The QuestionSet ID is hard-coded after being looked up once:
 *   { name: "1st Generated Question Set", subject.slug: "vce-specialist" }
 *
 * Usage:
 *   # Seed every qset-specialist-*.json file
 *   npx tsx --env-file=.env.local scripts/seed-specialist-bank.ts
 *
 *   # Seed a specific file
 *   npx tsx --env-file=.env.local scripts/seed-specialist-bank.ts --file scripts/output/qset-specialist-foo.json
 *
 *   # Then approve everything in PENDING status
 *   npx tsx --env-file=.env.local scripts/seed-specialist-bank.ts --approve
 *
 *   # Approve only what was just inserted (run combined)
 *   npx tsx --env-file=.env.local scripts/seed-specialist-bank.ts --seed-and-approve
 */

import * as fs from "fs";
import * as path from "path";
import { prisma } from "../lib/prisma";

const SPECIALIST_QSET_ID = "cmpkc57ls0003ofk0tskjbtxn";
const SPECIALIST_SUBJECT_SLUG = "vce-specialist";
const OUTPUT_DIR = path.resolve("scripts/output");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
    return process.argv[i + 1];
  }
  return undefined;
}
function has(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

interface GeneratedMCQ {
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  marks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  solutionContent: string;
  subtopicSlugs: string[];
}
interface GeneratedFR {
  content: string;
  marks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  solutionContent: string;
  subtopicSlugs: string[];
}
interface GeneratedSet {
  mcq?: GeneratedMCQ[];
  shortAnswer?: GeneratedFR[];
  extendedAnswer?: GeneratedFR[];
  extendedResponse?: GeneratedFR[];
  longResponse?: GeneratedFR[];
}

async function loadSpecialistMaps() {
  const subj = await prisma.subject.findUnique({
    where: { slug: SPECIALIST_SUBJECT_SLUG },
    include: {
      topics: {
        include: { subtopics: true },
      },
    },
  });
  if (!subj) throw new Error(`Subject "${SPECIALIST_SUBJECT_SLUG}" not found`);

  // slug -> { subtopicId, topicId }
  const slugMap = new Map<string, { subtopicId: string; topicId: string }>();
  for (const t of subj.topics) {
    for (const s of t.subtopics) {
      slugMap.set(s.slug, { subtopicId: s.id, topicId: t.id });
    }
  }
  return { subject: subj, slugMap };
}

async function resolveTopicAndSubtopics(
  slugs: string[],
  slugMap: Map<string, { subtopicId: string; topicId: string }>,
): Promise<{ topicId: string; subtopicIds: string[] }> {
  const subtopicIds: string[] = [];
  let topicId: string | null = null;
  for (const slug of slugs) {
    const m = slugMap.get(slug);
    if (!m) continue;
    if (!topicId) topicId = m.topicId;
    subtopicIds.push(m.subtopicId);
  }
  if (!topicId) {
    throw new Error(`None of the subtopic slugs resolved: ${slugs.join(", ")}`);
  }
  return { topicId, subtopicIds: Array.from(new Set(subtopicIds)) };
}

async function seedFile(
  filePath: string,
  slugMap: Map<string, { subtopicId: string; topicId: string }>,
  startOrder: number,
): Promise<{ inserted: number; order: number }> {
  const raw = fs.readFileSync(filePath, "utf-8");
  const data: GeneratedSet = JSON.parse(raw);
  let order = startOrder;
  let inserted = 0;

  const items: Array<Parameters<typeof prisma.questionSetItem.create>[0]["data"]> = [];

  const buildCommon = async (
    q: GeneratedFR | GeneratedMCQ,
  ): Promise<{ topicId: string; subtopicIds: string[] }> =>
    resolveTopicAndSubtopics(q.subtopicSlugs, slugMap);

  for (const mcq of data.mcq ?? []) {
    const { topicId, subtopicIds } = await buildCommon(mcq);
    items.push({
      questionSetId: SPECIALIST_QSET_ID,
      topicId,
      type: "MCQ",
      order: order++,
      marks: mcq.marks ?? 1,
      content: mcq.content,
      optionA: mcq.optionA,
      optionB: mcq.optionB,
      optionC: mcq.optionC,
      optionD: mcq.optionD,
      correctOption: mcq.correctOption,
      solutionContent: mcq.solutionContent,
      difficulty: mcq.difficulty ?? "MEDIUM",
      subtopics: { connect: subtopicIds.map((id) => ({ id })) },
    });
  }

  for (const sa of data.shortAnswer ?? []) {
    const { topicId, subtopicIds } = await buildCommon(sa);
    items.push({
      questionSetId: SPECIALIST_QSET_ID,
      topicId,
      type: "SHORT_ANSWER",
      order: order++,
      marks: sa.marks ?? 2,
      content: sa.content,
      solutionContent: sa.solutionContent,
      difficulty: sa.difficulty ?? "MEDIUM",
      subtopics: { connect: subtopicIds.map((id) => ({ id })) },
    });
  }

  for (const ea of data.extendedAnswer ?? []) {
    const { topicId, subtopicIds } = await buildCommon(ea);
    items.push({
      questionSetId: SPECIALIST_QSET_ID,
      topicId,
      type: "EXTENDED_ANSWER",
      order: order++,
      marks: ea.marks ?? 6,
      content: ea.content,
      solutionContent: ea.solutionContent,
      difficulty: ea.difficulty ?? "MEDIUM",
      subtopics: { connect: subtopicIds.map((id) => ({ id })) },
    });
  }

  const er = data.extendedResponse ?? data.longResponse ?? [];
  for (const e of er) {
    const { topicId, subtopicIds } = await buildCommon(e);
    items.push({
      questionSetId: SPECIALIST_QSET_ID,
      topicId,
      type: "EXTENDED_RESPONSE",
      order: order++,
      marks: e.marks ?? 12,
      content: e.content,
      solutionContent: e.solutionContent,
      difficulty: e.difficulty ?? "HARD",
      subtopics: { connect: subtopicIds.map((id) => ({ id })) },
    });
  }

  for (const data of items) {
    await prisma.questionSetItem.create({ data });
    inserted++;
  }

  return { inserted, order };
}

async function bulkApprove(): Promise<number> {
  const result = await prisma.questionSetItem.updateMany({
    where: { questionSetId: SPECIALIST_QSET_ID, status: "PENDING" },
    data: { status: "APPROVED" },
  });
  return result.count;
}

async function main() {
  // Verify target
  const qset = await prisma.questionSet.findUnique({
    where: { id: SPECIALIST_QSET_ID },
    include: { subject: true, _count: { select: { items: true } } },
  });
  if (!qset) {
    throw new Error(`Specialist QuestionSet ${SPECIALIST_QSET_ID} not found`);
  }
  if (qset.subject?.slug !== SPECIALIST_SUBJECT_SLUG) {
    throw new Error(
      `Target QuestionSet does not belong to Specialist — got "${qset.subject?.slug}"`,
    );
  }
  console.log(`Target QuestionSet: "${qset.name}" (${qset.id}) — currently ${qset._count.items} items.`);

  if (has("approve")) {
    const n = await bulkApprove();
    console.log(`Bulk-approved ${n} items.`);
    await prisma.$disconnect();
    return;
  }

  const { slugMap } = await loadSpecialistMaps();

  const single = arg("file");
  const files: string[] = single
    ? [path.resolve(single)]
    : fs
        .readdirSync(OUTPUT_DIR)
        .filter((n) => n.startsWith("qset-specialist-") && n.endsWith(".json"))
        .map((n) => path.join(OUTPUT_DIR, n));

  if (files.length === 0) {
    console.log("No qset-specialist-*.json files to seed.");
    await prisma.$disconnect();
    return;
  }

  let order = await prisma.questionSetItem.count({
    where: { questionSetId: SPECIALIST_QSET_ID },
  });
  console.log(`Starting from order = ${order} (${files.length} file(s) to seed)`);

  let totalInserted = 0;
  for (const f of files) {
    const { inserted, order: newOrder } = await seedFile(f, slugMap, order);
    console.log(`  + ${path.basename(f)}: ${inserted} items`);
    totalInserted += inserted;
    order = newOrder;
  }
  console.log(`\nInserted ${totalInserted} items total.`);

  if (has("seed-and-approve")) {
    const n = await bulkApprove();
    console.log(`Bulk-approved ${n} items.`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
