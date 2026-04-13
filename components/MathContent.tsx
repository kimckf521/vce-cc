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
  // 1. Protect $$...$$ display-math blocks from newline processing.
  const segments = content.split(/(\$\$[\s\S]*?\$\$)/g);
  for (const seg of segments) {
    if (seg.startsWith("$$") && seg.endsWith("$$")) {
      out.push(seg);
      continue;
    }
    // 2. Split into lines and process each one.
    //    - Table lines (starting with |) are kept verbatim with real \n so
    //      remark-gfm can parse them. A blank line is inserted before/after
    //      table blocks to ensure GFM separation.
    //    - Empty lines become a non-breaking space (visible blank line).
    //    - All other lines get a trailing "  " (markdown hard break).
    const lines = seg.split("\n");
    const result: string[] = [];
    let prevWasTable = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isTable = /^\s*\|/.test(line);
      if (isTable) {
        if (!prevWasTable && result.length > 0) {
          // Insert blank line before table to ensure GFM parsing
          result.push("");
        }
        result.push(line);
        prevWasTable = true;
      } else {
        if (prevWasTable) {
          // Insert blank line after table
          result.push("");
          prevWasTable = false;
        }
        if (line.trim().length === 0) {
          // Empty line → non-breaking space so it renders as a visible blank line
          result.push("\u00A0  ");
        } else {
          result.push(line + "  ");
        }
      }
    }
    out.push(result.join("\n"));
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
