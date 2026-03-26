import { prisma } from "../lib/prisma";

async function main() {
  const questions = await prisma.question.findMany({
    where: { questionNumber: 8 },
    select: { id: true, part: true, content: true, imageUrl: true },
  });

  const q8a = questions.find((q) => q.part === "a");
  if (!q8a) { console.log("Q8a not found"); return; }

  // Fix content: insert [GRAPH] placeholder between preamble and the actual question
  const fixedContent = `Let $X$ be a continuous random variable with probability density function
$$f(x) = \\begin{cases} -4x\\log_e(x) & 0 < x \\leq 1 \\\\ 0 & \\text{elsewhere} \\end{cases}$$

Part of the graph of $f$ is shown below. The graph has a turning point at $x = \\dfrac{1}{e}$.

[GRAPH]

Show by differentiation that
$$\\dfrac{x^k}{k^2}\\left(k\\log_e(x) - 1\\right)$$
is an antiderivative of $x^{k-1}\\log_e(x)$, where $k$ is a positive real number.`;

  await prisma.question.update({
    where: { id: q8a.id },
    data: { content: fixedContent },
  });

  console.log("✅ Q8a content updated with [GRAPH] placeholder");
}

main().catch(console.error).finally(() => prisma.$disconnect());
