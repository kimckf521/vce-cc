"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Loader2,
  Trash2,
  X,
  ImageIcon,
  FolderOpen,
  ExternalLink,
} from "lucide-react";

interface FileEntry {
  path: string;
  name: string;
  subfolder: string;
  url: string;
  size: number | null;
}

interface FolderEntry {
  name: string;
  examLabel: string;
  sessionId?: string;
  createdBy?: string;
  createdAt?: string;
  files: FileEntry[];
}

export default function ExtractionStoragePage() {
  const [folders, setFolders] = useState<FolderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState("");
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  const fetchFiles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/extraction");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setFolders(data.folders || []);
      // Auto-expand all folders
      setExpanded(new Set((data.folders || []).map((f: FolderEntry) => f.name)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const totalFiles = folders.reduce((sum, f) => sum + f.files.length, 0);

  const toggleFolder = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleDelete = async (path: string) => {
    if (deleting.has(path)) return;
    setDeleting((prev) => new Set(prev).add(path));
    try {
      const res = await fetch("/api/admin/extraction", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      // Remove from local state
      setFolders((prev) =>
        prev
          .map((f) => ({ ...f, files: f.files.filter((file) => file.path !== path) }))
          .filter((f) => f.files.length > 0)
      );
      if (previewUrl) {
        const deleted = folders.flatMap((f) => f.files).find((f) => f.path === path);
        if (deleted && deleted.url === previewUrl) setPreviewUrl(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    }
  };

  const handleDeleteFolder = async (folderName: string) => {
    const folder = folders.find((f) => f.name === folderName);
    if (!folder || folder.files.length === 0) return;
    if (!confirm(`Delete all ${folder.files.length} image(s) from ${folder.examLabel}?`)) return;

    const paths = folder.files.map((f) => f.path);
    try {
      const res = await fetch("/api/admin/extraction", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setFolders((prev) => prev.filter((f) => f.name !== folderName));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="max-w-5xl">
      {/* Preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{previewLabel}</p>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-800 p-4 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt={previewLabel} className="max-w-full max-h-full rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin"
          className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Extraction Storage</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View and manage uploaded extraction images
          </p>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 mb-6 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-brand-500" />
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{totalFiles}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total images</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{folders.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Exam{folders.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Loading extraction storage...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400 mb-4">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && folders.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-10 text-center">
          <ImageIcon className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-1 font-medium">No extraction images</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Upload extracted figures from the{" "}
            <Link href="/admin/testing/figures" className="text-brand-600 dark:text-brand-400 hover:underline">
              PDF Figure Extraction
            </Link>{" "}
            tool.
          </p>
        </div>
      )}

      {/* Folders */}
      {!loading && folders.length > 0 && (
        <div className="space-y-4">
          {folders.map((folder) => {
            const isExpanded = expanded.has(folder.name);
            const questionFiles = folder.files.filter((f) => f.subfolder === "questions");
            const solutionFiles = folder.files.filter((f) => f.subfolder === "solutions");
            const itemFiles = folder.files.filter((f) => f.subfolder === "items");

            return (
              <div
                key={folder.name}
                className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
              >
                {/* Folder header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
                  <button
                    onClick={() => toggleFolder(folder.name)}
                    className="flex items-center gap-2 text-left flex-1"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {folder.examLabel}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {folder.files.length} image{folder.files.length !== 1 ? "s" : ""}
                    </span>
                    {folder.createdBy && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        by {folder.createdBy}
                      </span>
                    )}
                    {questionFiles.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400 font-medium">
                        {questionFiles.length} question
                      </span>
                    )}
                    {solutionFiles.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400 font-medium">
                        {solutionFiles.length} solution
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder.name)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Delete all
                  </button>
                </div>

                {/* Files grid */}
                {isExpanded && (
                  <div className="p-3">
                    {/* Questions section */}
                    {questionFiles.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Question Images
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                          {questionFiles.map((file) => (
                            <FileCard
                              key={file.path}
                              file={file}
                              deleting={deleting.has(file.path)}
                              onPreview={() => {
                                setPreviewUrl(file.url);
                                setPreviewLabel(`${folder.examLabel} — ${file.name}`);
                              }}
                              onDelete={() => handleDelete(file.path)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Solutions section */}
                    {solutionFiles.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Solution Images
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                          {solutionFiles.map((file) => (
                            <FileCard
                              key={file.path}
                              file={file}
                              deleting={deleting.has(file.path)}
                              onPreview={() => {
                                setPreviewUrl(file.url);
                                setPreviewLabel(`${folder.examLabel} — ${file.name}`);
                              }}
                              onDelete={() => handleDelete(file.path)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extracted figures section */}
                    {itemFiles.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Extracted Figures
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                          {itemFiles.map((file) => (
                            <FileCard
                              key={file.path}
                              file={file}
                              deleting={deleting.has(file.path)}
                              onPreview={() => {
                                setPreviewUrl(file.url);
                                setPreviewLabel(`${folder.examLabel} — ${file.name}`);
                              }}
                              onDelete={() => handleDelete(file.path)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FileCard({
  file,
  deleting,
  onPreview,
  onDelete,
}: {
  file: FileEntry;
  deleting: boolean;
  onPreview: () => void;
  onDelete: () => void;
}) {
  const label = file.name.replace(/\.png$/i, "");

  return (
    <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 overflow-hidden group relative">
      <button onClick={onPreview} className="w-full cursor-pointer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file.url}
          alt={label}
          className="w-full h-20 object-contain p-1 bg-white dark:bg-gray-900"
          loading="lazy"
        />
      </button>
      <div className="px-1.5 py-1 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
        <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 truncate flex-1">
          {label}
        </p>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="p-0.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
          title="Delete"
        >
          {deleting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>
  );
}
