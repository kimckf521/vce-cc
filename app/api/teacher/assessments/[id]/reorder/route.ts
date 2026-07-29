import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { requireTeacher } from "@/lib/teacher-gate";
import { reorderAssessmentSchema } from "@/lib/validations";
import {
  getOwnedAssessmentDetail,
  getOwnedAssessmentWithItemIds,
} from "@/lib/teacher-assessments";

/**
 * POST /api/teacher/assessments/[id]/reorder — rewrite the paper order from
 * a COMPLETE permutation of the current AssessmentItem ids. Partial lists,
 * duplicates and foreign ids are all rejected so a stale drag-and-drop
 * client can never silently drop questions.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireTeacher();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`teacher-assessment-reorder:${user.id}`, {
    maxRequests: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const { id } = await params;
  const owned = await getOwnedAssessmentWithItemIds(id, user.id);
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = reorderAssessmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const { itemIds } = parsed.data;

  // Complete-permutation check: same length, no duplicates, same id set.
  const currentIds = new Set(owned.items.map((it) => it.id));
  const uniqueIncoming = new Set(itemIds);
  if (
    itemIds.length !== owned.items.length ||
    uniqueIncoming.size !== itemIds.length ||
    itemIds.some((itemId) => !currentIds.has(itemId))
  ) {
    return NextResponse.json(
      { error: "itemIds must be a complete permutation of the paper's items" },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    ...itemIds.map((itemId, order) =>
      prisma.assessmentItem.update({ where: { id: itemId }, data: { order } })
    ),
    prisma.assessment.update({
      where: { id },
      data: { updatedAt: new Date() },
    }),
  ]);

  const assessment = await getOwnedAssessmentDetail(id, user.id);
  return NextResponse.json({ assessment });
}
