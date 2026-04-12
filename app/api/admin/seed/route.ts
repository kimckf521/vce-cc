import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VCE_TOPICS, isAdminRole } from "@/lib/utils";

export async function POST() {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  for (let i = 0; i < VCE_TOPICS.length; i++) {
    const t = VCE_TOPICS[i];
    const topic = await prisma.topic.upsert({
      where: { slug: t.slug },
      update: { name: t.name, order: i },
      create: { name: t.name, slug: t.slug, order: i },
    });

    for (let j = 0; j < t.subtopics.length; j++) {
      const subName = t.subtopics[j];
      const subSlug = subName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      await prisma.subtopic.upsert({
        where: { topicId_slug: { topicId: topic.id, slug: subSlug } },
        update: { name: subName, order: j },
        create: { name: subName, slug: subSlug, order: j, topicId: topic.id },
      });
    }
  }

  return NextResponse.json({ ok: true, message: "Topics seeded successfully" });
}
