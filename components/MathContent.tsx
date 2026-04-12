"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Preserve every newline (including blank lines) as a visible line break.
// Markdown normally collapses blank lines into paragraph spacing; we replace
// each blank line with a non-breaking space so it remains a literal line, and
// terminate every line with a markdown hard break ("  \n"). Math blocks
// ($$...$$) are kept intact so multi-line LaTeX still parses correctly.
// Markdown tables (any line starting with "|") are also preserved verbatim
// so GFM table parsing works.
function preserveNewlines(content: string): string {
  const out: string[] = [];
  const segments = content.split(/(\$\$[\s\S]*?\$\$)/g);
  for (const seg of segments) {
    if (seg.startsWith("$$") && seg.endsWith("$$")) {
      out.push(seg);
      continue;
    }
    // Split into paragraph blocks (separated by blank lines). Process each
    // block independently so table blocks remain delimited by real blank lines.
    const blocks = seg.split(/\n\s*\n/);
    const processed = blocks.map((block) => {
      const lines = block.split("\n");
      const isTable = lines.some((l) => /^\s*\|/.test(l));
      if (isTable) return block; // leave tables untouched
      return lines.map((l) => (l.length === 0 ? "\u00A0" : l)).join("  \n");
    });
    out.push(processed.join("\n\n"));
  }
  return out.join("");
}

const MathContent = React.memo(
  function MathContent({ content }: { content: string }) {
    return (
      <div className="prose prose-base max-w-none text-gray-800 dark:text-gray-200 [&_.katex]:text-2xl [&_.katex-display]:text-3xl [&_p]:mb-3 [&_p:last-child]:mb-0 [&_.katex]:text-inherit [&_table]:my-3 [&_th]:border [&_th]:border-gray-300 [&_th]:dark:border-gray-700 [&_th]:px-3 [&_th]:py-1.5 [&_th]:bg-gray-100 [&_th]:dark:bg-gray-800 [&_th]:text-center [&_td]:border [&_td]:border-gray-300 [&_td]:dark:border-gray-700 [&_td]:px-3 [&_td]:py-1.5 [&_td]:text-center [&_table]:border-collapse">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkBreaks, remarkGfm]}
          rehypePlugins={[rehypeKatex]}
          urlTransform={(url) => url}
        >
          {preserveNewlines(content)}
        </ReactMarkdown>
      </div>
    );
  },
  (prev, next) => prev.content === next.content
);

export default MathContent;
