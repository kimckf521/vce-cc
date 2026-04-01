"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import MathContent from "@/components/MathContent";

interface SearchResult {
  id: string;
  questionNumber: number;
  part: string | null;
  marks: number;
  content: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topic: { name: string; slug: string };
  exam: { year: number; examType: "EXAM_1" | "EXAM_2" };
  subtopics: { name: string }[];
}

const difficultyStyles = {
  EASY: "bg-green-50 text-green-700",
  MEDIUM: "bg-yellow-50 text-yellow-700",
  HARD: "bg-red-50 text-red-700",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.questions);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Search Questions</h1>
      <p className="text-gray-500 lg:text-base mb-8">
        Search across all questions by content, keywords, or mathematical terms.
      </p>

      {/* Search input */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 lg:h-6 lg:w-6 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions..."
          className="w-full rounded-xl border border-gray-300 bg-white pl-12 lg:pl-14 pr-4 py-3 lg:py-4 text-sm lg:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          autoFocus
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 lg:h-6 lg:w-6 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Results */}
      {searched && results.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400 lg:text-base">
          No questions found for &ldquo;{query}&rdquo;
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3 lg:space-y-4">
          <p className="text-sm lg:text-base text-gray-500 mb-4">{results.length} result{results.length !== 1 ? "s" : ""}</p>
          {results.map((q) => {
            const examLabel = q.exam.examType === "EXAM_1" ? "Exam 1" : "Exam 2";
            const label = `${q.exam.year} · ${examLabel} · Q${q.questionNumber}${q.part ? q.part : ""}`;
            // Truncate content for preview
            const preview = q.content.length > 200 ? q.content.slice(0, 200) + "..." : q.content;

            return (
              <Link
                key={q.id}
                href={`/questions/${q.id}`}
                className="block rounded-2xl border border-gray-100 bg-white p-5 lg:p-6 shadow-sm hover:border-brand-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs lg:text-sm font-mono text-gray-500">{label}</span>
                  <span className="rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 text-xs lg:text-sm font-medium">
                    {q.topic.name}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs lg:text-sm font-medium ${difficultyStyles[q.difficulty]}`}>
                    {q.difficulty}
                  </span>
                  <span className="text-xs lg:text-sm text-gray-400">{q.marks} mark{q.marks !== 1 ? "s" : ""}</span>
                </div>
                <div className="text-sm lg:text-base text-gray-700 line-clamp-3">
                  <MathContent content={preview} />
                </div>
                {q.subtopics.length > 0 && (
                  <div className="flex gap-1.5 mt-2 lg:mt-3 flex-wrap">
                    {q.subtopics.map((s) => (
                      <span key={s.name} className="rounded-full bg-gray-100 text-gray-500 px-2 py-0.5 text-xs lg:text-sm">
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
