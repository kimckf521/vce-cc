import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { requireTeacher } from "@/lib/teacher-gate";
import { createAssessmentSchema } from "@/lib/validations";
import {
  getOwnedAssessmentDetail,
  serializeAssessmentSummary,
} from "@/lib/teacher-assessments";
import { assemblePaper } from "@/lib/paper-assembler";
import { getGeneratedQuestionSetId } from "@/lib/question-set-groups";
import { getDbSubjectSlug } from "@/lib/subject-context";

/**
 * GET /api/teacher/assessments — the caller's own assessments (teacherId
 * scoping applies to admins too in T1: no cross-teacher browsing), newest
 * updatedAt first.
 */
export async function GET(_req: NextRequest) {
  const auth = await requireTeacher();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`teacher-assessments-read:${user.id}`, {
    maxRequests: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const rows = await prisma.assessment.findMany({
    where: { teacherId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      subject: { select: { slug: true, name: true } },
      // Summaries only need per-item marks for the total; keep the payload thin.
      items: { select: { questionSetItem: { select: { marks: true } } } },
    },
  });

  return NextResponse.json({ assessments: rows.map(serializeAssessmentSummary) });
}

/**
 * POST /api/teacher/assessments — create a paper, optionally auto-assembled
 * from the generated bank via lib/paper-assembler.ts (personalisation off).
 * The builder settings are stored verbatim on Assessment.settings as a
 * snapshot of what the teacher asked for.
 */
export async function POST(req: NextRequest) {
  const auth = await requireTeacher();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`teacher-assessments-create:${user.id}`, {
    maxRequests: 20,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const body = await req.json();
  const parsed = createAssessmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const { subjectSlug, title, autoAssemble, settings } = parsed.data;

  // Auto-assembly must be bounded: with neither targetMarks nor questionCount,
  // assemblePaper returns the ENTIRE ranked bank (1,500+ items for Methods) —
  // a massive nested create plus a multi-megabyte response. The official form
  // always sends targetMarks; reject API callers that omit both.
  if (autoAssemble && !settings?.targetMarks && !settings?.questionCount) {
    return NextResponse.json(
      {
        error:
          "Auto-assembly requires settings.targetMarks or settings.questionCount",
      },
      { status: 400 }
    );
  }

  // The builder UI sends the short URL slug (methods/general/...); DB slugs
  // are the legacy long form (mathematical-methods/...). Translate at the API
  // edge — getDbSubjectSlug passes already-DB slugs through unchanged, so both
  // forms are accepted.
  const subject = await prisma.subject.findUnique({
    where: { slug: getDbSubjectSlug(subjectSlug) },
    select: { id: true, slug: true, topics: { select: { id: true } } },
  });
  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  // Requested topics must belong to the subject — reject rather than silently
  // dropping so the teacher's stored settings snapshot never lies.
  const subjectTopicIds = subject.topics.map((t) => t.id);
  if (settings?.topicIds && settings.topicIds.length > 0) {
    const valid = new Set(subjectTopicIds);
    if (settings.topicIds.some((tid) => !valid.has(tid))) {
      return NextResponse.json(
        { error: "One or more topics do not belong to this subject" },
        { status: 400 }
      );
    }
  }

  // Auto-assemble BEFORE creating the row so a single nested create writes
  // the paper atomically. The pool is the original generated bank (T1 rule);
  // assemblePaper never throws — an unsatisfiable request yields an empty or
  // partial paper the teacher can finish by hand.
  let itemIds: string[] = [];
  if (autoAssemble) {
    const setId = await getGeneratedQuestionSetId(subject.slug);
    if (setId) {
      const assembled = await assemblePaper({
        setId,
        topicIds:
          settings?.topicIds && settings.topicIds.length > 0
            ? settings.topicIds
            : subjectTopicIds,
        difficulty: settings?.difficulty,
        tech: settings?.tech,
        targetMarks: settings?.targetMarks,
        questionCount: settings?.questionCount,
        // Personalisation off for teacher papers: no weakItemIds / recentSeenIds.
      });
      itemIds = assembled.itemIds;
    }
  }

  const created = await prisma.assessment.create({
    data: {
      teacherId: user.id,
      subjectId: subject.id,
      title,
      ...(settings !== undefined && { settings }),
      ...(itemIds.length > 0 && {
        items: {
          // Dense 0-based order in assembled paper order.
          create: itemIds.map((questionSetItemId, i) => ({
            questionSetItemId,
            order: i,
          })),
        },
      }),
    },
    select: { id: true },
  });

  const assessment = await getOwnedAssessmentDetail(created.id, user.id);
  return NextResponse.json({ assessment }, { status: 201 });
}
