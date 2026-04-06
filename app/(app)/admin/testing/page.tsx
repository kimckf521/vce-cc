"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Plus,
  Check,
  X,
  Pencil,
  Trash2,
  Circle,
  Clock,
  FileImage,
  ArrowRight,
  Scissors,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────

type IdeaStatus = "pending" | "accepted" | "rejected";

interface TestIdea {
  id: string;
  description: string;
  status: IdeaStatus;
  createdAt: string; // ISO string
}

const STORAGE_KEY = "vce-admin-test-ideas";
const TOOLS_STATUS_KEY = "vce-admin-tool-status";

// ── Helpers ──────────────────────────────────────────────────────────

function loadIdeas(): TestIdea[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveIdeas(ideas: TestIdea[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${date}, ${time}`;
}

const statusConfig = {
  pending: {
    icon: Circle,
    label: "Pending",
    bg: "bg-gray-50 dark:bg-gray-800",
    border: "border-gray-200 dark:border-gray-700",
    badge: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
    iconColor: "text-gray-400 dark:text-gray-500",
  },
  accepted: {
    icon: Check,
    label: "Accepted",
    bg: "bg-green-50/50 dark:bg-green-950/50",
    border: "border-green-200 dark:border-green-800",
    badge: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400",
    iconColor: "text-green-600 dark:text-green-400",
  },
  rejected: {
    icon: X,
    label: "Rejected",
    bg: "bg-red-50/50 dark:bg-red-950/50",
    border: "border-red-200 dark:border-red-800",
    badge: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400",
    iconColor: "text-red-500 dark:text-red-400",
  },
};

// ── Idea Card ────────────────────────────────────────────────────────

function IdeaCard({
  idea,
  onUpdate,
  onDelete,
}: {
  idea: TestIdea;
  onUpdate: (id: string, updates: Partial<TestIdea>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(idea.description);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cfg = statusConfig[idea.status];

  useEffect(() => {
    if (editing && textareaRef.current) {
      const el = textareaRef.current;
      el.focus();
      el.selectionStart = el.selectionEnd = el.value.length;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [editing]);

  function handleSave() {
    const trimmed = draft.trim();
    if (trimmed) {
      onUpdate(idea.id, { description: trimmed });
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setDraft(idea.description);
      setEditing(false);
    }
  }

  function cycleStatus() {
    const next: IdeaStatus =
      idea.status === "pending"
        ? "accepted"
        : idea.status === "accepted"
          ? "rejected"
          : "pending";
    onUpdate(idea.id, { status: next });
  }

  return (
    <div
      className={`rounded-2xl border ${cfg.border} ${cfg.bg} shadow-sm p-5 transition-all`}
    >
      {/* Top row: status + actions */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={cycleStatus}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.badge} hover:opacity-80 transition-opacity`}
          title="Click to change status"
        >
          <cfg.icon className="h-3.5 w-3.5" />
          {cfg.label}
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setDraft(idea.description);
              setEditing(true);
            }}
            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
            title="Edit description"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(idea.id)}
            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            title="Delete idea"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Description */}
      {editing ? (
        <div className="mb-3">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="w-full rounded-xl border border-brand-300 dark:border-brand-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            rows={2}
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Enter to save · Esc to cancel · Shift+Enter for new line
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-3 leading-relaxed">
          {idea.description}
        </p>
      )}

      {/* Timestamp */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
        <Clock className="h-3 w-3" />
        {formatDate(idea.createdAt)}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default function TestingPage() {
  const [ideas, setIdeas] = useState<TestIdea[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [toolStatus, setToolStatus] = useState<Record<string, IdeaStatus>>({});

  // Load from localStorage on mount
  useEffect(() => {
    setIdeas(loadIdeas());
    try {
      const raw = localStorage.getItem(TOOLS_STATUS_KEY);
      if (raw) setToolStatus(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  function updateToolStatus(toolId: string, status: IdeaStatus) {
    setToolStatus((prev) => {
      const current = prev[toolId];
      const next = current === status ? "pending" : status;
      const updated = { ...prev, [toolId]: next };
      localStorage.setItem(TOOLS_STATUS_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  // Persist on every change
  const persist = useCallback((updated: TestIdea[]) => {
    setIdeas(updated);
    saveIdeas(updated);
  }, []);

  function handleAdd() {
    const trimmed = newDesc.trim();
    if (!trimmed) return;
    const idea: TestIdea = {
      id: crypto.randomUUID(),
      description: trimmed,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    persist([idea, ...ideas]);
    setNewDesc("");
    setAdding(false);
  }

  function handleUpdate(id: string, updates: Partial<TestIdea>) {
    persist(ideas.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  }

  function handleDelete(id: string) {
    persist(ideas.filter((i) => i.id !== id));
  }

  useEffect(() => {
    if (adding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [adding]);

  const pending = ideas.filter((i) => i.status === "pending");
  const accepted = ideas.filter((i) => i.status === "accepted");
  const rejected = ideas.filter((i) => i.status === "rejected");

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-7 w-7 text-amber-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Testing</h1>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New idea
        </button>
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Track test ideas and experiments. Click the status badge to cycle between pending, accepted, and rejected.
      </p>

      {/* Testing tools */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          Testing Tools
        </h2>
        {(() => {
          const toolId = "hybrid-diagram-extraction";
          const status = toolStatus[toolId] || "pending";
          const borderColor =
            status === "accepted"
              ? "border-green-300 dark:border-green-700"
              : status === "rejected"
                ? "border-red-200 dark:border-red-800"
                : "border-gray-100 dark:border-gray-800";
          const bgColor =
            status === "accepted"
              ? "bg-green-50/50 dark:bg-green-950/30"
              : status === "rejected"
                ? "bg-red-50/30 dark:bg-red-950/30"
                : "bg-white dark:bg-gray-900";
          return (
            <div
              className={`rounded-xl border ${borderColor} ${bgColor} shadow-sm p-4 transition-all`}
            >
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="/admin/testing/diagrams"
                  className="flex items-center gap-3 flex-1 min-w-0 group"
                >
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-2.5 flex-shrink-0">
                    <FileImage className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">
                      Hybrid Diagram Extraction
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Upload PDF → detect diagrams → classify as SVG or PNG crop
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => updateToolStatus(toolId, "accepted")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      status === "accepted"
                        ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                        : "text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
                    }`}
                    title="Accept"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => updateToolStatus(toolId, "rejected")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      status === "rejected"
                        ? "bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-400"
                        : "text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                    }`}
                    title="Reject"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Link
                    href="/admin/testing/diagrams"
                    className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })()}

        {/* PDF Figure Extraction */}
        {(() => {
          const toolId = "pdf-figure-extraction";
          const status = toolStatus[toolId] || "pending";
          const borderColor =
            status === "accepted"
              ? "border-green-300 dark:border-green-700"
              : status === "rejected"
                ? "border-red-200 dark:border-red-800"
                : "border-gray-100 dark:border-gray-800";
          const bgColor =
            status === "accepted"
              ? "bg-green-50/50 dark:bg-green-950/30"
              : status === "rejected"
                ? "bg-red-50/30 dark:bg-red-950/30"
                : "bg-white dark:bg-gray-900";
          return (
            <div
              className={`rounded-xl border ${borderColor} ${bgColor} shadow-sm p-4 transition-all mt-3`}
            >
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="/admin/testing/figures"
                  className="flex items-center gap-3 flex-1 min-w-0 group"
                >
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-2.5 flex-shrink-0">
                    <Scissors className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">
                      PDF Figure Extraction
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Extract charts, diagrams, and tables using image segmentation
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => updateToolStatus(toolId, "accepted")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      status === "accepted"
                        ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                        : "text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
                    }`}
                    title="Accept"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => updateToolStatus(toolId, "rejected")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      status === "rejected"
                        ? "bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-400"
                        : "text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                    }`}
                    title="Reject"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Link
                    href="/admin/testing/figures"
                    className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* New idea input */}
      {adding && (
        <div className="rounded-2xl border-2 border-dashed border-brand-300 dark:border-brand-700 bg-brand-50/30 dark:bg-brand-950/30 p-5 mb-6">
          <textarea
            ref={inputRef}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAdd();
              }
              if (e.key === "Escape") {
                setNewDesc("");
                setAdding(false);
              }
            }}
            placeholder="Describe your test idea..."
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none mb-3"
            rows={3}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              disabled={!newDesc.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
            <button
              onClick={() => {
                setNewDesc("");
                setAdding(false);
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Ideas list */}
      {!loaded ? (
        <div className="text-gray-400 dark:text-gray-500 text-sm py-8 text-center">Loading...</div>
      ) : ideas.length === 0 && !adding ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-10 text-center">
          <FlaskConical className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-1 font-medium">No test ideas yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Click <strong>New idea</strong> to start tracking experiments.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending */}
          {pending.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Pending ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Accepted */}
          {accepted.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-3">
                Accepted ({accepted.length})
              </h2>
              <div className="space-y-3">
                {accepted.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Rejected */}
          {rejected.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider mb-3">
                Rejected ({rejected.length})
              </h2>
              <div className="space-y-3">
                {rejected.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
