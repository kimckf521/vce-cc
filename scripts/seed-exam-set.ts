/**
 * Seed a generated Exam Set into a target QuestionSet.
 *
 * Input JSON shape:
 * {
 *   "subject_slug":    "vce-foundation" | "vce-general" | "vce-specialist",
 *   "question_set_id": "<target QuestionSet.id>",
 *   "items": [
 *     {
 *       "type":            "MCQ" | "SHORT_ANSWER" | "EXTENDED_ANSWER" | "EXTENDED_RESPONSE",
 *       "topic_slug":      "<topic slug under this subject>",
 *       "subtopic_slugs":  ["<subtopic slug>", ...],
 *       "difficulty":      "EASY" | "MEDIUM" | "HARD",
 *       "tech":            "TECH_FREE" | "CAS_ALLOWED" | "CAS_REQUIRED",
 *       "marks":           <integer>,
 *       "order":           <integer 0-indexed within paper>,
 *       "content":         "<LaTeX question text>",
 *       "solutionContent": "<LaTeX worked solution with step marks>",
 *       "preamble":        null | "<shared scenario text for ext-resp>",
 *       "parts":           null | [{ "label": "a", "marks": 2, "content": "...", "solution": "...", "subParts"?: [...] }, ...],
 *       // MCQ fields (null otherwise):
 *       "optionA":         null | "<option A>",
 *       "optionB":         null | "<option B>",
 *       "optionC":         null | "<option C>",
 *       "optionD":         null | "<option D>",
 *       "correctOption":   null | "A" | "B" | "C" | "D"
 *     },
 *     ...
 *   ]
 * }
 *
 * Usage:
 *   npm run seed-exam-set -- <path-to-json>           # write rows as APPROVED
 *   npm run seed-exam-set -- <path-to-json> --dry     # validate only
 *   npm run seed-exam-set -- <path-to-json> --pending # write as PENDING (needs review)
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import type { Tech, QuestionSetItemType, Difficulty, QuestionSetItemStatus } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

interface ItemPart {
  label: string;
  marks: number;
  content: string;
  solution: string | null;
  subParts?: {
    label: string;
    marks: number;
    content: string;
    solution: string | null;
  }[];
}

interface ItemSpec {
  type: QuestionSetItemType;
  topic_slug: string;
  subtopic_slugs: string[];
  difficulty: Difficulty;
  tech: Tech;
  marks: number;
  order: number;
  content: string;
  solutionContent: string;
  preamble: string | null;
  parts: ItemPart[] | null;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctOption: string | null;
}

interface SetSpec {
  subject_slug: string;
  question_set_id: string;
  items: ItemSpec[];
}

const VALID_TYPES: QuestionSetItemType[] = [
  "MCQ",
  "SHORT_ANSWER",
  "EXTENDED_ANSWER",
  "EXTENDED_RESPONSE",
];
const VALID_DIFFS: Difficulty[] = ["EASY", "MEDIUM", "HARD"];
const VALID_TECHS: Tech[] = ["TECH_FREE", "CAS_ALLOWED", "CAS_REQUIRED"];

function validate(spec: SetSpec): string[] {
  const errs: string[] = [];
  if (!spec.subject_slug) errs.push("missing subject_slug");
  if (!spec.question_set_id) errs.push("missing question_set_id");
  if (!Array.isArray(spec.items)) errs.push("items is not an array");
  spec.items.forEach((it, i) => {
    const tag = `items[${i}]`;
    if (!VALID_TYPES.includes(it.type)) errs.push(`${tag} bad type: ${it.type}`);
    if (!VALID_DIFFS.includes(it.difficulty))
      errs.push(`${tag} bad difficulty: ${it.difficulty}`);
    if (!VALID_TECHS.includes(it.tech)) errs.push(`${tag} bad tech: ${it.tech}`);
    if (!it.topic_slug) errs.push(`${tag} missing topic_slug`);
    if (!Array.isArray(it.subtopic_slugs) || it.subtopic_slugs.length === 0)
      errs.push(`${tag} subtopic_slugs empty`);
    if (typeof it.marks !== "number" || it.marks <= 0)
      errs.push(`${tag} bad marks: ${it.marks}`);
    // For multi-part items (EXTENDED_ANSWER / EXTENDED_RESPONSE), `content`
    // and `solutionContent` are typically empty strings — the real content
    // lives in `parts`. Only enforce length checks on single-part items.
    const isMultiPart =
      it.type === "EXTENDED_ANSWER" || it.type === "EXTENDED_RESPONSE";
    if (!isMultiPart) {
      if (!it.content || it.content.length < 10)
        errs.push(`${tag} content too short (${it.content?.length ?? 0})`);
      if (!it.solutionContent || it.solutionContent.length < 20)
        errs.push(`${tag} solutionContent too short (${it.solutionContent?.length ?? 0})`);
    }
    if (it.type === "MCQ") {
      if (!it.optionA || !it.optionB || !it.optionC || !it.optionD)
        errs.push(`${tag} MCQ missing option`);
      if (!it.correctOption || !["A", "B", "C", "D"].includes(it.correctOption))
        errs.push(`${tag} MCQ bad correctOption: ${it.correctOption}`);
      if (it.marks !== 1) errs.push(`${tag} MCQ marks should be 1`);
    }
    if (it.type === "EXTENDED_ANSWER" || it.type === "EXTENDED_RESPONSE") {
      if (!Array.isArray(it.parts) || it.parts.length === 0)
        errs.push(`${tag} ${it.type} missing parts`);
      else {
        const partMarks = it.parts.reduce((s, p) => {
          if (p.subParts && p.subParts.length > 0) {
            return s + p.subParts.reduce((ss, sp) => ss + sp.marks, 0);
          }
          return s + p.marks;
        }, 0);
        if (partMarks !== it.marks)
          errs.push(`${tag} parts sum ${partMarks} != declared ${it.marks}`);
      }
    }
  });
  return errs;
}

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  const dry = args.includes("--dry");
  const status: QuestionSetItemStatus = args.includes("--pending")
    ? "PENDING"
    : "APPROVED";

  if (!file) {
    console.error("Usage: seed-exam-set <path-to-json> [--dry] [--pending]");
    process.exit(1);
  }
  const fullPath = path.resolve(file);
  console.log(`Reading: ${fullPath}`);
  const spec: SetSpec = JSON.parse(fs.readFileSync(fullPath, "utf-8"));

  // ── Validate ────────────────────────────────────────────────
  const validationErrors = validate(spec);
  if (validationErrors.length > 0) {
    console.error(`\n${validationErrors.length} validation errors:`);
    for (const e of validationErrors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`✓ Schema valid. ${spec.items.length} items in spec.\n`);

  // ── Lookup target set + topic/subtopic IDs ──────────────────
  const targetSet = await prisma.questionSet.findUnique({
    where: { id: spec.question_set_id },
    include: { subject: { select: { slug: true, id: true } } },
  });
  if (!targetSet) {
    console.error(`Target QuestionSet ${spec.question_set_id} not found.`);
    process.exit(1);
  }
  if (targetSet.subject?.slug !== spec.subject_slug) {
    console.error(
      `Subject mismatch: target set is ${targetSet.subject?.slug}, spec says ${spec.subject_slug}.`,
    );
    process.exit(1);
  }
  console.log(`Target set: ${targetSet.name} (${targetSet.id}) for ${targetSet.subject?.slug}`);

  const topics = await prisma.topic.findMany({
    where: { subjectId: targetSet.subject?.id },
    include: { subtopics: { select: { id: true, slug: true } } },
  });
  const topicBySlug = new Map(topics.map((t) => [t.slug, t]));
  const subtopicBySlug = new Map<string, string>();
  for (const t of topics) {
    for (const st of t.subtopics) subtopicBySlug.set(st.slug, st.id);
  }

  // ── Resolve all foreign keys, fail loudly on any miss ──────
  const resolved: {
    spec: ItemSpec;
    topicId: string;
    subtopicIds: string[];
  }[] = [];
  const lookupErrors: string[] = [];
  spec.items.forEach((it, i) => {
    const topic = topicBySlug.get(it.topic_slug);
    if (!topic) {
      lookupErrors.push(`items[${i}] unknown topic_slug "${it.topic_slug}"`);
      return;
    }
    const subtopicIds: string[] = [];
    for (const sslug of it.subtopic_slugs) {
      const id = subtopicBySlug.get(sslug);
      if (!id) {
        lookupErrors.push(
          `items[${i}] unknown subtopic_slug "${sslug}" (under topic ${it.topic_slug})`,
        );
      } else {
        subtopicIds.push(id);
      }
    }
    resolved.push({ spec: it, topicId: topic.id, subtopicIds });
  });

  if (lookupErrors.length > 0) {
    console.error(`\n${lookupErrors.length} lookup errors:`);
    for (const e of lookupErrors.slice(0, 20)) console.error(`  - ${e}`);
    if (lookupErrors.length > 20) console.error(`  ... and ${lookupErrors.length - 20} more`);
    process.exit(1);
  }
  console.log(`✓ All topic + subtopic slugs resolved.\n`);

  if (dry) {
    console.log("(--dry mode: not writing to DB)");
    await prisma.$disconnect();
    return;
  }

  // ── Insert ──────────────────────────────────────────────────
  let written = 0;
  for (const r of resolved) {
    const it = r.spec;
    await prisma.questionSetItem.create({
      data: {
        questionSetId: targetSet.id,
        topicId: r.topicId,
        type: it.type,
        status,
        order: it.order,
        marks: it.marks,
        difficulty: it.difficulty,
        tech: it.tech,
        preamble: it.preamble,
        parts: it.parts === null ? undefined : (it.parts as unknown as object),
        content: it.content,
        optionA: it.optionA,
        optionB: it.optionB,
        optionC: it.optionC,
        optionD: it.optionD,
        correctOption: it.correctOption,
        solutionContent: it.solutionContent,
        subtopics: { connect: r.subtopicIds.map((id) => ({ id })) },
      },
    });
    written++;
    if (written % 10 === 0) console.log(`  ... wrote ${written}/${resolved.length}`);
  }
  console.log(`\n✓ Wrote ${written} items as ${status}.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
