"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, ChevronLeft, Calculator, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exam {
  id: string;
  year: number;
  examType: "EXAM_1" | "EXAM_2";
  questionCount: number;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selected, setSelected] = useState<"EXAM_1" | "EXAM_2" | null>(null);

  useEffect(() => {
    fetch("/api/exams").then((r) => r.json()).then((d) => setExams(d.exams ?? []));
  }, []);

  const exam1s = exams.filter((e) => e.examType === "EXAM_1").sort((a, b) => b.year - a.year);
  const exam2s = exams.filter((e) => e.examType === "EXAM_2").sort((a, b) => b.year - a.year);
  const selectedExams = selected === "EXAM_1" ? exam1s : exam2s;

  if (selected) {
    return (
      <div className="max-w-3xl">
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            selected === "EXAM_1" ? "bg-brand-100" : "bg-violet-100"
          )}>
            {selected === "EXAM_1"
              ? <PenLine className="h-5 w-5 text-brand-600" />
              : <Calculator className="h-5 w-5 text-violet-600" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selected === "EXAM_1" ? "Exam 1" : "Exam 2"}
            </h1>
            <p className="text-sm text-gray-400">
              {selected === "EXAM_1"
                ? "Short answer · No calculator · 40 marks"
                : "Multiple choice + extended response · CAS · 80 marks"}
            </p>
          </div>
        </div>

        <p className="text-gray-500 mb-8">{selectedExams.length} papers · 2016 – 2023</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {selectedExams.map((exam) => (
            <Link
              key={exam.id}
              href={`/exams/${exam.id}`}
              className={cn(
                "group flex flex-col items-center justify-center rounded-2xl border bg-white p-5 text-center shadow-sm transition-all hover:shadow-md",
                selected === "EXAM_1"
                  ? "border-gray-100 hover:border-brand-200"
                  : "border-gray-100 hover:border-violet-200"
              )}
            >
              <span className="text-2xl font-bold text-gray-900 mb-1">{exam.year}</span>
              <span className="text-xs text-gray-400">{exam.questionCount} questions</span>
              <span className={cn(
                "mt-3 text-xs font-semibold transition-colors",
                selected === "EXAM_1"
                  ? "text-brand-400 group-hover:text-brand-600"
                  : "text-violet-400 group-hover:text-violet-600"
              )}>
                Open →
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Past Papers</h1>
      <p className="text-gray-500 mb-8">
        Every VCAA Mathematical Methods exam, with questions and solutions.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Exam 1 card */}
        <button
          onClick={() => setSelected("EXAM_1")}
          className="group text-left rounded-2xl border border-gray-100 bg-white shadow-sm p-6 hover:border-brand-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 group-hover:bg-brand-200 transition-colors">
              <PenLine className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-500 uppercase tracking-wide mb-0.5">Technology Free</p>
              <h2 className="text-xl font-bold text-gray-900">Exam 1</h2>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Short answer questions with no calculator permitted. Tests analytical and algebraic skills.
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Short answer</span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">40 marks</span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">No calculator</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{exam1s.length} papers · 2016 – 2023</span>
            <span className="text-sm font-semibold text-brand-600 group-hover:underline">Browse →</span>
          </div>
        </button>

        {/* Exam 2 card */}
        <button
          onClick={() => setSelected("EXAM_2")}
          className="group text-left rounded-2xl border border-gray-100 bg-white shadow-sm p-6 hover:border-violet-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 group-hover:bg-violet-200 transition-colors">
              <Calculator className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide mb-0.5">Technology Active</p>
              <h2 className="text-xl font-bold text-gray-900">Exam 2</h2>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Multiple choice and extended response questions with CAS calculator permitted.
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Multiple choice</span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">80 marks</span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">CAS calculator</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{exam2s.length} papers · 2016 – 2023</span>
            <span className="text-sm font-semibold text-violet-600 group-hover:underline">Browse →</span>
          </div>
        </button>
      </div>
    </div>
  );
}
