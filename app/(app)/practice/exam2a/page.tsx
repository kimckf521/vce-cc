export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import PracticeSetupForm from "@/components/PracticeSetupForm";

export default async function Exam2APage() {
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return <PracticeSetupForm mode="exam2a" topics={topics} title="Exam 2A Practice" />;
}
