import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { requireTeacher } from "@/lib/teacher-gate";
import { updateAssessmentSchema } from "@/lib/validations";
import { getOwnedAssessmentDetail } from "@/lib/teacher-assessments";

/**
 * GET /api/teacher/assessments/[id] — full detail with hydrated items.
 * Ownership-scoped: another teacher's id looks identical to a missing one.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireTeacher();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`teacher-assessment-detail:${user.id}`, {
    maxRequests: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const { id } = await params;
  const assessment = await getOwnedAssessmentDetail(id, user.id);
  if (!assessment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ assessment });
}

/**
 * PATCH /api/teacher/assessments/[id] — update title / description / status.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireTeacher();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`teacher-assessment-update:${user.id}`, {
    maxRequests: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const { id } = await params;
  const owned = await prisma.assessment.findFirst({
    where: { id, teacherId: user.id },
    select: { id: true },
  });
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateAssessmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const { title, description, status } = parsed.data;

  await prisma.assessment.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      // description accepts null explicitly to clear it.
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
    },
  });

  const assessment = await getOwnedAssessmentDetail(id, user.id);
  return NextResponse.json({ assessment });
}

/**
 * DELETE /api/teacher/assessments/[id] — items cascade at the DB level.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireTeacher();
  if (auth.response) return auth.response;
  const { user } = auth;

  const limited = rateLimit(`teacher-assessment-delete:${user.id}`, {
    maxRequests: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const { id } = await params;
  const owned = await prisma.assessment.findFirst({
    where: { id, teacherId: user.id },
    select: { id: true },
  });
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.assessment.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
