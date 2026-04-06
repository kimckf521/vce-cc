"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Upload,
  FileImage,
  Loader2,
  Check,
  X,
  ChevronLeft,
  Scan,
  ArrowRight,
  Circle,
  Code2,
  Image as ImageIcon,
  Clock,
  Trash2,
  History,
  FolderOpen,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const FunctionGraph = dynamic(() => import("@/components/FunctionGraph"), { ssr: false });
const CartesianGrid = dynamic(() => import("@/components/CartesianGrid"), { ssr: false });

// ── Types ────────────────────────────────────────────────────────────

type DiagramType = "function_graph" | "cartesian_grid" | "complex_diagram" | "statistical_chart" | "geometric";
type ExtractionMethod = "function_json" | "grid_json" | "page_crop";
type DiagramStatus = "pending" | "accepted" | "rejected";

interface DiagramResult {
  id: string;
  pageNumber: number;
  question: string;
  type: DiagramType;
  description: string;
  extractionMethod: ExtractionMethod;
  bbox: { x: number; y: number; w: number; h: number };
  croppedImageDataUrl: string;
  suggestedConfig: Record<string, unknown> | null;
  status: DiagramStatus;
}

interface ExtractionSession {
  id: string;
  pdfName: string;
  createdAt: string; // ISO string
  diagrams: DiagramResult[];
}

const SESSIONS_KEY = "vce-admin-diagram-sessions";

function loadSessions(): ExtractionSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ExtractionSession[]) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    // localStorage might be full due to base64 images — warn in console
    console.warn("Failed to save sessions to localStorage:", e);
  }
}

function formatSessionDate(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${date}, ${time}`;
}

// ── Config ────────────────────────────────────────────────────────────

const typeConfig: Record<DiagramType, { label: string; color: string; icon: string }> = {
  function_graph:   { label: "Function Graph",    color: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400",   icon: "f(x)" },
  cartesian_grid:   { label: "Cartesian Grid",    color: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400",  icon: "xy" },
  complex_diagram:  { label: "Complex Diagram",   color: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400",  icon: "~" },
  statistical_chart: { label: "Statistical Chart", color: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400", icon: "||" },
  geometric:        { label: "Geometric",          color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",    icon: "△" },
};

const methodConfig: Record<ExtractionMethod, { label: string; format: string }> = {
  function_json: { label: "Procedural SVG",   format: "function:{JSON}" },
  grid_json:     { label: "CartesianGrid SVG", format: "grid:{JSON}" },
  page_crop:     { label: "Page-region crop",  format: "PNG URL" },
};

// ── Helpers ──────────────────────────────────────────────────────────

async function renderPageToBase64(pdfDoc: pdfjs.PDFDocumentProxy, pageNum: number, scale: number): Promise<string> {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL("image/png");
}

function cropFromDataUrl(
  fullDataUrl: string,
  bbox: { x: number; y: number; w: number; h: number },
): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const sx = (bbox.x / 100) * img.width;
      const sy = (bbox.y / 100) * img.height;
      const sw = (bbox.w / 100) * img.width;
      const sh = (bbox.h / 100) * img.height;
      const pad = 8;
      // Clamp to image bounds to avoid blank crops
      const cropX = Math.max(0, sx - pad);
      const cropY = Math.max(0, sy - pad);
      const cropW = Math.min(img.width - cropX, sw + pad * 2);
      const cropH = Math.min(img.height - cropY, sh + pad * 2);
      const canvas = document.createElement("canvas");
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = fullDataUrl;
  });
}

// ── DiagramCard ──────────────────────────────────────────────────────

function DiagramCard({
  diagram,
  onStatusChange,
}: {
  diagram: DiagramResult;
  onStatusChange: (id: string, status: DiagramStatus) => void;
}) {
  const [showConfig, setShowConfig] = useState(false);
  const tc = typeConfig[diagram.type] || typeConfig.complex_diagram;
  const mc = methodConfig[diagram.extractionMethod] || methodConfig.page_crop;

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-brand-700 dark:text-brand-400">
            Q{diagram.question}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">|</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Page {diagram.pageNumber}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tc.color}`}>
            {tc.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onStatusChange(diagram.id, "accepted")}
            className={`p-1.5 rounded-lg transition-colors ${
              diagram.status === "accepted"
                ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                : "text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
            }`}
            title="Accept"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => onStatusChange(diagram.id, "rejected")}
            className={`p-1.5 rounded-lg transition-colors ${
              diagram.status === "rejected"
                ? "bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-400"
                : "text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
            }`}
            title="Reject"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={() => onStatusChange(diagram.id, "pending")}
            className={`p-1.5 rounded-lg transition-colors ${
              diagram.status === "pending"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                : "text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
            title="Reset to pending"
          >
            <Circle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content: cropped image + SVG preview side-by-side */}
      <div className="px-5 pb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{diagram.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {/* Cropped image */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              <ImageIcon className="h-3 w-3" /> Cropped from PDF
            </p>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={diagram.croppedImageDataUrl}
                alt={`Diagram Q${diagram.question}`}
                className="max-w-full max-h-64 rounded"
              />
            </div>
          </div>

          {/* SVG preview (only for function/grid types) */}
          {diagram.suggestedConfig && diagram.extractionMethod !== "page_crop" && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                <Code2 className="h-3 w-3" /> SVG Preview
              </p>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 flex items-center justify-center min-h-[120px]">
                {diagram.extractionMethod === "function_json" && (
                  <FunctionGraph {...(diagram.suggestedConfig as { fn: string; xMin: number; xMax: number; yMin: number; yMax: number })} />
                )}
                {diagram.extractionMethod === "grid_json" && (
                  <CartesianGrid {...(diagram.suggestedConfig as { xMin: number; xMax: number; yMin: number; yMax: number })} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Method badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-gray-400">Method:</span>
          <span className="text-xs font-medium px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-1">
            {mc.label} <ArrowRight className="h-3 w-3" /> <code className="text-[10px]">{mc.format}</code>
          </span>
        </div>

        {/* Config viewer */}
        {diagram.suggestedConfig && (
          <div className="mt-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
            >
              {showConfig ? "Hide" : "Show"} config JSON
            </button>
            {showConfig && (
              <pre className="mt-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 overflow-x-auto text-gray-700 dark:text-gray-300">
                {JSON.stringify(diagram.suggestedConfig, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default function DiagramsTestingPage() {
  // ── Session persistence ──
  const [sessions, setSessions] = useState<ExtractionSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"upload" | "history">("upload");
  const [loaded, setLoaded] = useState(false);

  // ── Upload / analysis state ──
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [diagrams, setDiagrams] = useState<DiagramResult[]>([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    setSessions(loadSessions());
    setLoaded(true);
  }, []);

  // Persist helper
  const persistSessions = useCallback((updated: ExtractionSession[]) => {
    setSessions(updated);
    saveSessions(updated);
  }, []);

  // Save current diagrams into the active session (or create one)
  const saveToSession = useCallback((diagramsToSave: DiagramResult[], pdfName?: string) => {
    if (diagramsToSave.length === 0) return;

    setSessions((prev) => {
      let updated: ExtractionSession[];
      if (activeSessionId) {
        // Update existing session
        updated = prev.map((s) =>
          s.id === activeSessionId ? { ...s, diagrams: diagramsToSave } : s
        );
      } else {
        // Create new session
        const newSession: ExtractionSession = {
          id: crypto.randomUUID(),
          pdfName: pdfName || pdfFile?.name || "Unknown PDF",
          createdAt: new Date().toISOString(),
          diagrams: diagramsToSave,
        };
        setActiveSessionId(newSession.id);
        updated = [newSession, ...prev];
      }
      saveSessions(updated);
      return updated;
    });
  }, [activeSessionId, pdfFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setDiagrams([]);
      setActiveSessionId(null); // new upload = new session
      setError("");
      setViewMode("upload");
    }
  };

  const onDocumentLoadSuccess = useCallback((pdf: pdfjs.PDFDocumentProxy) => {
    setPdfDoc(pdf);
    setNumPages(pdf.numPages);
  }, []);

  const analyzePage = useCallback(async (pageNum: number, doc: pdfjs.PDFDocumentProxy, pdfName: string) => {
    // Render page at 2x for Claude (better precision for bounding boxes)
    const fullDataUrl = await renderPageToBase64(doc, pageNum, 2);
    const base64 = fullDataUrl.split(",")[1];

    const res = await fetch("/api/admin/testing/diagrams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageImage: base64, pageNumber: pageNum, pdfName }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Analysis failed");
    }

    const data = await res.json();

    // Render at 3x for high-res cropping
    const hiresDataUrl = await renderPageToBase64(doc, pageNum, 3);

    // Crop each detected diagram
    const results: DiagramResult[] = [];
    for (const d of data.diagrams) {
      const croppedImageDataUrl = await cropFromDataUrl(hiresDataUrl, {
        x: d.x, y: d.y, w: d.w, h: d.h,
      });

      results.push({
        id: crypto.randomUUID(),
        pageNumber: pageNum,
        question: d.question || "?",
        type: d.type || "complex_diagram",
        description: d.description || "",
        extractionMethod: d.extractionMethod || "page_crop",
        bbox: { x: d.x, y: d.y, w: d.w, h: d.h },
        croppedImageDataUrl,
        suggestedConfig: d.suggestedConfig || null,
        status: "pending",
      });
    }

    return results;
  }, []);

  const analyzeAllPages = useCallback(async () => {
    if (!pdfDoc || !pdfFile) return;

    setAnalyzing(true);
    setDiagrams([]);
    setError("");

    const allResults: DiagramResult[] = [];
    try {
      for (let i = 1; i <= numPages; i++) {
        setCurrentPage(i);
        const results = await analyzePage(i, pdfDoc, pdfFile.name);
        allResults.push(...results);
        setDiagrams([...allResults]);
      }
      // Auto-save after full analysis
      if (allResults.length > 0) {
        saveToSession(allResults, pdfFile.name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      // Save whatever we got so far
      if (allResults.length > 0) {
        saveToSession(allResults, pdfFile.name);
      }
    } finally {
      setAnalyzing(false);
      setCurrentPage(0);
    }
  }, [pdfDoc, pdfFile, numPages, analyzePage, saveToSession]);

  const analyzeSinglePage = useCallback(async (pageNum: number) => {
    if (!pdfDoc || !pdfFile) return;

    setAnalyzing(true);
    setCurrentPage(pageNum);
    setError("");

    try {
      const results = await analyzePage(pageNum, pdfDoc, pdfFile.name);
      setDiagrams((prev) => {
        const filtered = prev.filter((d) => d.pageNumber !== pageNum);
        const merged = [...filtered, ...results].sort((a, b) => a.pageNumber - b.pageNumber);
        // Auto-save after single page analysis
        saveToSession(merged, pdfFile.name);
        return merged;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
      setCurrentPage(0);
    }
  }, [pdfDoc, pdfFile, analyzePage, saveToSession]);

  const handleStatusChange = (id: string, status: DiagramStatus) => {
    setDiagrams((prev) => {
      const updated = prev.map((d) =>
        d.id === id ? { ...d, status: d.status === status ? "pending" : status } : d
      );
      // Persist status changes
      saveToSession(updated);
      return updated;
    });
  };

  // ── Session actions ──

  const openSession = (session: ExtractionSession) => {
    setDiagrams(session.diagrams);
    setActiveSessionId(session.id);
    setPdfFile(null);
    setPdfDoc(null);
    setNumPages(0);
    setViewMode("upload");
  };

  const deleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    persistSessions(updated);
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setDiagrams([]);
    }
  };

  const clearCurrentWork = () => {
    setPdfFile(null);
    setPdfDoc(null);
    setDiagrams([]);
    setNumPages(0);
    setActiveSessionId(null);
    setError("");
  };

  const accepted = diagrams.filter((d) => d.status === "accepted").length;
  const rejected = diagrams.filter((d) => d.status === "rejected").length;

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div className="max-w-4xl">
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hybrid Diagram Extraction</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upload a PDF to detect and classify diagrams</p>
          </div>
        </div>
        <button
          onClick={() => setViewMode(viewMode === "history" ? "upload" : "history")}
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

      {/* Method reference table */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 mb-6 mt-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Extraction Methods</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {Object.entries(typeConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`px-1.5 py-0.5 rounded ${cfg.color} font-medium`}>{cfg.icon}</span>
              <span className="text-gray-600 dark:text-gray-400">{cfg.label}</span>
              <span className="text-gray-400 dark:text-gray-500 ml-auto">
                {methodConfig[key === "function_graph" ? "function_json" : key === "cartesian_grid" ? "grid_json" : "page_crop"].format}
              </span>
            </div>
          ))}
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
                Upload and analyze a PDF — results will be saved automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const sAccepted = session.diagrams.filter((d) => d.status === "accepted").length;
                const sRejected = session.diagrams.filter((d) => d.status === "rejected").length;
                const sPending = session.diagrams.filter((d) => d.status === "pending").length;
                const isActive = session.id === activeSessionId;

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
                        <FileImage className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-brand-500" : "text-gray-400 dark:text-gray-500"}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {session.pdfName}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatSessionDate(session.createdAt)}
                            </span>
                            <span>{session.diagrams.length} diagram{session.diagrams.length !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        {/* Status summary badges */}
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
        /* ── Upload / active view ── */
        <>
          {/* Active session indicator */}
          {activeSession && !pdfFile && diagrams.length > 0 && (
            <div className="rounded-xl bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 p-4 mb-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <FileImage className="h-5 w-5 text-brand-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activeSession.pdfName}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(saved session)</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {diagrams.length} diagram{diagrams.length !== 1 ? "s" : ""}
                    {accepted > 0 && ` · ${accepted} accepted`}
                    {rejected > 0 && ` · ${rejected} rejected`}
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

          {/* Upload area — show when no PDF loaded AND no saved session active */}
          {!pdfFile && diagrams.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-12 text-center cursor-pointer hover:border-brand-400 dark:hover:border-brand-700 hover:bg-brand-50/30 dark:hover:bg-brand-950/30 transition-colors"
            >
              <Upload className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Upload a PDF exam paper</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Click to select or drag and drop</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={onFileChange}
                className="hidden"
              />
            </div>
          ) : pdfFile ? (
            <>
              {/* File info + actions */}
              <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <FileImage className="h-5 w-5 text-brand-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{pdfFile.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {numPages} page{numPages !== 1 ? "s" : ""}
                      {diagrams.length > 0 && ` · ${diagrams.length} diagram${diagrams.length !== 1 ? "s" : ""} found`}
                      {accepted > 0 && ` · ${accepted} accepted`}
                      {rejected > 0 && ` · ${rejected} rejected`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={analyzeAllPages}
                    disabled={analyzing || !pdfDoc}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
                  >
                    {analyzing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Scan className="h-4 w-4" />
                    )}
                    {analyzing ? `Analyzing page ${currentPage}/${numPages}...` : "Analyze all pages"}
                  </button>
                  <button
                    onClick={clearCurrentWork}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* PDF page thumbnails */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Pages</h3>
                <Document
                  file={pdfFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="text-sm text-gray-400 dark:text-gray-500">Loading PDF...</div>}
                >
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
                      const hasDiagrams = diagrams.some((d) => d.pageNumber === pageNum);
                      const isAnalyzing = analyzing && currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => !analyzing && analyzeSinglePage(pageNum)}
                          disabled={analyzing}
                          className={`relative flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all ${
                            hasDiagrams
                              ? "border-green-400 dark:border-green-600"
                              : isAnalyzing
                                ? "border-brand-400 dark:border-brand-700"
                                : "border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700"
                          }`}
                          title={`Page ${pageNum} — click to analyze`}
                        >
                          <Page
                            pageNumber={pageNum}
                            width={80}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                            {pageNum}
                          </div>
                          {isAnalyzing && (
                            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center">
                              <Loader2 className="h-4 w-4 animate-spin text-brand-600 dark:text-brand-400" />
                            </div>
                          )}
                          {hasDiagrams && (
                            <div className="absolute top-1 right-1 bg-green-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                              {diagrams.filter((d) => d.pageNumber === pageNum).length}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </Document>
              </div>
            </>
          ) : null}

          {/* Results — shown for both live analysis and saved session review */}
          {diagrams.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Detected Diagrams ({diagrams.length})
              </h3>
              <div className="space-y-4">
                {diagrams.map((d) => (
                  <DiagramCard key={d.id} diagram={d} onStatusChange={handleStatusChange} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
