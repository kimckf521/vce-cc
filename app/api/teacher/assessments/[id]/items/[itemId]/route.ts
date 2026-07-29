import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { requireTeacher } from "@/lib/teacher-gate";
import {
  getOwnedAssessmentDetail,
  getOwnedAssessmentWithItemIds,
} from "@/lib/teacher-assessments";

/**
 * DELETE /api/teacher/assessments/[id]/items/[itemId] — remove one question
 * slot and close the gap so orders stay dense 0-based.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const auth = await requireTeacher();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`teacher-assessment-items:${user.id}`, {
    maxRequests: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const { id, itemId } = await params;
  const owned = await getOwnedAssessmentWithItemIds(id, user.id);
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const item = owned.items.find((it) => it.id === itemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.assessmentItem.delete({ where: { id: itemId } }),
    // Close the gap left by the removed slot.
    prisma.assessmentItem.updateMany({
      where: { assessmentId: id, order: { gt: item.order } },
      data: { order: { decrement: 1 } },
    }),
    prisma.assessment.update({
      where: { id },
      data: { updatedAt: new Date() },
    }),
  ]);

  const assessment = await getOwnedAssessmentDetail(id, user.id);
  return NextResponse.json({ assessment });
}
