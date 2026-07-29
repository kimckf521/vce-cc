import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { requireTeacher } from "@/lib/teacher-gate";
import {
  getOwnedAssessmentDetail,
  getOwnedAssessmentWithItemIds,
} from "@/lib/teacher-assessments";

/**
 * POST /api/teacher/assessments/[id]/items/[itemId]/shuffle — replace one
 * slot with a random equivalent APPROVED item from the same bank:
 *
 *   - same topic, same type, same marks (hard constraints — the paper's
 *     structure and total marks are preserved)
 *   - same tech tag when the outgoing item has one (null tech → no constraint)
 *   - same difficulty preferred; when no equal-difficulty candidate exists
 *     the search widens to any difficulty
 *   - never an item already in the paper (including the outgoing one)
 *
 * 409 { error: "no-equivalent" } when nothing in the bank fits.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const auth = await requireTeacher();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`teacher-assessment-shuffle:${user.id}`, {
    maxRequests: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const { id, itemId } = await params;
  const owned = await getOwnedAssessmentWithItemIds(id, user.id);
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!owned.items.some((it) => it.id === itemId)) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const item = await prisma.assessmentItem.findUnique({
    where: { id: itemId },
    select: {
      questionSetItem: {
        select: {
          id: true,
          questionSetId: true,
          topicId: true,
          type: true,
          marks: true,
          difficulty: true,
          tech: true,
        },
      },
    },
  });
  // Slots without a questionSetItem are the reserved past-paper source
  // (questionId) which T1 never writes — nothing equivalent exists for them.
  if (!item?.questionSetItem) {
    return NextResponse.json({ error: "no-equivalent" }, { status: 409 });
  }
  const outgoing = item.questionSetItem;

  // Exclude every item already in the paper (the outgoing one included).
  const inPaperIds = owned.items
    .map((it) => it.questionSetItemId)
    .filter((qsiId): qsiId is string => qsiId !== null);

  const equivalentWhere = {
    questionSetId: outgoing.questionSetId,
    status: "APPROVED" as const,
    topicId: outgoing.topicId,
    type: outgoing.type,
    marks: outgoing.marks,
    id: { notIn: inPaperIds },
    // Same tech only when the outgoing item is classified.
    ...(outgoing.tech !== null && { tech: outgoing.tech }),
  };

  // Difficulty preferred-equal…
  let candidates = await prisma.questionSetItem.findMany({
    where: { ...equivalentWhere, difficulty: outgoing.difficulty },
    select: { id: true },
  });
  // …else any difficulty.
  if (candidates.length === 0) {
    candidates = await prisma.questionSetItem.findMany({
      where: equivalentWhere,
      select: { id: true },
    });
  }
  if (candidates.length === 0) {
    return NextResponse.json({ error: "no-equivalent" }, { status: 409 });
  }

  const replacement = candidates[Math.floor(Math.random() * candidates.length)];

  await prisma.$transaction([
    prisma.assessmentItem.update({
      where: { id: itemId },
      data: { questionSetItemId: replacement.id },
    }),
    prisma.assessment.update({
      where: { id },
      data: { updatedAt: new Date() },
    }),
  ]);

  const assessment = await getOwnedAssessmentDetail(id, user.id);
  return NextResponse.json({ assessment });
}
