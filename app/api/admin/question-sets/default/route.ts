import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";

/**
 * Transactionally flip which QuestionSet is the default for the Practice
 * page. Exactly one row must have isDefault=true at any time.
 *
 * POST /api/admin/question-sets/default
 *   body: { setId: string }
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
    select: { id: true, name: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Set not found" }, { status: 404 });
  }

  // Single transaction: unset all, set one.
  await prisma.$transaction([
    prisma.questionSet.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    }),
    prisma.questionSet.update({
      where: { id: setId },
      data: { isDefault: true },
    }),
  ]);

  return NextResponse.json({ ok: true, setId, name: target.name });
}
