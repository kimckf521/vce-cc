"use client";

import { useState } from "react";

/**
 * "Embed this countdown" section — one copy-paste iframe snippet per subject.
 * Snippet strings are built server-side (they carry the canonical SITE_URL)
 * and passed down; this component only owns the copy-to-clipboard state.
 */

export interface EmbedSnippet {
  slug: string;
  shortName: string;
  code: string;
}

export default function EmbedSnippets({ snippets }: { snippets: EmbedSnippet[] }) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  async function copy(snippet: EmbedSnippet) {
    try {
      await navigator.clipboard.writeText(snippet.code);
    } catch {
      // Clipboard API unavailable (older browser / non-secure context) —
      // fall back to the classic hidden-textarea trick.
      const ta = document.createElement("textarea");
      ta.value = snippet.code;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedSlug(snippet.slug);
    window.setTimeout(
      () => setCopiedSlug((current) => (current === snippet.slug ? null : current)),
      2000,
    );
  }

  return (
    <div className="space-y-4">
      {snippets.map((snippet) => (
        <div
          key={snippet.slug}
          className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {snippet.shortName}
            </p>
            <button
              type="button"
              onClick={() => copy(snippet)}
              className="shrink-0 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {copiedSlug === snippet.slug ? "Copied!" : "Copy snippet"}
            </button>
          </div>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-600 dark:bg-gray-950 dark:text-gray-300">
            <code>{snippet.code}</code>
          </pre>
        </div>
      ))}
    </div>
  );
}
