import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";

/**
 * Transactionally flip which QuestionSet is the default for the Practice
 * page within a single subject. `isDefault` is now scoped per subject —
 * at most one row per subject has `isDefault=true`, so each subject's
 * Practice page resolves to its own pool.
 *
 * POST /api/admin/question-sets/default
 *   body: { setId: string }
 *
 * The target set's `subjectId` determines the scope. Sets without a
 * `subjectId` fall back to global toggling (legacy behaviour).
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { setId } = body;
  if (!setId || typeof setId !== "string") {
    return NextResponse.json({ error: "Missing setId" }, { status: 400 });
  }

  const target = await prisma.questionSet.findUnique({
    where: { id: setId },
    select: { id: true, name: true, subjectId: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Set not found" }, { status: 404 });
  }

  // Unset other defaults SCOPED TO THE TARGET'S SUBJECT, then set the
  // target. Legacy rows with null subjectId still toggle globally so we
  // don't strand any historical setup.
  const unsetWhere = target.subjectId
    ? { isDefault: true, subjectId: target.subjectId }
    : { isDefault: true, subjectId: null };

  await prisma.$transaction([
    prisma.questionSet.updateMany({
      where: unsetWhere,
      data: { isDefault: false },
    }),
    prisma.questionSet.update({
      where: { id: setId },
      data: { isDefault: true },
    }),
  ]);

  return NextResponse.json({ ok: true, setId, name: target.name });
}
