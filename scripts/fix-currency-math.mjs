/**
 * Fix QuestionSetItem fields whose currency markup throws KaTeX errors on the
 * practice/history pages, under the CURRENT working-tree components/MathContent.tsx
 * (which rewrites in-math `\$<digits>` to the HTML entity `&#36;`, pulling the
 * dollar OUT of the math span). Three fields across two non-default generated
 * sets were affected:
 *
 *   cmpmlq1qj… (vce-specialist) .content        — `$$2000$` style → `$\$2000$`
 *   cmpmvf6jj… (vce-general)    .parts[0].content — `\$$a$` style  → `$\$a$`, `\$13`→`$\$13$`
 *   cmpmvf6jj… (vce-general)    .parts[3].solution — `\mathbf{\$17}` (currency nested
 *       in a LaTeX group, which the renderer cannot handle — extracting the `\$17`
 *       orphans `\mathbf{`) → bold the answer via markdown instead: `=$ **\$17**.`
 *
 * IDEMPOTENT + SELF-VERIFYING: each field is first rendered through the real
 * MathContent pipeline; if it is already clean it is skipped, so re-running after
 * an earlier partial fix is safe. A fix is only written when the field currently
 * errors AND the corrected value renders with ZERO KaTeX errors
 * (no `.katex-error` span and no `color:#cc0000` soft-error span).
 *
 *   node --env-file=.env.local scripts/fix-currency-math.mjs        # dry-run
 *   APPLY=1 node --env-file=.env.local scripts/fix-currency-math.mjs
 */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const React = (await import("react")).default;
const { renderToStaticMarkup } = await import("react-dom/server");
const ReactMarkdown = (await import("react-markdown")).default;
const remarkMath = (await import("remark-math")).default;
const remarkBreaks = (await import("remark-breaks")).default;
const remarkGfm = (await import("remark-gfm")).default;
const rehypeKatex = (await import("rehype-katex")).default;
const { PrismaClient } = require("./../node_modules/@prisma/client");

const prisma = new PrismaClient();
const APPLY = process.env.APPLY === "1";

// ── verbatim pure fns from components/MathContent.tsx (working tree) ──────────
function splitByMath(content) {
  const segs = []; let i = 0; const n = content.length; let buf = "";
  while (i < n) {
    if (content[i] === "\\" && content[i + 1] === "$") { buf += "\\$"; i += 2; continue; }
    if (content[i] === "$") {
      const fence = content[i + 1] === "$" ? "$$" : "$";
      segs.push({ isMath: false, text: buf, fence: "$" }); buf = ""; i += fence.length;
      let math = "";
      while (i < n) {
        if (content[i] === "\\" && content[i + 1] === "$") { math += "\\$"; i += 2; continue; }
        if (content[i] === "$") {
          const d = content[i + 1] === "$";
          if (fence === "$$" && d) { i += 2; break; }
          if (fence === "$") { i += 1; break; }
          math += "$"; i += 1; continue;
        }
        math += content[i]; i += 1;
      }
      segs.push({ isMath: true, text: math, fence }); continue;
    }
    buf += content[i]; i += 1;
  }
  if (buf !== "") segs.push({ isMath: false, text: buf, fence: "$" });
  return segs;
}
function normaliseCurrencyMath(content) {
  const segments = splitByMath(content); let out = "";
  for (const seg of segments) {
    if (!seg.isMath) { out += seg.text.replace(/\\\$/g, "&#36;"); continue; }
    if (!/\\\$/.test(seg.text)) { out += seg.fence + seg.text + seg.fence; continue; }
    const tokenRe = /\\\$\s*([0-9][0-9,.]*)?/g; let last = 0; let m;
    while ((m = tokenRe.exec(seg.text)) !== null) {
      const before = seg.text.slice(last, m.index);
      if (before.trim() !== "") out += seg.fence + before + seg.fence;
      out += "&#36;" + (m[1] ?? ""); last = tokenRe.lastIndex;
    }
    const after = seg.text.slice(last);
    if (after.trim() !== "") out += seg.fence + after + seg.fence;
  }
  return out;
}
function preserveNewlines(content) {
  const out = []; const segments = content.split(/(\$\$[\s\S]*?\$\$)/g);
  for (const seg of segments) {
    if (seg.startsWith("$$") && seg.endsWith("$$")) { out.push(seg); continue; }
    const lines = seg.split("\n"); const result = []; let prevWasTable = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]; const isTable = /^\s*\|/.test(line);
      if (isTable) { if (!prevWasTable && result.length > 0) result.push(""); result.push(line); prevWasTable = true; }
      else { if (prevWasTable) { result.push(""); prevWasTable = false; } result.push(line.trim().length === 0 ? "   " : line + "  "); }
    }
    out.push(result.join("\n"));
  }
  return out.join("");
}
// ─────────────────────────────────────────────────────────────────────────────

// A field is "broken" if the real pipeline emits ANY of:
//   e = KaTeX hard error (.katex-error span)
//   r = KaTeX soft error (color:#cc0000 span)
//   p = prose captured into math — a `.katex` whose TeX annotation contains
//       English prose / markdown (the visible symptom of `$` delimiter
//       mis-pairing, which throws NO error but renders prose as math italics).
function renderErrors(content) {
  if (typeof content !== "string" || !content.includes("$")) return { e: 0, r: 0, p: 0 };
  const html = renderToStaticMarkup(
    React.createElement(ReactMarkdown,
      { remarkPlugins: [remarkMath, remarkBreaks, remarkGfm], rehypePlugins: [rehypeKatex], urlTransform: (u) => u },
      preserveNewlines(normaliseCurrencyMath(content))),
  );
  // KaTeX embeds the source TeX in <annotation encoding="application/x-tex">…</annotation>.
  const annotations = Array.from(html.matchAll(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)).map((m) => m[1]);
  const proseMarkers = /\b(marks?|Step|Reject|evidence|Answer|mark|Total|Mean|Per|prefer|owner|sample|tailed|reject)\b|\*\*/i;
  const p = annotations.filter((a) => proseMarkers.test(a)).length;
  return {
    e: (html.match(/class="[^"]*katex-error[^"]*"/g) || []).length,
    r: (html.match(/color:\s*#cc0000/g) || []).length,
    p,
  };
}

// Apply ordered literal replacements; only those whose `old` is present are applied.
function applyReplacements(value, repls) {
  let out = value;
  for (const [oldT, newT] of repls) if (out.includes(oldT)) out = out.split(oldT).join(newT);
  return out;
}

const FIXES = [
  { id: "cmpmlq1qj000tg9l4f9injvm8", label: "specialist coffee-shop", field: "content",
    repls: [["$$2000$", "$\\$2000$"], ["$$2100$", "$\\$2100$"], ["$$300$", "$\\$300$"]] },
  // Solution has a BARE `$2000` (currency without a backslash) — a stray, unmatched
  // delimiter that makes the `$` count odd and swallows the rest of the solution into
  // math. Escape it so it's currency (`&#36;2000`) and every later `$` re-pairs.
  { id: "cmpmlq1qj000tg9l4f9injvm8", label: "specialist coffee-shop sol.", field: "solutionContent",
    repls: [["exceeds $2000.", "exceeds \\$2000."]] },
  { id: "cmpmvf6jj008ronnf4ukvai6s", label: "general fruit-vendor a.", field: "parts[0].content",
    repls: [["\\$$a$", "$\\$a$"], ["\\$$b$", "$\\$b$"], ["\\$13", "$\\$13$"], ["\\$17", "$\\$17$"]] },
  // Currency nested in \mathbf{} can't survive the in-math `\$`-extraction; bold via markdown.
  { id: "cmpmvf6jj008ronnf4ukvai6s", label: "general fruit-vendor d.", field: "parts[3].solution",
    repls: [["= \\mathbf{\\$17}$.", "=$ **\\$17**."]] },
  // Same item's aggregate solutionContent embeds the same broken part-d token.
  { id: "cmpmvf6jj008ronnf4ukvai6s", label: "general fruit-vendor d. (aggregate)", field: "solutionContent",
    repls: [["= \\mathbf{\\$17}$.", "=$ **\\$17**."]] },
];

function getField(it, field) {
  if (field === "content") return it.content;
  if (field === "solutionContent") return it.solutionContent;
  const m = field.match(/^parts\[(\d+)\]\.(content|solution)$/);
  if (m) return it.parts?.[Number(m[1])]?.[m[2]];
  return undefined;
}

async function main() {
  console.log(APPLY ? ">>> APPLY MODE\n" : ">>> DRY-RUN (set APPLY=1 to write)\n");
  for (const fix of FIXES) {
    const it = await prisma.questionSetItem.findUnique({
      where: { id: fix.id }, select: { id: true, content: true, solutionContent: true, parts: true },
    });
    if (!it) { console.log(`SKIP ${fix.id} ${fix.field} — item not found`); continue; }
    const cur = getField(it, fix.field);
    if (typeof cur !== "string") { console.log(`SKIP ${fix.id} ${fix.field} — field missing`); continue; }

    const before = renderErrors(cur);
    if (before.e === 0 && before.r === 0 && before.p === 0) {
      console.log(`ALREADY-CLEAN ${fix.id.slice(0, 8)} ${fix.field} (${fix.label}) — skipped`);
      continue;
    }
    const fixed = applyReplacements(cur, fix.repls);
    const after = renderErrors(fixed);
    console.log(`FIX ${fix.id.slice(0, 8)} ${fix.field} (${fix.label}): before(e=${before.e},r=${before.r},p=${before.p}) -> after(e=${after.e},r=${after.r},p=${after.p})`);
    if (fixed === cur) { console.log(`   !! no replacement matched — leaving untouched`); continue; }
    if (after.e !== 0 || after.r !== 0 || after.p !== 0) { console.log(`   !! refusing to write — still broken`); continue; }

    if (APPLY) {
      if (fix.field === "content") {
        await prisma.questionSetItem.update({ where: { id: fix.id }, data: { content: fixed } });
      } else if (fix.field === "solutionContent") {
        await prisma.questionSetItem.update({ where: { id: fix.id }, data: { solutionContent: fixed } });
      } else {
        const m = fix.field.match(/^parts\[(\d+)\]\.(content|solution)$/);
        const parts = JSON.parse(JSON.stringify(it.parts));
        parts[Number(m[1])][m[2]] = fixed;
        await prisma.questionSetItem.update({ where: { id: fix.id }, data: { parts } });
      }
      console.log("   WROTE.");
    } else {
      console.log("   (dry-run) would write — renders 0 errors.");
    }
  }
}
main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
