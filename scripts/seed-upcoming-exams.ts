/**
 * Seeds Exam rows for a sitting that has not happened yet.
 *
 * Why this exists: a brand-new URL on a low-authority domain takes weeks to be
 * crawled, indexed and ranked, but the search spike after a VCE exam lasts
 * hours. A page created on exam day cannot rank; a page created two months
 * early and UPDATED on exam day can. Seeding the Exam row is what makes
 * /vce/{subject}/exams/{year}-exam-{n} resolve 200 instead of 404, so Google
 * has something to index in the meantime.
 *
 * The rows carry NO questions and NULL pdfUrl/answerUrl. The exam page detects
 * the empty paper and renders components/UpcomingExamPanel.tsx instead of the
 * question list — and, importantly, suppresses the "questions on this page are
 * reproduced from..." copyright notice, which would be false.
 *
 * Idempotent: re-running touches nothing. Safe to run against production.
 *
 *   npx tsx scripts/seed-upcoming-exams.ts --year 2026 --dry-run
 *   npx tsx scripts/seed-upcoming-exams.ts --year 2026
 */
import { PrismaClient, type ExamType } from "@prisma/client";
import { VCE_EXAM_DATES } from "../lib/exam-config";
import { getDbSubjectSlug } from "../lib/subject-context";

const prisma = new PrismaClient();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

async function main() {
  const year = Number(arg("year"));
  const dryRun = process.argv.includes("--dry-run");
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    console.error("Usage: seed-upcoming-exams.ts --year <YYYY> [--dry-run]");
    process.exit(1);
  }

  // One row per sitting on the VCAA timetable. Foundation lists a single paper
  // ("Exam"), and every existing Foundation row in the DB is EXAM_1, so a
  // one-entry timetable maps to EXAM_1 only — never a phantom Exam 2.
  const wanted: { subjectUrlSlug: string; examType: ExamType; label: string; date: string | null }[] = [];
  for (const [subjectUrlSlug, sittings] of Object.entries(VCE_EXAM_DATES)) {
    sittings.forEach((sitting, i) => {
      wanted.push({
        subjectUrlSlug,
        examType: (i === 0 ? "EXAM_1" : "EXAM_2") as ExamType,
        label: sitting.label,
        date: sitting.date,
      });
    });
  }

  console.log(`${dryRun ? "[dry-run] " : ""}Seeding ${wanted.length} ${year} exam rows\n`);
  let created = 0;
  let existing = 0;

  for (const w of wanted) {
    const dbSlug = getDbSubjectSlug(w.subjectUrlSlug);
    const subject = await prisma.subject.findUnique({ where: { slug: dbSlug }, select: { id: true } });
    if (!subject) {
      console.error(`  SKIP ${w.subjectUrlSlug}: no Subject row for slug "${dbSlug}"`);
      continue;
    }
    const found = await prisma.exam.findFirst({
      where: { subjectId: subject.id, year, examType: w.examType },
      select: { id: true, _count: { select: { questions: true } } },
    });
    const tag = `${w.subjectUrlSlug} ${year} ${w.examType} (${w.label}, ${w.date ?? "no date"})`;
    if (found) {
      existing++;
      console.log(`  exists  ${tag} — ${found._count.questions} questions`);
      continue;
    }
    if (dryRun) {
      created++;
      console.log(`  WOULD CREATE  ${tag}`);
      continue;
    }
    await prisma.exam.create({
      data: { year, examType: w.examType, subjectId: subject.id },
    });
    created++;
    console.log(`  created ${tag}`);
  }

  console.log(`\n${dryRun ? "[dry-run] " : ""}${created} created, ${existing} already present`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
