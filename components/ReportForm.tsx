"use client";

import { useRef, useState } from "react";
import {
  Send,
  Check,
  AlertCircle,
  Loader2,
  ImagePlus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "BUG", label: "Bug — something broken" },
  { value: "FEATURE_REQUEST", label: "Feature request" },
  { value: "CONTENT_ERROR", label: "Content error (wrong answer, typo)" },
  { value: "ACCOUNT_BILLING", label: "Account or billing issue" },
  { value: "OTHER", label: "Other" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

const MIN_CHARS = 10;
const MAX_CHARS = 4000;
const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB each
const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20 MB total — stays well under email size limit
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"];

type ImageItem = {
  id: string;
  file: File;
  previewUrl: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ReportForm() {
  const [category, setCategory] = useState<Category>("BUG");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = description.trim().length;
  const totalBytes = images.reduce((sum, img) => sum + img.file.size, 0);
  const canSubmit = charCount >= MIN_CHARS && charCount <= MAX_CHARS && !loading;

  function resetForm() {
    // Revoke object URLs before clearing
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setDescription("");
    setCategory("BUG");
    setError(null);
  }

  function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const incoming = Array.from(files);
    const remainingSlots = MAX_IMAGES - images.length;
    if (incoming.length > remainingSlots) {
      setError(
        `You can attach up to ${MAX_IMAGES} images. ${remainingSlots} slot${remainingSlots === 1 ? "" : "s"} remaining.`,
      );
      return;
    }

    const accepted: ImageItem[] = [];
    for (const file of incoming) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`"${file.name}" is not a supported image type.`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setError(
          `"${file.name}" is ${formatBytes(file.size)}. Maximum is ${formatBytes(MAX_IMAGE_BYTES)} per image.`,
        );
        continue;
      }
      accepted.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (accepted.length === 0) return;

    const next = [...images, ...accepted];
    const nextTotal = next.reduce((s, i) => s + i.file.size, 0);
    if (nextTotal > MAX_TOTAL_BYTES) {
      // Revoke URLs for images we're not keeping
      accepted.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setError(
        `Total attachment size would be ${formatBytes(nextTotal)}. Maximum is ${formatBytes(MAX_TOTAL_BYTES)}.`,
      );
      return;
    }
    setImages(next);
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("category", category);
      form.append("description", description.trim());
      images.forEach((img) => form.append("images", img.file, img.file.name));

      const res = await fetch("/api/report", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Could not send report. Please try again.");
        setLoading(false);
        return;
      }

      // Clear previews and fields before showing success state
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setImages([]);
      setDescription("");
      setCategory("BUG");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/50 p-5 lg:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm lg:text-base font-semibold text-green-900 dark:text-green-100">
              Report sent — thanks!
            </p>
            <p className="text-xs lg:text-sm text-green-700 dark:text-green-400 mt-0.5">
              We'll get back to you by email as soon as we can.
            </p>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setSent(false);
              }}
              className="mt-3 text-xs lg:text-sm font-medium text-green-700 dark:text-green-400 hover:underline"
            >
              Send another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Intro */}
      <div>
        <h3 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">
          Report an issue or contact us
        </h3>
        <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Found a bug, a wrong answer, or have an idea? Let us know — we read every message.
        </p>
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="report-category"
          className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2"
        >
          Category
        </label>
        <select
          id="report-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          disabled={loading}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-60"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="report-description"
          className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2"
        >
          Description
        </label>
        <textarea
          id="report-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          rows={6}
          maxLength={MAX_CHARS}
          placeholder="Tell us what happened. Include the page or question where it occurred, and any steps to reproduce it."
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-60 resize-y"
        />
        <div className="mt-1.5 flex items-center justify-between text-xs">
          <span className="text-gray-400 dark:text-gray-500">
            {charCount < MIN_CHARS ? `At least ${MIN_CHARS} characters` : "\u00a0"}
          </span>
          <span
            className={cn(
              "tabular-nums",
              charCount > MAX_CHARS - 200
                ? "text-amber-600 dark:text-amber-400"
                : "text-gray-400 dark:text-gray-500",
            )}
          >
            {charCount} / {MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Image attachments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Screenshots{" "}
            <span className="normal-case text-gray-400 dark:text-gray-500">(optional)</span>
          </label>
          <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
            {images.length} / {MAX_IMAGES}
            {images.length > 0 && ` · ${formatBytes(totalBytes)}`}
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          onChange={(e) => {
            handleFilesSelected(e.target.files);
            // Reset so the same file can be re-selected after removing it
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          disabled={loading || images.length >= MAX_IMAGES}
          className="sr-only"
          id="report-images"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.previewUrl}
                alt={img.file.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                disabled={loading}
                aria-label={`Remove ${img.file.name}`}
                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/70 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-gray-900/90 transition-opacity disabled:opacity-40"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
                <p className="truncate text-[10px] text-white">{img.file.name}</p>
              </div>
            </div>
          ))}

          {images.length < MAX_IMAGES && (
            <label
              htmlFor="report-images"
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 text-gray-400 dark:text-gray-500 transition-colors",
                loading
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:border-brand-400 hover:text-brand-500 dark:hover:border-brand-500 dark:hover:text-brand-400",
              )}
            >
              <ImagePlus className="h-5 w-5" />
              <span className="text-xs font-medium">Add image</span>
            </label>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Up to {MAX_IMAGES} images, {formatBytes(MAX_IMAGE_BYTES)} each. JPEG, PNG, WebP, GIF, or HEIC.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 p-3">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs lg:text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors",
            canSubmit ? "hover:bg-brand-700" : "opacity-60 cursor-not-allowed",
          )}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send report
            </>
          )}
        </button>
      </div>
    </form>
  );
}
