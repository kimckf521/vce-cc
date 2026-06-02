/**
 * Faithful KaTeX-error scanner for QuestionSetItem content.
 *
 * Renders each field through the SAME stack as components/MathContent.tsx —
 * the real <ReactMarkdown> with [remarkMath, remarkBreaks, remarkGfm] +
 * [rehypeKatex], fed by the CURRENT working-tree normaliseCurrencyMath /
 * splitByMath / preserveNewlines (copied verbatim below) — via
 * renderToStaticMarkup, then flags fields whose HTML contains EITHER:
 *   - a `.katex-error` span  (hard error: both KaTeX render attempts failed), or
 *   - a `color:#cc0000` span (soft error: KaTeX rendered an undefined command red)
 *
 * Usage:
 *   node --env-file=.env.local scripts/scan-math-errors.mjs            # whole DB
 *   node --env-file=.env.local scripts/scan-math-errors.mjs methods    # methods default set only
 *   node --env-file=.env.local scripts/scan-math-errors.mjs selftest   # probes only, no DB
 */
import { createRequire } from "module";
import fs from "fs";
const require = createRequire(import.meta.url);
const React = (await import("react")).default;
const { renderToStaticMarkup } = await import("react-dom/server");
const ReactMarkdown = (await import("react-markdown")).default;
const remarkMath = (await import("remark-math")).default;
const remarkBreaks = (await import("remark-breaks")).default;
const remarkGfm = (await import("remark-gfm")).default;
const rehypeKatex = (await import("rehype-katex")).default;

// ─── verbatim from components/MathContent.tsx (working tree) ──────────────────
function normaliseCurrencyMath(content) {
  const segments = splitByMath(content);
  let out = "";
  for (const seg of segments) {
    if (!seg.isMath) { out += seg.text.replace(/\\\$/g, "&#36;"); continue; }
    if (!/\\\$/.test(seg.text)) { out += seg.fence + seg.text + seg.fence; continue; }
    const tokenRe = /\\\$\s*([0-9][0-9,.]*)?/g;
    let last = 0; let m;
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
function splitByMath(content) {
  const segs = [];
  let i = 0; const n = content.length; let buf = "";
  while (i < n) {
    if (content[i] === "\\" && content[i + 1] === "$") { buf += "\\$"; i += 2; continue; }
    if (content[i] === "$") {
      const fence = content[i + 1] === "$" ? "$$" : "$";
      segs.push({ isMath: false, text: buf, fence: "$" });
      buf = ""; i += fence.length;
      let math = "";
      while (i < n) {
        if (content[i] === "\\" && content[i + 1] === "$") { math += "\\$"; i += 2; continue; }
        if (content[i] === "$") {
          const isDouble = content[i + 1] === "$";
          if (fence === "$$" && isDouble) { i += 2; break; }
          if (fence === "$") { i += 1; break; }
          math += "$"; i += 1; continue;
        }
        math += content[i]; i += 1;
      }
      segs.push({ isMath: true, text: math, fence });
      continue;
    }
    buf += content[i]; i += 1;
  }
  if (buf !== "") segs.push({ isMath: false, text: buf, fence: "$" });
  return segs;
}
function preserveNewlines(content) {
  const out = [];
  const segments = content.split(/(\$\$[\s\S]*?\$\$)/g);
  for (const seg of segments) {
    if (seg.startsWith("$$") && seg.endsWith("$$")) { out.push(seg); continue; }
    const lines = seg.split("\n");
    const result = []; let prevWasTable = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isTable = /^\s*\|/.test(line);
      if (isTable) {
        if (!prevWasTable && result.length > 0) result.push("");
        result.push(line); prevWasTable = true;
      } else {
        if (prevWasTable) { result.push(""); prevWasTable = false; }
        if (line.trim().length === 0) result.push("   ");
        else result.push(line + "  ");
      }
    }
    out.push(result.join("\n"));
  }
  return out.join("");
}
// ─────────────────────────────────────────────────────────────────────────────

// Render content exactly as MathContent does, return error signatures.
function renderErrors(content) {
  if (typeof content !== "string" || !content.includes("$")) return { errClass: 0, red: 0, titles: [] };
  let html;
  try {
    html = renderToStaticMarkup(
      React.createElement(
        ReactMarkdown,
        { remarkPlugins: [remarkMath, remarkBreaks, remarkGfm], rehypePlugins: [rehypeKatex], urlTransform: (u) => u },
        preserveNewlines(normaliseCurrencyMath(content)),
      ),
    );
  } catch (e) {
    return { errClass: 1, red: 0, titles: ["RENDER_THREW: " + (e.message || String(e)).split("\n")[0]] };
  }
  const errClass = (html.match(/class="[^"]*katex-error[^"]*"/g) || []).length;
  const red = (html.match(/color:\s*#cc0000/g) || []).length;
  const titles = Array.from(html.matchAll(/title="([^"]*)"/g)).map((m) => m[1]).filter((t) => /rror|EOF|Undefined|Unexpected/.test(t)).slice(0, 3);
  return { errClass, red, titles };
}

// Controlled probes — must match the live browser DOM exactly.
const PROBES = [
  ["raw-dollar-in-math", "Probe A: $\\$2000$ end", { errClass: 0, red: 0 }],
  ["textdollar-in-math", "Probe B: $\\textdollar 2000$ end", { errClass: 0, red: 2 }],
  ["mathbf-rawdollar", "Probe C: $\\mathbf{\\$17}$ end", { errClass: 2, red: 2 }],
  ["mathbf-textdollar", "Probe D: $\\mathbf{\\textdollar 17}$ end", { errClass: 0, red: 2 }],
  ["stray-brace", "Probe E: $\\binom{30}{x}}$ end", { errClass: 1, red: 1 }],
  ["good-math", "Probe F: $x^2 + 3x - 4 = 0$ end", { errClass: 0, red: 0 }],
];
function selftest() {
  let pass = 0;
  const rows = [];
  for (const [id, content, exp] of PROBES) {
    const r = renderErrors(content);
    const ok = r.errClass === exp.errClass && r.red === exp.red;
    pass += ok ? 1 : 0;
    rows.push(`${ok ? "PASS" : "FAIL"} ${id}: got(errClass=${r.errClass},red=${r.red}) exp(errClass=${exp.errClass},red=${exp.red})`);
  }
  return { pass, total: PROBES.length, rows };
}

function fieldsOf(it) {
  const f = [];
  const push = (k, v) => { if (typeof v === "string" && v.includes("$")) f.push([k, v]); };
  push("content", it.content);
  push("solutionContent", it.solutionContent);
  push("preamble", it.preamble);
  for (const k of ["optionA", "optionB", "optionC", "optionD"]) push(k, it[k]);
  if (it.type === "MCQ" && it.optionA) {
    push("content+options", `${it.content}\n\n**A.** ${it.optionA}\n\n**B.** ${it.optionB ?? ""}\n\n**C.** ${it.optionC ?? ""}\n\n**D.** ${it.optionD ?? ""}`);
  }
  if (Array.isArray(it.parts)) it.parts.forEach((p, pi) => {
    push(`parts[${pi}].content`, p?.content);
    push(`parts[${pi}].solution`, p?.solution);
    if (Array.isArray(p?.subParts)) p.subParts.forEach((sp, si) => {
      push(`parts[${pi}].subParts[${si}].content`, sp?.content);
      push(`parts[${pi}].subParts[${si}].solution`, sp?.solution);
    });
  });
  return f;
}

const mode = process.argv[2] || "all";

const st = selftest();
console.log(`SELF-TEST: ${st.pass}/${st.total} probes match live browser`);
st.rows.forEach((r) => console.log("  " + r));
if (st.pass !== st.total) {
  console.log("\n!! Self-test FAILED — detector does not match the real renderer. Aborting DB scan.");
  process.exit(2);
}
if (mode === "selftest") process.exit(0);

const { PrismaClient } = require("./../node_modules/@prisma/client");
const prisma = new PrismaClient();
const where = mode === "methods"
  ? { questionSet: { isDefault: true, subject: { slug: "mathematical-methods" } } }
  : {};
const items = await prisma.questionSetItem.findMany({
  where,
  select: { id: true, type: true, content: true, solutionContent: true, preamble: true, parts: true,
            optionA: true, optionB: true, optionC: true, optionD: true,
            questionSet: { select: { name: true, isDefault: true, archived: true, subject: { select: { slug: true } } } } },
});
console.log(`\nScanning ${items.length} items (mode=${mode}) through the REAL MathContent stack...`);
const flagged = [];
let done = 0;
for (const it of items) {
  for (const [field, value] of fieldsOf(it)) {
    const r = renderErrors(value);
    if (r.errClass > 0 || r.red > 0) {
      const q = it.questionSet;
      flagged.push({ id: it.id, subj: q?.subject?.slug, set: q?.name, isDefault: q?.isDefault, archived: q?.archived,
                     field, errClass: r.errClass, red: r.red, titles: r.titles, sample: value.slice(0, 180) });
    }
  }
  if (++done % 1000 === 0) console.log(`  ...${done}/${items.length}`);
}
const result = { mode, scanned: items.length, flaggedFields: flagged.length, flaggedItems: new Set(flagged.map((f) => f.id)).size, flagged };
fs.writeFileSync(new URL("./scan-math-errors.out.json", import.meta.url), JSON.stringify(result, null, 2));
console.log(`\nDONE: ${result.flaggedFields} flagged field(s) across ${result.flaggedItems} item(s). Full results -> scripts/scan-math-errors.out.json`);
// also print a compact summary grouped by item
const byItem = {};
for (const f of flagged) (byItem[f.id] ??= []).push(f);
for (const [id, fs2] of Object.entries(byItem)) {
  const q = fs2[0];
  console.log(`\n${id}  [${q.subj}] set="${q.set}" default=${q.isDefault} archived=${q.archived}`);
  for (const f of fs2) console.log(`   ${f.field}: errClass=${f.errClass} red=${f.red} ${JSON.stringify(f.titles)}`);
}
await prisma.$disconnect();
