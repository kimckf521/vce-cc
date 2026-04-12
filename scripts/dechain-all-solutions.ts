/**
 * Apply dechainSolution to every solutionContent in every qset JSON file.
 * Idempotent — re-running is a no-op.
 */
import fs from "fs";
import path from "path";
import { dechainSolution } from "./qset-helpers";

const OUT = path.resolve(__dirname, "output");

const files = fs
  .readdirSync(OUT)
  .filter((f) => f.startsWith("qset-") && f.endsWith(".json"))
  .map((f) => path.join(OUT, f));

let filesChanged = 0;
let itemsChanged = 0;

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  let changed = false;
  for (const bucket of ["mcq", "shortAnswer", "extendedResponse"] as const) {
    if (!data[bucket]) continue;
    for (const item of data[bucket]) {
      if (typeof item.solutionContent === "string") {
        const next = dechainSolution(item.solutionContent);
        if (next !== item.solutionContent) {
          item.solutionContent = next;
          changed = true;
          itemsChanged++;
        }
      }
    }
  }
  if (changed) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
    filesChanged++;
    console.log(`✏️  ${path.basename(file)}`);
  }
}

console.log(
  `\n✅ Dechained ${itemsChanged} solutions across ${filesChanged} files.`
);
