/** Wave 1 batch 14: Conditional Probability ext-resp. */
import * as fs from "fs";
import * as path from "path";
import { probabilityTree, toDataUri } from "./svg";

const DIR = "scripts/output/figures/conditional-probability";
const OUT = "scripts/output/qset-methods-b2-conditional-probability.json";
fs.mkdirSync(DIR, { recursive: true });

const fig1 = probabilityTree({
  rootLabel: "start",
  stage1: [
    { label: "Disease", prob: "0.02", stage2: [
      { label: "Test +", prob: "0.95" },
      { label: "Test −", prob: "0.05" },
    ] },
    { label: "No disease", prob: "0.98", stage2: [
      { label: "Test +", prob: "0.10" },
      { label: "Test −", prob: "0.90" },
    ] },
  ],
});

const fig2 = probabilityTree({
  rootLabel: "bag",
  stage1: [
    { label: "Red (R)", prob: "5/8", stage2: [
      { label: "R", prob: "4/7" },
      { label: "B", prob: "3/7" },
    ] },
    { label: "Blue (B)", prob: "3/8", stage2: [
      { label: "R", prob: "5/7" },
      { label: "B", prob: "2/7" },
    ] },
  ],
});

const fig3 = probabilityTree({
  rootLabel: "weather",
  stage1: [
    { label: "Rain", prob: "0.3", stage2: [
      { label: "Late", prob: "0.6" },
      { label: "On time", prob: "0.4" },
    ] },
    { label: "No rain", prob: "0.7", stage2: [
      { label: "Late", prob: "0.1" },
      { label: "On time", prob: "0.9" },
    ] },
  ],
});

const fig4 = probabilityTree({
  rootLabel: "spinner",
  stage1: [
    { label: "1st: A", prob: "1/3", stage2: [
      { label: "2nd: A", prob: "1/3" },
      { label: "2nd: B", prob: "2/3" },
    ] },
    { label: "1st: B", prob: "2/3", stage2: [
      { label: "2nd: A", prob: "1/3" },
      { label: "2nd: B", prob: "2/3" },
    ] },
  ],
});

const figs = { "disease-test.svg": fig1, "draw-balls.svg": fig2, "weather-late.svg": fig3, "spinner-twice.svg": fig4 };
for (const [n, c] of Object.entries(figs)) fs.writeFileSync(path.join(DIR, n), c);
const img = (n: string, a: string) => `![${a}](${toDataUri(figs[n as keyof typeof figs])})`;

const questions = [
  {
    content: `In a population, $2\\%$ of people have a particular disease. A diagnostic test is $95\\%$ accurate if the person has the disease (true positive rate) and gives a false positive in $10\\%$ of people without the disease.

Let $D$ be the event "has the disease" and $T$ be the event "tests positive".

**a.** State $P(D)$, $P(T \\mid D)$, and $P(T \\mid D')$. (3 marks)

**b.** Find $P(T)$ using the law of total probability. (3 marks)

**c.** Find $P(D \\mid T)$, correct to 4 decimal places. (3 marks)

**d.** Briefly interpret your answer to part c. (1 mark)

${img("disease-test.svg", "Two-stage probability tree showing the disease outcome (probability 0.02 or 0.98) followed by test result (true positive 0.95, false negative 0.05 for diseased; false positive 0.10, true negative 0.90 for non-diseased)")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* $P(D) = 0.02$.
*Step 2 (1 mark):* $P(T \\mid D) = 0.95$.
*Step 3 (1 mark):* $P(T \\mid D') = 0.10$.

**b. (3 marks)**
*Step 1 (1 mark):* $P(T) = P(T \\mid D) P(D) + P(T \\mid D') P(D')$.
*Step 2 (1 mark):* $= 0.95 \\times 0.02 + 0.10 \\times 0.98$.
*Step 3 (1 mark):* $= 0.019 + 0.098 = 0.117$.

**c. (3 marks)**
*Step 1 (1 mark):* Bayes: $P(D \\mid T) = \\dfrac{P(T \\mid D) P(D)}{P(T)}$.
*Step 2 (1 mark):* $= \\dfrac{0.019}{0.117}$.
*Step 3 (1 mark):* $\\approx 0.1624$.

**d. (1 mark)** Even with a positive test result, the chance of actually having the disease is only about $16\\%$ — the low base rate dominates.`,
    subtopicSlugs: ["conditional-probability", "probability-rules"],
  },
  {
    content: `A bag contains $5$ red balls and $3$ blue balls. Two balls are drawn in succession, without replacement.

**a.** Find the probability that the first ball is red. (1 mark)

**b.** Find the probability that both balls are red. (3 marks)

**c.** Find the probability that the second ball is blue given the first is red. (2 marks)

**d.** Find the probability that the two balls are of different colours. (3 marks)

**e.** Find the probability that the first is red given that the second is blue. (3 marks)

${img("draw-balls.svg", "Two-stage probability tree for drawing two balls without replacement from a bag with 5 red and 3 blue: first stage shows P(R) = 5/8 and P(B) = 3/8; second stage shows updated probabilities depending on the first draw")}`,
    marks: 12,
    difficulty: "MEDIUM",
    solutionContent: `**a. (1 mark)** $P(R_1) = \\dfrac{5}{8}$.

**b. (3 marks)**
*Step 1 (1 mark):* After 1 red, 4 red + 3 blue remain (total 7): $P(R_2 \\mid R_1) = \\dfrac{4}{7}$.
*Step 2 (1 mark):* $P(R_1 \\cap R_2) = P(R_1) P(R_2 \\mid R_1)$.
*Step 3 (1 mark):* $= \\dfrac{5}{8} \\times \\dfrac{4}{7} = \\dfrac{20}{56} = \\dfrac{5}{14}$.

**c. (2 marks)**
*Step 1 (1 mark):* Given $R_1$: bag has 4 red + 3 blue = 7 balls.
*Step 2 (1 mark):* $P(B_2 \\mid R_1) = \\dfrac{3}{7}$.

**d. (3 marks)**
*Step 1 (1 mark):* $P(\\text{different}) = P(R_1 B_2) + P(B_1 R_2)$.
*Step 2 (1 mark):* $P(R_1 B_2) = \\dfrac{5}{8} \\cdot \\dfrac{3}{7} = \\dfrac{15}{56}$; $P(B_1 R_2) = \\dfrac{3}{8} \\cdot \\dfrac{5}{7} = \\dfrac{15}{56}$.
*Step 3 (1 mark):* Sum: $\\dfrac{30}{56} = \\dfrac{15}{28}$.

**e. (3 marks)**
*Step 1 (1 mark):* Need $P(R_1 \\mid B_2) = \\dfrac{P(R_1 \\cap B_2)}{P(B_2)}$.
*Step 2 (1 mark):* $P(B_2) = P(R_1 B_2) + P(B_1 B_2) = \\dfrac{15}{56} + \\dfrac{3}{8} \\cdot \\dfrac{2}{7} = \\dfrac{15}{56} + \\dfrac{6}{56} = \\dfrac{21}{56} = \\dfrac{3}{8}$.
*Step 3 (1 mark):* $P(R_1 \\mid B_2) = \\dfrac{15/56}{3/8} = \\dfrac{15}{56} \\cdot \\dfrac{8}{3} = \\dfrac{5}{7}$.`,
    subtopicSlugs: ["conditional-probability", "probability-rules"],
  },
  {
    content: `On any given day, the probability of rain is $0.3$. If it rains, the probability that Anh's train is late is $0.6$; otherwise the probability the train is late is $0.1$.

Let $R$ be the event "rains" and $L$ be the event "train is late".

**a.** Find $P(L)$. (3 marks)

**b.** Find $P(R \\mid L)$, correct to 4 decimal places. (3 marks)

**c.** Find $P(R \\cup L)$. (3 marks)

**d.** Are $R$ and $L$ independent? Justify by comparing $P(L)$ with $P(L \\mid R)$. (3 marks)

${img("weather-late.svg", "Two-stage probability tree showing rain outcome (0.3 or 0.7) followed by train status (late 0.6, on time 0.4 if rain; late 0.1, on time 0.9 if no rain)")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* Total probability: $P(L) = P(L \\mid R) P(R) + P(L \\mid R') P(R')$.
*Step 2 (1 mark):* $= 0.6 \\times 0.3 + 0.1 \\times 0.7$.
*Step 3 (1 mark):* $= 0.18 + 0.07 = 0.25$.

**b. (3 marks)**
*Step 1 (1 mark):* $P(R \\mid L) = \\dfrac{P(L \\mid R) P(R)}{P(L)}$.
*Step 2 (1 mark):* $= \\dfrac{0.18}{0.25}$.
*Step 3 (1 mark):* $= 0.72$.

**c. (3 marks)**
*Step 1 (1 mark):* $P(R \\cap L) = P(L \\mid R) P(R) = 0.18$.
*Step 2 (1 mark):* $P(R \\cup L) = P(R) + P(L) - P(R \\cap L)$.
*Step 3 (1 mark):* $= 0.3 + 0.25 - 0.18 = 0.37$.

**d. (3 marks)**
*Step 1 (1 mark):* $P(L) = 0.25$ and $P(L \\mid R) = 0.6$.
*Step 2 (1 mark):* Since $P(L \\mid R) \\neq P(L)$, the events are NOT independent.
*Step 3 (1 mark):* In context, rain makes the train more likely to be late.`,
    subtopicSlugs: ["conditional-probability", "probability-rules"],
  },
  {
    content: `A spinner has three sectors A, B, C with respective probabilities $P(A) = \\dfrac{1}{3}$, $P(B) = \\dfrac{1}{2}$, and $P(C) = \\dfrac{1}{6}$. The spinner is spun twice; outcomes are independent.

**a.** Find the probability that both spins land on B. (2 marks)

**b.** Find the probability that at least one spin lands on A. (3 marks)

**c.** Find the conditional probability that the second spin lands on B given that the first spin landed on A. (2 marks)

**d.** Let $X$ be the number of spins that land on A. Find $E[X]$. (2 marks)

**e.** Find $P(X = 1 \\mid X \\geq 1)$ exactly. (3 marks)

${img("spinner-twice.svg", "Two-stage probability tree for two independent spins of a spinner with sectors A (1/3) and B (2/3) shown for simplicity")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* Independent: $P(B_1 \\cap B_2) = P(B)^2$.
*Step 2 (1 mark):* $= \\left(\\dfrac{1}{2}\\right)^2 = \\dfrac{1}{4}$.

**b. (3 marks)**
*Step 1 (1 mark):* Complement: $P(\\text{at least one A}) = 1 - P(\\text{no A})$.
*Step 2 (1 mark):* $P(\\text{no A on a spin}) = 1 - \\dfrac{1}{3} = \\dfrac{2}{3}$, so $P(\\text{no A both}) = \\left(\\dfrac{2}{3}\\right)^2 = \\dfrac{4}{9}$.
*Step 3 (1 mark):* $P(\\text{at least one A}) = 1 - \\dfrac{4}{9} = \\dfrac{5}{9}$.

**c. (2 marks)**
*Step 1 (1 mark):* Independence: $P(B_2 \\mid A_1) = P(B_2)$.
*Step 2 (1 mark):* $= \\dfrac{1}{2}$.

**d. (2 marks)**
*Step 1 (1 mark):* Each spin is Bernoulli with $p = 1/3$, so $X \\sim \\text{Bin}(2, 1/3)$.
*Step 2 (1 mark):* $E[X] = n p = 2 \\times \\dfrac{1}{3} = \\dfrac{2}{3}$.

**e. (3 marks)**
*Step 1 (1 mark):* $P(X = 1) = \\binom{2}{1}\\left(\\dfrac{1}{3}\\right)\\left(\\dfrac{2}{3}\\right) = \\dfrac{4}{9}$.
*Step 2 (1 mark):* $P(X \\geq 1) = 1 - P(X = 0) = 1 - \\dfrac{4}{9} = \\dfrac{5}{9}$.
*Step 3 (1 mark):* $P(X = 1 \\mid X \\geq 1) = \\dfrac{4/9}{5/9} = \\dfrac{4}{5}$.`,
    subtopicSlugs: ["conditional-probability", "binomial-distribution", "probability-rules"],
  },
];

const output = { mcq: [], shortAnswer: [], extendedAnswer: [], extendedResponse: questions };
fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");
console.log(`${OUT}: ${questions.length} questions, ${questions.reduce((s, q) => s + q.marks, 0)} marks`);
