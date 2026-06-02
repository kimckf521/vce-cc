"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Fix fragile "currency wrapped in math mode" markup.
//
// Many generated questions write currency as an escaped dollar `\$` — as a
// whole math span (`$\$600$`), embedded in a larger expression
// (`$\bar{x} = \$240$`), or inline in prose (`tips: $\$28$, $\$35$`).
//
// The breakage: remark-math (our markdown→math parser) does NOT honour the
// `\` escape — every `$` is a candidate delimiter. So the `$` inside `\$240`
// mis-pairs with a neighbouring math span's `$`, KaTeX renders the plain text
// between them as italic math, and the leftover `\` throws a parse error.
//
// The robust fix: represent the currency dollar with the HTML numeric entity
// `&#36;`. micromark tokenises math BEFORE it decodes character references, so
// `&#36;` is completely invisible to the delimiter scanner — it can't be
// mis-paired. The entity is only decoded to a literal "$" in the final text
// output. Currency embedded inside a real math span is pulled OUT into text
// (math spans can't contain `&`), keeping the remaining math balanced.
//
//   `$\$600$`                       → `&#36;600`                  → "$600"
//   `$\$28$, $\$35$`                → `&#36;28, &#36;35`          → "$28, $35"
//   `$\bar{x} = \$240$`             → `$\bar{x} = $&#36;240`      → "x̄ = $240"
//   `$= 0.19 \times 726 = \$137.94$`→ `$= 0.19 \times 726 = $&#36;137.94`
//   `$$\text{Total} = \$726.00$$`   → `$$\text{Total} = $$&#36;726.00`
// Real math (`$x^2$`) and plain-text-only currency are otherwise unchanged.
function normaliseCurrencyMath(content: string): string {
  const segments = splitByMath(content);
  let out = "";
  for (const seg of segments) {
    if (!seg.isMath) {
      // Plain text: currency escapes become inert entities.
      out += seg.text.replace(/\\\$/g, "&#36;");
      continue;
    }
    if (!/\\\$/.test(seg.text)) {
      // Pure math, no currency — re-wrap verbatim.
      out += seg.fence + seg.text + seg.fence;
      continue;
    }
    // Math span containing currency: pull each `\$<number>` out into text.
    const tokenRe = /\\\$\s*([0-9][0-9,.]*)?/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = tokenRe.exec(seg.text)) !== null) {
      const before = seg.text.slice(last, m.index);
      if (before.trim() !== "") out += seg.fence + before + seg.fence;
      out += "&#36;" + (m[1] ?? "");
      last = tokenRe.lastIndex;
    }
    const after = seg.text.slice(last);
    if (after.trim() !== "") out += seg.fence + after + seg.fence;
  }
  return out;
}

/**
 * Split markdown into alternating text / math segments. A `$` (or `$$`)
 * preceded by a backslash is treated as a literal currency dollar, NOT a
 * delimiter — so spans pair the way they visually should, and currency never
 * prematurely closes a span. Mirrors the pairing remark-math *ought* to do.
 */
function splitByMath(
  content: string
): Array<{ isMath: boolean; text: string; fence: "$" | "$$" }> {
  const segs: Array<{ isMath: boolean; text: string; fence: "$" | "$$" }> = [];
  let i = 0;
  const n = content.length;
  let buf = "";
  while (i < n) {
    // Escaped dollar — keep verbatim in the current text buffer.
    if (content[i] === "\\" && content[i + 1] === "$") {
      buf += "\\$";
      i += 2;
      continue;
    }
    if (content[i] === "$") {
      const fence: "$" | "$$" = content[i + 1] === "$" ? "$$" : "$";
      segs.push({ isMath: false, text: buf, fence: "$" });
      buf = "";
      i += fence.length;
      // Read until the matching unescaped fence.
      let math = "";
      while (i < n) {
        if (content[i] === "\\" && content[i + 1] === "$") {
          math += "\\$";
          i += 2;
          continue;
        }
        if (content[i] === "$") {
          const isDouble = content[i + 1] === "$";
          if (fence === "$$" && isDouble) {
            i += 2;
            break;
          }
          if (fence === "$") {
            i += 1;
            break;
          }
          // fence is $$ but only a single $ here — treat as literal.
          math += "$";
          i += 1;
          continue;
        }
        math += content[i];
        i += 1;
      }
      segs.push({ isMath: true, text: math, fence });
      continue;
    }
    buf += content[i];
    i += 1;
  }
  if (buf !== "") segs.push({ isMath: false, text: buf, fence: "$" });
  return segs;
}

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
          {preserveNewlines(normaliseCurrencyMath(content))}
        </ReactMarkdown>
      </div>
    );
  },
  (prev, next) => prev.content === next.content
);

export default MathContent;
