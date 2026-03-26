export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Exam2ABSetupForm from "./Exam2ABSetupForm";

export default async function Exam2ABPage() {
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return <Exam2ABSetupForm topics={topics} />;
}
