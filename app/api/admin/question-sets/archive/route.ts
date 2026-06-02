import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";

/**
 * Toggle a question set's `archived` flag.
 * Archived sets are visually greyed out in the admin UI and treated as
 * historical record only. The default question set cannot be archived
 * (it must be in active use).
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { setId, archived } = await req.json();
  if (!setId) return NextResponse.json({ error: "Missing setId" }, { status: 400 });
  if (typeof archived !== "boolean") {
    return NextResponse.json({ error: "archived must be boolean" }, { status: 400 });
  }

  const set = await prisma.questionSet.findUnique({ where: { id: setId } });
  if (!set) return NextResponse.json({ error: "Set not found" }, { status: 404 });

  if (archived && set.isDefault) {
    return NextResponse.json(
      { error: "Cannot archive the default question set. Promote another set to default first." },
      { status: 400 },
    );
  }

  const updated = await prisma.questionSet.update({
    where: { id: setId },
    data: { archived },
  });

  return NextResponse.json({ questionSet: updated });
}
