"use client";

import { useState } from "react";

export default function SeedPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSeed() {
    setStatus("loading");
    const res = await fetch("/api/admin/seed", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setStatus("done");
      setMessage(data.message);
    } else {
      setStatus("error");
      setMessage(data.error);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Seed Topics</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Populate the database with VCE Mathematical Methods syllabus topics and subtopics.
        Safe to run multiple times (uses upsert).
      </p>

      {message && (
        <div className={`mb-6 rounded-lg px-4 py-3 text-sm ${
          status === "done" ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
        }`}>
          {message}
        </div>
      )}

      <button
        onClick={handleSeed}
        disabled={status === "loading"}
        className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Seeding…" : "Seed topics now"}
      </button>
    </div>
  );
}
