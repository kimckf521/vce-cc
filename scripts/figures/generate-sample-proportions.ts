/** Wave 1 batch 18: Sample Proportions & Sampling ext-resp. */
import * as fs from "fs";
import * as path from "path";
import { bellCurve, toDataUri } from "./svg";

const DIR = "scripts/output/figures/sample-proportions";
const OUT = "scripts/output/qset-methods-b2-sample-proportions-and-sampling.json";
fs.mkdirSync(DIR, { recursive: true });

const fig1 = bellCurve({
  mean: 0.4,
  sd: 0.049,
  xLabel: "p̂",
  markedValues: [0.3, 0.4, 0.5],
});

const fig2 = bellCurve({
  mean: 0.6,
  sd: 0.044,
  shadedFrom: 0.55,
  shadedTo: 0.65,
  xLabel: "p̂",
  markedValues: [0.5, 0.55, 0.6, 0.65, 0.7],
});

const fig3 = bellCurve({
  mean: 0.25,
  sd: 0.0306,
  shadedFrom: 0.30,
  shadedTo: 0.40,
  xLabel: "p̂",
  markedValues: [0.2, 0.25, 0.30, 0.35],
});

const fig4 = bellCurve({
  mean: 0.5,
  sd: 0.0224,
  shadedFrom: 0.456,
  shadedTo: 0.544,
  xLabel: "p̂",
  markedValues: [0.45, 0.456, 0.5, 0.544, 0.55],
});

const figs = { "sample-prop-mean.svg": fig1, "p-hat-range.svg": fig2, "tail-prob.svg": fig3, "central-limit.svg": fig4 };
for (const [n, c] of Object.entries(figs)) fs.writeFileSync(path.join(DIR, n), c);
const img = (n: string, a: string) => `![${a}](${toDataUri(figs[n as keyof typeof figs])})`;

const questions = [
  {
    content: `A particular trait occurs in a population with true proportion $p = 0.4$. A random sample of $n = 100$ individuals is taken. Let $\\hat{P}$ be the sample proportion having the trait.

**a.** State the mean and variance of $\\hat{P}$. (3 marks)

**b.** State the standard deviation of $\\hat{P}$, correct to 4 decimal places. (1 mark)

**c.** Using the normal approximation, find $P(\\hat{P} > 0.5)$, correct to 4 decimal places. (3 marks)

**d.** Find $P(0.35 < \\hat{P} < 0.45)$, correct to 4 decimal places. (3 marks)

${img("sample-prop-mean.svg", "Approximate sampling distribution of p-hat for n = 100, p = 0.4, centred at 0.4 with standard deviation about 0.049")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* $E[\\hat{P}] = p = 0.4$.
*Step 2 (1 mark):* $\\text{Var}(\\hat{P}) = \\dfrac{p(1 - p)}{n}$.
*Step 3 (1 mark):* $= \\dfrac{0.4 \\times 0.6}{100} = 0.0024$.

**b. (1 mark)** $\\sigma_{\\hat{P}} = \\sqrt{0.0024} \\approx 0.0490$.

**c. (3 marks)**
*Step 1 (1 mark):* Standardise: $z = \\dfrac{0.5 - 0.4}{0.0490} \\approx 2.041$.
*Step 2 (1 mark):* $P(\\hat{P} > 0.5) = P(Z > 2.041)$.
*Step 3 (1 mark):* $\\approx 0.0206$.

**d. (3 marks)**
*Step 1 (1 mark):* $z_1 = \\dfrac{0.35 - 0.4}{0.0490} \\approx -1.021$; $z_2 = \\dfrac{0.45 - 0.4}{0.0490} \\approx 1.021$.
*Step 2 (1 mark):* $P(-1.021 < Z < 1.021) = \\Phi(1.021) - \\Phi(-1.021)$.
*Step 3 (1 mark):* $\\approx 0.8463 - 0.1537 = 0.6926$.`,
    subtopicSlugs: ["sample-proportions-and-sampling", "normal-distribution"],
  },
  {
    content: `In a population, $60\\%$ of households own a pet. A random sample of $n = 125$ households is taken. Let $\\hat{P}$ be the sample proportion.

**a.** State the mean and standard deviation of $\\hat{P}$ (sd to 4 decimal places). (3 marks)

**b.** Find $P(\\hat{P} > 0.65)$, correct to 4 decimal places. (3 marks)

**c.** Find $P(0.55 < \\hat{P} < 0.65)$, correct to 4 decimal places. (3 marks)

**d.** Find the value $c$ such that $P(\\hat{P} > c) = 0.10$, correct to 4 decimal places. (2 marks)

${img("p-hat-range.svg", "Sampling distribution of p-hat for n = 125, p = 0.6, with the central region from 0.55 to 0.65 shaded")}`,
    marks: 11,
    difficulty: "MEDIUM",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* $E[\\hat{P}] = 0.60$.
*Step 2 (1 mark):* $\\text{Var}(\\hat{P}) = \\dfrac{0.6 \\times 0.4}{125} = 0.00192$.
*Step 3 (1 mark):* $\\sigma \\approx 0.0438$.

**b. (3 marks)**
*Step 1 (1 mark):* $z = \\dfrac{0.65 - 0.60}{0.0438} \\approx 1.141$.
*Step 2 (1 mark):* $P(Z > 1.141) \\approx 1 - 0.873$.
*Step 3 (1 mark):* $\\approx 0.1270$.

**c. (3 marks)**
*Step 1 (1 mark):* $z_1 = -1.141$, $z_2 = 1.141$.
*Step 2 (1 mark):* By symmetry, $P(-1.141 < Z < 1.141) = 2 \\Phi(1.141) - 1$.
*Step 3 (1 mark):* $\\approx 2(0.8730) - 1 = 0.7460$.

**d. (2 marks)**
*Step 1 (1 mark):* $P(Z > z^*) = 0.10 \\Rightarrow z^* \\approx 1.2816$.
*Step 2 (1 mark):* $c = 0.60 + 1.2816 \\times 0.0438 \\approx 0.6561$.`,
    subtopicSlugs: ["sample-proportions-and-sampling", "normal-distribution"],
  },
  {
    content: `In a city, $25\\%$ of adults use public transport daily. A random sample of $n = 200$ adults is selected.

**a.** State the distribution of $X$, the number of public transport users in the sample, and find $E[X]$, $\\text{Var}(X)$. (4 marks)

**b.** State the approximate distribution of $\\hat{P} = X/200$, including its mean and standard deviation (sd to 4 decimal places). (3 marks)

**c.** Find $P(\\hat{P} > 0.30)$ using the normal approximation, correct to 4 decimal places. (3 marks)

**d.** Find $P(0.30 \\leq \\hat{P} \\leq 0.40)$, correct to 4 decimal places. (2 marks)

${img("tail-prob.svg", "Sampling distribution of p-hat for n = 200, p = 0.25, with the right tail from 0.30 to 0.40 shaded")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (4 marks)**
*Step 1 (1 mark):* $X \\sim \\text{Bin}(200, 0.25)$.
*Step 2 (1 mark):* $E[X] = n p = 50$.
*Step 3 (1 mark):* $\\text{Var}(X) = n p (1 - p) = 200 \\times 0.25 \\times 0.75$.
*Step 4 (1 mark):* $= 37.5$.

**b. (3 marks)**
*Step 1 (1 mark):* $\\hat{P} \\approx N\\left(p, \\dfrac{p(1-p)}{n}\\right)$ for large $n$.
*Step 2 (1 mark):* Mean $= 0.25$; Variance $= \\dfrac{0.25 \\times 0.75}{200} = 0.0009375$.
*Step 3 (1 mark):* Sd $\\approx 0.0306$.

**c. (3 marks)**
*Step 1 (1 mark):* $z = \\dfrac{0.30 - 0.25}{0.0306} \\approx 1.633$.
*Step 2 (1 mark):* $P(Z > 1.633) \\approx 1 - 0.9487$.
*Step 3 (1 mark):* $\\approx 0.0513$.

**d. (2 marks)**
*Step 1 (1 mark):* $z_2 = \\dfrac{0.40 - 0.25}{0.0306} \\approx 4.900$, so $P(Z > 4.9) \\approx 0$.
*Step 2 (1 mark):* $P(0.30 \\leq \\hat{P} \\leq 0.40) \\approx 0.0513 - 0 \\approx 0.0513$.`,
    subtopicSlugs: ["sample-proportions-and-sampling", "binomial-distribution", "normal-distribution"],
  },
  {
    content: `A factory claims its defect rate is $p = 0.5\\%$ for a particular component, but a quality engineer suspects this is too low. A sample of $n = 500$ components is inspected.

**a.** Wait — the question intent uses $p = 0.5$, a population proportion of $50\\%$ (e.g. defective vs non-defective). Let $\\hat{P}$ be the sample proportion of "defective" items in a sample of $n = 500$ if the true proportion is $p = 0.5$. State the mean and standard deviation of $\\hat{P}$ (sd to 4 decimal places). (3 marks)

**b.** Use the central limit theorem to justify why $\\hat{P}$ is approximately normal. (2 marks)

**c.** Find $P(\\hat{P} > 0.55)$, correct to 4 decimal places. (3 marks)

**d.** Find $P(|\\hat{P} - 0.5| < 0.044)$, correct to 4 decimal places. (2 marks)

**e.** A new sample yields $\\hat{p} = 0.55$. Is this surprising? Comment briefly. (2 marks)

${img("central-limit.svg", "Sampling distribution of p-hat for n = 500, p = 0.5, centred at 0.5 with standard deviation about 0.0224, with the 95 percent central region from 0.456 to 0.544 shaded")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* $E[\\hat{P}] = p = 0.5$.
*Step 2 (1 mark):* $\\text{Var}(\\hat{P}) = \\dfrac{0.5 \\times 0.5}{500} = 0.0005$.
*Step 3 (1 mark):* Sd $= \\sqrt{0.0005} \\approx 0.0224$.

**b. (2 marks)**
*Step 1 (1 mark):* $\\hat{P}$ is the sample mean of $n$ i.i.d. Bernoulli trials.
*Step 2 (1 mark):* By the CLT, for large $n$ the sample mean is approximately normally distributed regardless of the parent distribution.

**c. (3 marks)**
*Step 1 (1 mark):* $z = \\dfrac{0.55 - 0.5}{0.0224} \\approx 2.232$.
*Step 2 (1 mark):* $P(Z > 2.232) \\approx 1 - 0.9872$.
*Step 3 (1 mark):* $\\approx 0.0128$.

**d. (2 marks)**
*Step 1 (1 mark):* $z = \\dfrac{0.044}{0.0224} \\approx 1.964$, so $P(|Z| < 1.964) \\approx 2 \\Phi(1.964) - 1$.
*Step 2 (1 mark):* $\\approx 2(0.9752) - 1 = 0.9504 \\approx 0.95$.

**e. (2 marks)**
*Step 1 (1 mark):* $\\hat{p} = 0.55$ corresponds to $z \\approx 2.23$, giving tail probability $\\approx 1.3\\%$.
*Step 2 (1 mark):* This is unusual — if the true $p$ is $0.5$, observing $\\hat{P} \\geq 0.55$ would happen by chance in only about $1$ in $77$ samples.`,
    subtopicSlugs: ["sample-proportions-and-sampling", "normal-distribution", "binomial-distribution"],
  },
];

const output = { mcq: [], shortAnswer: [], extendedAnswer: [], extendedResponse: questions };
fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");
console.log(`${OUT}: ${questions.length} questions, ${questions.reduce((s, q) => s + q.marks, 0)} marks`);
