import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient({ log: ["error"] });

// Must match GENERATED_QUESTION_SET_NAME in lib/question-set-groups.ts
const SET_NAME = "1st Generated Question Set";

const SUBJECTS = [
  { slug: "mathematical-methods", label: "Methods" },
  { slug: "vce-specialist", label: "Specialist" },
  { slug: "vce-general", label: "General" },
  { slug: "vce-foundation", label: "Foundation" },
];

async function main() {
  const report: any = { setName: SET_NAME, subjects: {} };

  for (const s of SUBJECTS) {
    const subject = await prisma.subject.findFirst({
      where: { slug: s.slug },
      select: { id: true },
    });
    if (!subject) {
      report.subjects[s.label] = { slug: s.slug, error: "SUBJECT ROW NOT FOUND" };
      continue;
    }

    const set = await prisma.questionSet.findFirst({
      where: { name: SET_NAME, archived: false, subjectId: subject.id },
      select: { id: true },
    });

    const topics = await prisma.topic.findMany({
      where: { subjectId: subject.id },
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true },
    });

    const subj: any = {
      slug: s.slug,
      topicSetFound: !!set,
      topicCount: topics.length,
      topics: [],
    };

    if (!set) {
      subj.error = `NO non-archived "${SET_NAME}" for this subject → ALL topics render empty`;
      report.subjects[s.label] = subj;
      continue;
    }

    // Status totals across the whole set
    const statusGroups = await prisma.questionSetItem.groupBy({
      by: ["status"],
      where: { questionSetId: set.id },
      _count: { _all: true },
    });
    subj.statusTotals = Object.fromEntries(
      statusGroups.map((g) => [g.status, g._count._all]),
    );

    // Per-topic APPROVED counts + type breakdown
    let approvedSubjectTotal = 0;
    const emptyTopics: string[] = [];
    for (const t of topics) {
      const [approved, pending, rejected, byType] = await Promise.all([
        prisma.questionSetItem.count({
          where: { questionSetId: set.id, topicId: t.id, status: "APPROVED" },
        }),
        prisma.questionSetItem.count({
          where: { questionSetId: set.id, topicId: t.id, status: "PENDING" },
        }),
        prisma.questionSetItem.count({
          where: { questionSetId: set.id, topicId: t.id, status: "REJECTED" },
        }),
        prisma.questionSetItem.groupBy({
          by: ["type"],
          where: { questionSetId: set.id, topicId: t.id, status: "APPROVED" },
          _count: { _all: true },
        }),
      ]);
      approvedSubjectTotal += approved;
      if (approved === 0) emptyTopics.push(t.name);
      subj.topics.push({
        name: t.name,
        slug: t.slug,
        approved,
        pending,
        rejected,
        types: Object.fromEntries(byType.map((g) => [g.type, g._count._all])),
      });
    }
    subj.approvedSubjectTotal = approvedSubjectTotal;
    subj.emptyTopics = emptyTopics;

    // Orphans: APPROVED items in this set whose topicId is null or not a topic of this subject
    const topicIds = new Set(topics.map((t) => t.id));
    const approvedItems = await prisma.questionSetItem.findMany({
      where: { questionSetId: set.id, status: "APPROVED" },
      select: { topicId: true },
    });
    subj.approvedItemsInSet = approvedItems.length;
    subj.orphanApproved = approvedItems.filter(
      (i) => !i.topicId || !topicIds.has(i.topicId),
    ).length;

    report.subjects[s.label] = subj;
  }

  // Also: are there OTHER non-archived sets with the canonical name (ambiguity risk)?
  const allNamed = await prisma.questionSet.findMany({
    where: { name: SET_NAME },
    select: { id: true, archived: true, isDefault: true, subject: { select: { slug: true } } },
  });
  report.allSetsWithCanonicalName = allNamed.map((r) => ({
    subject: r.subject?.slug ?? null,
    archived: r.archived,
    isDefault: r.isDefault,
  }));

  const out = JSON.stringify(report, null, 2);
  fs.writeFileSync("/tmp/topics_audit.json", out);
  console.log(out);
}

main()
  .catch((e) => {
    console.error("AUDIT_ERROR", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
