import Link from "next/link";
import { PenLine, Calculator } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function ExamsPage() {
  const exams = await prisma.exam.findMany({
    orderBy: [{ year: "desc" }, { examType: "asc" }],
    select: {
      id: true,
      year: true,
      examType: true,
      questions: { select: { questionNumber: true, part: true } },
    },
  });

  const examList = exams.map((e) => ({
    id: e.id,
    year: e.year,
    examType: e.examType,
    questionCount:
      e.questions.filter((q) => q.part === null).length +
      new Set(e.questions.filter((q) => q.part !== null).map((q) => q.questionNumber)).size,
  }));

  const exam1s = examList.filter((e) => e.examType === "EXAM_1").sort((a, b) => a.year - b.year);
  const exam2s = examList.filter((e) => e.examType === "EXAM_2").sort((a, b) => a.year - b.year);

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Past Papers</h1>
      <p className="text-gray-500 lg:text-base mb-8">
        Every VCAA Mathematical Methods exam, with questions and solutions.
      </p>

      <div className="space-y-10">
        {/* Exam 1 */}
        <div>
          <div className="flex items-center gap-3 lg:gap-4 mb-2">
            <div className="flex h-10 w-10 lg:h-14 lg:w-14 items-center justify-center rounded-xl lg:rounded-2xl bg-brand-100">
              <PenLine className="h-5 w-5 lg:h-7 lg:w-7 text-brand-600" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Exam 1</h2>
              <p className="text-sm lg:text-base text-gray-400">
                Short answer · No calculator · 40 marks
              </p>
            </div>
          </div>
          <p className="text-gray-500 lg:text-base mb-5">{exam1s.length} papers · 2016 – 2023</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 lg:gap-4">
            {exam1s.map((exam) => (
              <Link
                key={exam.id}
                href={`/exams/${exam.id}`}
                className="group flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-5 lg:p-7 text-center shadow-sm transition-all hover:shadow-md hover:border-brand-200"
              >
                <span className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{exam.year}</span>
                <span className="text-xs lg:text-sm text-gray-400">{exam.questionCount} questions</span>
                <span className="mt-3 text-xs lg:text-sm font-semibold text-brand-400 group-hover:text-brand-600 transition-colors">
                  Open →
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Exam 2 */}
        <div>
          <div className="flex items-center gap-3 lg:gap-4 mb-2">
            <div className="flex h-10 w-10 lg:h-14 lg:w-14 items-center justify-center rounded-xl lg:rounded-2xl bg-violet-100">
              <Calculator className="h-5 w-5 lg:h-7 lg:w-7 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Exam 2</h2>
              <p className="text-sm lg:text-base text-gray-400">
                Multiple choice + extended response · CAS · 80 marks
              </p>
            </div>
          </div>
          <p className="text-gray-500 lg:text-base mb-5">{exam2s.length} papers · 2016 – 2023</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 lg:gap-4">
            {exam2s.map((exam) => (
              <Link
                key={exam.id}
                href={`/exams/${exam.id}`}
                className="group flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-5 lg:p-7 text-center shadow-sm transition-all hover:shadow-md hover:border-violet-200"
              >
                <span className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{exam.year}</span>
                <span className="text-xs lg:text-sm text-gray-400">{exam.questionCount} questions</span>
                <span className="mt-3 text-xs lg:text-sm font-semibold text-violet-400 group-hover:text-violet-600 transition-colors">
                  Open →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
