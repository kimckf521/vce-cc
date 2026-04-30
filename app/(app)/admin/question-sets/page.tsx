"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FlaskConical, Loader2, Check, Star, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type QuestionSetItemType =
  | "MCQ"
  | "SHORT_ANSWER"
  | "EXTENDED_ANSWER"
  | "EXTENDED_RESPONSE";

type QuestionSetItemStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Item {
  id: string;
  type: QuestionSetItemType;
  status: QuestionSetItemStatus;
}

interface QuestionSet {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: string;
  items: Item[];
}

function countByType(items: Item[]) {
  const out = { MCQ: 0, SHORT_ANSWER: 0, EXTENDED_ANSWER: 0, EXTENDED_RESPONSE: 0 };
  for (const it of items) out[it.type]++;
  return out;
}

function countByStatus(items: Item[]) {
  const out = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
  for (const it of items) out[it.status]++;
  return out;
}

export default function AdminQuestionSetsPage() {
  const [sets, setSets] = useState<QuestionSet[] | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/admin/question-sets");
    if (res.ok) {
      const data = await res.json();
      setSets(data.questionSets);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function makeDefault(setId: string) {
    setSaving(setId);
    try {
      const res = await fetch("/api/admin/question-sets/default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId }),
      });
      if (res.ok) await refresh();
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <ArrowLeft className="h-3 w-3" /> Admin
            </Link>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Question Sets
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage which question set serves the <span className="font-medium">Practice page</span>. Exactly
            one set is the default. Flipping it is atomic — running sessions are not disrupted.
          </p>
        </div>
      </div>

      {/* List */}
      {sets === null ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : sets.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-10 text-center text-gray-500">
          No question sets.
        </div>
      ) : (
        <div className="space-y-4">
          {sets.map((s) => {
            const types = countByType(s.items);
            const statuses = countByStatus(s.items);
            const isSaving = saving === s.id;
            return (
              <div
                key={s.id}
                className={cn(
                  "rounded-2xl bg-white dark:bg-gray-900 border-2 shadow-sm p-5 lg:p-6",
                  s.isDefault
                    ? "border-brand-400 dark:border-brand-600"
                    : "border-gray-200 dark:border-gray-800"
                )}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <FlaskConical className="h-6 w-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">
                          {s.name}
                        </h2>
                        {s.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-400 px-2.5 py-0.5 text-xs font-semibold">
                            <Star className="h-3 w-3" /> Default
                          </span>
                        )}
                      </div>
                      {s.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {s.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {s.isDefault ? (
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      >
                        <Check className="h-4 w-4" /> Current default
                      </button>
                    ) : (
                      <button
                        onClick={() => makeDefault(s.id)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                        Make default
                      </button>
                    )}
                  </div>
                </div>

                {/* Counts */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <Stat label="MCQ" value={types.MCQ} colour="blue" />
                  <Stat label="Short" value={types.SHORT_ANSWER} colour="amber" />
                  <Stat label="Ext-Ans" value={types.EXTENDED_ANSWER} colour="green" />
                  <Stat label="Ext-Resp" value={types.EXTENDED_RESPONSE} colour="rose" />
                </div>

                {/* Status */}
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <Stat label="Approved" value={statuses.APPROVED} colour="green" />
                  <Stat label="Pending" value={statuses.PENDING} colour="gray" />
                  <Stat label="Rejected" value={statuses.REJECTED} colour="rose" />
                </div>

                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <Link
                    href="/admin/questions"
                    className="text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    View / edit items →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 p-4 text-sm text-blue-900 dark:text-blue-200">
        <p className="font-semibold mb-1">How the switch works</p>
        <p className="text-xs">
          The <span className="font-medium">Practice page</span> resolves its question set by{" "}
          <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">isDefault = true</code>. Clicking{" "}
          <em>Make default</em> unsets the current default and sets the new one in a single transaction.
          No code deploy or server restart is required.
        </p>
        <p className="text-xs mt-2">
          The <span className="font-medium">Topic page</span> always reads from{" "}
          <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">1st Generated Question Set</code> by
          name — it is not affected by this toggle.
        </p>
        <p className="text-xs mt-2">
          Only items with <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">status = APPROVED</code>{" "}
          reach the practice picker. Pending and rejected items stay hidden.
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  colour,
}: {
  label: string;
  value: number;
  colour: "blue" | "amber" | "green" | "rose" | "gray";
}) {
  const cls =
    colour === "blue"
      ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
      : colour === "amber"
        ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
        : colour === "green"
          ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400"
          : colour === "rose"
            ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400"
            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
  return (
    <div className="rounded-lg px-3 py-2 flex items-center justify-between gap-2">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className={cn("rounded-full px-2 py-0.5 font-semibold", cls)}>{value}</span>
    </div>
  );
}
