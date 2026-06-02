/**
 * Apply a JSON action plan of fixes to QuestionSetItem rows.
 *
 * Input JSON shape: [{ id, type: "update-fields", set: { <field>: <value>, ... }, reason }, ...]
 *
 * Usage: tsx apply-fixes.ts /tmp/fixes.json [--dry]
 */
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

interface Fix {
  id: string;
  type: string;
  set: Record<string, unknown>;
  reason: string;
}

const ALLOWED_FIELDS = new Set([
  "content",
  "preamble",
  "parts",
  "solutionContent",
  "optionA",
  "optionB",
  "optionC",
  "optionD",
  "correctOption",
]);

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  const dry = args.includes("--dry");
  if (!file) {
    console.error("Usage: apply-fixes <plan.json> [--dry]");
    process.exit(1);
  }
  const fixes: Fix[] = JSON.parse(fs.readFileSync(file, "utf-8"));
  console.log(`Loaded ${fixes.length} fixes from ${file}${dry ? " (DRY RUN)" : ""}\n`);

  let applied = 0;
  let skipped = 0;
  for (const f of fixes) {
    const before = await prisma.questionSetItem.findUnique({ where: { id: f.id } });
    if (!before) {
      console.log(`  [SKIP] ${f.id}: not found`);
      skipped++;
      continue;
    }
    const bad = Object.keys(f.set).filter((k) => !ALLOWED_FIELDS.has(k));
    if (bad.length > 0) {
      console.log(`  [SKIP] ${f.id}: disallowed fields ${bad.join(", ")}`);
      skipped++;
      continue;
    }
    if (dry) {
      console.log(`  [DRY] ${f.id} — ${f.reason}`);
      console.log(`        fields: ${Object.keys(f.set).join(", ")}`);
      applied++;
      continue;
    }
    await prisma.questionSetItem.update({
      where: { id: f.id },
      data: f.set as Parameters<typeof prisma.questionSetItem.update>[0]["data"],
    });
    console.log(`  [OK] ${f.id} — ${f.reason}`);
    applied++;
  }
  console.log(`\nApplied: ${applied}, Skipped: ${skipped}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
