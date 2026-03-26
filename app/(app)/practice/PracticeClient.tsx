"use client";

import { useState } from "react";
import QuestionCard from "@/components/QuestionCard";

interface Topic { id: string; name: string; slug: string }

interface Question {
  id: string;
  questionNumber: number;
  part: string | null;
  marks: number;
  content: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  exam: { year: number; examType: "EXAM_1" | "EXAM_2" };
  topic: { name: string };
  subtopics: { name: string }[];
  solution: { content: string; videoUrl: string | null } | null;
}

interface Props {
  topics: Topic[];
  years: number[];
}

export default function PracticeClient({ topics, years }: Props) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("ALL");
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  function toggleTopic(id: string) {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function startPractice() {
    setLoading(true);
    const params = new URLSearchParams({
      count: count.toString(),
      ...(difficulty !== "ALL" && { difficulty }),
      ...(selectedTopics.length > 0 && { topics: selectedTopics.join(",") }),
    });
    const res = await fetch(`/api/practice?${params}`);
    const data = await res.json();
    setQuestions(data.questions ?? []);
    setStarted(true);
    setLoading(false);
  }

  function reset() {
    setStarted(false);
    setQuestions([]);
  }

  if (started) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm lg:text-base text-gray-500">{questions.length} questions</p>
          <button
            onClick={reset}
            className="text-sm lg:text-base text-brand-600 font-medium hover:underline"
          >
            ← New practice set
          </button>
        </div>
        <div className="space-y-4">
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              id={q.id}
              questionNumber={q.questionNumber}
              part={q.part}
              marks={q.marks}
              year={q.exam.year}
              examType={q.exam.examType}
              topic={q.topic.name}
              subtopic={q.subtopics[0]?.name}
              content={q.content}
              difficulty={q.difficulty}
              solution={q.solution}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Topics */}
      <div>
        <h3 className="text-sm lg:text-base font-semibold text-gray-700 mb-3">Topics (leave blank for all)</h3>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => toggleTopic(t.id)}
              className={`rounded-full px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium transition-colors ${
                selectedTopics.includes(t.id)
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <h3 className="text-sm lg:text-base font-semibold text-gray-700 mb-3">Difficulty</h3>
        <div className="flex gap-2">
          {["ALL", "EASY", "MEDIUM", "HARD"].map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`rounded-full px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium transition-colors ${
                difficulty === d
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              {d === "ALL" ? "All" : d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Question count */}
      <div>
        <h3 className="text-sm lg:text-base font-semibold text-gray-700 mb-3">
          Number of questions: <span className="text-brand-600">{count}</span>
        </h3>
        <input
          type="range"
          min={5}
          max={40}
          step={5}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full accent-brand-600"
        />
        <div className="flex justify-between text-xs lg:text-sm text-gray-400 mt-1">
          <span>5</span><span>40</span>
        </div>
      </div>

      <button
        onClick={startPractice}
        disabled={loading}
        className="w-full rounded-xl bg-brand-600 py-3 lg:py-4 text-sm lg:text-base font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
      >
        {loading ? "Loading…" : "Start practice →"}
      </button>
    </div>
  );
}
