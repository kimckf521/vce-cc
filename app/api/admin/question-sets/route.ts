import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";

export async function PATCH(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { itemId, content, solutionContent } = body;
  if (!itemId) return NextResponse.json({ error: "Missing itemId" }, { status: 400 });

  const item = await prisma.questionSetItem.update({
    where: { id: itemId },
    data: {
      ...(content !== undefined && { content }),
      ...(solutionContent !== undefined && { solutionContent }),
    },
  });

  return NextResponse.json({ item });
}

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sets = await prisma.questionSet.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: {
          topic: { select: { id: true, name: true } },
          subtopics: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  return NextResponse.json({ questionSets: sets });
}
