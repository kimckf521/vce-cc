import Link from "next/link";
import { PenLine, CheckSquare, FileText, LayoutGrid, GraduationCap } from "lucide-react";
import { canAccessPaidPractice } from "@/lib/practice-gate";
import PracticeCard from "@/components/PracticeCard";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ curriculum: string; subject: string }>;
}

export default async function PracticePage({ params }: PageProps) {
  const { curriculum, subject } = await params;
  const isFoundation = subject === "foundation";

  const isGeneral = subject === "general";

  const hasPaid = await canAccessPaidPractice();
  const locked = !hasPaid;

  // VCE General Mathematics has just two papers, no Section A/B split:
  //   Exam 1 — 40 multiple-choice questions, 1 mark each (40 marks), 1.5h, no CAS
  //   Exam 2 — ~15–18 multi-part extended-response questions (60 marks), 1.5h, CAS
  // Render two cards instead of the Methods/Specialist 4-card layout.
  if (isGeneral) {
    return (
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Practice mode</h1>
        <p className="text-gray-500 dark:text-gray-400 lg:text-base mb-8">
          Choose a practice format and configure your session.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
          {/* Exam 1 — 40 MCQ, free for everyone */}
          <Link
            href={`/${curriculum}/${subject}/practice/exam1`}
            className="group rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950 hover:bg-violet-100 dark:hover:bg-violet-900 p-6 lg:p-8 flex flex-col gap-4 lg:gap-5 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-violet-100 dark:bg-violet-900 p-3 lg:p-4">
                <PenLine className="h-6 w-6 lg:h-7 lg:w-7 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-400 px-3 py-1 text-xs lg:text-sm font-semibold">
                No calculator · 40 MCQ
              </span>
            </div>
            <div>
              <div className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 lg:mb-2">Exam 1 practice</div>
              <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                40 multiple-choice questions worth 1 mark each — 40 marks total, no CAS calculator. Mirrors the VCAA General Exam 1 paper.
              </p>
            </div>
            <div className="text-sm lg:text-base font-semibold text-violet-700 dark:text-violet-400 group-hover:translate-x-0.5 transition-transform">
              Configure and start →
            </div>
          </Link>

          {/* Exam 2 — extended response, 60 marks (paid) */}
          <PracticeCard
            href={`/${curriculum}/${subject}/practice/exam2`}
            locked={locked}
            accent="amber"
            icon={<FileText className="h-6 w-6 lg:h-7 lg:w-7 text-amber-600 dark:text-amber-400" />}
            chip="CAS · 60 marks"
            title="Exam 2 practice"
            description="Multi-part extended-response questions worth 60 marks total, with a CAS calculator. Mirrors the VCAA General Exam 2 paper."
          />
        </div>
      </div>
    );
  }

  // Foundation: a single end-of-year paper split into:
  //   Section A — 20 multiple-choice questions, 1 mark each (20 marks)
  //   Section B — 12 multi-part extended-response questions (60 marks)
  // Total 80 marks. Mirror the real paper with three cards — drill either
  // section, or sit the full paper. All free (Foundation isn't gated).
  if (isFoundation) {
    return (
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Practice mode</h1>
        <p className="text-gray-500 dark:text-gray-400 lg:text-base mb-8">
          Drill a single section or sit the full VCE Foundation Mathematics paper.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
          {/* Section A — 20 MCQ, 20 marks */}
          <PracticeCard
            href={`/${curriculum}/${subject}/practice/examA`}
            locked={false}
            accent="sky"
            icon={<CheckSquare className="h-6 w-6 lg:h-7 lg:w-7 text-sky-600 dark:text-sky-400" />}
            chip="Section A · 20 MCQ · 20 marks"
            title="Section A practice"
            description="20 multiple-choice questions, 1 mark each. Mirrors Section A of the Foundation exam."
          />

          {/* Section B — 12 multi-part extended questions, 60 marks */}
          <PracticeCard
            href={`/${curriculum}/${subject}/practice/examB`}
            locked={false}
            accent="amber"
            icon={<FileText className="h-6 w-6 lg:h-7 lg:w-7 text-amber-600 dark:text-amber-400" />}
            chip="Section B · 12 questions · 60 marks"
            title="Section B practice"
            description="12 multi-part extended-response questions worth 60 marks. Mirrors Section B of the Foundation exam."
          />

          {/* Full paper — Section A + Section B */}
          <PracticeCard
            href={`/${curriculum}/${subject}/practice/exam`}
            locked={false}
            accent="emerald"
            icon={<GraduationCap className="h-6 w-6 lg:h-7 lg:w-7 text-emerald-600 dark:text-emerald-400" />}
            chip="Full paper · 80 marks"
            title="Section A & B practice"
            description="The complete paper — 20 MCQ (Section A) plus 12 extended-response questions (Section B)."
          />
        </div>
      </div>
    );
  }

  // Methods / Specialist / General — keep the existing 4-card layout
  // (Exam 1 free, Exam 2A/2B/2AB gated).
  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Practice mode</h1>
      <p className="text-gray-500 dark:text-gray-400 lg:text-base mb-8">
        Choose a practice format and configure your session.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
        {/* Exam 1 — free for everyone */}
        <Link
          href={`/${curriculum}/${subject}/practice/exam1`}
          className="group rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950 hover:bg-violet-100 dark:hover:bg-violet-900 p-6 lg:p-8 flex flex-col gap-4 lg:gap-5 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-violet-100 dark:bg-violet-900 p-3 lg:p-4">
              <PenLine className="h-6 w-6 lg:h-7 lg:w-7 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-400 px-3 py-1 text-xs lg:text-sm font-semibold">
              No calculator
            </span>
          </div>
          <div>
            <div className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 lg:mb-2">Exam 1 practice</div>
            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              Short-answer questions without a CAS calculator. Mirrors the Exam 1 format.
            </p>
          </div>
          <div className="text-sm lg:text-base font-semibold text-violet-700 dark:text-violet-400 group-hover:translate-x-0.5 transition-transform">
            Configure and start →
          </div>
        </Link>

        {/* Exam 2A — paid (opens paywall modal when locked) */}
        <PracticeCard
          href={`/${curriculum}/${subject}/practice/exam2a`}
          locked={locked}
          accent="sky"
          icon={<CheckSquare className="h-6 w-6 lg:h-7 lg:w-7 text-sky-600 dark:text-sky-400" />}
          chip="CAS · MCQ"
          title="Exam 2A practice"
          description="Multiple-choice questions with a CAS calculator. 20 questions in exam format."
        />

        {/* Exam 2B — paid */}
        <PracticeCard
          href={`/${curriculum}/${subject}/practice/exam2b`}
          locked={locked}
          accent="amber"
          icon={<FileText className="h-6 w-6 lg:h-7 lg:w-7 text-amber-600 dark:text-amber-400" />}
          chip="CAS · Extended"
          title="Exam 2B practice"
          description="Extended-response questions with a CAS calculator. Multi-part problem-solving."
        />

        {/* Exam 2A & 2B — paid */}
        <PracticeCard
          href={`/${curriculum}/${subject}/practice/exam2ab`}
          locked={locked}
          accent="emerald"
          icon={<LayoutGrid className="h-6 w-6 lg:h-7 lg:w-7 text-emerald-600 dark:text-emerald-400" />}
          chip="Full exam 2"
          title="Exam 2A & 2B practice"
          description="Complete Exam 2 experience — 20 MCQs followed by 4–5 extended-response questions."
        />
      </div>
    </div>
  );
}
