/**
 * Replace the LaTeX-line-break pattern "\\<newline>" with a real markdown
 * paragraph break ("\n\n") in all content/solution fields of an exam-set
 * JSON file. The General Exam 1 subagent used "\\" (which is a LaTeX
 * in-math-mode line break) in plain text, where it renders as visible
 * backslashes rather than a line break.
 *
 * Usage: tsx fix-backslash-linebreaks.ts <path-to-json>
 *        (writes back to the same file)
 */
import fs from "fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: fix-backslash-linebreaks <path>");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(file, "utf-8"));

function patch(s: string | null): string | null {
  if (!s) return s;
  // The string contains literal "\\<newline>" — two chars (backslash, newline)
  // after JSON parsing means \\\n in the file source. Replace with paragraph.
  // We use \n\n for clean rendering; markdown collapses extras.
  return s.replace(/\\\\\n/g, "\n\n");
}

let touched = 0;
for (const it of data.items as Record<string, unknown>[]) {
  const before =
    (it.content as string | null) + "|" + (it.solutionContent as string | null);
  it.content = patch(it.content as string | null);
  it.solutionContent = patch(it.solutionContent as string | null);
  if (Array.isArray(it.parts)) {
    for (const p of it.parts as Record<string, unknown>[]) {
      p.content = patch(p.content as string | null);
      p.solution = patch(p.solution as string | null);
      if (Array.isArray(p.subParts)) {
        for (const sp of p.subParts as Record<string, unknown>[]) {
          sp.content = patch(sp.content as string | null);
          sp.solution = patch(sp.solution as string | null);
        }
      }
    }
  }
  const after =
    (it.content as string | null) + "|" + (it.solutionContent as string | null);
  if (before !== after) touched++;
}

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log(`Patched ${touched} items in ${file}`);
