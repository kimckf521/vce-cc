export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import PracticeSetupForm from "@/components/PracticeSetupForm";

export default async function Exam2BPage() {
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return <PracticeSetupForm mode="exam2b" topics={topics} title="Exam 2B Practice" />;
}
