/**
 * Show full content of a question by id so we can decide how to fix it.
 * Usage: tsx inspect-finding.ts <id>
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

async function main() {
  const id = process.argv[2];
  const it = await prisma.questionSetItem.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      marks: true,
      content: true,
      preamble: true,
      parts: true,
      solutionContent: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      correctOption: true,
      topic: { select: { name: true } },
      subtopics: { select: { name: true } },
    },
  });
  if (!it) {
    console.log("not found");
    return;
  }
  console.log(`ID: ${it.id}`);
  console.log(`Type: ${it.type}, Marks: ${it.marks}`);
  console.log(`Topic: ${it.topic.name}`);
  console.log(`Subtopics: ${it.subtopics.map((s) => s.name).join(", ")}`);
  console.log();
  console.log("CONTENT:");
  console.log(it.content);
  if (it.preamble) {
    console.log("\nPREAMBLE:");
    console.log(it.preamble);
  }
  if (it.parts) {
    console.log("\nPARTS:");
    console.log(JSON.stringify(it.parts, null, 2));
  }
  if (it.type === "MCQ") {
    console.log("\nOPTIONS:");
    console.log(`A. ${it.optionA}`);
    console.log(`B. ${it.optionB}`);
    console.log(`C. ${it.optionC}`);
    console.log(`D. ${it.optionD}`);
    console.log(`Correct: ${it.correctOption}`);
  }
  if (it.solutionContent) {
    console.log("\nSOLUTION:");
    console.log(it.solutionContent);
  }
  await prisma.$disconnect();
}

main();
