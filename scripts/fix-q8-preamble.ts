import { prisma } from "../lib/prisma";

async function main() {
  const questions = await prisma.question.findMany({
    where: { questionNumber: 8 },
    select: { id: true, part: true },
  });

  const q8a = questions.find((q) => q.part === "a");
  if (!q8a) { console.log("Q8a not found"); return; }

  // Preamble goes at the top of the card (shared across all parts)
  // Use ---PREAMBLE--- marker so QuestionGroup can extract and render it separately
  const fixedContent = `---PREAMBLE---
Let $X$ be a continuous random variable with probability density function
$$f(x) = \\begin{cases} -4x\\log_e(x) & 0 < x \\leq 1 \\\\ 0 & \\text{elsewhere} \\end{cases}$$

Part of the graph of $f$ is shown below. The graph has a turning point at $x = \\dfrac{1}{e}$.

[GRAPH]
---QUESTION---
Show by differentiation that
$$\\dfrac{x^k}{k^2}\\left(k\\log_e(x) - 1\\right)$$
is an antiderivative of $x^{k-1}\\log_e(x)$, where $k$ is a positive real number.`;

  await prisma.question.update({
    where: { id: q8a.id },
    data: { content: fixedContent },
  });

  console.log("✅ Q8a updated with preamble marker");
}

main().catch(console.error).finally(() => prisma.$disconnect());
