/**
 * Quality audit for the Specialist Mathematics question bank.
 *
 * Prints a multi-section quality report:
 *   - Item counts by topic / subtopic / type / status
 *   - MCQs without a correctOption letter (A–D)
 *   - MCQs with a missing option text
 *   - Items with no subtopic tagged
 *   - Items with very short content (< 40 chars), suggesting truncation
 *   - Items where the solution doesn't end with **Answer: X** (MCQ only)
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/audit-specialist-bank.ts
 */

import { prisma } from "../lib/prisma";

const SPECIALIST_QSET_ID = "cmpkc57ls0003ofk0tskjbtxn";

async function main() {
  const qset = await prisma.questionSet.findUnique({
    where: { id: SPECIALIST_QSET_ID },
    include: { subject: true },
  });
  if (!qset) throw new Error(`QuestionSet ${SPECIALIST_QSET_ID} not found`);
  console.log(`Auditing: "${qset.name}" (${qset.subject?.slug})\n`);

  // Counts by status / type
  const byTypeStatus = await prisma.questionSetItem.groupBy({
    by: ["type", "status"],
    where: { questionSetId: SPECIALIST_QSET_ID },
    _count: true,
  });
  console.log("─── Counts by type/status ───");
  for (const r of byTypeStatus) console.log(`  ${r.type.padEnd(20)} ${r.status.padEnd(10)} ${r._count}`);

  // Total
  const total = await prisma.questionSetItem.count({ where: { questionSetId: SPECIALIST_QSET_ID } });
  console.log(`\nTotal items: ${total}`);

  // Counts by topic
  const items = await prisma.questionSetItem.findMany({
    where: { questionSetId: SPECIALIST_QSET_ID },
    include: { topic: true, subtopics: true },
  });

  const byTopic: Record<string, { total: number; types: Record<string, number> }> = {};
  for (const item of items) {
    const t = item.topic.name;
    if (!byTopic[t]) byTopic[t] = { total: 0, types: {} };
    byTopic[t].total++;
    byTopic[t].types[item.type] = (byTopic[t].types[item.type] || 0) + 1;
  }
  console.log("\n─── Counts by topic ───");
  for (const [topic, { total: tot, types }] of Object.entries(byTopic)) {
    console.log(`  ${topic.padEnd(50)} ${tot} (${Object.entries(types).map(([k, v]) => `${k}:${v}`).join(", ")})`);
  }

  // Counts by subtopic
  const subCounts: Record<string, { total: number; types: Record<string, number> }> = {};
  for (const item of items) {
    for (const s of item.subtopics) {
      if (!subCounts[s.slug]) subCounts[s.slug] = { total: 0, types: {} };
      subCounts[s.slug].total++;
      subCounts[s.slug].types[item.type] = (subCounts[s.slug].types[item.type] || 0) + 1;
    }
  }
  console.log("\n─── Counts by subtopic (sorted desc) ───");
  const sorted = Object.entries(subCounts).sort((a, b) => b[1].total - a[1].total);
  for (const [slug, { total: tot, types }] of sorted) {
    console.log(`  ${slug.padEnd(55)} ${tot.toString().padStart(4)} (${Object.entries(types).map(([k, v]) => `${k.split("_")[0]}:${v}`).join(", ")})`);
  }

  // Quality issues
  console.log("\n─── Quality checks ───");

  const mcqMissing = items.filter(
    (i) =>
      i.type === "MCQ" && (!i.correctOption || !["A", "B", "C", "D"].includes(i.correctOption)),
  );
  console.log(`  MCQ with missing/invalid correctOption: ${mcqMissing.length}`);
  for (const m of mcqMissing.slice(0, 5)) console.log(`    - id=${m.id} order=${m.order}`);

  const mcqMissingOpts = items.filter(
    (i) =>
      i.type === "MCQ" &&
      (!i.optionA || !i.optionB || !i.optionC || !i.optionD),
  );
  console.log(`  MCQ with missing option text: ${mcqMissingOpts.length}`);

  const noSubtopic = items.filter((i) => i.subtopics.length === 0);
  console.log(`  Items with no subtopic: ${noSubtopic.length}`);

  const shortContent = items.filter((i) => i.content.length < 40);
  console.log(`  Items with very short content (<40 chars): ${shortContent.length}`);
  for (const s of shortContent.slice(0, 5)) console.log(`    - id=${s.id} type=${s.type}: ${s.content.slice(0, 80)}`);

  const mcqMissingAnswerSig = items.filter(
    (i) => i.type === "MCQ" && i.solutionContent && !/\*\*Answer:\s*[A-D]\*\*/i.test(i.solutionContent),
  );
  console.log(`  MCQ solutions missing "**Answer: X**" trailer: ${mcqMissingAnswerSig.length}`);

  const noSolution = items.filter((i) => !i.solutionContent || i.solutionContent.trim().length < 5);
  console.log(`  Items with empty/short solution: ${noSolution.length}`);

  // Tier compliance summary
  console.log("\n─── Subtopic coverage (count vs minimum) ───");
  console.log("  Each subtopic should have ≥ 1 MCQ (smoke check)");
  const expectedTypes: Record<string, string[]> = {};
  for (const item of items) {
    for (const s of item.subtopics) {
      if (!expectedTypes[s.slug]) expectedTypes[s.slug] = [];
      expectedTypes[s.slug].push(item.type);
    }
  }
  const allSubtopics = await prisma.subtopic.findMany({
    where: { topic: { subject: { slug: "vce-specialist" } } },
  });
  for (const sub of allSubtopics) {
    const types = expectedTypes[sub.slug] ?? [];
    const hasMcq = types.includes("MCQ");
    const hasShort = types.includes("SHORT_ANSWER");
    if (!hasMcq || !hasShort) {
      console.log(`  ⚠ ${sub.slug.padEnd(55)} mcq:${hasMcq} short:${hasShort} total:${types.length}`);
    }
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
