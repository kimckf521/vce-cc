export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import PracticeSetupForm from "@/components/PracticeSetupForm";

export default async function Exam1Page() {
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return <PracticeSetupForm mode="exam1" topics={topics} title="Exam 1 Practice" />;
}
