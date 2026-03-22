import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function TopicsPage() {
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    include: {
      subtopics: { orderBy: { order: "asc" } },
      _count: { select: { questions: true } },
    },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Topics</h1>
      <p className="text-gray-500 mb-8">
        Browse past exam questions organised by VCE Mathematical Methods syllabus topic.
      </p>

      <div className="space-y-4">
        {topics.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
            No topics yet. Ask an admin to add content.
          </div>
        )}
        {topics.map((topic) => (
          <div key={topic.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <Link
              href={`/topics/${topic.slug}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div>
                <h2 className="font-semibold text-gray-900">{topic.name}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{topic._count.questions} questions</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300" />
            </Link>

            {topic.subtopics.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-3 flex flex-wrap gap-2">
                {topic.subtopics.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/topics/${topic.slug}?subtopic=${sub.slug}`}
                    className="rounded-full bg-gray-100 hover:bg-brand-50 hover:text-brand-700 text-gray-600 px-3 py-1 text-xs font-medium transition-colors"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
