import { prisma } from "@/lib/prisma";
import PracticeClient from "./PracticeClient";

export default async function PracticePage() {
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });

  const years = await prisma.exam.findMany({
    select: { year: true },
    distinct: ["year"],
    orderBy: { year: "desc" },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Practice Mode</h1>
      <p className="text-gray-500 mb-8">
        Build a custom practice set — choose topics, difficulty, and how many questions.
      </p>
      <PracticeClient topics={topics} years={years.map((y) => y.year)} />
    </div>
  );
}
