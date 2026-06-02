/**
 * Seed VCAA PDF URLs on Exam rows for Specialist / General / Foundation.
 *
 * Methods already has its pdfUrls set (all pointing to vcaa.vic.edu.au).
 * The other 3 subjects have `pdfUrl: null` everywhere. This script:
 *   1. Generates the likely VCAA URL for each missing exam using the patterns
 *      observed on Methods URLs (pre-2025 and 2025+ are different).
 *   2. HEAD-checks every URL to confirm it actually resolves (200).
 *   3. Reports verified vs failed URLs.
 *   4. With --execute, writes verified URLs to the DB.
 *
 * For URLs that don't verify, the user can supply manual overrides in the
 * MANUAL_OVERRIDES map below.
 *
 * VCAA URL patterns observed:
 *   Pre-2025: https://www.vcaa.vic.edu.au/sites/default/files/Documents/exams/mathematics/{Y}/{Y}{ABBR}{N}-w.pdf
 *   2025+:    https://www.vcaa.vic.edu.au/sites/default/files/{Y}-11/{Y}-{LongName}{N}.pdf
 *
 * Subject abbreviations (educated guesses, HEAD-checked):
 *   Mathematical Methods    → MM   (long: MathMethods)
 *   Specialist Mathematics  → SM   (long: SpecMaths)
 *   General Mathematics     → FM   (Further Maths pre-2023; long: GenMaths from 2023)
 *   Foundation Mathematics  → FMNS (new 2023+; long: FoundMaths)
 *
 * Default: DRY RUN. Pass --execute to actually write.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/seed-vcaa-pdf-urls.ts
 *   npx tsx --env-file=.env.local scripts/seed-vcaa-pdf-urls.ts --execute
 */

import { prisma } from "../lib/prisma";

const execute = process.argv.includes("--execute");
const MODE = execute ? "EXECUTE" : "DRY RUN";

// Slug → { pre-2025 abbreviation, 2025+ long name, year General was renamed
//   from "Further Mathematics" (null if always one name) }
type SubjectPattern = {
  slug: string;
  shortName: string;
  abbrPre2025: string;
  abbrPre2025After?: { fromYear: number; abbr: string };
  longName2025: string;
};

const PATTERNS: SubjectPattern[] = [
  {
    slug: "vce-specialist",
    shortName: "Specialist",
    abbrPre2025: "SM",
    longName2025: "SpecMaths",
  },
  {
    // General was called "Further Mathematics" until end of 2022; renamed to
    // "General Mathematics" from 2023 (new Study Design).
    slug: "vce-general",
    shortName: "General",
    abbrPre2025: "FM", // Further Mathematics
    abbrPre2025After: { fromYear: 2023, abbr: "GM" }, // General Mathematics
    longName2025: "GenMaths",
  },
  {
    // Foundation only exists from 2023+ (current Units 3&4 form).
    slug: "vce-foundation",
    shortName: "Foundation",
    abbrPre2025: "FMNS", // Foundation Maths Numeracy Skills — best guess
    longName2025: "FoundMaths",
  },
];

// Manual overrides for URLs that don't follow the auto-detected pattern.
// Populate this after seeing the script's failures, then re-run.
// Key format: "{slug}-{year}-{1|2}"
const MANUAL_OVERRIDES: Record<string, string> = {
  // e.g. "vce-specialist-2024-1": "https://www.vcaa.vic.edu.au/.../actual-url.pdf",
};

function buildUrl(
  pattern: SubjectPattern,
  year: number,
  examType: 1 | 2
): string {
  const overrideKey = `${pattern.slug}-${year}-${examType}`;
  if (MANUAL_OVERRIDES[overrideKey]) return MANUAL_OVERRIDES[overrideKey];

  if (year >= 2025) {
    // 2025+ pattern: /sites/default/files/2025-11/2025-MathMethods1.pdf
    // Month folder defaults to 11 (November release); override if needed.
    return `https://www.vcaa.vic.edu.au/sites/default/files/${year}-11/${year}-${pattern.longName2025}${examType}.pdf`;
  }
  // Pre-2025 pattern: /sites/default/files/Documents/exams/mathematics/2024/2024SM1-w.pdf
  let abbr = pattern.abbrPre2025;
  if (pattern.abbrPre2025After && year >= pattern.abbrPre2025After.fromYear) {
    abbr = pattern.abbrPre2025After.abbr;
  }
  return `https://www.vcaa.vic.edu.au/sites/default/files/Documents/exams/mathematics/${year}/${year}${abbr}${examType}-w.pdf`;
}

async function headCheck(url: string): Promise<number> {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.status;
  } catch {
    return 0; // network error
  }
}

type Plan = {
  examId: string;
  slug: string;
  year: number;
  examType: 1 | 2;
  url: string;
  status: number;
};

async function main() {
  console.log(`\n🦘 VCAA PDF URL seeder (${MODE})\n`);

  const plans: Plan[] = [];
  for (const pattern of PATTERNS) {
    const subject = await prisma.subject.findUnique({
      where: { slug: pattern.slug },
      select: { id: true, name: true },
    });
    if (!subject) continue;
    const exams = await prisma.exam.findMany({
      where: { subjectId: subject.id, pdfUrl: null },
      orderBy: [{ year: "asc" }, { examType: "asc" }],
      select: { id: true, year: true, examType: true },
    });
    for (const e of exams) {
      const examType = (e.examType === "EXAM_1" ? 1 : 2) as 1 | 2;
      const url = buildUrl(pattern, e.year, examType);
      plans.push({
        examId: e.id,
        slug: pattern.slug,
        year: e.year,
        examType,
        url,
        status: 0,
      });
    }
  }

  console.log(`Planning ${plans.length} URL updates. Running HEAD checks…\n`);

  // HEAD-check in parallel (VCAA can handle 60 concurrent)
  await Promise.all(
    plans.map(async (p) => {
      p.status = await headCheck(p.url);
    })
  );

  // Group output by subject
  const bySubject = new Map<string, Plan[]>();
  for (const p of plans) {
    const list = bySubject.get(p.slug) ?? [];
    list.push(p);
    bySubject.set(p.slug, list);
  }

  let verified = 0;
  let failed = 0;
  for (const [slug, list] of bySubject) {
    console.log(`── ${slug} ──`);
    for (const p of list) {
      const ok = p.status >= 200 && p.status < 400;
      const marker = ok ? "✓" : "✗";
      console.log(
        `  ${marker} ${p.year} Exam ${p.examType}  [${String(p.status).padStart(3)}]  ${p.url}`
      );
      if (ok) verified++;
      else failed++;
    }
  }

  console.log(`\n📊 ${verified} verified, ${failed} failed`);

  if (execute) {
    let written = 0;
    for (const p of plans) {
      if (p.status >= 200 && p.status < 400) {
        await prisma.exam.update({
          where: { id: p.examId },
          data: { pdfUrl: p.url },
        });
        written++;
      }
    }
    console.log(`\n✅ ${written} pdfUrl(s) written to DB.`);
    if (failed > 0) {
      console.log(
        `   ${failed} URL(s) failed verification — add them to MANUAL_OVERRIDES in this script and re-run.`
      );
    }
  } else {
    console.log(
      `\nℹ️  DRY RUN. ${failed > 0 ? "Add failures to MANUAL_OVERRIDES, then re-run with --execute.\n" : "Re-run with --execute to write to DB.\n"}`
    );
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
