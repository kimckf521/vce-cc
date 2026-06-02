/** Wave 1 batch 17: Confidence Intervals ext-resp. */
import * as fs from "fs";
import * as path from "path";
import { bellCurve, toDataUri } from "./svg";

const DIR = "scripts/output/figures/confidence-intervals";
const OUT = "scripts/output/qset-methods-b2-confidence-intervals.json";
fs.mkdirSync(DIR, { recursive: true });

const fig1 = bellCurve({
  mean: 0.6,
  sd: 0.049,
  shadedFrom: 0.504,
  shadedTo: 0.696,
  xLabel: "p̂",
  markedValues: [0.4, 0.5, 0.504, 0.6, 0.696, 0.8],
});

const fig2 = bellCurve({
  mean: 0.45,
  sd: 0.035,
  shadedFrom: 0.382,
  shadedTo: 0.518,
  xLabel: "p̂",
  markedValues: [0.35, 0.382, 0.45, 0.518, 0.55],
});

const fig3 = bellCurve({
  mean: 0.7,
  sd: 0.0648,
  shadedFrom: 0.573,
  shadedTo: 0.827,
  xLabel: "p̂",
  markedValues: [0.5, 0.573, 0.7, 0.827, 0.9],
});

const fig4 = bellCurve({
  mean: 0.5,
  sd: 0.0224,
  shadedFrom: 0.456,
  shadedTo: 0.544,
  xLabel: "p̂",
  markedValues: [0.45, 0.456, 0.5, 0.544, 0.55],
});

const figs = { "ci-95.svg": fig1, "ci-95-smaller.svg": fig2, "ci-95-small-n.svg": fig3, "ci-95-large-n.svg": fig4 };
for (const [n, c] of Object.entries(figs)) fs.writeFileSync(path.join(DIR, n), c);
const img = (n: string, a: string) => `![${a}](${toDataUri(figs[n as keyof typeof figs])})`;

const questions = [
  {
    content: `A survey of $n = 100$ randomly chosen voters found that $60$ supported a particular candidate. Construct a $95\\%$ approximate confidence interval for the true population proportion $p$ of supporters.

**a.** State $\\hat{p}$, the sample proportion. (1 mark)

**b.** Find the standard error of $\\hat{p}$, correct to 4 decimal places. (3 marks)

**c.** Construct a $95\\%$ confidence interval for $p$, correct to 3 decimal places at each end. (4 marks)

**d.** Interpret the interval in context. (2 marks)

${img("ci-95.svg", "Sampling distribution of p-hat centred at 0.6 with standard deviation about 0.049, with the 95 percent CI from 0.504 to 0.696 shaded")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (1 mark)** $\\hat{p} = 60/100 = 0.60$.

**b. (3 marks)**
*Step 1 (1 mark):* Standard error formula: $\\text{SE}(\\hat{p}) = \\sqrt{\\dfrac{\\hat{p}(1 - \\hat{p})}{n}}$.
*Step 2 (1 mark):* $= \\sqrt{\\dfrac{0.6 \\times 0.4}{100}} = \\sqrt{0.0024}$.
*Step 3 (1 mark):* $\\approx 0.0490$.

**c. (4 marks)**
*Step 1 (1 mark):* $95\\%$ CI: $\\hat{p} \\pm 1.96 \\times \\text{SE}$.
*Step 2 (1 mark):* Margin $= 1.96 \\times 0.0490 \\approx 0.0960$.
*Step 3 (1 mark):* Lower: $0.60 - 0.0960 = 0.504$.
*Step 4 (1 mark):* Upper: $0.60 + 0.0960 = 0.696$. CI: $(0.504, 0.696)$.

**d. (2 marks)**
*Step 1 (1 mark):* We are $95\\%$ confident the true proportion lies between $50.4\\%$ and $69.6\\%$.
*Step 2 (1 mark):* If many such samples were taken, $95\\%$ of the constructed intervals would contain the true $p$.`,
    subtopicSlugs: ["confidence-intervals", "sample-proportions-and-sampling"],
  },
  {
    content: `In a sample of $n = 200$ randomly selected students, $90$ reported reading for pleasure regularly.

**a.** State $\\hat{p}$. (1 mark)

**b.** Find the standard error of $\\hat{p}$, correct to 4 decimal places. (2 marks)

**c.** Construct a $95\\%$ confidence interval for the true proportion $p$, correct to 3 decimal places. (3 marks)

**d.** Construct a $99\\%$ confidence interval (use $z = 2.576$), correct to 3 decimal places. (3 marks)

**e.** Compare the widths of the two intervals and explain the difference. (2 marks)

${img("ci-95-smaller.svg", "Sampling distribution of p-hat centred at 0.45 with the 95 percent CI from 0.382 to 0.518 shaded")}`,
    marks: 11,
    difficulty: "MEDIUM",
    solutionContent: `**a. (1 mark)** $\\hat{p} = 90/200 = 0.45$.

**b. (2 marks)**
*Step 1 (1 mark):* $\\text{SE} = \\sqrt{\\dfrac{0.45 \\times 0.55}{200}} = \\sqrt{0.001238}$.
*Step 2 (1 mark):* $\\approx 0.0352$.

**c. (3 marks)**
*Step 1 (1 mark):* Margin $= 1.96 \\times 0.0352 \\approx 0.069$.
*Step 2 (1 mark):* Lower: $0.45 - 0.069 = 0.381$.
*Step 3 (1 mark):* Upper: $0.45 + 0.069 = 0.519$. CI: $(0.381, 0.519)$.

**d. (3 marks)**
*Step 1 (1 mark):* Margin $= 2.576 \\times 0.0352 \\approx 0.091$.
*Step 2 (1 mark):* Lower: $0.45 - 0.091 = 0.359$.
*Step 3 (1 mark):* Upper: $0.45 + 0.091 = 0.541$. CI: $(0.359, 0.541)$.

**e. (2 marks)**
*Step 1 (1 mark):* The $99\\%$ CI ($0.182$ wide) is wider than the $95\\%$ CI ($0.138$ wide).
*Step 2 (1 mark):* Greater confidence requires a wider interval (we trade precision for confidence).`,
    subtopicSlugs: ["confidence-intervals", "sample-proportions-and-sampling"],
  },
  {
    content: `An experimental drug is tested on $n = 50$ patients. $35$ show improvement.

**a.** State $\\hat{p}$. (1 mark)

**b.** Construct a $95\\%$ confidence interval for the true success proportion, correct to 3 decimal places. (4 marks)

**c.** A larger trial with $n = 500$ patients again yields $\\hat{p} = 0.70$. Construct a $95\\%$ CI for this trial. (4 marks)

**d.** Compare the two intervals and explain the relationship between sample size and CI width. (3 marks)

${img("ci-95-small-n.svg", "Sampling distribution of p-hat centred at 0.7 with the 95 percent CI from 0.573 to 0.827 shaded, reflecting the moderate sample size n = 50")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (1 mark)** $\\hat{p} = 35/50 = 0.70$.

**b. (4 marks)**
*Step 1 (1 mark):* $\\text{SE} = \\sqrt{\\dfrac{0.7 \\times 0.3}{50}} = \\sqrt{0.0042} \\approx 0.0648$.
*Step 2 (1 mark):* Margin $= 1.96 \\times 0.0648 \\approx 0.127$.
*Step 3 (1 mark):* Lower: $0.573$.
*Step 4 (1 mark):* Upper: $0.827$. CI: $(0.573, 0.827)$.

**c. (4 marks)**
*Step 1 (1 mark):* $\\text{SE} = \\sqrt{\\dfrac{0.7 \\times 0.3}{500}} = \\sqrt{0.00042} \\approx 0.0205$.
*Step 2 (1 mark):* Margin $= 1.96 \\times 0.0205 \\approx 0.040$.
*Step 3 (1 mark):* Lower: $0.660$.
*Step 4 (1 mark):* Upper: $0.740$. CI: $(0.660, 0.740)$.

**d. (3 marks)**
*Step 1 (1 mark):* First width: $\\approx 0.254$; second width: $\\approx 0.080$.
*Step 2 (1 mark):* Increasing $n$ from $50$ to $500$ (factor 10) reduces SE by factor $\\sqrt{10} \\approx 3.16$, and thus the CI width by the same factor.
*Step 3 (1 mark):* Larger samples produce more precise estimates (narrower CIs).`,
    subtopicSlugs: ["confidence-intervals", "sample-proportions-and-sampling"],
  },
  {
    content: `A pollster wishes to estimate the true proportion $p$ of voters who support a referendum to within $\\pm 0.03$ with $95\\%$ confidence.

**a.** Write down the formula relating margin of error, $z$, and $n$ for a sample proportion. (2 marks)

**b.** Assuming $\\hat{p} = 0.5$ (the worst case for variance), find the minimum $n$ required. (4 marks)

**c.** If a previous survey suggests $\\hat{p} \\approx 0.3$, find the minimum $n$ under this assumption. (3 marks)

**d.** Explain why the planning calculation in (b) uses $\\hat{p} = 0.5$ even when other information is available. (3 marks)

${img("ci-95-large-n.svg", "Sampling distribution of p-hat centred at 0.5 with the 95 percent CI from 0.456 to 0.544 shaded, illustrating a margin of error of about 0.044")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* Margin of error $E = z \\sqrt{\\dfrac{\\hat{p}(1 - \\hat{p})}{n}}$.
*Step 2 (1 mark):* Solving for $n$: $n = \\dfrac{z^2 \\hat{p}(1 - \\hat{p})}{E^2}$.

**b. (4 marks)**
*Step 1 (1 mark):* $z = 1.96$, $E = 0.03$, $\\hat{p}(1 - \\hat{p}) = 0.25$ (max).
*Step 2 (1 mark):* $n = \\dfrac{(1.96)^2 \\times 0.25}{(0.03)^2}$.
*Step 3 (1 mark):* $= \\dfrac{3.8416 \\times 0.25}{0.0009} = \\dfrac{0.9604}{0.0009}$.
*Step 4 (1 mark):* $\\approx 1067.1$, so $n \\geq 1068$.

**c. (3 marks)**
*Step 1 (1 mark):* $\\hat{p}(1 - \\hat{p}) = 0.3 \\times 0.7 = 0.21$.
*Step 2 (1 mark):* $n = \\dfrac{3.8416 \\times 0.21}{0.0009} = \\dfrac{0.8067}{0.0009}$.
*Step 3 (1 mark):* $\\approx 896.4$, so $n \\geq 897$.

**d. (3 marks)**
*Step 1 (1 mark):* $\\hat{p}(1 - \\hat{p})$ is maximised at $\\hat{p} = 0.5$ (max value $0.25$).
*Step 2 (1 mark):* Using this max guarantees the margin of error condition holds regardless of the true $p$.
*Step 3 (1 mark):* It is a conservative (worst-case) choice — actual sample sizes can be smaller if prior information about $p$ is reliable.`,
    subtopicSlugs: ["confidence-intervals", "sample-proportions-and-sampling"],
  },
];

const output = { mcq: [], shortAnswer: [], extendedAnswer: [], extendedResponse: questions };
fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");
console.log(`${OUT}: ${questions.length} questions, ${questions.reduce((s, q) => s + q.marks, 0)} marks`);
