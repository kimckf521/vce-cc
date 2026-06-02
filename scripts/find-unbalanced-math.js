// Find QuestionSetItem rows whose math spans have unbalanced { } braces,
// which make KaTeX throw "Expected 'EOF', got '}'" on the practice/history pages.
//
// Run with the live DB env (matches the project's other scripts):
//   node --env-file=.env.local scripts/find-unbalanced-math.js
//
// CommonJS; requires the generated Prisma client directly.
const { PrismaClient } = require("./../node_modules/@prisma/client");

const prisma = new PrismaClient();

// Walk a markdown string and return every math span, following the SAME
// delimiter rules the renderer uses (see components/MathContent.tsx):
//   - `\$`  is an escaped dollar (currency), NOT a delimiter — skip it.
//   - `$$`  toggles display math.
//   - `$`   toggles inline math.
// Both `$` and `$$` toggle the same in/out state, exactly like the real pipeline.
function extractMathSpans(text) {
  const spans = [];
  let i = 0;
  let inMath = false;
  let start = -1;
  let display = false;
  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    // Escaped dollar = currency, never a delimiter.
    if (ch === "\\" && next === "$") {
      i += 2;
      continue;
    }

    if (ch === "$") {
      const isDouble = next === "$";
      if (!inMath) {
        inMath = true;
        display = isDouble;
        start = i + (isDouble ? 2 : 1);
      } else {
        spans.push({ text: text.slice(start, i), display, start, end: i });
        inMath = false;
      }
      i += isDouble ? 2 : 1;
      continue;
    }

    i += 1;
  }
  // Unterminated math span (odd number of delimiters) — a different bug, but
  // worth surfacing.
  if (inMath) {
    spans.push({ text: text.slice(start), display, start, end: text.length, unterminated: true });
  }
  return spans;
}

// Brace balance inside a single math span, matching how KaTeX groups:
//   `{`/`}` are grouping; `\{`/`\}` are literal brace glyphs (ignored);
//   a backslash escapes/starts a command, so the char after it never counts.
// Returns { depth, minDepth }. Unbalanced iff depth !== 0 OR minDepth < 0.
function braceBalance(span) {
  let depth = 0;
  let minDepth = 0;
  for (let i = 0; i < span.length; i++) {
    const ch = span[i];
    if (ch === "\\") {
      i += 1; // skip the escaped/command char (covers \{ \} \\ \$ \frac ...)
      continue;
    }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth < minDepth) minDepth = depth;
    }
  }
  return { depth, minDepth };
}

// Collect the string fields we want to check. Primary targets per the task are
// `content` and `solutionContent`; `preamble` and `parts` are scanned too so
// nothing slips through, each labelled with its field path.
function collectFields(item) {
  const fields = [];
  if (typeof item.content === "string") fields.push({ path: "content", value: item.content });
  if (typeof item.solutionContent === "string")
    fields.push({ path: "solutionContent", value: item.solutionContent });
  if (typeof item.preamble === "string") fields.push({ path: "preamble", value: item.preamble });

  // parts is a JSON array of { label, marks, content, solution, subParts? }.
  const parts = item.parts;
  if (Array.isArray(parts)) {
    parts.forEach((p, pi) => {
      if (p && typeof p.content === "string")
        fields.push({ path: `parts[${pi}].content`, value: p.content });
      if (p && typeof p.solution === "string")
        fields.push({ path: `parts[${pi}].solution`, value: p.solution });
      if (p && Array.isArray(p.subParts)) {
        p.subParts.forEach((sp, si) => {
          if (sp && typeof sp.content === "string")
            fields.push({ path: `parts[${pi}].subParts[${si}].content`, value: sp.content });
          if (sp && typeof sp.solution === "string")
            fields.push({ path: `parts[${pi}].subParts[${si}].solution`, value: sp.solution });
        });
      }
    });
  }
  return fields;
}

async function main() {
  const items = await prisma.questionSetItem.findMany({
    where: {
      questionSet: {
        isDefault: true,
        subject: { slug: "mathematical-methods" },
      },
    },
    select: {
      id: true,
      type: true,
      status: true,
      content: true,
      solutionContent: true,
      preamble: true,
      parts: true,
      questionSet: { select: { id: true, name: true, isDefault: true } },
    },
  });

  console.log(`Scanned ${items.length} questionSetItem rows (isDefault sets, mathematical-methods).\n`);

  const flagged = [];

  for (const item of items) {
    for (const field of collectFields(item)) {
      const spans = extractMathSpans(field.value);
      for (const span of spans) {
        const { depth, minDepth } = braceBalance(span.text);
        if (depth !== 0 || minDepth < 0 || span.unterminated) {
          flagged.push({ item, field, span, depth, minDepth });
        }
      }
    }
  }

  if (flagged.length === 0) {
    console.log("No unbalanced math spans found.");
  } else {
    console.log(`Found ${flagged.length} unbalanced math span(s):\n`);
    console.log("=".repeat(90));
    for (const f of flagged) {
      console.log(`Item id:    ${f.item.id}`);
      console.log(`Type/status:${f.item.type} / ${f.item.status}`);
      console.log(`Set:        ${f.item.questionSet?.name} (${f.item.questionSet?.id})`);
      console.log(`Field:      ${f.field.path}`);
      console.log(
        `Imbalance:  depth=${f.depth} minDepth=${f.minDepth}${f.span.unterminated ? " UNTERMINATED" : ""} (display=${f.span.display})`
      );
      console.log(`Bad span:   $${f.span.display ? "$" : ""}${f.span.text}${f.span.display ? "$" : ""}$`);
      console.log(`--- full ${f.field.path} ---`);
      console.log(f.field.value);
      console.log("=".repeat(90));
    }

    // Distinct items (the task expects two).
    const ids = [...new Set(flagged.map((f) => f.item.id))];
    console.log(`\nDistinct flagged items: ${ids.length}`);
    ids.forEach((id) => console.log(`  - ${id}`));
  }
}

// Exported for unit-testing the pure detection logic without touching the DB.
module.exports = { extractMathSpans, braceBalance, collectFields };

// Only hit the database when run directly (`node scripts/find-unbalanced-math.js`).
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
