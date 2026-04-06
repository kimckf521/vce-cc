"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Upload,
  FileImage,
  Loader2,
  Check,
  X,
  ChevronLeft,
  Circle,
  Clock,
  Trash2,
  History,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  ExternalLink,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────

interface DetectionBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Detection {
  id: string;
  kind: string;
  label: string;
  confidence: number;
  box: DetectionBox;
}

interface PageResult {
  pageNumber: number;
  width: number;
  height: number;
  imageUrl: string;
  detections: Detection[];
}

interface ItemResult {
  id: string;
  pageNumber: number;
  kind: string;
  label: string;
  confidence: number;
  source: string;
  imageUrl: string;
  downloadUrl: string;
  tableUrl: string | null;
  box: DetectionBox;
  pixelSize: { width: number; height: number };
}

interface ExtractionResult {
  jobId: string;
  filename: string;
  summary: {
    pages: number;
    items: number;
    counts: Record<string, number>;
  };
  pages: PageResult[];
  items: ItemResult[];
}

type ItemStatus = "pending" | "accepted" | "rejected";

interface SavedSession {
  id: string;
  pdfName: string;
  createdAt: string;
  result: ExtractionResult;
  statuses: Record<string, ItemStatus>;
}

// ── Config ───────────────────────────────────────────────────────────

const kindConfig: Record<string, { label: string; color: string; borderColor: string }> = {
  chart: { label: "Chart", color: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400", borderColor: "border-blue-400" },
  diagram: { label: "Diagram", color: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400", borderColor: "border-amber-400" },
  table: { label: "Table", color: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400", borderColor: "border-green-400" },
  image: { label: "Others", color: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400", borderColor: "border-purple-400" },
};

const SESSIONS_KEY = "vce-admin-figure-sessions";

function loadSessions(): SavedSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: SavedSession[]) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.warn("Failed to save figure sessions:", e);
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${date}, ${time}`;
}

// ── ItemCard ─────────────────────────────────────────────────────────

function ItemCard({
  item,
  status,
  onStatusChange,
  onPreview,
}: {
  item: ItemResult;
  status: ItemStatus;
  onStatusChange: (id: string, status: ItemStatus) => void;
  onPreview: (item: ItemResult) => void;
}) {
  const kc = kindConfig[item.kind] || kindConfig.image;

  return (
    <div
      className={`rounded-xl border bg-white dark:bg-gray-900 shadow-sm overflow-hidden transition-all ${
        status === "accepted"
          ? "border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-950/30"
          : status === "rejected"
            ? "border-red-200 dark:border-red-800 bg-red-50/20 dark:bg-red-950/20 opacity-60"
            : "border-gray-100 dark:border-gray-800"
      }`}
    >
      {/* Image preview */}
      <button
        onClick={() => onPreview(item)}
        className="w-full block bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.label}
          className="w-full h-auto max-h-48 object-contain p-2"
          loading="lazy"
        />
      </button>

      <div className="p-3">
        {/* Meta row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {item.label}
            </span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${kc.color}`}>
              {kc.label}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
            p.{item.pageNumber}
          </span>
        </div>

        {/* Confidence */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
            <div
              className="bg-brand-500 rounded-full h-1.5 transition-all"
              style={{ width: `${item.confidence * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {Math.round(item.confidence * 100)}%
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onStatusChange(item.id, "accepted")}
              className={`p-1.5 rounded-lg transition-colors ${
                status === "accepted"
                  ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                  : "text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
              }`}
              title="Accept"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onStatusChange(item.id, "rejected")}
              className={`p-1.5 rounded-lg transition-colors ${
                status === "rejected"
                  ? "bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-400"
                  : "text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
              }`}
              title="Reject"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            {item.tableUrl && (
              <a
                href={item.tableUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
                title="Open CSV"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <a
              href={item.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
              title="Open full image"
            >
              <Download className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PagePreview ──────────────────────────────────────────────────────

function PagePreview({
  page,
  detections,
}: {
  page: PageResult;
  detections: Detection[];
}) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={page.imageUrl}
          alt={`Page ${page.pageNumber}`}
          className="w-full h-auto"
          loading="lazy"
        />
        {/* Detection overlays */}
        {detections.map((det) => {
          const kc = kindConfig[det.kind] || kindConfig.image;
          return (
            <div
              key={det.id}
              className={`absolute border-2 ${kc.borderColor} rounded-lg pointer-events-none`}
              style={{
                left: `${det.box.left * 100}%`,
                top: `${det.box.top * 100}%`,
                width: `${det.box.width * 100}%`,
                height: `${det.box.height * 100}%`,
              }}
            >
              <span
                className="absolute -top-3 left-1 text-[9px] font-bold bg-white/90 dark:bg-gray-900/90 dark:text-gray-100 px-1 py-0.5 rounded-full whitespace-nowrap"
              >
                {det.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="px-3 py-2 border-t border-gray-50 dark:border-gray-800">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
          Page {page.pageNumber}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          {detections.length} detection{detections.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

// ── ImagePreviewModal ────────────────────────────────────────────────

function ImagePreviewModal({
  item,
  onClose,
}: {
  item: ItemResult;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const kc = kindConfig[item.kind] || kindConfig.image;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.label}</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${kc.color}`}>
              {kc.label}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">Page {item.pageNumber}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {item.pixelSize.width}×{item.pixelSize.height}px
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="px-2 py-1 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
            <a
              href={item.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-800 p-4">
          <div className="flex items-center justify-center min-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.label}
              className="rounded-lg"
              style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default function FiguresTestingPage() {
  // Session persistence
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"extract" | "history">("extract");
  const [loaded, setLoaded] = useState(false);

  // Extraction state — multi-file queue (up to 10)
  type QueueItem = {
    file: File;
    status: "pending" | "extracting" | "done" | "error";
    error?: string;
    sessionId?: string;
  };
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({});
  const [error, setError] = useState("");
  const [previewItem, setPreviewItem] = useState<ItemResult | null>(null);
  const [viewTab, setViewTab] = useState<"items" | "pages">("items");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const extractingRef = useRef(false);

  // Load sessions
  useEffect(() => {
    setSessions(loadSessions());
    setLoaded(true);
  }, []);

  // Persist helper
  const persistSessions = useCallback((updated: SavedSession[]) => {
    setSessions(updated);
    saveSessions(updated);
  }, []);

  const saveToSession = useCallback(
    (extractionResult: ExtractionResult, itemStatuses: Record<string, ItemStatus>) => {
      setSessions((prev) => {
        let updated: SavedSession[];
        if (activeSessionId) {
          updated = prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, result: extractionResult, statuses: itemStatuses }
              : s
          );
        } else {
          const newSession: SavedSession = {
            id: crypto.randomUUID(),
            pdfName: extractionResult.filename,
            createdAt: new Date().toISOString(),
            result: extractionResult,
            statuses: itemStatuses,
          };
          setActiveSessionId(newSession.id);
          updated = [newSession, ...prev];
        }
        saveSessions(updated);
        return updated;
      });
    },
    [activeSessionId]
  );

  const addFiles = useCallback((files: FileList | File[]) => {
    const pdfs = Array.from(files)
      .filter((f) => f.type === "application/pdf")
      .slice(0, 10);
    if (pdfs.length === 0) return;
    setQueue((prev) => {
      const remaining = 10 - prev.length;
      if (remaining <= 0) return prev;
      const newItems: QueueItem[] = pdfs.slice(0, remaining).map((file) => ({
        file,
        status: "pending" as const,
      }));
      return [...prev, ...newItems];
    });
    setResult(null);
    setStatuses({});
    setActiveSessionId(null);
    setError("");
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleExtractAll = useCallback(async () => {
    if (queue.length === 0 || extractingRef.current) return;
    extractingRef.current = true;
    setExtracting(true);
    setError("");

    for (let i = 0; i < queue.length; i++) {
      // Skip already-done items (in case of re-run)
      if (queue[i].status === "done") continue;

      // Mark current as extracting
      setQueue((prev) =>
        prev.map((q, j) => (j === i ? { ...q, status: "extracting" as const } : q))
      );

      try {
        const formData = new FormData();
        formData.append("pdf", queue[i].file);

        const res = await fetch("/api/admin/testing/figures", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Extraction failed");
        }

        const data: ExtractionResult = await res.json();

        // Initialize all items as pending
        const initialStatuses: Record<string, ItemStatus> = {};
        for (const item of data.items) {
          initialStatuses[item.id] = "pending";
        }

        // Save session for this file
        const newSession: SavedSession = {
          id: crypto.randomUUID(),
          pdfName: data.filename,
          createdAt: new Date().toISOString(),
          result: data,
          statuses: initialStatuses,
        };

        setSessions((prev) => {
          const updated = [newSession, ...prev];
          saveSessions(updated);
          return updated;
        });

        // Mark as done
        setQueue((prev) =>
          prev.map((q, j) =>
            j === i ? { ...q, status: "done" as const, sessionId: newSession.id } : q
          )
        );
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Extraction failed";
        setQueue((prev) =>
          prev.map((q, j) =>
            j === i ? { ...q, status: "error" as const, error: errMsg } : q
          )
        );
      }
    }

    extractingRef.current = false;
    setExtracting(false);
  }, [queue]);

  const handleStatusChange = (id: string, status: ItemStatus) => {
    setStatuses((prev) => {
      const current = prev[id];
      const next = current === status ? "pending" : status;
      const updated = { ...prev, [id]: next };
      if (result) saveToSession(result, updated);
      return updated;
    });
  };

  const openSession = (session: SavedSession) => {
    setResult(session.result);
    setStatuses(session.statuses);
    setActiveSessionId(session.id);
    setQueue([]);
    setError("");
    setViewMode("extract");
  };

  const deleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    persistSessions(updated);
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setResult(null);
      setStatuses({});
    }
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCurrentWork = () => {
    setQueue([]);
    setResult(null);
    setStatuses({});
    setActiveSessionId(null);
    setError("");
  };

  const acceptedCount = Object.values(statuses).filter((s) => s === "accepted").length;
  const rejectedCount = Object.values(statuses).filter((s) => s === "rejected").length;
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const kindOrder = ["chart", "diagram", "table", "image"];

  return (
    <div className="max-w-5xl">
      {/* Image preview modal */}
      {previewItem && (
        <ImagePreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/testing"
            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">PDF Figure Extraction</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Extract charts, diagrams, and tables from exam paper PDFs
            </p>
          </div>
        </div>
        <button
          onClick={() => setViewMode(viewMode === "history" ? "extract" : "history")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === "history"
              ? "bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-400"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <History className="h-4 w-4" />
          History{sessions.length > 0 && ` (${sessions.length})`}
        </button>
      </div>

      {/* What it extracts */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 mb-6 mt-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          What it extracts
        </h3>
        <div className="flex gap-3 flex-wrap text-xs">
          {Object.entries(kindConfig).map(([key, cfg]) => (
            <span key={key} className={`px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>
              {cfg.label}
            </span>
          ))}
          <span className="text-gray-400 dark:text-gray-500 self-center">
            Uses native PDF inspection + image segmentation
          </span>
        </div>
      </div>

      {/* ── History view ── */}
      {viewMode === "history" ? (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Saved Sessions</h3>
          {!loaded ? (
            <div className="text-gray-400 dark:text-gray-500 text-sm py-8 text-center">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-10 text-center">
              <FolderOpen className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-1 font-medium">No saved sessions</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Upload and extract a PDF — results are saved automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const sAccepted = Object.values(session.statuses).filter((s) => s === "accepted").length;
                const sRejected = Object.values(session.statuses).filter((s) => s === "rejected").length;
                const sPending = Object.values(session.statuses).filter((s) => s === "pending").length;
                const isActive = session.id === activeSessionId;
                const counts = session.result.summary.counts;

                return (
                  <div
                    key={session.id}
                    className={`rounded-xl border bg-white dark:bg-gray-900 shadow-sm p-4 transition-all ${
                      isActive ? "border-brand-300 dark:border-brand-700 ring-1 ring-brand-200 dark:ring-brand-800" : "border-gray-100 dark:border-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => openSession(session)}
                        className="flex items-center gap-3 text-left flex-1 min-w-0"
                      >
                        <FileImage
                          className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-brand-500" : "text-gray-400 dark:text-gray-500"}`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {session.pdfName}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(session.createdAt)}
                            </span>
                            <span>
                              {session.result.summary.items} item
                              {session.result.summary.items !== 1 ? "s" : ""}
                            </span>
                            {Object.entries(counts).map(([kind, count]) => (
                              <span key={kind} className="text-gray-400 dark:text-gray-500">
                                {count} {kindConfig[kind]?.label.toLowerCase() || kind}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        {sAccepted > 0 && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400">
                            {sAccepted} accepted
                          </span>
                        )}
                        {sRejected > 0 && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400">
                            {sRejected} rejected
                          </span>
                        )}
                        {sPending > 0 && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {sPending} pending
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                          className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                          title="Delete session"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── Extract view ── */
        <>
          {/* Saved session banner */}
          {activeSession && queue.length === 0 && result && (
            <div className="rounded-xl bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 p-4 mb-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <FileImage className="h-5 w-5 text-brand-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activeSession.pdfName}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(saved session)</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {result.summary.items} items extracted
                    {acceptedCount > 0 && ` · ${acceptedCount} accepted`}
                    {rejectedCount > 0 && ` · ${rejectedCount} rejected`}
                  </p>
                </div>
              </div>
              <button
                onClick={clearCurrentWork}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Upload area */}
          {queue.length === 0 && !result ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("border-brand-400", "bg-brand-50/30");
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("border-brand-400", "bg-brand-50/30");
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("border-brand-400", "bg-brand-50/30");
                const files = e.dataTransfer.files;
                if (files?.length) addFiles(files);
              }}
              className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-12 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 dark:hover:bg-brand-950/30 transition-colors"
            >
              <Upload className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Upload PDF exam papers</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Click to select or drag and drop · up to 10 files</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                onChange={onFileChange}
                className="hidden"
              />
            </div>
          ) : queue.length > 0 && !result ? (
            <>
              {/* File queue list */}
              <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {queue.length} PDF{queue.length !== 1 ? "s" : ""} selected
                  </p>
                  <div className="flex items-center gap-2">
                    {!extracting && queue.length < 10 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
                      >
                        + Add more
                      </button>
                    )}
                    <button
                      onClick={handleExtractAll}
                      disabled={extracting || queue.every((q) => q.status === "done")}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
                    >
                      {extracting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileImage className="h-4 w-4" />
                      )}
                      {extracting
                        ? `Extracting ${queue.filter((q) => q.status === "done").length + 1}/${queue.length}...`
                        : queue.every((q) => q.status === "done")
                          ? "All done"
                          : `Extract All (${queue.length})`}
                    </button>
                    <button
                      onClick={clearCurrentWork}
                      disabled={extracting}
                      className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-40"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {queue.map((item, i) => (
                    <div
                      key={`${item.file.name}-${i}`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                        item.status === "extracting"
                          ? "bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800"
                          : item.status === "done"
                            ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                            : item.status === "error"
                              ? "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
                              : "bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                      }`}
                    >
                      {item.status === "extracting" ? (
                        <Loader2 className="h-4 w-4 animate-spin text-brand-600 flex-shrink-0" />
                      ) : item.status === "done" ? (
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : item.status === "error" ? (
                        <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.file.name}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                          {(item.file.size / 1024).toFixed(0)} KB
                          {item.status === "extracting" && " · Extracting..."}
                          {item.status === "done" && " · Done"}
                          {item.status === "error" && ` · ${item.error}`}
                        </p>
                      </div>
                      {item.status === "done" && item.sessionId && (
                        <button
                          onClick={() => {
                            const session = sessions.find((s) => s.id === item.sessionId);
                            if (session) openSession(session);
                          }}
                          className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex-shrink-0"
                        >
                          View
                        </button>
                      )}
                      {item.status === "pending" && !extracting && (
                        <button
                          onClick={() => removeFromQueue(i)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hidden file input for "Add more" */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                onChange={onFileChange}
                className="hidden"
              />

              {/* Error */}
              {error && (
                <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}
            </>
          ) : null}

          {/* Results */}
          {result && (
            <>
              {/* Summary bar */}
              <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {result.summary.items} figure{result.summary.items !== 1 ? "s" : ""} extracted
                      from {result.summary.pages} page{result.summary.pages !== 1 ? "s" : ""}
                    </p>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {Object.entries(result.summary.counts).map(([kind, count]) => {
                        const kc = kindConfig[kind] || kindConfig.image;
                        return (
                          <span
                            key={kind}
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${kc.color}`}
                          >
                            {count} {kc.label}
                          </span>
                        );
                      })}
                      {acceptedCount > 0 && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400">
                          {acceptedCount} accepted
                        </span>
                      )}
                      {rejectedCount > 0 && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400">
                          {rejectedCount} rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* View toggle */}
                  <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button
                      onClick={() => setViewTab("items")}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                        viewTab === "items"
                          ? "bg-brand-600 text-white"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      Figures
                    </button>
                    <button
                      onClick={() => setViewTab("pages")}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                        viewTab === "pages"
                          ? "bg-brand-600 text-white"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      Pages
                    </button>
                  </div>
                </div>
              </div>

              {/* Items view */}
              {viewTab === "items" && (
                <div className="space-y-6">
                  {kindOrder
                    .filter((kind) => result.items.some((item) => item.kind === kind))
                    .map((kind) => {
                      const items = result.items.filter((item) => item.kind === kind);
                      const kc = kindConfig[kind] || kindConfig.image;
                      return (
                        <section key={kind}>
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {kc.label}s
                            </h3>
                            <span className="text-xs text-gray-400 dark:text-gray-500">({items.length})</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {items.map((item) => (
                              <ItemCard
                                key={item.id}
                                item={item}
                                status={statuses[item.id] || "pending"}
                                onStatusChange={handleStatusChange}
                                onPreview={setPreviewItem}
                              />
                            ))}
                          </div>
                        </section>
                      );
                    })}
                </div>
              )}

              {/* Pages view */}
              {viewTab === "pages" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.pages.map((page) => (
                    <PagePreview
                      key={page.pageNumber}
                      page={page}
                      detections={page.detections}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
