/**
 * Phase 2 seeder — reads generated-item JSON files from
 * `scripts/output/phase2-batch/` and inserts them into the "1st Generated
 * Exam Set" with status = PENDING. Idempotent per file: uses a marker in
 * `scripts/output/phase2-batch/.seeded` to skip files already inserted.
 *
 * Usage:
 *   npx tsx scripts/seed-phase2.ts                 # seed all unseeded files
 *   npx tsx scripts/seed-phase2.ts --file NAME.json  # seed one specific file
 *   npx tsx scripts/seed-phase2.ts --dry            # validate only, no insert
 */
import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma";
import { dechainSolution } from "./qset-helpers";

const BATCH_DIR = path.resolve(__dirname, "output/phase2-batch");
const SEEDED_LOG = path.join(BATCH_DIR, ".seeded");
const SET_NAME = "1st Generated Exam Set";

function dechainItem(item: GenItem): GenItem {
  if (item.solutionContent) item.solutionContent = dechainSolution(item.solutionContent);
  if (item.content) item.content = dechainSolution(item.content);
  if (item.preamble) item.preamble = dechainSolution(item.preamble);
  if (Array.isArray(item.parts)) {
    for (const p of item.parts) {
      if (p.solution) p.solution = dechainSolution(p.solution);
      if (p.content) p.content = dechainSolution(p.content);
      if (Array.isArray(p.subParts)) {
        for (const sp of p.subParts) {
          if (sp.solution) sp.solution = dechainSolution(sp.solution);
          if (sp.content) sp.content = dechainSolution(sp.content);
        }
      }
    }
  }
  return item;
}

type DifficultyV = "EASY" | "MEDIUM" | "HARD";
type ItemType = "MCQ" | "SHORT_ANSWER" | "EXTENDED_ANSWER" | "EXTENDED_RESPONSE";

interface SubPart {
  label: string;
  marks: number;
  content: string;
  solution: string;
}
interface Part {
  label: string;
  marks: number;
  content: string;
  solution: string;
  subParts?: SubPart[];
}
interface GenItem {
  type: ItemType;
  marks: number;
  difficulty: DifficultyV;
  topicSlug: string;
  subtopicSlugs: string[];
  content: string;
  preamble?: string | null;
  parts?: Part[] | null;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: "A" | "B" | "C" | "D";
  solutionContent?: string | null;
}
interface BatchFile {
  items: GenItem[];
}

function argFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}
function argVal(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

// ── Validators — mirror the audit rules from phase-1-handoff.md ──────────────
function validateItem(item: GenItem, where: string): string[] {
  const errs: string[] = [];
  const push = (m: string) => errs.push(`${where}: ${m}`);

  if (!item.type) push("missing type");
  if (!["EASY", "MEDIUM", "HARD"].includes(item.difficulty)) push(`bad difficulty ${item.difficulty}`);
  if (typeof item.marks !== "number" || item.marks < 1) push(`bad marks ${item.marks}`);
  if (!item.topicSlug) push("missing topicSlug");
  if (!Array.isArray(item.subtopicSlugs) || item.subtopicSlugs.length === 0) push("empty subtopicSlugs");

  const thinking = /\b(wait[,\s]|recompute|re-?check|re-?examine|hmm[,\s]|let me (re-?|double-?)check|assume intended|\bactually,|re-?read|something's weird|let me think|intended answer|\(assume corrected)/i;

  if (item.type === "MCQ") {
    if (item.marks !== 1) push(`MCQ marks should be 1, got ${item.marks}`);
    for (const k of ["optionA", "optionB", "optionC", "optionD"] as const) {
      if (!item[k]) push(`MCQ missing ${k}`);
    }
    if (!["A", "B", "C", "D"].includes(item.correctOption ?? "")) push(`MCQ bad correctOption`);
    if (!item.solutionContent) push("MCQ missing solutionContent");
    else if (!/\*\*Answer:\s*[A-D]\*\*/.test(item.solutionContent)) push("MCQ solution missing **Answer: X**");
    else {
      const m = item.solutionContent.match(/\*\*Answer:\s*([A-D])\*\*/);
      if (m && m[1] !== item.correctOption) push(`MCQ stated ${m[1]} but correctOption=${item.correctOption}`);
    }
    if (item.solutionContent && thinking.test(item.solutionContent)) push("MCQ thinking-out-loud");
  } else if (item.type === "SHORT_ANSWER") {
    if (![1, 2, 3].includes(item.marks)) push(`SA marks should be 1/2/3, got ${item.marks}`);
    if (!item.content) push("SA missing content");
    if (!item.solutionContent) push("SA missing solutionContent");
    if (item.solutionContent && thinking.test(item.solutionContent)) push("SA thinking-out-loud");
    if (item.parts && item.parts.length > 0) push("SA must not have parts");
  } else if (item.type === "EXTENDED_ANSWER" || item.type === "EXTENDED_RESPONSE") {
    if (!item.preamble || item.preamble.length < 5) push(`${item.type} missing preamble`);
    if (!Array.isArray(item.parts) || item.parts.length < 2) push(`${item.type} needs >=2 parts`);
    else {
      let partSum = 0;
      for (const p of item.parts) {
        if (!p.label) push(`part missing label`);
        if (typeof p.marks !== "number" || p.marks < 1) push(`part ${p.label} bad marks`);
        partSum += p.marks;
        if (!p.content) push(`part ${p.label} missing content`);
        const hasSubParts = Array.isArray(p.subParts) && p.subParts.length > 0;
        if (!p.solution && !hasSubParts) push(`part ${p.label} missing solution`);
        if (p.solution && thinking.test(p.solution)) push(`part ${p.label} thinking-out-loud`);
        if (Array.isArray(p.subParts) && p.subParts.length > 0) {
          const subSum = p.subParts.reduce((a, s) => a + (s.marks || 0), 0);
          if (subSum !== p.marks) push(`part ${p.label} subParts sum ${subSum} != part marks ${p.marks}`);
          for (const sp of p.subParts) {
            if (!sp.label) push(`subPart in ${p.label} missing label`);
            if (!sp.content) push(`subPart ${p.label}.${sp.label} missing content`);
            if (!sp.solution) push(`subPart ${p.label}.${sp.label} missing solution`);
            if (sp.solution && thinking.test(sp.solution)) push(`subPart ${p.label}.${sp.label} thinking-out-loud`);
          }
        }
      }
      if (partSum !== item.marks) push(`${item.type} parts sum to ${partSum}, item marks ${item.marks}`);
    }
    if (item.type === "EXTENDED_ANSWER" && (item.marks < 4 || item.marks > 8)) push(`EA marks out of 4–8: ${item.marks}`);
    if (item.type === "EXTENDED_RESPONSE" && (item.marks < 9 || item.marks > 21)) push(`ER marks out of 9–21: ${item.marks}`);
  }

  // LaTeX delimiter balance (stripped escaped $)
  const allText = [
    item.content ?? "",
    item.solutionContent ?? "",
    item.preamble ?? "",
    ...(item.parts ?? []).flatMap((p) => [
      p.content ?? "",
      p.solution ?? "",
      ...(p.subParts ?? []).flatMap((s) => [s.content ?? "", s.solution ?? ""]),
    ]),
  ].join("\n");
  const noBlock = allText.replace(/\$\$/g, "").replace(/\\\$/g, "");
  const inlineCount = (noBlock.match(/\$/g) || []).length;
  if (inlineCount % 2 !== 0) push(`unbalanced inline $ (count=${inlineCount})`);
  const blockCount = (allText.match(/\$\$/g) || []).length;
  if (blockCount % 2 !== 0) push(`unbalanced block $$ (count=${blockCount})`);

  // Chained equalities in $$ display blocks
  for (const m of allText.matchAll(/\$\$([\s\S]*?)\$\$/g)) {
    const inside = m[1];
    let depth = 0;
    let eq = 0;
    for (let i = 0; i < inside.length; i++) {
      const c = inside[i];
      if (c === "(" || c === "{" || c === "[") depth++;
      else if (c === ")" || c === "}" || c === "]") depth--;
      else if (c === "=" && depth === 0) {
        if (inside[i + 1] === ">" || inside[i - 1] === "\\") continue;
        eq++;
      }
    }
    if (eq >= 2 && !/,|\\\\|\\implies|\\Rightarrow|\\iff|\\Leftrightarrow|\\quad|\\qquad/.test(inside)) {
      push(`chained equality ($$${inside.slice(0, 60)}...$$)`);
      break;
    }
  }

  return errs;
}

async function main() {
  const dryRun = argFlag("dry");
  const specificFile = argVal("file");

  const setRow = await prisma.questionSet.findFirst({ where: { name: SET_NAME }, select: { id: true } });
  if (!setRow) throw new Error(`QuestionSet "${SET_NAME}" not found`);
  const questionSetId = setRow.id;

  const topics = await prisma.topic.findMany({ include: { subtopics: true } });
  const topicBySlug = new Map(topics.map((t) => [t.slug, t]));

  const seeded = new Set<string>();
  if (fs.existsSync(SEEDED_LOG)) {
    for (const line of fs.readFileSync(SEEDED_LOG, "utf-8").split("\n")) {
      const name = line.trim();
      if (name) seeded.add(name);
    }
  }

  let files = fs
    .readdirSync(BATCH_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("."));
  if (specificFile) files = files.filter((f) => f === specificFile);

  let totalValidated = 0;
  let totalInserted = 0;
  const allErrors: string[] = [];

  const orderStart = await prisma.questionSetItem.count({ where: { questionSetId } });
  let order = orderStart;

  for (const file of files) {
    if (seeded.has(file)) {
      console.log(`⏭  ${file} (already seeded)`);
      continue;
    }
    const raw = fs.readFileSync(path.join(BATCH_DIR, file), "utf-8");
    let data: BatchFile;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      allErrors.push(`${file}: invalid JSON — ${(e as Error).message}`);
      continue;
    }
    if (!Array.isArray(data.items)) {
      allErrors.push(`${file}: missing items[]`);
      continue;
    }

    // Auto-dechain chained equalities (e.g. $$A = B = C$$ → $$A = B$$ $$B = C$$)
    for (const item of data.items) dechainItem(item);

    const fileErrors: string[] = [];
    for (let i = 0; i < data.items.length; i++) {
      fileErrors.push(...validateItem(data.items[i], `${file}#${i}`));
    }
    totalValidated += data.items.length;

    if (fileErrors.length > 0) {
      console.log(`❌ ${file}: ${data.items.length} items, ${fileErrors.length} errors`);
      for (const e of fileErrors.slice(0, 10)) console.log(`    ${e}`);
      if (fileErrors.length > 10) console.log(`    (+${fileErrors.length - 10} more)`);
      allErrors.push(...fileErrors);
      continue;
    }

    if (dryRun) {
      console.log(`✅ ${file}: ${data.items.length} items validated (dry run)`);
      continue;
    }

    // Insert
    for (const item of data.items) {
      const topic = topicBySlug.get(item.topicSlug);
      if (!topic) throw new Error(`Unknown topic slug ${item.topicSlug} in ${file}`);
      const slugToId = new Map(topic.subtopics.map((s) => [s.slug, s.id]));
      const subIds: string[] = [];
      for (const slug of item.subtopicSlugs) {
        const id = slugToId.get(slug);
        if (id) {
          subIds.push(id);
        } else {
          // Cross-topic subtopic reference (valid for ERs that weave topics).
          // The primary topic FK is preserved; we just don't connect a subtopic
          // from a different topic.
          console.log(`  ℹ skipped cross-topic subtopic "${slug}" (primary topic: ${item.topicSlug})`);
        }
      }
      if (subIds.length === 0) {
        // Fall back to topic's first subtopic — happens when the agent only
        // tagged cross-topic slugs that don't belong to the primary topic.
        const fallback = topic.subtopics[0];
        if (!fallback) {
          throw new Error(`Topic ${item.topicSlug} has no subtopics; cannot fall back.`);
        }
        subIds.push(fallback.id);
        console.log(`  ⚠ no valid subtopic in [${item.subtopicSlugs.join(", ")}]; falling back to "${fallback.slug}" for ${file}`);
      }

      await prisma.questionSetItem.create({
        data: {
          questionSetId,
          topicId: topic.id,
          type: item.type,
          status: "PENDING",
          order: order++,
          marks: item.marks,
          content: item.content ?? "",
          preamble: item.preamble ?? null,
          parts: (item.parts ?? null) as any,
          optionA: item.optionA ?? null,
          optionB: item.optionB ?? null,
          optionC: item.optionC ?? null,
          optionD: item.optionD ?? null,
          correctOption: item.correctOption ?? null,
          solutionContent: item.solutionContent ?? null,
          difficulty: item.difficulty,
          subtopics: { connect: subIds.map((id) => ({ id })) },
        },
      });
      totalInserted++;
    }

    fs.appendFileSync(SEEDED_LOG, `${file}\n`);
    console.log(`✅ ${file}: inserted ${data.items.length}`);
  }

  console.log("────────────────────────────────────────");
  console.log(`Validated: ${totalValidated}`);
  console.log(`Inserted:  ${totalInserted}`);
  if (allErrors.length > 0) {
    console.log(`Errors:    ${allErrors.length}`);
    process.exitCode = 1;
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
