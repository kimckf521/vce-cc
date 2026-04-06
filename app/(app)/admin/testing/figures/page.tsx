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
  Plus,
  Undo2,
  Pencil,
  MousePointer,
  Move,
  Save,
  CloudUpload,
  ChevronDown,
  GripVertical,
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
  updatedAt?: string;
  result: ExtractionResult;
  statuses: Record<string, ItemStatus>;
  done?: boolean;
  createdBy?: string;
  userId?: string;
}

interface ExamOption {
  id: string;
  year: number;
  examType: string;
  label: string;
  questions: { id: string; questionNumber: number; part: string | null; hasImage: boolean }[];
}

function parseLabel(label: string): { questionNumber: number; part: string | null } | null {
  const m = label.match(/^Q(\d+)([a-z])?/i);
  if (!m) return null;
  return { questionNumber: parseInt(m[1]), part: m[2]?.toLowerCase() || null };
}

// ── Config ───────────────────────────────────────────────────────────

const kindConfig: Record<string, { label: string; color: string; borderColor: string }> = {
  chart: { label: "Chart", color: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400", borderColor: "border-blue-400" },
  diagram: { label: "Diagram", color: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400", borderColor: "border-amber-400" },
  table: { label: "Table", color: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400", borderColor: "border-green-400" },
  image: { label: "Others", color: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400", borderColor: "border-purple-400" },
};

const SESSIONS_API = "/api/admin/testing/figures/sessions";

async function fetchSessions(): Promise<SavedSession[]> {
  try {
    const res = await fetch(SESSIONS_API);
    if (!res.ok) return [];
    const data = await res.json();
    return data.sessions || [];
  } catch {
    return [];
  }
}

async function createSessionApi(pdfName: string, result: ExtractionResult, statuses: Record<string, ItemStatus>): Promise<SavedSession | null> {
  try {
    const res = await fetch(SESSIONS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdfName, result, statuses }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.session || null;
  } catch {
    return null;
  }
}

async function updateSessionApi(id: string, updates: { statuses?: Record<string, ItemStatus>; result?: ExtractionResult; done?: boolean }) {
  try {
    await fetch(SESSIONS_API, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
  } catch {
    // silent fail
  }
}

async function deleteSessionApi(id: string) {
  try {
    await fetch(SESSIONS_API, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  } catch {
    // silent fail
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
  selected,
  onStatusChange,
  onPreview,
  onRename,
  onClick,
  onUpload,
}: {
  item: ItemResult;
  status: ItemStatus;
  selected?: boolean;
  onStatusChange: (id: string, status: ItemStatus) => void;
  onPreview: (item: ItemResult) => void;
  onRename?: (id: string, newLabel: string) => void;
  onClick?: (e: React.MouseEvent) => void;
  onUpload?: (item: ItemResult) => void;
}) {
  const kc = kindConfig[item.kind] || kindConfig.image;
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.label);
  const inputRef = useRef<HTMLInputElement>(null);

  const commitRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== item.label && onRename) onRename(item.id, trimmed);
    setEditing(false);
  };

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border bg-white dark:bg-gray-900 shadow-sm overflow-hidden transition-all ${
        selected
          ? "border-brand-400 dark:border-brand-600 ring-2 ring-brand-200 dark:ring-brand-800"
          : status === "accepted"
            ? "border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-950/30"
            : status === "rejected"
              ? "border-red-200 dark:border-red-800 bg-red-50/20 dark:bg-red-950/20 opacity-60"
              : "border-gray-100 dark:border-gray-800"
      }`}
    >
      {/* Image preview */}
      <button
        onClick={(e) => { e.stopPropagation(); onPreview(item); }}
        className="w-full block bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
            {editing ? (
              <input
                ref={inputRef}
                className="text-sm font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-brand-300 dark:border-brand-600 rounded-lg px-1.5 py-0.5 w-full min-w-0 outline-none focus:ring-1 focus:ring-brand-400"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); commitRename(); }
                  if (e.key === "Escape") { e.preventDefault(); setEditing(false); setEditValue(item.label); }
                }}
                onBlur={commitRename}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate cursor-text"
                title="Double-click to rename"
                onDoubleClick={(e) => { e.stopPropagation(); setEditValue(item.label); setEditing(true); }}
              >
                {item.label}
              </span>
            )}
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
              onClick={(e) => { e.stopPropagation(); onStatusChange(item.id, "accepted"); }}
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
              onClick={(e) => { e.stopPropagation(); onStatusChange(item.id, "rejected"); }}
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
                onClick={(e) => e.stopPropagation()}
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
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
              title="Open full image"
            >
              <Download className="h-3.5 w-3.5" />
            </a>
            {onUpload && (
              <button
                onClick={(e) => { e.stopPropagation(); onUpload(item); }}
                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
                title="Upload to Supabase"
              >
                <CloudUpload className="h-3.5 w-3.5" />
              </button>
            )}
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
  onOpenEditor,
}: {
  page: PageResult;
  detections: Detection[];
  onOpenEditor?: () => void;
}) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <button
        onClick={onOpenEditor}
        className="relative w-full cursor-pointer hover:opacity-90 transition-opacity"
      >
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
      </button>
      <div className="px-3 py-2 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Page {page.pageNumber}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            {detections.length} detection{detections.length !== 1 ? "s" : ""}
          </p>
        </div>
        {onOpenEditor && (
          <button
            onClick={onOpenEditor}
            className="text-[10px] font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
          >
            Open editor
          </button>
        )}
      </div>
    </div>
  );
}

// ── PageEditorModal ─────────────────────────────────────────────────

interface EditorDraft {
  itemId: string;
  isNew: boolean;
  kind: string;
  box: DetectionBox;
  labelOverride?: string;
}

function PageEditorModal({
  result,
  page,
  onClose,
  onSave,
  onDeleteItems,
}: {
  result: ExtractionResult;
  page: PageResult;
  onClose: () => void;
  onSave: (updatedItem: ItemResult) => void;
  onDeleteItems: (ids: string[]) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [drafts, setDrafts] = useState<Map<string, EditorDraft>>(new Map());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState<Map<string, EditorDraft>[]>([]);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelValue, setEditingLabelValue] = useState("");
  const labelInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    itemId: string;
    mode: "move" | "nw" | "ne" | "sw" | "se";
    startX: number;
    startY: number;
    startBox: DetectionBox;
  } | null>(null);

  const pageItems = result.items.filter((item) => item.pageNumber === page.pageNumber);

  const getBox = (itemId: string): DetectionBox => {
    const draft = drafts.get(itemId);
    if (draft) return draft.box;
    const item = pageItems.find((i) => i.id === itemId);
    return item?.box ?? { left: 0.1, top: 0.1, width: 0.2, height: 0.2 };
  };

  const getKind = (itemId: string): string => {
    const draft = drafts.get(itemId);
    if (draft && draft.kind !== "auto") return draft.kind;
    const item = pageItems.find((i) => i.id === itemId);
    return item?.kind ?? "chart";
  };

  const startLabelEdit = (id: string, currentLabel: string) => {
    setEditingLabelId(id);
    setEditingLabelValue(currentLabel);
    // Ensure draft exists
    if (!drafts.has(id)) {
      const item = pageItems.find((i) => i.id === id);
      if (item) upsertDraft({ itemId: id, isNew: false, kind: item.kind, box: { ...item.box }, labelOverride: item.label });
    }
  };

  const commitLabelEdit = () => {
    if (!editingLabelId) return;
    const trimmed = editingLabelValue.trim();
    if (trimmed) {
      const existing = drafts.get(editingLabelId);
      if (existing) {
        upsertDraft({ ...existing, labelOverride: trimmed });
      }
    }
    setEditingLabelId(null);
  };

  useEffect(() => {
    if (editingLabelId) labelInputRef.current?.select();
  }, [editingLabelId]);

  const pushHistory = () => {
    setHistory((prev) => [...prev, new Map(drafts)]);
  };

  const undo = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const snapshot = next.pop()!;
      setDrafts(snapshot);
      return next;
    });
  };

  const upsertDraft = (draft: EditorDraft) => {
    setDrafts((prev) => {
      const next = new Map(prev);
      next.set(draft.itemId, draft);
      return next;
    });
  };

  const addBox = () => {
    pushHistory();
    const id = `manual-draft-${page.pageNumber}-${Date.now()}`;
    upsertDraft({
      itemId: id,
      isNew: true,
      kind: "auto",
      box: { left: 0.25, top: 0.25, width: 0.5, height: 0.3 },
    });
    setSelectedIds(new Set([id]));
  };

  const deleteSelected = () => {
    if (selectedIds.size === 0) return;
    pushHistory();
    const existingIds = Array.from(selectedIds).filter(
      (id) => !drafts.get(id)?.isNew && pageItems.some((i) => i.id === id)
    );
    const draftOnlyIds = Array.from(selectedIds).filter(
      (id) => drafts.get(id)?.isNew
    );
    // Remove new drafts
    if (draftOnlyIds.length > 0) {
      setDrafts((prev) => {
        const next = new Map(prev);
        draftOnlyIds.forEach((id) => next.delete(id));
        return next;
      });
    }
    // Delete existing items from result
    if (existingIds.length > 0) {
      onDeleteItems(existingIds);
    }
    setSelectedIds(new Set());
    setStatus(`Deleted ${existingIds.length + draftOnlyIds.length} box(es).`);
  };

  const handleSave = async () => {
    const draftList = Array.from(drafts.values());
    if (draftList.length === 0) return;
    setSaving(true);
    setStatus(`Saving ${draftList.length} crop(s)...`);

    try {
      for (const draft of draftList) {
        const currentItem = draft.isNew
          ? null
          : result.items.find((i) => i.id === draft.itemId);
        const existingLabels = result.items
          .filter((i) => i.id !== draft.itemId)
          .map((i) => i.label)
          .filter(Boolean);

        const res = await fetch("/api/admin/testing/figures/recrop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId: result.jobId,
            pageNumber: page.pageNumber,
            itemId: draft.isNew ? null : draft.itemId,
            labelOverride: draft.labelOverride || currentItem?.label || "",
            existingLabels,
            kind: draft.kind,
            box: draft.box,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Save failed");
        }

        const data = await res.json();
        if (data.item) {
          onSave(data.item);
        }
      }

      setDrafts(new Map());
      setHistory([]);
      setSelectedIds(new Set());
      setStatus("Saved successfully.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayMouseDown = (
    e: React.MouseEvent,
    itemId: string,
    mode: "move" | "nw" | "ne" | "sw" | "se"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!overlayRef.current) return;

    // Snapshot the current box before dragging starts
    let startBox: DetectionBox;
    const existingDraft = drafts.get(itemId);

    if (existingDraft) {
      startBox = { ...existingDraft.box };
      pushHistory();
    } else {
      const item = pageItems.find((i) => i.id === itemId);
      if (!item) return;
      startBox = { ...item.box };
      pushHistory();
      upsertDraft({ itemId, isNew: false, kind: item.kind, box: startBox });
    }

    dragRef.current = {
      itemId,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startBox,
    };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current || !overlayRef.current) return;
      const rect = overlayRef.current.getBoundingClientRect();
      const dx = (ev.clientX - dragRef.current.startX) / rect.width;
      const dy = (ev.clientY - dragRef.current.startY) / rect.height;
      const sb = dragRef.current.startBox;
      let newBox: DetectionBox;

      if (dragRef.current.mode === "move") {
        newBox = {
          left: Math.max(0, Math.min(1 - sb.width, sb.left + dx)),
          top: Math.max(0, Math.min(1 - sb.height, sb.top + dy)),
          width: sb.width,
          height: sb.height,
        };
      } else {
        let l = sb.left, t = sb.top, w = sb.width, h = sb.height;
        if (dragRef.current.mode.includes("w")) { l = sb.left + dx; w = sb.width - dx; }
        if (dragRef.current.mode.includes("e")) { w = sb.width + dx; }
        if (dragRef.current.mode.includes("n")) { t = sb.top + dy; h = sb.height - dy; }
        if (dragRef.current.mode.includes("s")) { h = sb.height + dy; }
        if (w < 0.02) { w = 0.02; l = sb.left + sb.width - 0.02; }
        if (h < 0.02) { h = 0.02; t = sb.top + sb.height - 0.02; }
        newBox = {
          left: Math.max(0, Math.min(1, l)),
          top: Math.max(0, Math.min(1, t)),
          width: Math.min(1 - Math.max(0, l), w),
          height: Math.min(1 - Math.max(0, t), h),
        };
      }

      const dragItemId = dragRef.current.itemId;
      setDrafts((prev) => {
        const next = new Map(prev);
        const current = next.get(dragItemId);
        if (current) {
          next.set(dragItemId, { ...current, box: newBox });
        } else {
          // Fallback: create draft if somehow missing
          next.set(dragItemId, { itemId: dragItemId, isNew: true, kind: "chart", box: newBox });
        }
        return next;
      });
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // All boxes: existing page items + new drafts
  const allBoxes: { id: string; kind: string; box: DetectionBox; isNew: boolean; label: string }[] = [];
  for (const item of pageItems) {
    allBoxes.push({
      id: item.id,
      kind: getKind(item.id),
      box: getBox(item.id),
      isNew: false,
      label: drafts.get(item.id)?.labelOverride || item.label,
    });
  }
  for (const [id, draft] of Array.from(drafts)) {
    if (draft.isNew) {
      allBoxes.push({
        id,
        kind: draft.kind === "auto" ? "chart" : draft.kind,
        box: draft.box,
        isNew: true,
        label: draft.labelOverride || "Manual crop",
      });
    }
  }

  // Overlap detection: check if two boxes overlap
  const boxesOverlap = (a: DetectionBox, b: DetectionBox) => {
    return (
      a.left < b.left + b.width &&
      a.left + a.width > b.left &&
      a.top < b.top + b.height &&
      a.top + a.height > b.top
    );
  };

  // For each selected box, find which other boxes it overlaps with
  const overlappingIds = new Set<string>();
  for (const selId of Array.from(selectedIds)) {
    const selBox = allBoxes.find((b) => b.id === selId);
    if (!selBox) continue;
    for (const other of allBoxes) {
      if (other.id === selId) continue;
      if (boxesOverlap(selBox.box, other.box)) {
        overlappingIds.add(selId);
        overlappingIds.add(other.id);
      }
    }
  }

  const hasDrafts = drafts.size > 0;
  const selectedDraft = selectedIds.size === 1 ? drafts.get(Array.from(selectedIds)[0]) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.size > 0 && !editingLabelId) {
          e.preventDefault();
          deleteSelected();
        }
      }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-[96vw] max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex-wrap gap-2">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Page Editor</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {result.filename} &middot; Page {page.pageNumber}. Click a box to select, drag to move/resize.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex-wrap">
          {/* Zoom */}
          <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-3">
            <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="p-1 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              <ZoomOut className="h-4 w-4" />
            </button>
            <button onClick={() => setZoom(1)} className="px-1.5 py-0.5 rounded text-[11px] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              {Math.round(zoom * 100)}%
            </button>
            <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="p-1 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          <button onClick={addBox} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Plus className="h-3.5 w-3.5" /> Add box
          </button>

          {/* Kind selector for selected box */}
          {selectedIds.size === 1 && (
            <select
              value={getKind(Array.from(selectedIds)[0])}
              onChange={(e) => {
                const id = Array.from(selectedIds)[0];
                pushHistory();
                const existing = drafts.get(id);
                if (existing) {
                  upsertDraft({ ...existing, kind: e.target.value });
                } else {
                  const item = pageItems.find((i) => i.id === id);
                  if (item) {
                    upsertDraft({ itemId: id, isNew: false, kind: e.target.value, box: { ...item.box } });
                  }
                }
              }}
              className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="auto">Auto detect</option>
              <option value="chart">Chart</option>
              <option value="diagram">Diagram</option>
              <option value="table">Table</option>
              <option value="image">Others</option>
            </select>
          )}

          <button
            onClick={handleSave}
            disabled={!hasDrafts || saving}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save crop{hasDrafts ? ` (${drafts.size})` : ""}
          </button>

          <button
            onClick={undo}
            disabled={history.length === 0}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
          >
            <Undo2 className="h-3.5 w-3.5" /> Undo
          </button>

          <button
            onClick={deleteSelected}
            disabled={selectedIds.size === 0}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
          </button>
        </div>

        {/* Viewport */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800 p-4 min-h-0">
          <div
            ref={overlayRef}
            className="relative mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-sm"
            style={{ width: `${page.width * zoom}px`, maxWidth: "none" }}
            onClick={() => setSelectedIds(new Set())}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={page.imageUrl}
              alt={`Page ${page.pageNumber}`}
              className="w-full h-auto rounded-lg select-none pointer-events-none"
              draggable={false}
            />
            {/* Overlay boxes */}
            {allBoxes.map((entry) => {
              const kc = kindConfig[entry.kind] || kindConfig.image;
              const isSelected = selectedIds.has(entry.id);
              const hasOverlap = overlappingIds.has(entry.id) && isSelected;
              return (
                <div
                  key={entry.id}
                  className={`absolute border-2 ${hasOverlap ? "border-red-500" : kc.borderColor} rounded-lg cursor-move transition-shadow ${
                    isSelected ? (hasOverlap ? "ring-2 ring-red-400/60 shadow-lg shadow-red-500/20 z-10" : "ring-2 ring-white/80 shadow-lg z-10") : ""
                  } ${entry.isNew ? "border-dashed" : ""}`}
                  style={{
                    left: `${entry.box.left * 100}%`,
                    top: `${entry.box.top * 100}%`,
                    width: `${entry.box.width * 100}%`,
                    height: `${entry.box.height * 100}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (e.metaKey || e.altKey) {
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        next.has(entry.id) ? next.delete(entry.id) : next.add(entry.id);
                        return next;
                      });
                    } else {
                      setSelectedIds(new Set([entry.id]));
                    }
                    // Ensure we have a draft
                    if (!drafts.has(entry.id) && !entry.isNew) {
                      const item = pageItems.find((i) => i.id === entry.id);
                      if (item) upsertDraft({ itemId: entry.id, isNew: false, kind: item.kind, box: { ...item.box } });
                    }
                  }}
                  onMouseDown={(e) => handleOverlayMouseDown(e, entry.id, "move")}
                >
                  {/* Label — positioned to the right of the box with padding */}
                  {editingLabelId === entry.id ? (
                    <input
                      ref={labelInputRef}
                      className="absolute top-0 text-xs font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 rounded-lg border border-brand-400 outline-none min-w-[3em] w-[6em] z-20 shadow-sm"
                      style={{ right: "calc(100% + 8px)" }}
                      value={editingLabelValue}
                      onChange={(e) => setEditingLabelValue(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") { e.preventDefault(); commitLabelEdit(); }
                        if (e.key === "Escape") { e.preventDefault(); setEditingLabelId(null); }
                      }}
                      onBlur={commitLabelEdit}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      className={`absolute top-0 text-xs font-bold px-2 py-0.5 rounded-lg whitespace-nowrap cursor-text z-10 shadow-sm ${
                        hasOverlap
                          ? "bg-red-500 text-white"
                          : "bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-gray-100"
                      }`}
                      style={{ right: "calc(100% + 8px)" }}
                      title="Double-click to rename"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        startLabelEdit(entry.id, entry.label);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      {entry.label}
                      {hasOverlap && " ⚠"}
                    </span>
                  )}
                  {/* Resize handles (only when selected) */}
                  {isSelected && (
                    <>
                      <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-white dark:bg-gray-100 border-2 border-current rounded-full cursor-nwse-resize" onMouseDown={(e) => handleOverlayMouseDown(e, entry.id, "nw")} />
                      <div className="absolute -right-1.5 -top-1.5 w-3 h-3 bg-white dark:bg-gray-100 border-2 border-current rounded-full cursor-nesw-resize" onMouseDown={(e) => handleOverlayMouseDown(e, entry.id, "ne")} />
                      <div className="absolute -left-1.5 -bottom-1.5 w-3 h-3 bg-white dark:bg-gray-100 border-2 border-current rounded-full cursor-nesw-resize" onMouseDown={(e) => handleOverlayMouseDown(e, entry.id, "sw")} />
                      <div className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-white dark:bg-gray-100 border-2 border-current rounded-full cursor-nwse-resize" onMouseDown={(e) => handleOverlayMouseDown(e, entry.id, "se")} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Status bar */}
        <div className={`px-4 py-2 border-t text-xs ${
          status?.includes("successfully") || status?.includes("Saved")
            ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400"
            : status?.includes("failed") || status?.includes("error") || status?.includes("requires Python")
              ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400"
              : overlappingIds.size > 0
                ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400"
                : "border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400"
        }`}>
          {status
            ? (status.includes("successfully") || status.includes("Saved") ? `✓ ${status}` : `✕ ${status}`)
            : (overlappingIds.size > 0
              ? `⚠ Selected box overlaps with ${overlappingIds.size - selectedIds.size} other box(es). Adjust to avoid cropping issues.`
              : selectedIds.size > 0
                ? `${selectedIds.size} box(es) selected. Drag to move, corners to resize.`
                : `${allBoxes.length} detection(s). Click a box to select it.`)}
        </div>
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

// ── Upload helpers ──────────────────────────────────────────────────

function parsePdfName(name: string) {
  const m = name.match(/^(\d{4})-mm([12])(-sol)?\.pdf$/i);
  if (!m) return null;
  return { year: parseInt(m[1]), examNum: parseInt(m[2]), isSolution: !!m[3] };
}

function findExamByPdfName(name: string, exams: ExamOption[]): { examId: string; isSolution: boolean } | null {
  const parsed = parsePdfName(name);
  if (!parsed) return null;
  const examType = parsed.examNum === 1 ? "EXAM_1" : "EXAM_2";
  const match = exams.find((e) => e.year === parsed.year && e.examType === examType);
  if (!match) return null;
  return { examId: match.id, isSolution: parsed.isSolution };
}

// ── UploadPopover ───────────────────────────────────────────────────

function UploadPopover({
  item,
  exams,
  pdfName,
  onClose,
}: {
  item: ItemResult;
  exams: ExamOption[];
  pdfName?: string;
  onClose: () => void;
}) {
  const parsed = parseLabel(item.label);
  const autoExam = pdfName ? findExamByPdfName(pdfName, exams) : null;
  const [examId, setExamId] = useState(autoExam?.examId || exams[0]?.id || "");
  const [qNum, setQNum] = useState(parsed?.questionNumber ?? 1);
  const [qPart, setQPart] = useState(parsed?.part ?? "");
  const [target, setTarget] = useState<"question" | "solution">(autoExam?.isSolution ? "solution" : "question");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");

  const handleUpload = async () => {
    setUploading(true);
    setUploadError("");
    try {
      const res = await fetch("/api/admin/testing/figures/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: item.imageUrl,
          examId,
          questionNumber: qNum,
          part: qPart || null,
          target,
          label: item.label,
          pdfName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUploadResult(data.publicUrl);
      setUploadTarget(data.target);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Upload Figure</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt={item.label} className="h-12 w-12 object-contain rounded" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Page {item.pageNumber} &middot; {kindConfig[item.kind]?.label || item.kind}</p>
          </div>
        </div>

        {uploadResult ? (
          <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3 mb-3">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              Uploaded as {uploadTarget === "solution" ? "solution" : "question"} image
            </p>
            <p className="text-[10px] text-green-600 dark:text-green-500 truncate mt-1">{uploadResult}</p>
          </div>
        ) : (
          <>
            {/* Auto-detect info */}
            {autoExam && (
              <div className="rounded-lg bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 px-3 py-2 mb-3 text-xs text-brand-700 dark:text-brand-400">
                Auto-detected from <span className="font-medium">{pdfName}</span> → {autoExam.isSolution ? "Solution" : "Question"} image
              </div>
            )}

            {/* Exam picker */}
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Exam</label>
            <select
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              className="w-full mb-3 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
            >
              {exams.map((e) => (
                <option key={e.id} value={e.id}>{e.label}</option>
              ))}
            </select>

            {/* Question number + part */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Question #</label>
                <input
                  type="number"
                  min={1}
                  value={qNum}
                  onChange={(e) => setQNum(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="w-20">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Part</label>
                <input
                  type="text"
                  placeholder="a"
                  value={qPart}
                  onChange={(e) => setQPart(e.target.value.toLowerCase())}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Target */}
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Attach to</label>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTarget("question")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  target === "question"
                    ? "bg-brand-600 text-white border-brand-600"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                Question image
              </button>
              <button
                onClick={() => setTarget("solution")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  target === "solution"
                    ? "bg-brand-600 text-white border-brand-600"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                Solution image
              </button>
            </div>

            {uploadError && (
              <div className="mb-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-red-700 dark:text-red-400">
                {uploadError}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || !examId}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Upload to Supabase"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── BulkUploadModal ─────────────────────────────────────────────────

function BulkUploadModal({
  result,
  statuses,
  exams,
  pdfName,
  selectedItemIds,
  onClose,
}: {
  result: ExtractionResult;
  statuses: Record<string, ItemStatus>;
  exams: ExamOption[];
  pdfName?: string;
  selectedItemIds?: Set<string>;
  onClose: () => void;
}) {
  const autoExam = pdfName ? findExamByPdfName(pdfName, exams) : null;
  const [examId, setExamId] = useState(autoExam?.examId || exams[0]?.id || "");
  const [target, setTarget] = useState<"question" | "solution">(autoExam?.isSolution ? "solution" : "question");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Record<string, "ok" | "error" | "skip">>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isSelectedMode = selectedItemIds && selectedItemIds.size > 0;

  // Only include items that have parseable labels
  const uploadableItems = result.items.filter((item) => {
    if (isSelectedMode && !selectedItemIds.has(item.id)) return false;
    const p = parseLabel(item.label);
    return p !== null;
  });

  // In "all" mode, prefer accepted items; in "selected" mode, use the selection as-is
  const itemsToUpload = isSelectedMode
    ? uploadableItems
    : (() => {
        const accepted = uploadableItems.filter((i) => statuses[i.id] === "accepted");
        return accepted.length > 0 ? accepted : uploadableItems;
      })();

  const handleBulkUpload = async () => {
    setUploading(true);
    setProgress(0);
    setResults({});
    setErrors({});

    for (let i = 0; i < itemsToUpload.length; i++) {
      const item = itemsToUpload[i];
      const parsed = parseLabel(item.label);
      if (!parsed) {
        setResults((prev) => ({ ...prev, [item.id]: "skip" }));
        continue;
      }

      try {
        const res = await fetch("/api/admin/testing/figures/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: item.imageUrl,
            examId,
            questionNumber: parsed.questionNumber,
            part: parsed.part,
            target,
            label: item.label,
            pdfName,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        setResults((prev) => ({ ...prev, [item.id]: "ok" }));
      } catch (err) {
        setResults((prev) => ({ ...prev, [item.id]: "error" }));
        setErrors((prev) => ({
          ...prev,
          [item.id]: err instanceof Error ? err.message : "Failed",
        }));
      }
      setProgress(i + 1);
    }
    setUploading(false);
  };

  const doneCount = Object.values(results).filter((r) => r === "ok").length;
  const errorCount = Object.values(results).filter((r) => r === "error").length;
  const isDone = progress === itemsToUpload.length && !uploading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {isSelectedMode ? "Upload Selected to Exam" : "Upload All to Exam"}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 overflow-auto flex-1">
          {/* Exam picker */}
          {/* Auto-detect info */}
          {autoExam && (
            <div className="rounded-lg bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 px-3 py-2 mb-3 text-xs text-brand-700 dark:text-brand-400">
              Auto-detected from <span className="font-medium">{pdfName}</span> → {autoExam.isSolution ? "Solution" : "Question"} images
            </div>
          )}

          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Target Exam</label>
          <select
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            disabled={uploading}
            className="w-full mb-3 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 disabled:opacity-50"
          >
            {exams.map((e) => (
              <option key={e.id} value={e.id}>{e.label}</option>
            ))}
          </select>

          {/* Target */}
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Attach as</label>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => !uploading && setTarget("question")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                target === "question"
                  ? "bg-brand-600 text-white border-brand-600"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              Question images
            </button>
            <button
              onClick={() => !uploading && setTarget("solution")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                target === "solution"
                  ? "bg-brand-600 text-white border-brand-600"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              Solution images
            </button>
          </div>

          {/* Items list */}
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isSelectedMode
              ? `${itemsToUpload.length} selected figure(s) to upload`
              : `${itemsToUpload.length} figure(s) to upload`}
          </p>
          <div className="space-y-1.5 mb-4">
            {itemsToUpload.map((item) => {
              const parsed = parseLabel(item.label);
              const r = results[item.id];
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
                    r === "ok"
                      ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400"
                      : r === "error"
                        ? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {r === "ok" ? (
                    <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                  ) : r === "error" ? (
                    <X className="h-3 w-3 text-red-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-3 w-3 text-gray-300 flex-shrink-0" />
                  )}
                  <span className="font-medium">{item.label}</span>
                  <span className="text-gray-400 dark:text-gray-500">→ Q{parsed?.questionNumber}{parsed?.part || ""}</span>
                  {r === "error" && errors[item.id] && (
                    <span className="ml-auto text-red-500 truncate max-w-[150px]">{errors[item.id]}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress */}
          {(uploading || isDone) && (
            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                <span>{progress}/{itemsToUpload.length}</span>
                <span>{doneCount} uploaded{errorCount > 0 ? `, ${errorCount} failed` : ""}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                <div
                  className="bg-brand-500 rounded-full h-1.5 transition-all"
                  style={{ width: `${(progress / itemsToUpload.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDone ? "Close" : "Cancel"}
          </button>
          {!isDone && (
            <button
              onClick={handleBulkUpload}
              disabled={uploading || itemsToUpload.length === 0 || !examId}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
              {uploading ? `Uploading ${progress}/${itemsToUpload.length}...` : `Upload All (${itemsToUpload.length})`}
            </button>
          )}
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
  const [viewMode, setViewMode] = useState<"extract" | "history">("history");
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

  // Page editor state
  const [editorPage, setEditorPage] = useState<PageResult | null>(null);
  // Which result the editor is for (when viewing batch results)
  const [editorResult, setEditorResult] = useState<ExtractionResult | null>(null);

  // Batch results: after multi-file extraction, show all results stacked
  const [batchSessionIds, setBatchSessionIds] = useState<string[]>([]);

  // Selection & delete/undo state
  const [selectedItems, setSelectedItems] = useState<Record<string, Set<string>>>({});
  const [undoStack, setUndoStack] = useState<Record<string, ItemResult[][]>>({});

  // Upload state
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [uploadItem, setUploadItem] = useState<ItemResult | null>(null);
  const [bulkUploadMode, setBulkUploadMode] = useState<"all" | "selected" | null>(null);

  // Load sessions from database
  useEffect(() => {
    fetchSessions().then((s) => {
      setSessions(s);
      setLoaded(true);
    });
  }, []);

  // Load exams for upload picker
  const loadExams = useCallback(() => {
    if (exams.length > 0) return Promise.resolve();
    return fetch("/api/admin/testing/figures/exams")
      .then((r) => r.json())
      .then((d) => setExams(d.exams || []))
      .catch(() => {});
  }, [exams.length]);

  // Auto-load exams when results are available
  useEffect(() => {
    if (result || batchSessionIds.length > 0) loadExams();
  }, [result, batchSessionIds, loadExams]);

  // Persist helper (local state only — DB updates happen via API)
  const persistSessions = useCallback((updated: SavedSession[]) => {
    setSessions(updated);
  }, []);

  const saveToSession = useCallback(
    async (extractionResult: ExtractionResult, itemStatuses: Record<string, ItemStatus>) => {
      if (activeSessionId) {
        // Update existing session
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, result: extractionResult, statuses: itemStatuses }
              : s
          )
        );
        updateSessionApi(activeSessionId, { result: extractionResult, statuses: itemStatuses });
      } else {
        // Create new session via API
        const saved = await createSessionApi(extractionResult.filename, extractionResult, itemStatuses);
        if (saved) {
          setActiveSessionId(saved.id);
          setSessions((prev) => [saved, ...prev]);
        }
      }
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
    const completedIds: string[] = [];

    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status === "done") continue;

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

        const initialStatuses: Record<string, ItemStatus> = {};
        for (const item of data.items) {
          initialStatuses[item.id] = "pending";
        }

        // Save session to database
        const newSession = await createSessionApi(data.filename, data, initialStatuses);
        if (newSession) {
          completedIds.push(newSession.id);
          setSessions((prev) => [newSession, ...prev]);
        }

        setQueue((prev) =>
          prev.map((q, j) =>
            j === i ? { ...q, status: "done" as const, sessionId: newSession?.id } : q
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

    // Show all extracted results on the same page
    if (completedIds.length > 0) {
      setQueue([]);
      setBatchSessionIds(completedIds);
      setResult(null);
      setActiveSessionId(null);
    }
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

  const handleRename = useCallback((id: string, newLabel: string) => {
    if (!result) return;
    const updated: ExtractionResult = {
      ...result,
      items: result.items.map((item) =>
        item.id === id ? { ...item, label: newLabel } : item
      ),
      pages: result.pages.map((p) => ({
        ...p,
        detections: p.detections.map((d) =>
          d.id === id ? { ...d, label: newLabel } : d
        ),
      })),
    };
    setResult(updated);
    saveToSession(updated, statuses);
  }, [result, statuses, saveToSession]);

  const handleDeleteItems = useCallback((ids: string[]) => {
    if (!result || ids.length === 0) return;
    const idSet = new Set(ids);
    const updated: ExtractionResult = {
      ...result,
      items: result.items.filter((i) => !idSet.has(i.id)),
      pages: result.pages.map((p) => ({
        ...p,
        detections: p.detections.filter((d) => !idSet.has(d.id)),
      })),
      summary: {
        ...result.summary,
        items: result.items.length - ids.length,
        counts: (() => {
          const counts: Record<string, number> = {};
          for (const item of result.items) {
            if (!idSet.has(item.id)) {
              counts[item.kind] = (counts[item.kind] || 0) + 1;
            }
          }
          return counts;
        })(),
      },
    };
    setResult(updated);
    const newStatuses = { ...statuses };
    ids.forEach((id) => delete newStatuses[id]);
    setStatuses(newStatuses);
    saveToSession(updated, newStatuses);
  }, [result, statuses, saveToSession]);

  const handleDeleteGroup = useCallback((kind: string) => {
    if (!result) return;
    const toDelete = result.items.filter((i) => i.kind === kind);
    if (toDelete.length === 0) return;
    // Push to undo stack
    setUndoStack((prev) => ({
      ...prev,
      [kind]: [...(prev[kind] || []), toDelete],
    }));
    handleDeleteItems(toDelete.map((i) => i.id));
  }, [result, handleDeleteItems]);

  const handleDeleteSelected = useCallback((kind: string) => {
    if (!result) return;
    const sel = selectedItems[kind];
    if (!sel || sel.size === 0) return;
    const toDelete = result.items.filter((i) => i.kind === kind && sel.has(i.id));
    if (toDelete.length === 0) return;
    setUndoStack((prev) => ({
      ...prev,
      [kind]: [...(prev[kind] || []), toDelete],
    }));
    handleDeleteItems(toDelete.map((i) => i.id));
    setSelectedItems((prev) => ({ ...prev, [kind]: new Set() }));
  }, [result, selectedItems, handleDeleteItems]);

  const handleUndoGroup = useCallback((kind: string) => {
    const stack = undoStack[kind];
    if (!stack || stack.length === 0 || !result) return;
    const itemsToRestore = stack[stack.length - 1];
    setUndoStack((prev) => ({
      ...prev,
      [kind]: (prev[kind] || []).slice(0, -1),
    }));
    const updated: ExtractionResult = {
      ...result,
      items: [...result.items, ...itemsToRestore].sort((a, b) => a.pageNumber - b.pageNumber),
      pages: result.pages.map((p) => ({
        ...p,
        detections: [
          ...p.detections,
          ...itemsToRestore
            .filter((i) => i.pageNumber === p.pageNumber)
            .map((i) => ({ id: i.id, kind: i.kind, label: i.label, confidence: i.confidence, box: i.box })),
        ],
      })),
      summary: {
        ...result.summary,
        items: result.items.length + itemsToRestore.length,
        counts: (() => {
          const counts = { ...result.summary.counts };
          for (const item of itemsToRestore) {
            counts[item.kind] = (counts[item.kind] || 0) + 1;
          }
          return counts;
        })(),
      },
    };
    const newStatuses = { ...statuses };
    for (const item of itemsToRestore) {
      newStatuses[item.id] = "pending";
    }
    setResult(updated);
    setStatuses(newStatuses);
    saveToSession(updated, newStatuses);
  }, [result, undoStack, statuses, saveToSession]);

  const handleItemClick = useCallback((kind: string, itemId: string, e: React.MouseEvent) => {
    setSelectedItems((prev) => {
      const sel = new Set(prev[kind] || []);
      if (e.metaKey || e.altKey) {
        sel.has(itemId) ? sel.delete(itemId) : sel.add(itemId);
      } else {
        if (sel.has(itemId) && sel.size === 1) {
          sel.delete(itemId);
        } else {
          sel.clear();
          sel.add(itemId);
        }
      }
      return { ...prev, [kind]: sel };
    });
  }, []);

  const handleEditorSave = useCallback((updatedItem: ItemResult) => {
    if (!result) return;
    const existingIndex = result.items.findIndex((i) => i.id === updatedItem.id);
    let updatedResult: ExtractionResult;
    if (existingIndex >= 0) {
      updatedResult = {
        ...result,
        items: result.items.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
        pages: result.pages.map((p) => ({
          ...p,
          detections: p.detections.map((d) =>
            d.id === updatedItem.id
              ? { id: updatedItem.id, kind: updatedItem.kind, label: updatedItem.label, confidence: updatedItem.confidence, box: updatedItem.box }
              : d
          ),
        })),
      };
    } else {
      updatedResult = {
        ...result,
        items: [...result.items, updatedItem].sort((a, b) => a.pageNumber - b.pageNumber),
        pages: result.pages.map((p) =>
          p.pageNumber === updatedItem.pageNumber
            ? {
                ...p,
                detections: [
                  ...p.detections,
                  { id: updatedItem.id, kind: updatedItem.kind, label: updatedItem.label, confidence: updatedItem.confidence, box: updatedItem.box },
                ],
              }
            : p
        ),
        summary: {
          ...result.summary,
          items: result.items.length + 1,
          counts: {
            ...result.summary.counts,
            [updatedItem.kind]: (result.summary.counts[updatedItem.kind] || 0) + 1,
          },
        },
      };
    }
    const newStatuses = { ...statuses };
    if (!newStatuses[updatedItem.id]) newStatuses[updatedItem.id] = "pending";
    setResult(updatedResult);
    setStatuses(newStatuses);
    saveToSession(updatedResult, newStatuses);
  }, [result, statuses, saveToSession]);

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
    deleteSessionApi(sessionId);
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
    setBatchSessionIds([]);
    setError("");
  };

  const acceptedCount = Object.values(statuses).filter((s) => s === "accepted").length;
  const rejectedCount = Object.values(statuses).filter((s) => s === "rejected").length;
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const kindOrder = ["chart", "diagram", "table", "image"];

  // Delete/Backspace key deletes selected items on the results page
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      // Don't interfere with inputs, modals, or text editing
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (editorPage || previewItem || uploadItem || bulkUploadMode) return;
      if (!result) return;

      // Find all selected items across all kinds
      const allSelectedIds: string[] = [];
      for (const kind of kindOrder) {
        const sel = selectedItems[kind];
        if (sel && sel.size > 0) {
          allSelectedIds.push(...Array.from(sel));
        }
      }
      if (allSelectedIds.length === 0) return;

      e.preventDefault();
      // Push each kind's selected items to its undo stack, then delete
      for (const kind of kindOrder) {
        const sel = selectedItems[kind];
        if (sel && sel.size > 0) {
          handleDeleteSelected(kind);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [result, selectedItems, editorPage, previewItem, uploadItem, bulkUploadMode, handleDeleteSelected, kindOrder]);

  return (
    <div className="max-w-5xl">
      {/* Image preview modal */}
      {previewItem && (
        <ImagePreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      )}

      {/* Page editor modal */}
      {editorPage && result && (
        <PageEditorModal
          result={result}
          page={editorPage}
          onClose={() => setEditorPage(null)}
          onSave={handleEditorSave}
          onDeleteItems={handleDeleteItems}
        />
      )}

      {/* Upload popover */}
      {uploadItem && (
        <UploadPopover
          item={uploadItem}
          exams={exams}
          pdfName={activeSession?.pdfName || result?.filename}
          onClose={() => setUploadItem(null)}
        />
      )}

      {/* Bulk upload modal */}
      {bulkUploadMode && result && (
        <BulkUploadModal
          result={result}
          statuses={statuses}
          exams={exams}
          pdfName={activeSession?.pdfName || result?.filename}
          selectedItemIds={bulkUploadMode === "selected"
            ? new Set(Object.values(selectedItems).flatMap((s) => Array.from(s || [])))
            : undefined}
          onClose={() => setBulkUploadMode(null)}
        />
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
                    className={`rounded-xl border shadow-sm p-4 transition-all ${
                      session.done
                        ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                        : isActive
                          ? "bg-white dark:bg-gray-900 border-brand-300 dark:border-brand-700 ring-1 ring-brand-200 dark:ring-brand-800"
                          : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
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
                            {session.createdBy && (
                              <span className="text-gray-400 dark:text-gray-500">
                                by {session.createdBy}
                              </span>
                            )}
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
                            const newDone = !session.done;
                            setSessions((prev) =>
                              prev.map((s) => s.id === session.id ? { ...s, done: newDone } : s)
                            );
                            updateSessionApi(session.id, { done: newDone });
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                            session.done
                              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400"
                              : "text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
                          }`}
                          title={session.done ? "Mark as not done" : "Mark as done"}
                        >
                          <Check className="h-3 w-3" />
                          {session.done ? "Done" : "Done"}
                        </button>
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
            <div className="rounded-xl bg-brand-50 dark:bg-gray-800 border border-brand-200 dark:border-gray-700 p-4 mb-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <FileImage className="h-5 w-5 text-brand-500 dark:text-brand-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
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
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("ring-2", "ring-brand-400");
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("ring-2", "ring-brand-400");
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("ring-2", "ring-brand-400");
                const files = e.dataTransfer.files;
                if (files?.length) addFiles(files);
              }}
            >
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
                      draggable={item.status === "pending" && !extracting}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", String(i));
                        e.currentTarget.classList.add("opacity-40");
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.classList.remove("opacity-40");
                        document.querySelectorAll("[data-drag-over]").forEach((el) => el.removeAttribute("data-drag-over"));
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        e.currentTarget.setAttribute("data-drag-over", "true");
                        e.currentTarget.classList.add("ring-2", "ring-brand-400");
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.removeAttribute("data-drag-over");
                        e.currentTarget.classList.remove("ring-2", "ring-brand-400");
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.removeAttribute("data-drag-over");
                        e.currentTarget.classList.remove("ring-2", "ring-brand-400");
                        const fromIndex = Number(e.dataTransfer.getData("text/plain"));
                        const toIndex = i;
                        if (fromIndex !== toIndex && !extracting) {
                          setQueue((prev) => {
                            const next = [...prev];
                            const [moved] = next.splice(fromIndex, 1);
                            next.splice(toIndex, 0, moved);
                            return next;
                          });
                        }
                      }}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                        item.status === "pending" && !extracting ? "cursor-grab active:cursor-grabbing" : ""
                      } ${
                        item.status === "extracting"
                          ? "bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800"
                          : item.status === "done"
                            ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                            : item.status === "error"
                              ? "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
                              : "bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                      }`}
                    >
                      {item.status === "pending" && !extracting && (
                        <GripVertical className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                      )}
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
            </div>
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

                  <div className="flex items-center gap-2">
                    {/* Upload buttons */}
                    <>
                      {(() => {
                        const selCount = Object.values(selectedItems).reduce((sum, s) => sum + (s?.size || 0), 0);
                        return selCount > 0 ? (
                          <button
                            onClick={() => { loadExams().then(() => setBulkUploadMode("selected")); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
                          >
                            <CloudUpload className="h-3.5 w-3.5" />
                            Upload Selected ({selCount})
                          </button>
                        ) : null;
                      })()}
                      <button
                        onClick={() => { loadExams().then(() => setBulkUploadMode("all")); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                      >
                        <CloudUpload className="h-3.5 w-3.5" />
                        Upload All ({result.items.length})
                      </button>
                    </>

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
              </div>

              {/* Items view */}
              {viewTab === "items" && (
                <div className="space-y-6">
                  {kindOrder
                    .filter((kind) => result.items.some((item) => item.kind === kind) || (undoStack[kind]?.length ?? 0) > 0)
                    .map((kind) => {
                      const items = result.items.filter((item) => item.kind === kind);
                      const kc = kindConfig[kind] || kindConfig.image;
                      const sel = selectedItems[kind] || new Set<string>();
                      const undoCount = undoStack[kind]?.length
                        ? undoStack[kind][undoStack[kind].length - 1].length
                        : 0;
                      return (
                        <section key={kind}>
                          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {kc.label}s
                              </h3>
                              <span className="text-xs text-gray-400 dark:text-gray-500">({items.length})</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {undoStack[kind]?.length > 0 && (
                                <button
                                  onClick={() => handleUndoGroup(kind)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  <Undo2 className="h-3 w-3" /> Undo ({undoCount})
                                </button>
                              )}
                              {sel.size > 0 && (
                                <button
                                  onClick={() => handleDeleteSelected(kind)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                  <Trash2 className="h-3 w-3" /> Delete selected ({sel.size})
                                </button>
                              )}
                              {items.length > 0 && (
                                <button
                                  onClick={() => handleDeleteGroup(kind)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                  <Trash2 className="h-3 w-3" /> Delete all ({items.length})
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {items.map((item) => (
                              <ItemCard
                                key={item.id}
                                item={item}
                                status={statuses[item.id] || "pending"}
                                selected={sel.has(item.id)}
                                onStatusChange={handleStatusChange}
                                onPreview={setPreviewItem}
                                onRename={handleRename}
                                onClick={(e) => handleItemClick(kind, item.id, e)}
                                onUpload={(item) => { loadExams().then(() => setUploadItem(item)); }}
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
                  {result.pages.map((pg) => (
                    <PagePreview
                      key={pg.pageNumber}
                      page={pg}
                      detections={pg.detections}
                      onOpenEditor={() => setEditorPage(pg)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Batch results — shown after multi-file extraction */}
          {batchSessionIds.length > 0 && !result && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {batchSessionIds.length} PDF{batchSessionIds.length !== 1 ? "s" : ""} extracted
                </p>
                <button
                  onClick={clearCurrentWork}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-6">
                {batchSessionIds.map((sid) => {
                  const session = sessions.find((s) => s.id === sid);
                  if (!session) return null;
                  const r = session.result;
                  return (
                    <div key={sid} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                      {/* Per-file header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileImage className="h-5 w-5 text-brand-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{r.filename}</p>
                            <div className="flex gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {r.summary.items} figure{r.summary.items !== 1 ? "s" : ""} &middot; {r.summary.pages} page{r.summary.pages !== 1 ? "s" : ""}
                              </span>
                              {Object.entries(r.summary.counts).map(([kind, count]) => {
                                const kc = kindConfig[kind] || kindConfig.image;
                                return (
                                  <span key={kind} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${kc.color}`}>
                                    {count} {kc.label}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            openSession(session);
                            setBatchSessionIds([]);
                          }}
                          className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex-shrink-0"
                        >
                          Open
                        </button>
                      </div>
                      {/* Item thumbnails grid */}
                      {r.items.length > 0 ? (
                        <div className="p-3 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                          {r.items.map((item) => {
                            const kc = kindConfig[item.kind] || kindConfig.image;
                            return (
                              <div
                                key={item.id}
                                className="rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-800 cursor-pointer hover:border-brand-300 dark:hover:border-brand-600 transition-colors"
                                onClick={() => {
                                  openSession(session);
                                  setBatchSessionIds([]);
                                  setPreviewItem(item);
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.imageUrl}
                                  alt={item.label}
                                  className="w-full h-20 object-contain p-1"
                                  loading="lazy"
                                />
                                <div className="px-1.5 py-1 border-t border-gray-100 dark:border-gray-700">
                                  <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 truncate">{item.label}</p>
                                  <span className={`text-[8px] font-medium px-1 py-0.5 rounded-full ${kc.color}`}>{kc.label}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500">
                          No figures detected
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
