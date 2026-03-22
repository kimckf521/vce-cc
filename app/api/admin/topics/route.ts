import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    include: { subtopics: { orderBy: { order: "asc" }, select: { id: true, name: true } } },
  });
  return NextResponse.json({ topics });
}
