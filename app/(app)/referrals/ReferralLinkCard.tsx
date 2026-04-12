"use client";

import { useState } from "react";
import { Copy, Check, Link as LinkIcon } from "lucide-react";

export default function ReferralLinkCard({ url, code }: { url: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <LinkIcon className="h-5 w-5" />
        <h2 className="font-semibold">Your referral link</h2>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur px-4 py-3">
        <code className="flex-1 truncate text-sm font-mono">{url}</code>
        <button
          onClick={copy}
          className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-white text-brand-700 px-3 py-1.5 text-sm font-medium hover:bg-brand-50 transition"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </button>
      </div>
      <p className="mt-3 text-xs text-white/80">
        Code: <span className="font-mono">{code}</span>
      </p>
    </div>
  );
}
