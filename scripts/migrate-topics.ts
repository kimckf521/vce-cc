import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Migrating topics...\n");

  // ── 1. Rename "Functions and Graphs" → "Algebra, Number, and Structure" ──
  await prisma.topic.update({
    where: { id: "cmmuq9gcp000e5pjsa0l9l742" },
    data: {
      name: "Algebra, Number, and Structure",
      slug: "algebra-number-and-structure",
      description:
        "Identifying and analysing key features of mathematical models including polynomials, power, exponential, logarithmic, and circular (trigonometric) functions. Covers sketching graphs, transformations, domains and ranges, and composite and inverse functions.",
      order: 1,
    },
  });
  console.log("✅ Renamed 'Functions and Graphs' → 'Algebra, Number, and Structure'");

  // ── 2. Rename "Algebra" → "Functions, Relations, and Graphs" ──
  await prisma.topic.update({
    where: { id: "cmn63mova000e1zyi0vv8lukz" },
    data: {
      name: "Functions, Relations, and Graphs",
      slug: "functions-relations-and-graphs",
      description:
        "Algebraic tools for manipulating functions. Covers solving polynomial, exponential, logarithmic, and circular equations using analytical, graphical, and numerical methods (including Newton's method). Includes simultaneous equations and logarithm/exponent laws.",
      order: 2,
    },
  });
  console.log("✅ Renamed 'Algebra' → 'Functions, Relations, and Graphs'");

  // ── 3. Update Calculus description ──
  await prisma.topic.update({
    where: { id: "cmmuq9eru00015pjsmpbjocik" },
    data: {
      description:
        "Differential calculus: derivatives, chain/product/quotient rules, rates of change, and optimisation. Integral calculus: antiderivatives, area under a curve, the fundamental theorem of calculus, and numerical approximations (trapezium rule).",
      order: 3,
    },
  });
  console.log("✅ Updated 'Calculus' description");

  // ── 4. Rename "Probability" → "Data Analysis, Probability, and Statistics" ──
  await prisma.topic.update({
    where: { id: "cmmuq9h8w000l5pjsuia1hoc8" },
    data: {
      name: "Data Analysis, Probability, and Statistics",
      slug: "data-analysis-probability-and-statistics",
      description:
        "Probability distributions for discrete (Binomial and Bernoulli) and continuous (Normal and general) random variables. Statistical inference including sample proportions, confidence intervals for a population proportion, and sampling distributions.",
      order: 4,
    },
  });
  console.log("✅ Renamed 'Probability' → 'Data Analysis, Probability, and Statistics'");

  // ── 5. Merge Statistics' Normal Distribution into Probability's Normal Distribution ──
  // Stats Normal Distribution id: cmn5suodr000mxbu545kudph1 (5 questions)
  // Prob Normal Distribution id:  cmn63nkus000pm8c4t2xvy5dv (16 questions)
  const statsNDQs = await prisma.question.count({ where: { subtopicId: "cmn5suodr000mxbu545kudph1" } });
  await prisma.question.updateMany({
    where: { subtopicId: "cmn5suodr000mxbu545kudph1" },
    data: { subtopicId: "cmn63nkus000pm8c4t2xvy5dv" },
  });
  console.log(`✅ Moved ${statsNDQs} questions from Stats 'Normal Distribution' → Probability 'Normal Distribution'`);

  // Delete Stats Normal Distribution subtopic
  await prisma.subtopic.delete({ where: { id: "cmn5suodr000mxbu545kudph1" } });
  console.log("✅ Deleted Statistics 'Normal Distribution' subtopic");

  // ── 6. Move remaining Statistics subtopics to the merged topic ──
  const statsSubtopics = [
    "cmn5suoth000oxbu57yczjaff", // Sample Proportions
    "cmn5sup7t000qxbu50xpmy3b8", // Confidence Intervals
    "cmn5supis000sxbu5utaiml8d", // Continuous Distributions
    "cmn63nwtl00171edq13va4fr3", // Sampling
  ];
  await prisma.subtopic.updateMany({
    where: { id: { in: statsSubtopics } },
    data: { topicId: "cmmuq9h8w000l5pjsuia1hoc8" },
  });
  console.log("✅ Moved Sample Proportions, Confidence Intervals, Continuous Distributions, Sampling → merged topic");

  // Also move questions for those subtopics to the merged topic
  await prisma.question.updateMany({
    where: { subtopicId: { in: statsSubtopics } },
    data: { topicId: "cmmuq9h8w000l5pjsuia1hoc8" },
  });
  console.log("✅ Reassigned questions for those subtopics to merged topic");

  // ── 7. Delete the now-empty Statistics topic ──
  await prisma.topic.delete({ where: { id: "cmn5suo0w000kxbu5dms2hlri" } });
  console.log("✅ Deleted 'Statistics' topic");

  // ── 8. Verify ──
  console.log("\n📊 Final topic summary:");
  const topics = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { questions: true } }, subtopics: { orderBy: { name: "asc" } } },
  });
  topics.forEach((t) => {
    console.log(`  ${t.order}. ${t.name} (${t._count.questions} questions)`);
    t.subtopics.forEach((s) => console.log(`       • ${s.name}`));
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
