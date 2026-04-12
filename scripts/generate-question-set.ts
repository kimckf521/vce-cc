/**
 * Seed a Question Set from a JSON file (no AI calls — Claude Code generates
 * the JSON in-conversation, this script just inserts it).
 *
 * Usage:
 *   npx tsx scripts/generate-question-set.ts \
 *     --setName "Questions Set testing" \
 *     --subtopicSlug polynomial-equations \
 *     --file scripts/output/qset-polynomial-equations.json
 */

import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma";

// ─── CLI args ────────────────────────────────────────────────────────────────
function arg(name: string, fallback?: string): string {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required arg --${name}`);
}

const SET_NAME = arg("setName", "Questions Set testing");
const SUBTOPIC_SLUG = arg("subtopicSlug");
const FILE = arg("file");

// ─── Types ───────────────────────────────────────────────────────────────────
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
  mcq: GeneratedMCQ[];
  shortAnswer: GeneratedFR[];
  // New canonical key. `longResponse` still accepted for backwards compatibility.
  extendedResponse?: GeneratedFR[];
  longResponse?: GeneratedFR[];
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const subtopic = await prisma.subtopic.findFirst({
    where: { slug: SUBTOPIC_SLUG },
    include: { topic: { include: { subtopics: true } } },
  });
  if (!subtopic) throw new Error(`Subtopic "${SUBTOPIC_SLUG}" not found`);

  const topic = subtopic.topic;
  const slugToId = new Map(topic.subtopics.map((s) => [s.slug, s.id]));

  const filePath = path.resolve(FILE);
  const raw = fs.readFileSync(filePath, "utf-8");
  const data: GeneratedSet = JSON.parse(raw);

  console.log(`📚 Topic: ${topic.name}`);
  console.log(`🎯 Subtopic: ${subtopic.name}`);
  const extended = data.extendedResponse ?? data.longResponse ?? [];
  console.log(
    `📝 Loaded ${data.mcq?.length ?? 0} MCQ, ${data.shortAnswer?.length ?? 0} short, ${extended.length} extended from ${filePath}`
  );

  let questionSet = await prisma.questionSet.findFirst({ where: { name: SET_NAME } });
  if (!questionSet) {
    questionSet = await prisma.questionSet.create({
      data: {
        name: SET_NAME,
        description:
          "AI-generated question sets for evaluating quality before bulk generation.",
      },
    });
    console.log(`✨ Created QuestionSet "${SET_NAME}" (${questionSet.id})`);
  } else {
    console.log(`📦 Using existing QuestionSet "${SET_NAME}" (${questionSet.id})`);
  }

  let order = await prisma.questionSetItem.count({
    where: { questionSetId: questionSet.id },
  });

  function resolveSubtopicIds(slugs: string[]): string[] {
    const ids = new Set<string>([subtopic!.id]);
    for (const slug of slugs) {
      const id = slugToId.get(slug);
      if (id) ids.add(id);
    }
    return Array.from(ids);
  }

  let inserted = 0;

  for (const mcq of data.mcq ?? []) {
    await prisma.questionSetItem.create({
      data: {
        questionSetId: questionSet.id,
        topicId: topic.id,
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
        subtopics: {
          connect: resolveSubtopicIds(mcq.subtopicSlugs ?? []).map((id) => ({ id })),
        },
      },
    });
    inserted++;
  }

  for (const sa of data.shortAnswer ?? []) {
    await prisma.questionSetItem.create({
      data: {
        questionSetId: questionSet.id,
        topicId: topic.id,
        type: "SHORT_ANSWER",
        order: order++,
        marks: sa.marks ?? 2,
        content: sa.content,
        solutionContent: sa.solutionContent,
        difficulty: sa.difficulty ?? "MEDIUM",
        subtopics: {
          connect: resolveSubtopicIds(sa.subtopicSlugs ?? []).map((id) => ({ id })),
        },
      },
    });
    inserted++;
  }

  for (const er of extended) {
    await prisma.questionSetItem.create({
      data: {
        questionSetId: questionSet.id,
        topicId: topic.id,
        type: "EXTENDED_RESPONSE",
        order: order++,
        marks: er.marks ?? 12,
        content: er.content,
        solutionContent: er.solutionContent,
        difficulty: er.difficulty ?? "HARD",
        subtopics: {
          connect: resolveSubtopicIds(er.subtopicSlugs ?? []).map((id) => ({ id })),
        },
      },
    });
    inserted++;
  }

  console.log(`\n✅ Inserted ${inserted} items into "${SET_NAME}"`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
