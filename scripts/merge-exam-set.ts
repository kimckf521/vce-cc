/**
 * Merge multiple exam-set JSON chunks into one combined file, in order.
 *
 * Usage: tsx merge-exam-set.ts <out.json> <chunk1.json> <chunk2.json> ...
 */
import fs from "fs";

const args = process.argv.slice(2);
const out = args[0];
const inputs = args.slice(1);
if (!out || inputs.length === 0) {
  console.error("Usage: merge-exam-set <out.json> <chunk1.json> ...");
  process.exit(1);
}

let merged: { subject_slug: string; question_set_id: string; items: unknown[] } = {
  subject_slug: "",
  question_set_id: "",
  items: [],
};

let runningOrder = 0;
for (const f of inputs) {
  const data = JSON.parse(fs.readFileSync(f, "utf-8"));
  if (!merged.subject_slug) merged.subject_slug = data.subject_slug;
  if (!merged.question_set_id) merged.question_set_id = data.question_set_id;
  if (data.subject_slug !== merged.subject_slug) {
    console.error(`Subject mismatch in ${f}`);
    process.exit(1);
  }
  // Re-number `order` to be unique across the merged file (each chunk
  // numbered from 0 within itself).
  for (const item of data.items as { order: number }[]) {
    item.order = runningOrder++;
    merged.items.push(item);
  }
  console.log(`+ ${f}: ${data.items.length} items`);
}

fs.writeFileSync(out, JSON.stringify(merged, null, 2));
console.log(`✓ Wrote ${merged.items.length} merged items to ${out}`);
