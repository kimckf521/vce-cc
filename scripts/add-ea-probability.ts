/**
 * add-ea-probability.ts
 *
 * Adds 5 Extended-Answer (EA) questions to each of the 8 Data Analysis,
 * Probability, and Statistics subtopic JSON files under scripts/output/.
 * Idempotent: files already having 5+ extendedAnswer items are skipped.
 *
 * Run: npx tsx scripts/add-ea-probability.ts
 */
import fs from "fs";
import path from "path";
import { dechainSolution } from "./qset-helpers";

interface EA {
  content: string;
  marks: number;
  difficulty: "MEDIUM" | "HARD";
  solutionContent: string;
  subtopicSlugs: string[];
}

const OUT_DIR = path.join(__dirname, "output");

const NEW_QUESTIONS: Record<string, EA[]> = {
  // ─── 1. Continuous random variables ──────────────────────────────────────
  "continuous-random-variables": [
    // 4 marks — MEDIUM
    {
      content:
        "A continuous random variable $X$ has probability density function\n\n$$f(x) = \\begin{cases} ax(2 - x), & 0 \\leq x \\leq 2 \\\\ 0, & \\text{otherwise} \\end{cases}$$\n\nwhere $a$ is a positive real constant.\n\n**a.** Show that $a = \\dfrac{3}{4}$. (2 marks)\n\n**b.** Find $\\Pr\\!\\left(X > 1\\right)$. (2 marks)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* Set up the total-area condition.\n\n$$\\int_0^2 ax(2 - x)\\,dx = 1$$\n\n*Step 2 (1 mark):* Evaluate the integral.\n\n$$a\\int_0^2 (2x - x^2)\\,dx = a\\left[x^2 - \\dfrac{x^3}{3}\\right]_0^2 = a\\left(4 - \\dfrac{8}{3}\\right) = \\dfrac{4a}{3}$$\n\nSetting $\\dfrac{4a}{3} = 1$ gives $a = \\dfrac{3}{4}$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Set up the integral.\n\n$$\\Pr(X > 1) = \\int_1^2 \\dfrac{3}{4}x(2 - x)\\,dx = \\dfrac{3}{4}\\int_1^2 (2x - x^2)\\,dx$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$= \\dfrac{3}{4}\\left[x^2 - \\dfrac{x^3}{3}\\right]_1^2 = \\dfrac{3}{4}\\left[\\left(4 - \\dfrac{8}{3}\\right) - \\left(1 - \\dfrac{1}{3}\\right)\\right] = \\dfrac{3}{4} \\cdot \\dfrac{2}{3} = \\dfrac{1}{2}$$",
      subtopicSlugs: ["continuous-random-variables"],
    },
    // 5 marks — MEDIUM
    {
      content:
        "The continuous random variable $X$ has probability density function\n\n$$f(x) = \\begin{cases} k(4x - x^2), & 0 \\leq x \\leq 4 \\\\ 0, & \\text{otherwise} \\end{cases}$$\n\nwhere $k$ is a positive real constant.\n\n**a.** Show that $k = \\dfrac{3}{32}$. (2 marks)\n\n**b.** Find $E(X)$. (2 marks)\n\n**c.** State, with a reason, whether $E(X)$ is equal to the median of $X$. (1 mark)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* Require the total area to be $1$.\n\n$$\\int_0^4 k(4x - x^2)\\,dx = 1$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$k\\left[2x^2 - \\dfrac{x^3}{3}\\right]_0^4 = k\\left(32 - \\dfrac{64}{3}\\right) = \\dfrac{32k}{3}$$\n\nSetting $\\dfrac{32k}{3} = 1$ gives $k = \\dfrac{3}{32}$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Set up $E(X) = \\int_0^4 x \\cdot \\dfrac{3}{32}(4x - x^2)\\,dx$.\n\n$$= \\dfrac{3}{32}\\int_0^4 (4x^2 - x^3)\\,dx$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$= \\dfrac{3}{32}\\left[\\dfrac{4x^3}{3} - \\dfrac{x^4}{4}\\right]_0^4 = \\dfrac{3}{32}\\left(\\dfrac{256}{3} - 64\\right) = \\dfrac{3}{32} \\cdot \\dfrac{64}{3} = 2$$\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* The pdf $f(x) = \\dfrac{3}{32}(4x - x^2)$ is symmetric about $x = 2$ (since $f(2 + t) = f(2 - t)$ for all $t$). For a symmetric distribution, the mean equals the median, so the median is also $2$.",
      subtopicSlugs: ["continuous-random-variables"],
    },
    // 6 marks — HARD
    {
      content:
        "A continuous random variable $X$ has probability density function\n\n$$f(x) = \\begin{cases} c(1 - x^2), & 0 \\leq x \\leq 1 \\\\ 0, & \\text{otherwise} \\end{cases}$$\n\nwhere $c$ is a positive real constant.\n\n**a.** Find the value of $c$. (2 marks)\n\n**b.** Find $E(X)$. (2 marks)\n\n**c.** Find $\\text{Var}(X)$. (2 marks)",
      marks: 6,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* Set up the total-area condition.\n\n$$\\int_0^1 c(1 - x^2)\\,dx = 1$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$c\\left[x - \\dfrac{x^3}{3}\\right]_0^1 = c \\cdot \\dfrac{2}{3} = 1$$\n\nSo $c = \\dfrac{3}{2}$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Set up $E(X)$.\n\n$$E(X) = \\int_0^1 x \\cdot \\dfrac{3}{2}(1 - x^2)\\,dx = \\dfrac{3}{2}\\int_0^1 (x - x^3)\\,dx$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$= \\dfrac{3}{2}\\left[\\dfrac{x^2}{2} - \\dfrac{x^4}{4}\\right]_0^1 = \\dfrac{3}{2} \\cdot \\dfrac{1}{4} = \\dfrac{3}{8}$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Find $E(X^2)$.\n\n$$E(X^2) = \\dfrac{3}{2}\\int_0^1 (x^2 - x^4)\\,dx = \\dfrac{3}{2}\\left[\\dfrac{x^3}{3} - \\dfrac{x^5}{5}\\right]_0^1 = \\dfrac{3}{2} \\cdot \\dfrac{2}{15} = \\dfrac{1}{5}$$\n\n*Step 2 (1 mark):* Apply $\\text{Var}(X) = E(X^2) - [E(X)]^2$.\n\n$$= \\dfrac{1}{5} - \\dfrac{9}{64} = \\dfrac{64 - 45}{320} = \\dfrac{19}{320}$$",
      subtopicSlugs: ["continuous-random-variables"],
    },
    // 7 marks — HARD
    {
      content:
        "A continuous random variable $X$ has probability density function\n\n$$f(x) = \\begin{cases} \\dfrac{3}{2}(1 - x^2), & 0 \\leq x \\leq 1 \\\\ 0, & \\text{otherwise} \\end{cases}$$\n\n**a.** Show that $f(x)$ is a valid probability density function. (2 marks)\n\n**b.** Find $E(X)$. (2 marks)\n\n**c.** Find the median $m$ of $X$. (3 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* Since $0 \\leq x \\leq 1$, we have $x^2 \\leq 1$, so $(1 - x^2) \\geq 0$ and therefore $f(x) \\geq 0$ for all $x$.\n\n*Step 2 (1 mark):* Check the total area.\n\n$$\\int_0^1 \\dfrac{3}{2}(1 - x^2)\\,dx = \\dfrac{3}{2}\\left[x - \\dfrac{x^3}{3}\\right]_0^1 = \\dfrac{3}{2} \\cdot \\dfrac{2}{3} = 1 \\quad \\checkmark$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Set up the expected value integral.\n\n$$E(X) = \\int_0^1 x \\cdot \\dfrac{3}{2}(1 - x^2)\\,dx = \\dfrac{3}{2}\\int_0^1 (x - x^3)\\,dx$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$= \\dfrac{3}{2}\\left[\\dfrac{x^2}{2} - \\dfrac{x^4}{4}\\right]_0^1 = \\dfrac{3}{2} \\cdot \\dfrac{1}{4} = \\dfrac{3}{8}$$\n\n**c. (3 marks)**\n\n*Step 1 (1 mark):* Set up the equation for the median $m$.\n\n$$\\int_0^m \\dfrac{3}{2}(1 - x^2)\\,dx = \\dfrac{1}{2}$$\n\n*Step 2 (1 mark):* Evaluate the left-hand side.\n\n$$\\dfrac{3}{2}\\left[x - \\dfrac{x^3}{3}\\right]_0^m = \\dfrac{3}{2}\\left(m - \\dfrac{m^3}{3}\\right) = \\dfrac{1}{2}$$\n\n*Step 3 (1 mark):* Simplify to obtain $3m - m^3 = 1$, i.e. $m^3 - 3m + 1 = 0$. Testing $m \\approx 0.347$ (or solving numerically) gives $m = 2\\cos\\!\\left(\\dfrac{4\\pi}{9}\\right) \\approx 0.347$. Since the pdf is right-skewed on $[0, 1]$ the median is less than the mean $\\dfrac{3}{8} = 0.375$, which is consistent.",
      subtopicSlugs: ["continuous-random-variables"],
    },
    // 8 marks — HARD
    {
      content:
        "A continuous random variable $X$ has probability density function\n\n$$f(x) = \\begin{cases} a(3x - x^2), & 0 \\leq x \\leq 3 \\\\ 0, & \\text{otherwise} \\end{cases}$$\n\nwhere $a$ is a positive real constant.\n\n**a.** Find the value of $a$. (2 marks)\n\n**b.** Find $E(X)$. (2 marks)\n\n**c.** Find $\\text{Var}(X)$. (2 marks)\n\n**d.** Find $\\Pr\\!\\left(X > E(X)\\right)$. (2 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* Require the total area to be $1$.\n\n$$\\int_0^3 a(3x - x^2)\\,dx = 1$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$a\\left[\\dfrac{3x^2}{2} - \\dfrac{x^3}{3}\\right]_0^3 = a\\left(\\dfrac{27}{2} - 9\\right) = \\dfrac{9a}{2}$$\n\nSetting $\\dfrac{9a}{2} = 1$ gives $a = \\dfrac{2}{9}$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Set up $E(X)$.\n\n$$E(X) = \\int_0^3 x \\cdot \\dfrac{2}{9}(3x - x^2)\\,dx = \\dfrac{2}{9}\\int_0^3 (3x^2 - x^3)\\,dx$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$= \\dfrac{2}{9}\\left[x^3 - \\dfrac{x^4}{4}\\right]_0^3 = \\dfrac{2}{9}\\left(27 - \\dfrac{81}{4}\\right) = \\dfrac{2}{9} \\cdot \\dfrac{27}{4} = \\dfrac{3}{2}$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Find $E(X^2)$.\n\n$$E(X^2) = \\dfrac{2}{9}\\int_0^3 (3x^3 - x^4)\\,dx = \\dfrac{2}{9}\\left[\\dfrac{3x^4}{4} - \\dfrac{x^5}{5}\\right]_0^3 = \\dfrac{2}{9}\\left(\\dfrac{243}{4} - \\dfrac{243}{5}\\right) = \\dfrac{2}{9} \\cdot \\dfrac{243}{20} = \\dfrac{27}{10}$$\n\n*Step 2 (1 mark):* Apply $\\text{Var}(X) = E(X^2) - [E(X)]^2$.\n\n$$= \\dfrac{27}{10} - \\dfrac{9}{4} = \\dfrac{54 - 45}{20} = \\dfrac{9}{20}$$\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* Set up the integral with $E(X) = \\dfrac{3}{2}$.\n\n$$\\Pr\\!\\left(X > \\dfrac{3}{2}\\right) = \\int_{3/2}^3 \\dfrac{2}{9}(3x - x^2)\\,dx = \\dfrac{2}{9}\\left[\\dfrac{3x^2}{2} - \\dfrac{x^3}{3}\\right]_{3/2}^3$$\n\n*Step 2 (1 mark):* Evaluate.\n\nAt $x = 3$: $\\dfrac{27}{2} - 9 = \\dfrac{9}{2}$.\n\nAt $x = \\dfrac{3}{2}$: $\\dfrac{27}{8} - \\dfrac{9}{8} = \\dfrac{18}{8} = \\dfrac{9}{4}$.\n\n$$= \\dfrac{2}{9}\\left(\\dfrac{9}{2} - \\dfrac{9}{4}\\right) = \\dfrac{2}{9} \\cdot \\dfrac{9}{4} = \\dfrac{1}{2}$$",
      subtopicSlugs: ["continuous-random-variables"],
    },
  ],

  // ─── 2. Normal distribution ──────────────────────────────────────────────
  "normal-distribution": [
    // 4 marks — MEDIUM
    {
      content:
        "The random variable $X$ is normally distributed with mean $50$ and standard deviation $8$.\n\nYou are given that $\\Pr(Z < 1.25) = 0.8944$.\n\n**a.** Find $\\Pr(X < 60)$. (2 marks)\n\n**b.** Find $\\Pr(40 < X < 60)$. (2 marks)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* Standardise $X = 60$.\n\n$$z = \\dfrac{60 - 50}{8} = 1.25$$\n\n*Step 2 (1 mark):* Read the probability.\n\n$$\\Pr(X < 60) = \\Pr(Z < 1.25) = 0.8944$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* By symmetry of the normal distribution about the mean, $\\Pr(X < 40) = \\Pr(X > 60)$.\n\n$$\\Pr(X > 60) = 1 - 0.8944 = 0.1056$$\n\n*Step 2 (1 mark):* Therefore\n\n$$\\Pr(40 < X < 60) = 1 - 2(0.1056) = 0.7888$$",
      subtopicSlugs: ["normal-distribution"],
    },
    // 5 marks — MEDIUM
    {
      content:
        "The heights of plants in a garden follow a normal distribution with mean $\\mu$ cm and standard deviation $5$ cm.\n\nYou are given that $\\Pr(Z < 2) = 0.9772$ and $\\Pr(Z < 0.4) = 0.6554$.\n\n**a.** Given that $\\Pr(X > 70) = 0.0228$, find the value of $\\mu$. (2 marks)\n\n**b.** Using your value of $\\mu$, find $\\Pr(X < 62)$. (2 marks)\n\n**c.** State $\\Pr(X > 58)$. (1 mark)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* Since $\\Pr(X > 70) = 0.0228 = 1 - 0.9772$, we have $\\Pr(X \\leq 70) = 0.9772$, so $\\dfrac{70 - \\mu}{5} = 2$.\n\n*Step 2 (1 mark):* Solve for $\\mu$.\n\n$$\\mu = 70 - 10 = 60$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Standardise $X = 62$ with $\\mu = 60$, $\\sigma = 5$.\n\n$$z = \\dfrac{62 - 60}{5} = 0.4$$\n\n*Step 2 (1 mark):* Read the probability.\n\n$$\\Pr(X < 62) = \\Pr(Z < 0.4) = 0.6554$$\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* By symmetry about $\\mu = 60$, $\\Pr(X > 58) = \\Pr(X < 62) = 0.6554$.",
      subtopicSlugs: ["normal-distribution"],
    },
    // 6 marks — HARD
    {
      content:
        "The time $T$ minutes that a student spends on a test is normally distributed with mean $45$ and standard deviation $\\sigma$.\n\nYou are given that $\\Pr(Z < 1.5) = 0.9332$ and $\\Pr(Z < 0.5) = 0.6915$.\n\n**a.** Given that $\\Pr(T > 60) = 0.0668$, find the value of $\\sigma$. (2 marks)\n\n**b.** Find $\\Pr(T < 50)$. (2 marks)\n\n**c.** In a class of $200$ students, how many would be expected to finish in less than $50$ minutes? (2 marks)",
      marks: 6,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* Since $\\Pr(T > 60) = 0.0668 = 1 - 0.9332$, we have $\\Pr(T \\leq 60) = 0.9332$, so $\\dfrac{60 - 45}{\\sigma} = 1.5$.\n\n*Step 2 (1 mark):* Solve for $\\sigma$.\n\n$$\\sigma = \\dfrac{15}{1.5} = 10$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Standardise $T = 50$ with $\\mu = 45$, $\\sigma = 10$.\n\n$$z = \\dfrac{50 - 45}{10} = 0.5$$\n\n*Step 2 (1 mark):* Read the probability.\n\n$$\\Pr(T < 50) = \\Pr(Z < 0.5) = 0.6915$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* The expected number is $200 \\times \\Pr(T < 50)$.\n\n$$= 200 \\times 0.6915$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$= 138.3$$\n\nSo approximately $138$ students would be expected to finish in less than $50$ minutes.",
      subtopicSlugs: ["normal-distribution"],
    },
    // 7 marks — HARD
    {
      content:
        "The mass of apples from an orchard is normally distributed with mean $150$ g and standard deviation $20$ g. Apples are graded by mass: those below $120$ g are \"small\" and those above $180$ g are \"large\".\n\nYou are given that $\\Pr(Z < 1.5) = 0.9332$.\n\n**a.** Find the proportion of apples classified as \"large\". (2 marks)\n\n**b.** Find the proportion of apples classified as \"small\". (2 marks)\n\n**c.** In a crate of $500$ apples, find the expected number classified as \"medium\" (neither small nor large). (3 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* Standardise $X = 180$.\n\n$$z = \\dfrac{180 - 150}{20} = 1.5$$\n\n*Step 2 (1 mark):* Find the proportion.\n\n$$\\Pr(X > 180) = 1 - \\Pr(Z < 1.5) = 1 - 0.9332 = 0.0668$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Standardise $X = 120$.\n\n$$z = \\dfrac{120 - 150}{20} = -1.5$$\n\n*Step 2 (1 mark):* By symmetry, $\\Pr(Z < -1.5) = 1 - 0.9332 = 0.0668$.\n\nSo the proportion of small apples is $0.0668$.\n\n**c. (3 marks)**\n\n*Step 1 (1 mark):* The proportion that is medium is $\\Pr(120 < X < 180)$.\n\n$$= 1 - \\Pr(X < 120) - \\Pr(X > 180)$$\n\n*Step 2 (1 mark):* Substitute.\n\n$$= 1 - 0.0668 - 0.0668 = 0.8664$$\n\n*Step 3 (1 mark):* Multiply by $500$.\n\n$$500 \\times 0.8664 = 433.2$$\n\nSo approximately $433$ apples would be classified as medium.",
      subtopicSlugs: ["normal-distribution"],
    },
    // 8 marks — HARD
    {
      content:
        "Exam scores for a large cohort are normally distributed with mean $\\mu$ and standard deviation $\\sigma$. The top $15.87\\%$ of students score above $75$ and the bottom $15.87\\%$ score below $45$.\n\nYou are given that $\\Pr(Z < 1) = 0.8413$.\n\n**a.** Explain why $\\Pr(Z > 1) = 0.1587$. (1 mark)\n\n**b.** Find the values of $\\mu$ and $\\sigma$. (3 marks)\n\n**c.** Find the percentage of students scoring between $45$ and $75$. (2 marks)\n\n**d.** In a cohort of $800$ students, find the expected number scoring above $75$. (2 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n*Step 1 (1 mark):* Since the total area under the standard normal curve is $1$,\n\n$$\\Pr(Z > 1) = 1 - \\Pr(Z < 1) = 1 - 0.8413 = 0.1587$$\n\n**b. (3 marks)**\n\n*Step 1 (1 mark):* Since $15.87\\% = 0.1587$ score above $75$, we have $\\Pr(X > 75) = 0.1587$, so $\\dfrac{75 - \\mu}{\\sigma} = 1$.\n\n*Step 2 (1 mark):* Since $15.87\\%$ score below $45$, $\\Pr(X < 45) = 0.1587$, so $\\dfrac{45 - \\mu}{\\sigma} = -1$.\n\n*Step 3 (1 mark):* From the two equations: $75 - \\mu = \\sigma$ and $\\mu - 45 = \\sigma$. Adding gives $30 = 2\\sigma$, so $\\sigma = 15$ and $\\mu = 60$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* The proportion scoring between $45$ and $75$ is\n\n$$\\Pr(45 < X < 75) = 1 - 0.1587 - 0.1587$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$= 0.6826$$\n\nSo $68.26\\%$ of students score between $45$ and $75$.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* The expected number scoring above $75$ is $800 \\times 0.1587$.\n\n*Step 2 (1 mark):* Evaluate.\n\n$$= 126.96$$\n\nSo approximately $127$ students are expected to score above $75$.",
      subtopicSlugs: ["normal-distribution"],
    },
  ],

  // ─── 3. Confidence intervals ─────────────────────────────────────────────
  "confidence-intervals": [
    // 4 marks — MEDIUM
    {
      content:
        "A random sample of $n = 400$ people finds that $220$ support a proposal. Let $\\hat{p}$ be the sample proportion.\n\n**a.** Find $\\hat{p}$. (1 mark)\n\n**b.** Find the approximate $95\\%$ confidence interval for the population proportion $p$. (3 marks)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n*Step 1 (1 mark):* Compute the sample proportion.\n\n$$\\hat{p} = \\dfrac{220}{400} = 0.55$$\n\n**b. (3 marks)**\n\n*Step 1 (1 mark):* Compute the standard error.\n\n$$\\text{SE} = \\sqrt{\\dfrac{\\hat{p}(1 - \\hat{p})}{n}} = \\sqrt{\\dfrac{0.55 \\times 0.45}{400}} = \\sqrt{\\dfrac{0.2475}{400}}$$\n\n*Step 2 (1 mark):* Simplify.\n\n$$= \\sqrt{0.00061875} \\approx 0.02487$$\n\n*Step 3 (1 mark):* Apply $\\hat{p} \\pm 1.96 \\times \\text{SE}$.\n\n$$0.55 \\pm 1.96 \\times 0.02487 \\approx 0.55 \\pm 0.0487$$\n\nThe $95\\%$ confidence interval is approximately $(0.501, 0.599)$.",
      subtopicSlugs: ["confidence-intervals"],
    },
    // 5 marks — MEDIUM
    {
      content:
        "A researcher surveys $n = 900$ households and finds that $\\hat{p} = 0.36$ have solar panels.\n\n**a.** Find the $95\\%$ confidence interval for the population proportion $p$. (3 marks)\n\n**b.** The researcher claims that more than one-third of all households have solar panels. Does the confidence interval support this claim? Justify your answer. (2 marks)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (3 marks)**\n\n*Step 1 (1 mark):* Compute the standard error.\n\n$$\\text{SE} = \\sqrt{\\dfrac{0.36 \\times 0.64}{900}} = \\sqrt{\\dfrac{0.2304}{900}} = \\sqrt{0.000256} = 0.016$$\n\n*Step 2 (1 mark):* Find the margin of error.\n\n$$M = 1.96 \\times 0.016 = 0.03136$$\n\n*Step 3 (1 mark):* Construct the interval.\n\n$$0.36 \\pm 0.03136$$\n\nThe $95\\%$ confidence interval is approximately $(0.329, 0.391)$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* One-third is $0.\\overline{3} \\approx 0.333$.\n\n*Step 2 (1 mark):* The lower bound of the confidence interval is $0.329$, which is less than $\\dfrac{1}{3}$. Since $\\dfrac{1}{3}$ lies inside the interval, the data does not provide sufficient evidence to conclusively support the claim.",
      subtopicSlugs: ["confidence-intervals"],
    },
    // 6 marks — HARD
    {
      content:
        "A factory produces bolts. A sample of $n = 200$ bolts finds $16$ are defective.\n\n**a.** Calculate the sample proportion $\\hat{p}$ of defective bolts. (1 mark)\n\n**b.** Calculate the approximate $95\\%$ confidence interval for the true proportion $p$ of defective bolts. (3 marks)\n\n**c.** The factory's quality target requires fewer than $10\\%$ defective bolts. Based on the confidence interval, can the factory be $95\\%$ confident it meets the target? Justify your answer. (2 marks)",
      marks: 6,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n*Step 1 (1 mark):* Compute $\\hat{p}$.\n\n$$\\hat{p} = \\dfrac{16}{200} = 0.08$$\n\n**b. (3 marks)**\n\n*Step 1 (1 mark):* Compute the standard error.\n\n$$\\text{SE} = \\sqrt{\\dfrac{0.08 \\times 0.92}{200}} = \\sqrt{\\dfrac{0.0736}{200}} = \\sqrt{0.000368} \\approx 0.01918$$\n\n*Step 2 (1 mark):* Find the margin of error.\n\n$$M = 1.96 \\times 0.01918 \\approx 0.03760$$\n\n*Step 3 (1 mark):* Construct the interval.\n\n$$0.08 \\pm 0.03760$$\n\nThe $95\\%$ CI is approximately $(0.042, 0.118)$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* The target requires $p < 0.10$. The upper bound of the confidence interval is approximately $0.118$.\n\n*Step 2 (1 mark):* Since $0.10$ lies within the interval, the factory cannot be $95\\%$ confident it meets the target. The true proportion could be above $10\\%$.",
      subtopicSlugs: ["confidence-intervals"],
    },
    // 7 marks — HARD
    {
      content:
        "A polling company surveys $n$ voters and finds $\\hat{p} = 0.52$ support a candidate. The $95\\%$ confidence interval has a margin of error of $0.04$.\n\n**a.** Write down the $95\\%$ confidence interval. (1 mark)\n\n**b.** Find the value of $n$. (3 marks)\n\n**c.** How large should $n$ be to reduce the margin of error to $0.02$? (3 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n*Step 1 (1 mark):* The interval is $\\hat{p} \\pm 0.04 = (0.48, 0.56)$.\n\n**b. (3 marks)**\n\n*Step 1 (1 mark):* The margin of error formula is $M = 1.96\\sqrt{\\dfrac{\\hat{p}(1-\\hat{p})}{n}}$.\n\n*Step 2 (1 mark):* Substitute $M = 0.04$ and $\\hat{p} = 0.52$.\n\n$$0.04 = 1.96\\sqrt{\\dfrac{0.52 \\times 0.48}{n}}$$\n\n$$\\sqrt{\\dfrac{0.2496}{n}} = \\dfrac{0.04}{1.96} \\approx 0.020408$$\n\n*Step 3 (1 mark):* Solve for $n$.\n\n$$\\dfrac{0.2496}{n} = (0.020408)^2 \\approx 0.0004165$$\n\n$$n = \\dfrac{0.2496}{0.0004165} \\approx 599.3$$\n\nSo $n = 600$ (rounding up).\n\n**c. (3 marks)**\n\n*Step 1 (1 mark):* Use $M = 0.02$ with the same formula.\n\n$$0.02 = 1.96\\sqrt{\\dfrac{0.52 \\times 0.48}{n}}$$\n\n*Step 2 (1 mark):* Solve.\n\n$$\\sqrt{\\dfrac{0.2496}{n}} = \\dfrac{0.02}{1.96} \\approx 0.010204$$\n\n$$\\dfrac{0.2496}{n} \\approx 0.00010412$$\n\n*Step 3 (1 mark):* Evaluate.\n\n$$n \\approx \\dfrac{0.2496}{0.00010412} \\approx 2397.2$$\n\nSo $n = 2398$ (rounding up). Halving the margin of error requires approximately four times the sample size.",
      subtopicSlugs: ["confidence-intervals"],
    },
    // 8 marks — HARD
    {
      content:
        "Two independent random samples are taken.\n- Sample A: $n_A = 500$, with $\\hat{p}_A = 0.60$.\n- Sample B: $n_B = 800$, with $\\hat{p}_B = 0.54$.\n\n**a.** Find the $95\\%$ confidence interval for $p_A$. (2 marks)\n\n**b.** Find the $95\\%$ confidence interval for $p_B$. (2 marks)\n\n**c.** Do the two confidence intervals overlap? (2 marks)\n\n**d.** Based on part (c), is there evidence that $p_A$ and $p_B$ are different? Justify your answer. (2 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* Compute $\\text{SE}_A = \\sqrt{\\dfrac{0.60 \\times 0.40}{500}} = \\sqrt{\\dfrac{0.24}{500}} = \\sqrt{0.00048} \\approx 0.02191$.\n\n*Step 2 (1 mark):* The interval is $0.60 \\pm 1.96 \\times 0.02191 \\approx 0.60 \\pm 0.0429$, giving approximately $(0.557, 0.643)$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Compute $\\text{SE}_B = \\sqrt{\\dfrac{0.54 \\times 0.46}{800}} = \\sqrt{\\dfrac{0.2484}{800}} = \\sqrt{0.0003105} \\approx 0.01762$.\n\n*Step 2 (1 mark):* The interval is $0.54 \\pm 1.96 \\times 0.01762 \\approx 0.54 \\pm 0.0345$, giving approximately $(0.506, 0.575)$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Interval A is approximately $(0.557, 0.643)$ and Interval B is approximately $(0.506, 0.575)$.\n\n*Step 2 (1 mark):* The intervals overlap in the region from approximately $0.557$ to $0.575$. So yes, the intervals do overlap.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* Since the confidence intervals overlap, there are plausible values of the proportion that are consistent with both samples.\n\n*Step 2 (1 mark):* Therefore, based on the overlapping intervals alone, there is not strong evidence to conclude that $p_A$ and $p_B$ are different at the $95\\%$ confidence level.",
      subtopicSlugs: ["confidence-intervals"],
    },
  ],

  // ─── 4. Probability rules ────────────────────────────────────────────────
  "probability-rules": [
    // 4 marks — MEDIUM
    {
      content:
        "Events $A$ and $B$ are such that $\\Pr(A) = 0.4$, $\\Pr(B) = 0.5$, and $\\Pr(A \\cup B) = 0.7$.\n\n**a.** Find $\\Pr(A \\cap B)$. (2 marks)\n\n**b.** Are $A$ and $B$ independent? Justify your answer. (2 marks)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* Apply the addition rule.\n\n$$\\Pr(A \\cup B) = \\Pr(A) + \\Pr(B) - \\Pr(A \\cap B)$$\n\n*Step 2 (1 mark):* Substitute and solve.\n\n$$0.7 = 0.4 + 0.5 - \\Pr(A \\cap B)$$\n\n$$\\Pr(A \\cap B) = 0.2$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* For independence, we need $\\Pr(A \\cap B) = \\Pr(A) \\times \\Pr(B)$.\n\n$$\\Pr(A) \\times \\Pr(B) = 0.4 \\times 0.5 = 0.2$$\n\n*Step 2 (1 mark):* Since $\\Pr(A \\cap B) = 0.2 = \\Pr(A) \\times \\Pr(B)$, the events $A$ and $B$ are independent.",
      subtopicSlugs: ["probability-rules"],
    },
    // 5 marks — MEDIUM
    {
      content:
        "Events $A$ and $B$ are such that $\\Pr(A) = 0.6$, $\\Pr(B) = 0.3$, and $A$ and $B$ are independent.\n\n**a.** Find $\\Pr(A \\cap B)$. (1 mark)\n\n**b.** Find $\\Pr(A \\cup B)$. (2 marks)\n\n**c.** Find $\\Pr(A' \\cap B')$. (2 marks)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n*Step 1 (1 mark):* Since $A$ and $B$ are independent,\n\n$$\\Pr(A \\cap B) = \\Pr(A) \\times \\Pr(B) = 0.6 \\times 0.3 = 0.18$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Apply the addition rule.\n\n$$\\Pr(A \\cup B) = \\Pr(A) + \\Pr(B) - \\Pr(A \\cap B)$$\n\n*Step 2 (1 mark):* Substitute.\n\n$$= 0.6 + 0.3 - 0.18 = 0.72$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* By De Morgan's law, $A' \\cap B' = (A \\cup B)'$.\n\n*Step 2 (1 mark):* Therefore\n\n$$\\Pr(A' \\cap B') = 1 - \\Pr(A \\cup B) = 1 - 0.72 = 0.28$$",
      subtopicSlugs: ["probability-rules"],
    },
    // 6 marks — HARD
    {
      content:
        "Events $A$ and $B$ are such that $\\Pr(A) = 0.5$, $\\Pr(B) = 0.4$, and $\\Pr(A \\cap B) = 0.3$.\n\n**a.** Find $\\Pr(A \\cup B)$. (1 mark)\n\n**b.** Are $A$ and $B$ mutually exclusive? Justify your answer. (1 mark)\n\n**c.** Are $A$ and $B$ independent? Justify your answer. (2 marks)\n\n**d.** Find $\\Pr(A \\mid B)$. (2 marks)",
      marks: 6,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n*Step 1 (1 mark):* Apply the addition rule.\n\n$$\\Pr(A \\cup B) = 0.5 + 0.4 - 0.3 = 0.6$$\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* Since $\\Pr(A \\cap B) = 0.3 \\neq 0$, the events are not mutually exclusive.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Compute $\\Pr(A) \\times \\Pr(B)$.\n\n$$= 0.5 \\times 0.4 = 0.2$$\n\n*Step 2 (1 mark):* Since $\\Pr(A \\cap B) = 0.3 \\neq 0.2 = \\Pr(A) \\times \\Pr(B)$, the events are not independent.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* Apply the conditional probability formula.\n\n$$\\Pr(A \\mid B) = \\dfrac{\\Pr(A \\cap B)}{\\Pr(B)}$$\n\n*Step 2 (1 mark):* Substitute.\n\n$$= \\dfrac{0.3}{0.4} = 0.75$$",
      subtopicSlugs: ["probability-rules"],
    },
    // 7 marks — HARD
    {
      content:
        "A bag contains $3$ red and $5$ blue balls. Two balls are drawn without replacement.\n\n**a.** Draw a tree diagram showing all outcomes and their probabilities. (2 marks)\n\n**b.** Find the probability that both balls are the same colour. (2 marks)\n\n**c.** Find the probability that at least one ball is red. (3 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* First draw: $\\Pr(R_1) = \\dfrac{3}{8}$, $\\Pr(B_1) = \\dfrac{5}{8}$.\n\n*Step 2 (1 mark):* Second draw given first:\n- After $R_1$: $\\Pr(R_2) = \\dfrac{2}{7}$, $\\Pr(B_2) = \\dfrac{5}{7}$.\n- After $B_1$: $\\Pr(R_2) = \\dfrac{3}{7}$, $\\Pr(B_2) = \\dfrac{4}{7}$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Compute $\\Pr(RR)$ and $\\Pr(BB)$.\n\n$$\\Pr(RR) = \\dfrac{3}{8} \\times \\dfrac{2}{7} = \\dfrac{6}{56}$$\n\n$$\\Pr(BB) = \\dfrac{5}{8} \\times \\dfrac{4}{7} = \\dfrac{20}{56}$$\n\n*Step 2 (1 mark):* Add.\n\n$$\\Pr(\\text{same colour}) = \\dfrac{6}{56} + \\dfrac{20}{56} = \\dfrac{26}{56} = \\dfrac{13}{28}$$\n\n**c. (3 marks)**\n\n*Step 1 (1 mark):* $\\Pr(\\text{at least one red}) = 1 - \\Pr(\\text{no red})$.\n\n*Step 2 (1 mark):* $\\Pr(\\text{no red}) = \\Pr(BB) = \\dfrac{20}{56} = \\dfrac{5}{14}$.\n\n*Step 3 (1 mark):* Therefore\n\n$$\\Pr(\\text{at least one red}) = 1 - \\dfrac{5}{14} = \\dfrac{9}{14}$$",
      subtopicSlugs: ["probability-rules"],
    },
    // 8 marks — HARD
    {
      content:
        "Events $A$ and $B$ are such that $\\Pr(A) = p$, $\\Pr(B) = 0.6$, and $A$ and $B$ are independent.\n\n**a.** Write $\\Pr(A \\cap B)$ in terms of $p$. (1 mark)\n\n**b.** Write $\\Pr(A \\cup B)$ in terms of $p$. (2 marks)\n\n**c.** Given that $\\Pr(A \\cup B) = 0.76$, find the value of $p$. (2 marks)\n\n**d.** Hence find $\\Pr(A' \\mid B)$. (3 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n*Step 1 (1 mark):* Since $A$ and $B$ are independent,\n\n$$\\Pr(A \\cap B) = p \\times 0.6 = 0.6p$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Apply the addition rule.\n\n$$\\Pr(A \\cup B) = \\Pr(A) + \\Pr(B) - \\Pr(A \\cap B)$$\n\n*Step 2 (1 mark):* Substitute.\n\n$$= p + 0.6 - 0.6p = 0.4p + 0.6$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Set $0.4p + 0.6 = 0.76$.\n\n*Step 2 (1 mark):* Solve.\n\n$$0.4p = 0.16$$\n\n$$p = 0.4$$\n\n**d. (3 marks)**\n\n*Step 1 (1 mark):* With $p = 0.4$, $\\Pr(A \\cap B) = 0.6 \\times 0.4 = 0.24$.\n\n*Step 2 (1 mark):* Find $\\Pr(A' \\cap B) = \\Pr(B) - \\Pr(A \\cap B) = 0.6 - 0.24 = 0.36$.\n\n*Step 3 (1 mark):* Apply the conditional probability formula.\n\n$$\\Pr(A' \\mid B) = \\dfrac{\\Pr(A' \\cap B)}{\\Pr(B)} = \\dfrac{0.36}{0.6} = 0.6$$",
      subtopicSlugs: ["probability-rules"],
    },
  ],

  // ─── 5. Conditional probability ──────────────────────────────────────────
  "conditional-probability": [
    // 4 marks — MEDIUM
    {
      content:
        "A survey of $100$ students recorded whether they study Mathematics (M) or Science (S).\n\n|  | M | M$'$ | Total |\n|---|---|---|---|\n| S | $30$ | $20$ | $50$ |\n| S$'$ | $25$ | $25$ | $50$ |\n| Total | $55$ | $45$ | $100$ |\n\n**a.** Find $\\Pr(M \\mid S)$. (2 marks)\n\n**b.** Find $\\Pr(S \\mid M)$. (2 marks)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* Apply the conditional probability definition.\n\n$$\\Pr(M \\mid S) = \\dfrac{\\Pr(M \\cap S)}{\\Pr(S)}$$\n\n*Step 2 (1 mark):* Substitute from the table.\n\n$$= \\dfrac{30/100}{50/100} = \\dfrac{30}{50} = \\dfrac{3}{5}$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Apply the formula.\n\n$$\\Pr(S \\mid M) = \\dfrac{\\Pr(M \\cap S)}{\\Pr(M)}$$\n\n*Step 2 (1 mark):* Substitute.\n\n$$= \\dfrac{30/100}{55/100} = \\dfrac{30}{55} = \\dfrac{6}{11}$$",
      subtopicSlugs: ["conditional-probability"],
    },
    // 5 marks — MEDIUM
    {
      content:
        "In a medical test, a disease affects $2\\%$ of a population. The test has the following properties:\n- If a person has the disease, the test is positive with probability $0.95$.\n- If a person does not have the disease, the test is positive with probability $0.03$.\n\n**a.** Construct a tree diagram showing the probabilities. (2 marks)\n\n**b.** Find the probability that a randomly chosen person tests positive. (2 marks)\n\n**c.** State which branches of your tree diagram would be used to find the probability that a person who tests positive has the disease. (1 mark)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* First branch: $\\Pr(D) = 0.02$, $\\Pr(D') = 0.98$.\n\n*Step 2 (1 mark):* Second branches:\n- Given $D$: $\\Pr(+) = 0.95$, $\\Pr(-) = 0.05$.\n- Given $D'$: $\\Pr(+) = 0.03$, $\\Pr(-) = 0.97$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Apply the law of total probability.\n\n$$\\Pr(+) = \\Pr(+ \\mid D)\\Pr(D) + \\Pr(+ \\mid D')\\Pr(D')$$\n\n*Step 2 (1 mark):* Substitute.\n\n$$= 0.95 \\times 0.02 + 0.03 \\times 0.98 = 0.019 + 0.0294 = 0.0484$$\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* To find $\\Pr(D \\mid +)$ we use the branch $D$ then $+$ (the numerator $\\Pr(D \\cap +) = 0.019$) and divide by $\\Pr(+) = 0.0484$ from part (b).",
      subtopicSlugs: ["conditional-probability"],
    },
    // 6 marks — HARD
    {
      content:
        "A two-way table summarises the transport choices of $200$ employees.\n\n|  | Car | Train | Bus | Total |\n|---|---|---|---|---|\n| Full-time | $60$ | $40$ | $20$ | $120$ |\n| Part-time | $30$ | $30$ | $20$ | $80$ |\n| Total | $90$ | $70$ | $40$ | $200$ |\n\nAn employee is chosen at random.\n\n**a.** Find $\\Pr(\\text{Train})$. (1 mark)\n\n**b.** Find $\\Pr(\\text{Full-time} \\mid \\text{Train})$. (2 marks)\n\n**c.** Are the events \"Full-time\" and \"Train\" independent? Justify your answer. (3 marks)",
      marks: 6,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n*Step 1 (1 mark):* From the table,\n\n$$\\Pr(\\text{Train}) = \\dfrac{70}{200} = \\dfrac{7}{20}$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Apply the conditional probability formula.\n\n$$\\Pr(\\text{FT} \\mid \\text{Train}) = \\dfrac{\\Pr(\\text{FT} \\cap \\text{Train})}{\\Pr(\\text{Train})}$$\n\n*Step 2 (1 mark):* Substitute.\n\n$$= \\dfrac{40/200}{70/200} = \\dfrac{40}{70} = \\dfrac{4}{7}$$\n\n**c. (3 marks)**\n\n*Step 1 (1 mark):* For independence we need $\\Pr(\\text{FT} \\cap \\text{Train}) = \\Pr(\\text{FT}) \\times \\Pr(\\text{Train})$.\n\n*Step 2 (1 mark):* Compute the right-hand side.\n\n$$\\Pr(\\text{FT}) \\times \\Pr(\\text{Train}) = \\dfrac{120}{200} \\times \\dfrac{70}{200} = \\dfrac{8400}{40000} = 0.21$$\n\n*Step 3 (1 mark):* Compare: $\\Pr(\\text{FT} \\cap \\text{Train}) = \\dfrac{40}{200} = 0.20 \\neq 0.21$. Since these are not equal, the events are not independent.",
      subtopicSlugs: ["conditional-probability"],
    },
    // 7 marks — HARD
    {
      content:
        "A bag contains $4$ red and $6$ blue marbles. A marble is drawn at random, its colour is noted, and it is not replaced. A second marble is then drawn.\n\n**a.** Find $\\Pr(\\text{second is red} \\mid \\text{first is red})$. (1 mark)\n\n**b.** Find $\\Pr(\\text{both red})$. (2 marks)\n\n**c.** Find $\\Pr(\\text{second is red})$. (2 marks)\n\n**d.** Given that the second marble drawn is red, find the probability that the first marble drawn was also red. (2 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n*Step 1 (1 mark):* After removing one red marble, $3$ red remain out of $9$ total.\n\n$$\\Pr(R_2 \\mid R_1) = \\dfrac{3}{9} = \\dfrac{1}{3}$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Apply the multiplication rule.\n\n$$\\Pr(R_1 \\cap R_2) = \\Pr(R_1) \\times \\Pr(R_2 \\mid R_1)$$\n\n*Step 2 (1 mark):* Substitute.\n\n$$= \\dfrac{4}{10} \\times \\dfrac{3}{9} = \\dfrac{12}{90} = \\dfrac{2}{15}$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Apply the law of total probability.\n\n$$\\Pr(R_2) = \\Pr(R_2 \\mid R_1)\\Pr(R_1) + \\Pr(R_2 \\mid B_1)\\Pr(B_1)$$\n\n*Step 2 (1 mark):* Substitute.\n\n$$= \\dfrac{3}{9} \\times \\dfrac{4}{10} + \\dfrac{4}{9} \\times \\dfrac{6}{10} = \\dfrac{12}{90} + \\dfrac{24}{90} = \\dfrac{36}{90} = \\dfrac{2}{5}$$\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* Apply Bayes' theorem.\n\n$$\\Pr(R_1 \\mid R_2) = \\dfrac{\\Pr(R_1 \\cap R_2)}{\\Pr(R_2)}$$\n\n*Step 2 (1 mark):* Substitute using parts (b) and (c).\n\n$$= \\dfrac{2/15}{2/5} = \\dfrac{2}{15} \\times \\dfrac{5}{2} = \\dfrac{1}{3}$$",
      subtopicSlugs: ["conditional-probability"],
    },
    // 8 marks — HARD
    {
      content:
        "Machine A produces $60\\%$ of items in a factory and Machine B produces the rest. The defect rate for Machine A is $4\\%$ and for Machine B is $7\\%$.\n\n**a.** Find the probability that a randomly chosen item is defective. (2 marks)\n\n**b.** Given that an item is defective, find the probability it was produced by Machine A. (3 marks)\n\n**c.** Given that an item is not defective, find the probability it was produced by Machine B. (3 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* Apply the law of total probability.\n\n$$\\Pr(D) = \\Pr(D \\mid A)\\Pr(A) + \\Pr(D \\mid B)\\Pr(B)$$\n\n*Step 2 (1 mark):* Substitute.\n\n$$= 0.04 \\times 0.6 + 0.07 \\times 0.4 = 0.024 + 0.028 = 0.052$$\n\n**b. (3 marks)**\n\n*Step 1 (1 mark):* Apply Bayes' theorem.\n\n$$\\Pr(A \\mid D) = \\dfrac{\\Pr(D \\mid A)\\Pr(A)}{\\Pr(D)}$$\n\n*Step 2 (1 mark):* Substitute.\n\n$$= \\dfrac{0.024}{0.052}$$\n\n*Step 3 (1 mark):* Simplify.\n\n$$= \\dfrac{24}{52} = \\dfrac{6}{13}$$\n\n**c. (3 marks)**\n\n*Step 1 (1 mark):* First find $\\Pr(D') = 1 - 0.052 = 0.948$.\n\n*Step 2 (1 mark):* Apply Bayes' theorem.\n\n$$\\Pr(B \\mid D') = \\dfrac{\\Pr(D' \\mid B)\\Pr(B)}{\\Pr(D')} = \\dfrac{0.93 \\times 0.4}{0.948}$$\n\n*Step 3 (1 mark):* Simplify.\n\n$$= \\dfrac{0.372}{0.948} = \\dfrac{372}{948} = \\dfrac{31}{79}$$",
      subtopicSlugs: ["conditional-probability"],
    },
  ],

  // ─── 6. Discrete random variables ────────────────────────────────────────
  "discrete-random-variables": [
    // 4 marks — MEDIUM
    {
      content:
        "The discrete random variable $X$ has the following probability distribution.\n\n| $x$ | $0$ | $1$ | $2$ | $3$ |\n|---|---|---|---|---|\n| $\\Pr(X = x)$ | $\\dfrac{1}{6}$ | $\\dfrac{1}{3}$ | $a$ | $\\dfrac{1}{6}$ |\n\n**a.** Find the value of $a$. (1 mark)\n\n**b.** Find $E(X)$. (2 marks)\n\n**c.** Find $\\Pr(X \\geq 2)$. (1 mark)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n*Step 1 (1 mark):* Since the probabilities sum to $1$,\n\n$$\\dfrac{1}{6} + \\dfrac{1}{3} + a + \\dfrac{1}{6} = 1$$\n\n$$a = 1 - \\dfrac{1}{6} - \\dfrac{2}{6} - \\dfrac{1}{6} = \\dfrac{2}{6} = \\dfrac{1}{3}$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Apply $E(X) = \\sum x \\Pr(X = x)$.\n\n$$E(X) = 0 \\times \\dfrac{1}{6} + 1 \\times \\dfrac{1}{3} + 2 \\times \\dfrac{1}{3} + 3 \\times \\dfrac{1}{6}$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$= 0 + \\dfrac{1}{3} + \\dfrac{2}{3} + \\dfrac{1}{2} = \\dfrac{3}{2}$$\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* $\\Pr(X \\geq 2) = \\dfrac{1}{3} + \\dfrac{1}{6} = \\dfrac{1}{2}$.",
      subtopicSlugs: ["discrete-random-variables"],
    },
    // 5 marks — MEDIUM
    {
      content:
        "The discrete random variable $X$ has the probability distribution shown below, where $k$ is a positive constant.\n\n| $x$ | $1$ | $2$ | $3$ | $4$ |\n|---|---|---|---|---|\n| $\\Pr(X = x)$ | $k$ | $2k$ | $3k$ | $4k$ |\n\n**a.** Show that $k = \\dfrac{1}{10}$. (1 mark)\n\n**b.** Find $E(X)$. (2 marks)\n\n**c.** Find $\\text{Var}(X)$. (2 marks)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n*Step 1 (1 mark):* The probabilities must sum to $1$.\n\n$$k + 2k + 3k + 4k = 10k = 1$$\n\nSo $k = \\dfrac{1}{10}$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Compute $E(X) = \\sum x \\Pr(X = x)$.\n\n$$E(X) = 1 \\times \\dfrac{1}{10} + 2 \\times \\dfrac{2}{10} + 3 \\times \\dfrac{3}{10} + 4 \\times \\dfrac{4}{10}$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$= \\dfrac{1 + 4 + 9 + 16}{10} = \\dfrac{30}{10} = 3$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Compute $E(X^2)$.\n\n$$E(X^2) = 1 \\times \\dfrac{1}{10} + 4 \\times \\dfrac{2}{10} + 9 \\times \\dfrac{3}{10} + 16 \\times \\dfrac{4}{10} = \\dfrac{1 + 8 + 27 + 64}{10} = 10$$\n\n*Step 2 (1 mark):* Apply $\\text{Var}(X) = E(X^2) - [E(X)]^2$.\n\n$$= 10 - 9 = 1$$",
      subtopicSlugs: ["discrete-random-variables"],
    },
    // 6 marks — HARD
    {
      content:
        "The probability distribution of a discrete random variable $X$ is given by the table below, where $k$ is a positive constant.\n\n| $x$ | $0$ | $1$ | $2$ | $3$ |\n|---|---|---|---|---|\n| $\\Pr(X = x)$ | $\\dfrac{2}{k}$ | $\\dfrac{k}{50}$ | $\\dfrac{k}{50}$ | $\\dfrac{4}{k}$ |\n\n**a.** Show that $k = 10$ or $k = 15$, and hence state the two possible probability distributions. (3 marks)\n\n**b.** For $k = 10$, find $E(X)$. (2 marks)\n\n**c.** For $k = 10$, find $\\Pr(X \\geq 2)$. (1 mark)",
      marks: 6,
      difficulty: "HARD",
      solutionContent:
        "**a. (3 marks)**\n\n*Step 1 (1 mark):* Set the probabilities to sum to $1$.\n\n$$\\dfrac{2}{k} + \\dfrac{k}{50} + \\dfrac{k}{50} + \\dfrac{4}{k} = 1$$\n\n$$\\dfrac{6}{k} + \\dfrac{k}{25} = 1$$\n\n*Step 2 (1 mark):* Multiply through by $25k$.\n\n$$150 + k^2 = 25k$$\n\n$$k^2 - 25k + 150 = 0$$\n\n$$(k - 10)(k - 15) = 0$$\n\nSo $k = 10$ or $k = 15$.\n\n*Step 3 (1 mark):* For $k = 10$: $\\Pr(X=0) = \\dfrac{1}{5}$, $\\Pr(X=1) = \\dfrac{1}{5}$, $\\Pr(X=2) = \\dfrac{1}{5}$, $\\Pr(X=3) = \\dfrac{2}{5}$.\n\nFor $k = 15$: $\\Pr(X=0) = \\dfrac{2}{15}$, $\\Pr(X=1) = \\dfrac{3}{10}$, $\\Pr(X=2) = \\dfrac{3}{10}$, $\\Pr(X=3) = \\dfrac{4}{15}$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* With $k = 10$, compute $E(X) = \\sum x \\Pr(X = x)$.\n\n$$E(X) = 0 \\times \\dfrac{1}{5} + 1 \\times \\dfrac{1}{5} + 2 \\times \\dfrac{1}{5} + 3 \\times \\dfrac{2}{5}$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$= \\dfrac{1}{5} + \\dfrac{2}{5} + \\dfrac{6}{5} = \\dfrac{9}{5}$$\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* $\\Pr(X \\geq 2) = \\dfrac{1}{5} + \\dfrac{2}{5} = \\dfrac{3}{5}$.",
      subtopicSlugs: ["discrete-random-variables"],
    },
    // 7 marks — HARD
    {
      content:
        "A game costs $\\$2$ to play. A fair die is rolled. If the result is $6$, the player wins $\\$10$. If the result is $4$ or $5$, the player wins $\\$3$. Otherwise, the player wins nothing.\n\nLet $X$ be the player's net profit (winnings minus cost).\n\n**a.** Complete the probability distribution table for $X$. (2 marks)\n\n**b.** Find $E(X)$. (2 marks)\n\n**c.** Find $\\text{SD}(X)$. (3 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* Identify the outcomes: Win $\\$10$ costs $\\$2$ so net $= \\$8$; win $\\$3$ costs $\\$2$ so net $= \\$1$; win $\\$0$ costs $\\$2$ so net $= -\\$2$.\n\n*Step 2 (1 mark):*\n\n| $x$ | $-2$ | $1$ | $8$ |\n|---|---|---|---|\n| $\\Pr(X = x)$ | $\\dfrac{3}{6} = \\dfrac{1}{2}$ | $\\dfrac{2}{6} = \\dfrac{1}{3}$ | $\\dfrac{1}{6}$ |\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Compute $E(X) = \\sum x \\Pr(X = x)$.\n\n$$E(X) = (-2) \\times \\dfrac{1}{2} + 1 \\times \\dfrac{1}{3} + 8 \\times \\dfrac{1}{6}$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$= -1 + \\dfrac{1}{3} + \\dfrac{4}{3} = -1 + \\dfrac{5}{3} = \\dfrac{2}{3}$$\n\n**c. (3 marks)**\n\n*Step 1 (1 mark):* Compute $E(X^2)$.\n\n$$E(X^2) = 4 \\times \\dfrac{1}{2} + 1 \\times \\dfrac{1}{3} + 64 \\times \\dfrac{1}{6} = 2 + \\dfrac{1}{3} + \\dfrac{32}{3} = 2 + 11 = 13$$\n\n*Step 2 (1 mark):* Find $\\text{Var}(X) = E(X^2) - [E(X)]^2$.\n\n$$= 13 - \\dfrac{4}{9} = \\dfrac{113}{9}$$\n\n*Step 3 (1 mark):* Take the square root.\n\n$$\\text{SD}(X) = \\sqrt{\\dfrac{113}{9}} = \\dfrac{\\sqrt{113}}{3}$$",
      subtopicSlugs: ["discrete-random-variables"],
    },
    // 8 marks — HARD
    {
      content:
        "The discrete random variable $X$ has the probability distribution shown, where $a$ and $b$ are positive constants.\n\n| $x$ | $1$ | $2$ | $3$ | $4$ |\n|---|---|---|---|---|\n| $\\Pr(X = x)$ | $a$ | $b$ | $b$ | $a$ |\n\nIt is given that $E(X) = 2.5$ and $\\text{Var}(X) = 1$.\n\n**a.** Show that $2a + 2b = 1$. (1 mark)\n\n**b.** Show that $E(X) = 2.5$ for all valid values of $a$ and $b$. (2 marks)\n\n**c.** Using $\\text{Var}(X) = 1$, find the values of $a$ and $b$. (3 marks)\n\n**d.** Find $\\Pr(X > E(X))$. (2 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n*Step 1 (1 mark):* The probabilities sum to $1$.\n\n$$a + b + b + a = 2a + 2b = 1$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Compute $E(X) = 1 \\cdot a + 2 \\cdot b + 3 \\cdot b + 4 \\cdot a$.\n\n$$= 5a + 5b$$\n\n*Step 2 (1 mark):* From part (a), $2a + 2b = 1$ so $a + b = \\dfrac{1}{2}$. Therefore\n\n$$E(X) = 5(a + b) = 5 \\times \\dfrac{1}{2} = \\dfrac{5}{2} = 2.5$$\n\nThis holds for all valid $a$, $b$.\n\n**c. (3 marks)**\n\n*Step 1 (1 mark):* Compute $E(X^2) = 1 \\cdot a + 4 \\cdot b + 9 \\cdot b + 16 \\cdot a = 17a + 13b$.\n\n*Step 2 (1 mark):* Set $\\text{Var}(X) = E(X^2) - [E(X)]^2 = 1$.\n\n$$17a + 13b - 6.25 = 1$$\n\n$$17a + 13b = 7.25$$\n\n*Step 3 (1 mark):* From $a + b = 0.5$, so $b = 0.5 - a$. Substitute.\n\n$$17a + 13(0.5 - a) = 7.25$$\n\n$$17a + 6.5 - 13a = 7.25$$\n\n$$4a = 0.75$$\n\n$$a = \\dfrac{3}{16}, \\quad b = \\dfrac{5}{16}$$\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* $\\Pr(X > 2.5) = \\Pr(X = 3) + \\Pr(X = 4) = b + a$.\n\n*Step 2 (1 mark):* Substitute.\n\n$$= \\dfrac{5}{16} + \\dfrac{3}{16} = \\dfrac{8}{16} = \\dfrac{1}{2}$$",
      subtopicSlugs: ["discrete-random-variables"],
    },
  ],

  // ─── 7. Binomial distribution ────────────────────────────────────────────
  "binomial-distribution": [
    // 4 marks — MEDIUM
    {
      content:
        "Let $X \\sim \\text{Bi}\\!\\left(4, \\dfrac{1}{3}\\right)$.\n\n**a.** Find $\\Pr(X = 0)$. (1 mark)\n\n**b.** Find $\\Pr(X \\geq 1)$. (1 mark)\n\n**c.** Find $E(X)$ and $\\text{Var}(X)$. (2 marks)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n*Step 1 (1 mark):* Apply the binomial formula with $x = 0$.\n\n$$\\Pr(X = 0) = \\binom{4}{0}\\left(\\dfrac{1}{3}\\right)^0\\left(\\dfrac{2}{3}\\right)^4 = \\dfrac{16}{81}$$\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* Use the complement.\n\n$$\\Pr(X \\geq 1) = 1 - \\Pr(X = 0) = 1 - \\dfrac{16}{81} = \\dfrac{65}{81}$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* $E(X) = np = 4 \\times \\dfrac{1}{3} = \\dfrac{4}{3}$.\n\n*Step 2 (1 mark):* $\\text{Var}(X) = np(1-p) = 4 \\times \\dfrac{1}{3} \\times \\dfrac{2}{3} = \\dfrac{8}{9}$.",
      subtopicSlugs: ["binomial-distribution"],
    },
    // 5 marks — MEDIUM
    {
      content:
        "A fair coin is tossed $8$ times. Let $X$ be the number of heads.\n\n**a.** State the distribution of $X$. (1 mark)\n\n**b.** Find $\\Pr(X = 6)$. (2 marks)\n\n**c.** Find $\\Pr(X \\leq 1)$. (2 marks)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n*Step 1 (1 mark):* $X \\sim \\text{Bi}\\!\\left(8, \\dfrac{1}{2}\\right)$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Apply the binomial formula.\n\n$$\\Pr(X = 6) = \\binom{8}{6}\\left(\\dfrac{1}{2}\\right)^8 = 28 \\times \\dfrac{1}{256}$$\n\n*Step 2 (1 mark):* Simplify.\n\n$$= \\dfrac{28}{256} = \\dfrac{7}{64}$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Compute $\\Pr(X = 0)$ and $\\Pr(X = 1)$.\n\n$$\\Pr(X = 0) = \\left(\\dfrac{1}{2}\\right)^8 = \\dfrac{1}{256}$$\n\n$$\\Pr(X = 1) = 8 \\times \\left(\\dfrac{1}{2}\\right)^8 = \\dfrac{8}{256}$$\n\n*Step 2 (1 mark):* Add.\n\n$$\\Pr(X \\leq 1) = \\dfrac{1}{256} + \\dfrac{8}{256} = \\dfrac{9}{256}$$",
      subtopicSlugs: ["binomial-distribution"],
    },
    // 6 marks — HARD
    {
      content:
        "A multiple-choice test has $5$ questions, each with $4$ options (one correct). A student guesses every answer. Let $X$ be the number of correct answers.\n\n**a.** State the distribution of $X$ and give its mean and standard deviation. (2 marks)\n\n**b.** Find $\\Pr(X \\geq 3)$. (2 marks)\n\n**c.** Find $\\Pr(X = 2 \\mid X \\geq 1)$. (2 marks)",
      marks: 6,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* $X \\sim \\text{Bi}\\!\\left(5, \\dfrac{1}{4}\\right)$.\n\n*Step 2 (1 mark):* $E(X) = 5 \\times \\dfrac{1}{4} = \\dfrac{5}{4}$ and $\\text{SD}(X) = \\sqrt{5 \\times \\dfrac{1}{4} \\times \\dfrac{3}{4}} = \\sqrt{\\dfrac{15}{16}} = \\dfrac{\\sqrt{15}}{4}$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Compute each term.\n\n$$\\Pr(X = 3) = \\binom{5}{3}\\left(\\dfrac{1}{4}\\right)^3\\left(\\dfrac{3}{4}\\right)^2 = 10 \\times \\dfrac{9}{1024} = \\dfrac{90}{1024}$$\n\n$$\\Pr(X = 4) = \\binom{5}{4}\\left(\\dfrac{1}{4}\\right)^4\\left(\\dfrac{3}{4}\\right) = 5 \\times \\dfrac{3}{1024} = \\dfrac{15}{1024}$$\n\n$$\\Pr(X = 5) = \\left(\\dfrac{1}{4}\\right)^5 = \\dfrac{1}{1024}$$\n\n*Step 2 (1 mark):* Add.\n\n$$\\Pr(X \\geq 3) = \\dfrac{90 + 15 + 1}{1024} = \\dfrac{106}{1024} = \\dfrac{53}{512}$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* First find $\\Pr(X = 0) = \\left(\\dfrac{3}{4}\\right)^5 = \\dfrac{243}{1024}$, so $\\Pr(X \\geq 1) = 1 - \\dfrac{243}{1024} = \\dfrac{781}{1024}$.\n\nAnd $\\Pr(X = 2) = \\binom{5}{2}\\left(\\dfrac{1}{4}\\right)^2\\left(\\dfrac{3}{4}\\right)^3 = 10 \\times \\dfrac{27}{1024} = \\dfrac{270}{1024}$.\n\n*Step 2 (1 mark):* Apply conditional probability.\n\n$$\\Pr(X = 2 \\mid X \\geq 1) = \\dfrac{270/1024}{781/1024} = \\dfrac{270}{781}$$",
      subtopicSlugs: ["binomial-distribution"],
    },
    // 7 marks — HARD
    {
      content:
        "A manufacturer knows that $\\dfrac{1}{5}$ of items produced are defective. A batch of $10$ items is selected at random. Let $X$ be the number of defective items.\n\n**a.** State the distribution of $X$. (1 mark)\n\n**b.** Find $\\Pr(X = 2)$. (2 marks)\n\n**c.** Find $\\Pr(X \\leq 1)$. (2 marks)\n\n**d.** Find $E(X)$ and $\\text{Var}(X)$. (2 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n*Step 1 (1 mark):* $X \\sim \\text{Bi}\\!\\left(10, \\dfrac{1}{5}\\right)$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Apply the binomial formula.\n\n$$\\Pr(X = 2) = \\binom{10}{2}\\left(\\dfrac{1}{5}\\right)^2\\left(\\dfrac{4}{5}\\right)^8$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$= 45 \\times \\dfrac{1}{25} \\times \\dfrac{65536}{390625} = 45 \\times \\dfrac{65536}{9765625} = \\dfrac{2949120}{9765625}$$\n\nSimplifying: $= \\dfrac{45 \\times 4^8}{5^{10}} = \\dfrac{45 \\times 65536}{9765625} \\approx 0.3020$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Compute $\\Pr(X = 0)$ and $\\Pr(X = 1)$.\n\n$$\\Pr(X = 0) = \\left(\\dfrac{4}{5}\\right)^{10} = \\dfrac{4^{10}}{5^{10}} = \\dfrac{1048576}{9765625}$$\n\n$$\\Pr(X = 1) = 10 \\times \\dfrac{1}{5} \\times \\left(\\dfrac{4}{5}\\right)^9 = \\dfrac{10 \\times 4^9}{5^{10}} = \\dfrac{2621440}{9765625}$$\n\n*Step 2 (1 mark):* Add.\n\n$$\\Pr(X \\leq 1) = \\dfrac{1048576 + 2621440}{9765625} = \\dfrac{3670016}{9765625} \\approx 0.3758$$\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* $E(X) = np = 10 \\times \\dfrac{1}{5} = 2$.\n\n*Step 2 (1 mark):* $\\text{Var}(X) = np(1-p) = 10 \\times \\dfrac{1}{5} \\times \\dfrac{4}{5} = \\dfrac{8}{5}$.",
      subtopicSlugs: ["binomial-distribution"],
    },
    // 8 marks — HARD
    {
      content:
        "A biased coin has $\\Pr(\\text{Head}) = \\dfrac{2}{3}$. The coin is tossed $6$ times. Let $X$ be the number of heads.\n\n**a.** State the distribution of $X$ and find $E(X)$. (2 marks)\n\n**b.** Find $\\Pr(X = 4)$. (2 marks)\n\n**c.** Find $\\Pr(X \\geq 5)$. (2 marks)\n\n**d.** Find $\\text{Var}(X)$ and $\\text{SD}(X)$. (2 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* $X \\sim \\text{Bi}\\!\\left(6, \\dfrac{2}{3}\\right)$.\n\n*Step 2 (1 mark):* $E(X) = np = 6 \\times \\dfrac{2}{3} = 4$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Apply the binomial formula.\n\n$$\\Pr(X = 4) = \\binom{6}{4}\\left(\\dfrac{2}{3}\\right)^4\\left(\\dfrac{1}{3}\\right)^2$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$= 15 \\times \\dfrac{16}{81} \\times \\dfrac{1}{9} = 15 \\times \\dfrac{16}{729} = \\dfrac{240}{729} = \\dfrac{80}{243}$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Compute $\\Pr(X = 5)$ and $\\Pr(X = 6)$.\n\n$$\\Pr(X = 5) = \\binom{6}{5}\\left(\\dfrac{2}{3}\\right)^5\\left(\\dfrac{1}{3}\\right) = 6 \\times \\dfrac{32}{243} \\times \\dfrac{1}{3} = \\dfrac{192}{729} = \\dfrac{64}{243}$$\n\n$$\\Pr(X = 6) = \\left(\\dfrac{2}{3}\\right)^6 = \\dfrac{64}{729}$$\n\n*Step 2 (1 mark):* Add.\n\n$$\\Pr(X \\geq 5) = \\dfrac{64}{243} + \\dfrac{64}{729} = \\dfrac{192}{729} + \\dfrac{64}{729} = \\dfrac{256}{729}$$\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* $\\text{Var}(X) = np(1-p) = 6 \\times \\dfrac{2}{3} \\times \\dfrac{1}{3} = \\dfrac{4}{3}$.\n\n*Step 2 (1 mark):* $\\text{SD}(X) = \\sqrt{\\dfrac{4}{3}} = \\dfrac{2}{\\sqrt{3}} = \\dfrac{2\\sqrt{3}}{3}$.",
      subtopicSlugs: ["binomial-distribution"],
    },
  ],

  // ─── 8. Sample proportions and sampling ──────────────────────────────────
  "sample-proportions-and-sampling": [
    // 4 marks — MEDIUM
    {
      content:
        "A population has proportion $p = 0.4$. A random sample of $n = 100$ is taken.\n\nYou are given that $\\Pr(Z < 2) = 0.9772$.\n\n**a.** Find the mean and standard deviation of the distribution of $\\hat{p}$. (2 marks)\n\n**b.** Find $\\Pr(\\hat{p} < 0.5)$. (2 marks)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* The mean of $\\hat{p}$ is $p = 0.4$.\n\n*Step 2 (1 mark):* The standard deviation is\n\n$$\\text{SD}(\\hat{p}) = \\sqrt{\\dfrac{p(1-p)}{n}} = \\sqrt{\\dfrac{0.4 \\times 0.6}{100}} = \\sqrt{0.0024} = 0.04899$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Standardise $\\hat{p} = 0.5$.\n\n$$z = \\dfrac{0.5 - 0.4}{0.04899} \\approx 2$$\n\n*Step 2 (1 mark):* Read the probability.\n\n$$\\Pr(\\hat{p} < 0.5) \\approx \\Pr(Z < 2) = 0.9772$$",
      subtopicSlugs: ["sample-proportions-and-sampling"],
    },
    // 5 marks — MEDIUM
    {
      content:
        "A factory claims that $70\\%$ of its products pass quality control. A sample of $n = 225$ products is tested and $\\hat{p} = 0.64$ pass.\n\nYou are given that $\\Pr(Z < -1.96) = 0.025$.\n\n**a.** Find the standard deviation of $\\hat{p}$ under the factory's claim. (1 mark)\n\n**b.** Find the $z$-score for the observed $\\hat{p}$. (2 marks)\n\n**c.** Using the given information, determine whether $\\hat{p} = 0.64$ is unusually low at the $5\\%$ significance level. (2 marks)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n*Step 1 (1 mark):* Under the claim $p = 0.7$,\n\n$$\\text{SD}(\\hat{p}) = \\sqrt{\\dfrac{0.7 \\times 0.3}{225}} = \\sqrt{\\dfrac{0.21}{225}} \\approx 0.03055$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Standardise the observed proportion.\n\n$$z = \\dfrac{\\hat{p} - p}{\\text{SD}(\\hat{p})} = \\dfrac{0.64 - 0.70}{0.03055}$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$\\approx \\dfrac{-0.06}{0.03055} \\approx -1.96$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* The observed $z \\approx -1.96$. From the given information, $\\Pr(Z < -1.96) = 0.025$.\n\n*Step 2 (1 mark):* Since $0.025 < 0.05$, the result falls in the lower $2.5\\%$ tail. This is unusually low at the $5\\%$ significance level (two-tailed), providing evidence against the factory's claim.",
      subtopicSlugs: ["sample-proportions-and-sampling"],
    },
    // 6 marks — HARD
    {
      content:
        "A survey of $n = 400$ residents finds that $\\hat{p} = 0.45$ support a new policy.\n\n**a.** Calculate the approximate $95\\%$ confidence interval for $p$. (3 marks)\n\n**b.** The council claims that majority support exists (i.e. $p > 0.5$). Does the confidence interval support this claim? Justify. (1 mark)\n\n**c.** How large should the sample be so that the margin of error is at most $0.03$? (2 marks)",
      marks: 6,
      difficulty: "HARD",
      solutionContent:
        "**a. (3 marks)**\n\n*Step 1 (1 mark):* Compute the standard error.\n\n$$\\text{SE} = \\sqrt{\\dfrac{0.45 \\times 0.55}{400}} = \\sqrt{\\dfrac{0.2475}{400}} = \\sqrt{0.00061875} \\approx 0.02487$$\n\n*Step 2 (1 mark):* Find the margin of error.\n\n$$M = 1.96 \\times 0.02487 \\approx 0.0487$$\n\n*Step 3 (1 mark):* The $95\\%$ confidence interval is\n\n$$0.45 \\pm 0.0487$$\n\n$$\\approx (0.401, 0.499)$$\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* The entire confidence interval lies below $0.5$, so the data does not support the claim of majority support.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Set $1.96\\sqrt{\\dfrac{0.45 \\times 0.55}{n}} \\leq 0.03$.\n\n$$\\sqrt{\\dfrac{0.2475}{n}} \\leq \\dfrac{0.03}{1.96} \\approx 0.015306$$\n\n*Step 2 (1 mark):* Solve for $n$.\n\n$$\\dfrac{0.2475}{n} \\leq 0.0002343$$\n\n$$n \\geq \\dfrac{0.2475}{0.0002343} \\approx 1056.3$$\n\nSo the sample size should be at least $n = 1057$.",
      subtopicSlugs: ["sample-proportions-and-sampling"],
    },
    // 7 marks — HARD
    {
      content:
        "Two independent random samples are taken from a population where $p = 0.5$. Sample 1 has $n_1 = 100$ and Sample 2 has $n_2 = 400$.\n\nYou are given that $\\Pr(Z < 1) = 0.8413$.\n\n**a.** Find the standard deviation of $\\hat{p}_1$ and $\\hat{p}_2$. (2 marks)\n\n**b.** Find $\\Pr(\\hat{p}_1 > 0.55)$. (2 marks)\n\n**c.** Find $\\Pr(\\hat{p}_2 > 0.525)$. (2 marks)\n\n**d.** Explain why the probability in part (c) is greater than in part (b), despite the threshold being closer to $p$. (1 mark)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n*Step 1 (1 mark):* $\\text{SD}(\\hat{p}_1) = \\sqrt{\\dfrac{0.5 \\times 0.5}{100}} = \\sqrt{0.0025} = 0.05$.\n\n*Step 2 (1 mark):* $\\text{SD}(\\hat{p}_2) = \\sqrt{\\dfrac{0.25}{400}} = \\sqrt{0.000625} = 0.025$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Standardise.\n\n$$z = \\dfrac{0.55 - 0.5}{0.05} = 1$$\n\n*Step 2 (1 mark):* $\\Pr(\\hat{p}_1 > 0.55) = 1 - \\Pr(Z < 1) = 1 - 0.8413 = 0.1587$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Standardise.\n\n$$z = \\dfrac{0.525 - 0.5}{0.025} = 1$$\n\n*Step 2 (1 mark):* $\\Pr(\\hat{p}_2 > 0.525) = 1 - 0.8413 = 0.1587$.\n\n**d. (1 mark)**\n\n*Step 1 (1 mark):* The probabilities are equal because both give $z = 1$. The larger sample has a smaller standard deviation ($0.025$ vs $0.05$), so the threshold $0.525$ in Sample 2 is the same number of standard deviations from the mean as $0.55$ in Sample 1.",
      subtopicSlugs: ["sample-proportions-and-sampling"],
    },
    // 8 marks — HARD
    {
      content:
        "A political poll surveys $n = 625$ voters and finds $\\hat{p} = 0.52$ intend to vote for Candidate A.\n\n**a.** Find the $95\\%$ confidence interval for $p$. (3 marks)\n\n**b.** Does the confidence interval provide evidence that Candidate A will win (i.e. $p > 0.5$)? Justify your answer. (2 marks)\n\n**c.** Find the minimum sample size required so that $\\hat{p} = 0.52$ gives a $95\\%$ confidence interval that lies entirely above $0.5$. (3 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (3 marks)**\n\n*Step 1 (1 mark):* Compute the standard error.\n\n$$\\text{SE} = \\sqrt{\\dfrac{0.52 \\times 0.48}{625}} = \\sqrt{\\dfrac{0.2496}{625}} = \\sqrt{0.0003994} \\approx 0.01998$$\n\n*Step 2 (1 mark):* Find the margin of error.\n\n$$M = 1.96 \\times 0.01998 \\approx 0.03917$$\n\n*Step 3 (1 mark):* The interval is\n\n$$0.52 \\pm 0.03917$$\n\n$$\\approx (0.481, 0.559)$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* The lower bound of the confidence interval is approximately $0.481$, which is below $0.5$.\n\n*Step 2 (1 mark):* Since $0.5$ lies within the confidence interval, there is not sufficient evidence at the $95\\%$ level to conclude that Candidate A will win.\n\n**c. (3 marks)**\n\n*Step 1 (1 mark):* We need the lower bound $\\hat{p} - 1.96\\sqrt{\\dfrac{\\hat{p}(1-\\hat{p})}{n}} > 0.5$.\n\n$$0.52 - 1.96\\sqrt{\\dfrac{0.2496}{n}} > 0.5$$\n\n*Step 2 (1 mark):* Rearrange.\n\n$$1.96\\sqrt{\\dfrac{0.2496}{n}} < 0.02$$\n\n$$\\sqrt{\\dfrac{0.2496}{n}} < 0.010204$$\n\n*Step 3 (1 mark):* Solve for $n$.\n\n$$\\dfrac{0.2496}{n} < 0.00010412$$\n\n$$n > \\dfrac{0.2496}{0.00010412} \\approx 2397.2$$\n\nSo the minimum sample size is $n = 2398$.",
      subtopicSlugs: ["sample-proportions-and-sampling"],
    },
  ],
};

function main(): void {
  const slugs = Object.keys(NEW_QUESTIONS);
  for (const slug of slugs) {
    const filePath = path.join(OUT_DIR, `qset-${slug}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`  ${filePath}: not found, skipping.`);
      continue;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    // Idempotent: skip if already has 5+ extendedAnswer items
    if (Array.isArray(data.extendedAnswer) && data.extendedAnswer.length >= 5) {
      console.log(
        `  ${slug}: already has ${data.extendedAnswer.length} EAs, skipping.`
      );
      continue;
    }

    const additions = NEW_QUESTIONS[slug];

    // Validate: each question's part marks sum to declared total
    for (const q of additions) {
      const partHeaderPattern = /\*\*[a-z]\.\s*\((\d+)\s*marks?\)\*\*/g;
      const partMatches = [...q.solutionContent.matchAll(partHeaderPattern)];
      const partSum = partMatches.reduce((acc, m) => acc + Number(m[1]), 0);
      if (partSum !== q.marks) {
        throw new Error(
          `[${slug}] Part-mark mismatch: declared ${q.marks}, part headers sum to ${partSum}. Content: ${q.content.slice(0, 80)}`
        );
      }
    }

    // Validate: within each part, step marks sum to part marks
    for (const q of additions) {
      const parts = q.solutionContent.split(/(?=\*\*[a-z]\.\s*\(\d+\s*marks?\)\*\*)/);
      for (const part of parts) {
        const partHeader = part.match(/\*\*[a-z]\.\s*\((\d+)\s*marks?\)\*\*/);
        if (!partHeader) continue;
        const partMarks = Number(partHeader[1]);
        const stepMatches = [...part.matchAll(/\*Step \d+ \((\d+) marks?\):\*/g)];
        const stepSum = stepMatches.reduce((acc, m) => acc + Number(m[1]), 0);
        if (stepSum !== partMarks) {
          throw new Error(
            `[${slug}] Step-mark mismatch in part: declared ${partMarks}, steps sum to ${stepSum}. Content: ${q.content.slice(0, 80)}`
          );
        }
      }
    }

    // Split any chain equalities in display math
    for (const q of additions) {
      q.solutionContent = dechainSolution(q.solutionContent);
    }

    data.extendedAnswer = additions;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(
      `  ${slug}: added ${additions.length} EAs.`
    );
  }
  console.log("\nDone.");
}

main();
