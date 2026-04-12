/**
 * add-sa-probability.ts
 *
 * Appends 5 new short-answer questions to each of the 8 Data Analysis,
 * Probability, and Statistics subtopic JSON files under scripts/output/.
 * Idempotent: files already at 15+ shortAnswer items are skipped.
 *
 * Run: npx tsx scripts/add-sa-probability.ts
 */
import fs from "fs";
import path from "path";
import { dechainSolution } from "./qset-helpers";

interface FR {
  content: string;
  marks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  solutionContent: string;
  subtopicSlugs: string[];
}

const OUT_DIR = path.join(__dirname, "output");

const NEW_QUESTIONS: Record<string, FR[]> = {
  // ─── 1. Continuous random variables ───────────────────────────────────────
  "continuous-random-variables": [
    {
      content:
        "The continuous random variable $X$ has probability density function $f(x) = \\dfrac{3}{8}x^2$ on $[0, 2]$ and $0$ elsewhere. Find $\\Pr(X \\leq 1)$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Set up the integral from $0$ to $1$.\n\n$$\\Pr(X \\leq 1) = \\int_0^1 \\dfrac{3}{8}x^2 \\, dx$$\n\n**Step 2 (1 mark):** Evaluate.\n\n$$\\Pr(X \\leq 1) = \\left[\\dfrac{x^3}{8}\\right]_0^1$$\n\n$$\\Pr(X \\leq 1) = \\dfrac{1}{8}$$",
      subtopicSlugs: ["continuous-random-variables"],
    },
    {
      content:
        "A continuous random variable $X$ has probability density function $f(x) = \\dfrac{1}{2}\\sin x$ on $[0, \\pi]$ and $0$ elsewhere. Show that $f$ is a valid probability density function.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Note $f(x) = \\dfrac{1}{2}\\sin x \\geq 0$ on $[0, \\pi]$ since $\\sin x \\geq 0$ throughout this interval.\n\n**Step 2 (1 mark):** Set up the total-area integral.\n\n$$\\int_0^\\pi \\dfrac{1}{2}\\sin x \\, dx = \\dfrac{1}{2}\\left[-\\cos x\\right]_0^\\pi$$\n\n**Step 3 (1 mark):** Evaluate.\n\n$$= \\dfrac{1}{2}\\left(-\\cos\\pi + \\cos 0\\right)$$\n\n$$= \\dfrac{1}{2}(1 + 1) = 1$$\n\nBoth conditions hold, so $f$ is a valid pdf.",
      subtopicSlugs: ["continuous-random-variables"],
    },
    {
      content:
        "The continuous random variable $X$ has probability density function $f(x) = \\dfrac{1}{5}$ on $[0, 5]$. Find $\\text{Var}(X)$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Compute $E(X)$.\n\n$$E(X) = \\int_0^5 x \\cdot \\dfrac{1}{5} \\, dx = \\dfrac{1}{5}\\left[\\dfrac{x^2}{2}\\right]_0^5 = \\dfrac{5}{2}$$\n\n**Step 2 (1 mark):** Compute $E(X^2)$.\n\n$$E(X^2) = \\int_0^5 x^2 \\cdot \\dfrac{1}{5} \\, dx = \\dfrac{1}{5}\\left[\\dfrac{x^3}{3}\\right]_0^5 = \\dfrac{25}{3}$$\n\n**Step 3 (1 mark):** Apply $\\text{Var}(X) = E(X^2) - [E(X)]^2$.\n\n$$\\text{Var}(X) = \\dfrac{25}{3} - \\dfrac{25}{4} = \\dfrac{25}{12}$$",
      subtopicSlugs: ["continuous-random-variables"],
    },
    {
      content:
        "The time (in hours) that a customer waits for service has pdf $f(x) = 2e^{-2x}$ for $x \\geq 0$. Find $\\Pr(X > 1 \\mid X > 0.5)$.",
      marks: 3,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Compute $\\Pr(X > a)$ for general $a \\geq 0$.\n\n$$\\Pr(X > a) = \\int_a^\\infty 2e^{-2x} \\, dx = \\left[-e^{-2x}\\right]_a^\\infty = e^{-2a}$$\n\n**Step 2 (1 mark):** Apply conditional probability.\n\n$$\\Pr(X > 1 \\mid X > 0.5) = \\dfrac{\\Pr(X > 1)}{\\Pr(X > 0.5)}$$\n\n**Step 3 (1 mark):** Substitute and simplify.\n\n$$= \\dfrac{e^{-2}}{e^{-1}}$$\n\n$$= e^{-1}$$",
      subtopicSlugs: ["continuous-random-variables"],
    },
    {
      content:
        "The pdf of $X$ is $f(x) = 1 - \\lvert x \\rvert$ for $-1 \\leq x \\leq 1$ and $0$ elsewhere. Find the median of $X$.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** The pdf is symmetric about $x = 0$ because $f(-x) = f(x)$.\n\n**Step 2 (1 mark):** By symmetry the median $m$ satisfies $\\Pr(X \\leq m) = 0.5$, and $x = 0$ is a candidate.\n\n**Step 3 (1 mark):** Verify by integrating from $-1$ to $0$.\n\n$$\\int_{-1}^0 (1 - \\lvert x \\rvert) \\, dx = \\int_{-1}^0 (1 + x) \\, dx$$\n\n**Step 4 (1 mark):** Evaluate.\n\n$$= \\left[x + \\dfrac{x^2}{2}\\right]_{-1}^0 = 0 - \\left(-1 + \\dfrac{1}{2}\\right) = \\dfrac{1}{2}$$\n\nHence the median is $m = 0$.",
      subtopicSlugs: ["continuous-random-variables"],
    },
  ],

  // ─── 2. Normal distribution ───────────────────────────────────────────────
  "normal-distribution": [
    {
      content:
        "Let $X \\sim N(20, 16)$. Find the standardised value of $X = 26$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Identify $\\mu = 20$ and $\\sigma = \\sqrt{16} = 4$.\n\n**Step 2 (1 mark):** Compute the $z$-score.\n\n$$z = \\dfrac{26 - 20}{4}$$\n\n$$z = 1.5$$",
      subtopicSlugs: ["normal-distribution"],
    },
    {
      content:
        "The heights (in cm) of adult males in a town are modelled by $X \\sim N(175, 64)$. Using $\\Pr(Z < 2) = 0.9772$, find the probability that a randomly chosen male is shorter than $191$ cm.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Identify $\\mu = 175$, $\\sigma = 8$ and standardise.\n\n$$z = \\dfrac{191 - 175}{8}$$\n\n$$z = 2$$\n\n**Step 2 (1 mark):** Express the required probability.\n\n$$\\Pr(X < 191) = \\Pr(Z < 2)$$\n\n**Step 3 (1 mark):** Read the value.\n\n$$\\Pr(X < 191) = 0.9772$$",
      subtopicSlugs: ["normal-distribution"],
    },
    {
      content:
        "A battery life (in hours) follows $X \\sim N(50, 25)$. In a shipment of $2000$ batteries, approximately how many are expected to last between $45$ and $55$ hours? Use $\\Pr(-1 < Z < 1) = 0.6826$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Standardise. $\\sigma = 5$.\n\n$$z_1 = \\dfrac{45 - 50}{5} = -1, \\quad z_2 = \\dfrac{55 - 50}{5} = 1$$\n\n**Step 2 (1 mark):** Use the given probability.\n\n$$\\Pr(45 < X < 55) = 0.6826$$\n\n**Step 3 (1 mark):** Multiply by the shipment size.\n\n$$\\text{Expected number} = 2000 \\times 0.6826 = 1365.2$$\n\nApproximately $1365$ batteries.",
      subtopicSlugs: ["normal-distribution"],
    },
    {
      content:
        "For $X \\sim N(\\mu, \\sigma^2)$, the value $X = 58$ has $z$-score $1.645$ and $X = 50$ has $z$-score $0$. Find $\\mu$ and $\\sigma$.",
      marks: 3,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** From $z = 0$ at $X = 50$, we have $\\mu = 50$.\n\n**Step 2 (1 mark):** Use the other condition with $z = \\dfrac{X - \\mu}{\\sigma}$.\n\n$$1.645 = \\dfrac{58 - 50}{\\sigma}$$\n\n**Step 3 (1 mark):** Solve for $\\sigma$.\n\n$$\\sigma = \\dfrac{8}{1.645}$$\n\n$$\\sigma \\approx 4.863$$",
      subtopicSlugs: ["normal-distribution"],
    },
    {
      content:
        "The duration (in minutes) of a train journey is $X \\sim N(30, 4)$. The train company defines a journey as 'on time' if it takes less than $32$ minutes. Using $\\Pr(Z < 1) = 0.8413$, find the probability that, of $4$ independent journeys, exactly $3$ are on time. (Leave as an exact expression.)",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Standardise to find $p = \\Pr(X < 32)$. $\\sigma = 2$.\n\n$$z = \\dfrac{32 - 30}{2} = 1$$\n\n$$p = \\Pr(Z < 1) = 0.8413$$\n\n**Step 2 (1 mark):** Let $Y$ be the number of on-time journeys out of $4$. Then $Y \\sim \\text{Bi}(4, 0.8413)$.\n\n**Step 3 (1 mark):** Apply the binomial pmf.\n\n$$\\Pr(Y = 3) = \\binom{4}{3}(0.8413)^3(0.1587)^1$$\n\n**Step 4 (1 mark):** Simplify the expression.\n\n$$\\Pr(Y = 3) = 4(0.8413)^3(0.1587)$$",
      subtopicSlugs: ["normal-distribution"],
    },
  ],

  // ─── 3. Confidence intervals ──────────────────────────────────────────────
  "confidence-intervals": [
    {
      content:
        "A random sample of $n = 100$ has sample proportion $\\hat{p} = 0.60$. Compute the $95\\%$ confidence interval for the population proportion $p$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Compute the standard error.\n\n$$\\text{SE} = \\sqrt{\\dfrac{0.60 \\cdot 0.40}{100}} = 0.049$$\n\n**Step 2 (1 mark):** Apply $\\hat{p} \\pm 1.96 \\cdot \\text{SE}$.\n\n$$0.60 \\pm 1.96 \\cdot 0.049 \\approx (0.504, 0.696)$$",
      subtopicSlugs: ["confidence-intervals"],
    },
    {
      content:
        "Explain what happens to the width of a confidence interval for a proportion when, with $\\hat{p}$ fixed, the sample size $n$ is quadrupled.",
      marks: 2,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** The margin of error is $E = z^* \\sqrt{\\dfrac{\\hat{p}(1 - \\hat{p})}{n}}$, which is proportional to $\\dfrac{1}{\\sqrt{n}}$.\n\n**Step 2 (1 mark):** Replacing $n$ with $4n$ gives a factor $\\dfrac{1}{\\sqrt{4}} = \\dfrac{1}{2}$, so the margin of error (and hence the width) is halved.",
      subtopicSlugs: ["confidence-intervals"],
    },
    {
      content:
        "A random sample of $n = 150$ apples has mean weight $\\bar{x} = 120$ g with population standard deviation $\\sigma = 12$ g.\n\na. Construct a $90\\%$ confidence interval for $\\mu$. (2 marks)\n\nb. State whether $\\mu = 122$ g is a plausible value. (1 mark)",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Compute the standard error.\n\n$$\\text{SE} = \\dfrac{12}{\\sqrt{150}} \\approx 0.9798$$\n\n**Step 2 (1 mark):** Apply $\\bar{x} \\pm 1.645 \\cdot \\text{SE}$.\n\n$$120 \\pm 1.645 \\cdot 0.9798 \\approx (118.39, 121.61)$$\n\n**Step 3 (1 mark):** Since $122$ lies outside $(118.39, 121.61)$, $\\mu = 122$ g is not a plausible value at the $90\\%$ level.",
      subtopicSlugs: ["confidence-intervals"],
    },
    {
      content:
        "A polling company wants a $95\\%$ confidence interval for the true proportion of voters supporting a policy, with margin of error at most $0.03$. Find the minimum sample size $n$ using the conservative $\\hat{p} = 0.5$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Set up the margin-of-error condition.\n\n$$1.96 \\sqrt{\\dfrac{0.5 \\cdot 0.5}{n}} \\leq 0.03$$\n\n**Step 2 (1 mark):** Solve for $n$.\n\n$$\\sqrt{\\dfrac{0.25}{n}} \\leq \\dfrac{0.03}{1.96}$$\n\n$$\\dfrac{0.25}{n} \\leq \\left(\\dfrac{0.03}{1.96}\\right)^2$$\n\n**Step 3 (1 mark):** Rearrange and round up.\n\n$$n \\geq \\dfrac{0.25 \\cdot 1.96^2}{0.03^2} \\approx 1067.1$$\n\nSo $n = 1068$.",
      subtopicSlugs: ["confidence-intervals"],
    },
    {
      content:
        "From a random sample of $n = 50$ with population standard deviation $\\sigma = 10$, a researcher constructs both a $95\\%$ and a $99\\%$ confidence interval for $\\mu$. The sample mean is $\\bar{x} = 42$.\n\na. Construct both intervals. (3 marks)\n\nb. Explain which interval is wider and why. (1 mark)",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Compute the standard error.\n\n$$\\text{SE} = \\dfrac{10}{\\sqrt{50}} \\approx 1.414$$\n\n**Step 2 (1 mark):** Construct the $95\\%$ CI using $z^* = 1.96$.\n\n$$42 \\pm 1.96 \\cdot 1.414 \\approx (39.23, 44.77)$$\n\n**Step 3 (1 mark):** Construct the $99\\%$ CI using $z^* = 2.576$.\n\n$$42 \\pm 2.576 \\cdot 1.414 \\approx (38.36, 45.64)$$\n\n**Step 4 (1 mark):** The $99\\%$ CI is wider because a higher confidence level uses a larger $z^*$, which increases the margin of error.",
      subtopicSlugs: ["confidence-intervals"],
    },
  ],

  // ─── 4. Probability rules ─────────────────────────────────────────────────
  "probability-rules": [
    {
      content:
        "$A$ and $B$ are mutually exclusive events with $\\Pr(A) = 0.35$ and $\\Pr(B) = 0.40$. Find $\\Pr(A \\cup B)$ and $\\Pr(A' \\cap B')$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Because $A$ and $B$ are mutually exclusive, $\\Pr(A \\cap B) = 0$.\n\n$$\\Pr(A \\cup B) = 0.35 + 0.40 = 0.75$$\n\n**Step 2 (1 mark):** Apply the complement rule.\n\n$$\\Pr(A' \\cap B') = 1 - \\Pr(A \\cup B) = 0.25$$",
      subtopicSlugs: ["probability-rules"],
    },
    {
      content:
        "Students at a college were surveyed about languages studied. $60\\%$ study French, $45\\%$ study German, and $25\\%$ study both.\n\na. Find $\\Pr(\\text{French or German})$. (1 mark)\n\nb. Find the probability a student studies neither language. (2 marks)",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Apply the addition rule.\n\n$$\\Pr(F \\cup G) = 0.60 + 0.45 - 0.25 = 0.80$$\n\n**Step 2 (1 mark):** Use the complement of a union (De Morgan's law).\n\n$$\\Pr(F' \\cap G') = 1 - \\Pr(F \\cup G)$$\n\n**Step 3 (1 mark):** Compute.\n\n$$\\Pr(F' \\cap G') = 1 - 0.80 = 0.20$$",
      subtopicSlugs: ["probability-rules"],
    },
    {
      content:
        "A point is chosen uniformly at random inside a rectangle of width $6$ and height $4$. A circle of radius $1$ is drawn entirely inside the rectangle. Find the probability that the point lies inside the circle. Give the answer in exact form.",
      marks: 2,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Compute the two areas.\n\n$$\\text{Rectangle area} = 6 \\cdot 4 = 24$$\n\n$$\\text{Circle area} = \\pi \\cdot 1^2 = \\pi$$\n\n**Step 2 (1 mark):** Take the ratio.\n\n$$\\Pr(\\text{in circle}) = \\dfrac{\\pi}{24}$$",
      subtopicSlugs: ["probability-rules"],
    },
    {
      content:
        "A fair six-sided die is rolled twice. Let $A$ be the event that the first roll is even and $B$ be the event that the sum of the two rolls is at least $10$.\n\na. Find $\\Pr(A)$. (1 mark)\n\nb. Find $\\Pr(B)$. (1 mark)\n\nc. Find $\\Pr(A \\cap B)$. (1 mark)",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Three of the six first-roll outcomes are even.\n\n$$\\Pr(A) = \\dfrac{3}{6} = \\dfrac{1}{2}$$\n\n**Step 2 (1 mark):** Count pairs with sum $\\geq 10$: $(4,6),(5,5),(5,6),(6,4),(6,5),(6,6)$ — that is $6$ out of $36$.\n\n$$\\Pr(B) = \\dfrac{6}{36} = \\dfrac{1}{6}$$\n\n**Step 3 (1 mark):** Among those pairs the ones with first roll even are $(4,6),(6,4),(6,5),(6,6)$ — $4$ pairs out of $36$.\n\n$$\\Pr(A \\cap B) = \\dfrac{4}{36} = \\dfrac{1}{9}$$",
      subtopicSlugs: ["probability-rules"],
    },
    {
      content:
        "In a group of $120$ tourists, $75$ visited the museum, $60$ visited the gallery, and $30$ visited both.\n\na. Complete a two-way table showing the four categories. (2 marks)\n\nb. Find the probability a randomly chosen tourist visited exactly one of the two venues. (2 marks)",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Museum only: $75 - 30 = 45$. Gallery only: $60 - 30 = 30$. Both: $30$. Neither: $120 - (45 + 30 + 30) = 15$.\n\n**Step 2 (1 mark):** Write the two-way table.\n\n| | Gallery | No gallery | Total |\n|---|---|---|---|\n| Museum | $30$ | $45$ | $75$ |\n| No museum | $30$ | $15$ | $45$ |\n| Total | $60$ | $60$ | $120$ |\n\n**Step 3 (1 mark):** Exactly one venue means museum only or gallery only, giving $45 + 30 = 75$ tourists.\n\n**Step 4 (1 mark):** Compute the probability.\n\n$$\\Pr(\\text{exactly one}) = \\dfrac{75}{120} = \\dfrac{5}{8}$$",
      subtopicSlugs: ["probability-rules"],
    },
  ],

  // ─── 5. Conditional probability ───────────────────────────────────────────
  "conditional-probability": [
    {
      content:
        "$\\Pr(A) = 0.6$, $\\Pr(B) = 0.5$, and $\\Pr(A \\cup B) = 0.8$. Find $\\Pr(B \\mid A)$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Use the addition rule to find $\\Pr(A \\cap B)$.\n\n$$\\Pr(A \\cap B) = \\Pr(A) + \\Pr(B) - \\Pr(A \\cup B)$$\n\n$$\\Pr(A \\cap B) = 0.6 + 0.5 - 0.8 = 0.3$$\n\n**Step 2 (1 mark):** Apply the conditional formula.\n\n$$\\Pr(B \\mid A) = \\dfrac{0.3}{0.6} = 0.5$$",
      subtopicSlugs: ["conditional-probability"],
    },
    {
      content:
        "A factory has two machines producing widgets. Machine $M_1$ produces $70\\%$ of widgets with a $2\\%$ defect rate; Machine $M_2$ produces $30\\%$ with a $5\\%$ defect rate. A widget is chosen at random and is defective. Find the probability it came from Machine $M_1$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Apply the law of total probability.\n\n$$\\Pr(D) = \\Pr(M_1)\\Pr(D \\mid M_1) + \\Pr(M_2)\\Pr(D \\mid M_2)$$\n\n$$\\Pr(D) = 0.70 \\cdot 0.02 + 0.30 \\cdot 0.05 = 0.014 + 0.015 = 0.029$$\n\n**Step 2 (1 mark):** Use Bayes' rule.\n\n$$\\Pr(M_1 \\mid D) = \\dfrac{\\Pr(M_1)\\Pr(D \\mid M_1)}{\\Pr(D)}$$\n\n**Step 3 (1 mark):** Substitute and simplify.\n\n$$\\Pr(M_1 \\mid D) = \\dfrac{0.014}{0.029} \\approx 0.483$$",
      subtopicSlugs: ["conditional-probability"],
    },
    {
      content:
        "A jar contains $3$ gold and $5$ silver coins. Two coins are drawn without replacement. Given that at least one coin drawn is gold, find the probability that both are gold.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Compute $\\Pr(\\text{both gold})$.\n\n$$\\Pr(GG) = \\dfrac{3}{8} \\cdot \\dfrac{2}{7} = \\dfrac{6}{56} = \\dfrac{3}{28}$$\n\n**Step 2 (1 mark):** Compute $\\Pr(\\text{at least one gold})$ via the complement.\n\n$$\\Pr(\\text{at least one } G) = 1 - \\Pr(SS) = 1 - \\dfrac{5}{8} \\cdot \\dfrac{4}{7} = 1 - \\dfrac{20}{56} = \\dfrac{36}{56} = \\dfrac{9}{14}$$\n\n**Step 3 (1 mark):** Apply the conditional formula.\n\n$$\\Pr(GG \\mid \\text{at least one } G) = \\dfrac{3/28}{9/14} = \\dfrac{3}{28} \\cdot \\dfrac{14}{9} = \\dfrac{1}{6}$$",
      subtopicSlugs: ["conditional-probability"],
    },
    {
      content:
        "Consider the following two-way table of $200$ survey responses.\n\n| | Likes A | Dislikes A | Total |\n|---|---|---|---|\n| Likes B | $50$ | $30$ | $80$ |\n| Dislikes B | $40$ | $80$ | $120$ |\n| Total | $90$ | $110$ | $200$ |\n\na. Find $\\Pr(\\text{Likes B} \\mid \\text{Likes A})$. (1 mark)\n\nb. Find $\\Pr(\\text{Likes A} \\mid \\text{Likes B})$. (1 mark)\n\nc. Determine whether 'Likes A' and 'Likes B' are independent. (1 mark)",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Use the Likes A column total $90$.\n\n$$\\Pr(\\text{Likes B} \\mid \\text{Likes A}) = \\dfrac{50}{90} = \\dfrac{5}{9}$$\n\n**Step 2 (1 mark):** Use the Likes B row total $80$.\n\n$$\\Pr(\\text{Likes A} \\mid \\text{Likes B}) = \\dfrac{50}{80} = \\dfrac{5}{8}$$\n\n**Step 3 (1 mark):** Independence would require $\\Pr(\\text{Likes A} \\mid \\text{Likes B}) = \\Pr(\\text{Likes A}) = \\dfrac{90}{200} = 0.45$. Since $\\dfrac{5}{8} = 0.625 \\neq 0.45$, the events are not independent.",
      subtopicSlugs: ["conditional-probability"],
    },
    {
      content:
        "On rainy days, Sam takes the bus with probability $0.9$; on non-rainy days, with probability $0.3$. It rains on $40\\%$ of days. Given Sam took the bus, find the probability it was a rainy day.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Let $R$ be the event it rains and $T$ be the event Sam takes the bus. Given: $\\Pr(R) = 0.4$, $\\Pr(T \\mid R) = 0.9$, $\\Pr(T \\mid R') = 0.3$.\n\n**Step 2 (1 mark):** Apply the law of total probability.\n\n$$\\Pr(T) = \\Pr(R)\\Pr(T \\mid R) + \\Pr(R')\\Pr(T \\mid R')$$\n\n$$\\Pr(T) = 0.4 \\cdot 0.9 + 0.6 \\cdot 0.3 = 0.36 + 0.18 = 0.54$$\n\n**Step 3 (1 mark):** Apply Bayes' rule.\n\n$$\\Pr(R \\mid T) = \\dfrac{\\Pr(R)\\Pr(T \\mid R)}{\\Pr(T)}$$\n\n**Step 4 (1 mark):** Compute.\n\n$$\\Pr(R \\mid T) = \\dfrac{0.36}{0.54} = \\dfrac{2}{3}$$",
      subtopicSlugs: ["conditional-probability"],
    },
  ],

  // ─── 6. Discrete random variables ─────────────────────────────────────────
  "discrete-random-variables": [
    {
      content:
        "The random variable $X$ has the distribution below. Find $a$.\n\n| $x$ | $1$ | $2$ | $3$ | $4$ |\n|---|---|---|---|---|\n| $\\Pr(X = x)$ | $0.1$ | $0.3$ | $a$ | $0.2$ |",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** The probabilities must sum to $1$.\n\n$$0.1 + 0.3 + a + 0.2 = 1$$\n\n**Step 2 (1 mark):** Solve for $a$.\n\n$$a = 1 - 0.6 = 0.4$$",
      subtopicSlugs: ["discrete-random-variables"],
    },
    {
      content:
        "The discrete random variable $X$ takes values $0, 1, 2, 3$ with $\\Pr(X = k) = ck^2$ for $k \\geq 1$ and $\\Pr(X = 0) = 0$.\n\na. Find $c$. (1 mark)\n\nb. Find $\\Pr(X \\geq 2)$. (1 mark)",
      marks: 2,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Sum must equal $1$: $c(1 + 4 + 9) = 14c = 1$, so $c = \\dfrac{1}{14}$.\n\n**Step 2 (1 mark):** Compute $\\Pr(X \\geq 2)$.\n\n$$\\Pr(X \\geq 2) = \\dfrac{4}{14} + \\dfrac{9}{14} = \\dfrac{13}{14}$$",
      subtopicSlugs: ["discrete-random-variables"],
    },
    {
      content:
        "A discrete random variable $X$ has $E(X) = 3$ and $E(X^2) = 12$. Let $Y = 3X - 1$.\n\na. Find $\\text{Var}(X)$. (1 mark)\n\nb. Find $E(Y)$. (1 mark)\n\nc. Find $\\text{Var}(Y)$. (1 mark)",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Apply $\\text{Var}(X) = E(X^2) - [E(X)]^2$.\n\n$$\\text{Var}(X) = 12 - 9 = 3$$\n\n**Step 2 (1 mark):** Apply linearity of expectation.\n\n$$E(Y) = 3E(X) - 1 = 9 - 1 = 8$$\n\n**Step 3 (1 mark):** Apply the variance scaling rule.\n\n$$\\text{Var}(Y) = 3^2 \\cdot \\text{Var}(X) = 9 \\cdot 3 = 27$$",
      subtopicSlugs: ["discrete-random-variables"],
    },
    {
      content:
        "A small lottery sells tickets for $\\$5$ each. There is one $\\$1000$ prize, ten $\\$50$ prizes, and $1000$ tickets are sold in total. Let $X$ be the net profit (prize minus ticket cost) to a randomly chosen ticket buyer.\n\na. State the three values $X$ can take and their probabilities. (2 marks)\n\nb. Find $E(X)$. (1 mark)",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** The outcomes and probabilities are:\n\n| $x$ | $995$ | $45$ | $-5$ |\n|---|---|---|---|\n| $\\Pr(X = x)$ | $\\dfrac{1}{1000}$ | $\\dfrac{10}{1000}$ | $\\dfrac{989}{1000}$ |\n\n**Step 2 (1 mark):** Verify these sum to $1$: $\\dfrac{1 + 10 + 989}{1000} = 1$.\n\n**Step 3 (1 mark):** Compute the expected value.\n\n$$E(X) = \\dfrac{995 + 450 - 4945}{1000} = \\dfrac{-3500}{1000} = -\\$3.50$$",
      subtopicSlugs: ["discrete-random-variables"],
    },
    {
      content:
        "A discrete random variable $X$ has the distribution below.\n\n| $x$ | $0$ | $1$ | $2$ | $3$ |\n|---|---|---|---|---|\n| $\\Pr(X = x)$ | $0.2$ | $0.4$ | $0.3$ | $0.1$ |\n\nFind $\\Pr(X \\geq 2 \\mid X \\geq 1)$.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Compute $\\Pr(X \\geq 1)$.\n\n$$\\Pr(X \\geq 1) = 0.4 + 0.3 + 0.1 = 0.8$$\n\n**Step 2 (1 mark):** Compute $\\Pr(X \\geq 2)$.\n\n$$\\Pr(X \\geq 2) = 0.3 + 0.1 = 0.4$$\n\n**Step 3 (1 mark):** Note $\\{X \\geq 2\\} \\subseteq \\{X \\geq 1\\}$, so $\\Pr(X \\geq 2 \\cap X \\geq 1) = \\Pr(X \\geq 2)$.\n\n**Step 4 (1 mark):** Apply the conditional formula.\n\n$$\\Pr(X \\geq 2 \\mid X \\geq 1) = \\dfrac{0.4}{0.8} = 0.5$$",
      subtopicSlugs: ["discrete-random-variables"],
    },
  ],

  // ─── 7. Binomial distribution ─────────────────────────────────────────────
  "binomial-distribution": [
    {
      content:
        "If $X \\sim \\text{Bi}(12, 0.5)$, find $E(X)$ and the standard deviation of $X$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Apply the binomial mean.\n\n$$E(X) = 12 \\cdot 0.5 = 6$$\n\n**Step 2 (1 mark):** Apply the standard deviation formula $\\sqrt{np(1-p)}$.\n\n$$\\text{SD}(X) = \\sqrt{12 \\cdot 0.5 \\cdot 0.5} = \\sqrt{3}$$",
      subtopicSlugs: ["binomial-distribution"],
    },
    {
      content:
        "A machine produces bolts, $8\\%$ of which are defective. A quality inspector checks a random sample of $10$ bolts. Find the probability that at least one bolt is defective.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Let $X \\sim \\text{Bi}(10, 0.08)$.\n\n**Step 2 (1 mark):** Use the complement.\n\n$$\\Pr(X \\geq 1) = 1 - \\Pr(X = 0)$$\n\n$$\\Pr(X = 0) = (0.92)^{10}$$\n\n**Step 3 (1 mark):** Compute.\n\n$$\\Pr(X \\geq 1) = 1 - (0.92)^{10} \\approx 1 - 0.4344 \\approx 0.5656$$",
      subtopicSlugs: ["binomial-distribution"],
    },
    {
      content:
        "A darts player hits the bullseye with probability $0.3$ on any attempt. She takes $6$ independent attempts.\n\na. Find the probability she hits exactly $2$ bullseyes. (2 marks)\n\nb. Find $\\text{Var}(X)$ where $X$ is the number of bullseyes. (1 mark)",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Apply the binomial pmf with $n = 6$, $p = 0.3$.\n\n$$\\Pr(X = 2) = \\binom{6}{2}(0.3)^2(0.7)^4$$\n\n**Step 2 (1 mark):** Compute.\n\n$$\\Pr(X = 2) = 15 \\cdot 0.09 \\cdot 0.2401 \\approx 0.3241$$\n\n**Step 3 (1 mark):** Apply $\\text{Var}(X) = np(1-p)$.\n\n$$\\text{Var}(X) = 6 \\cdot 0.3 \\cdot 0.7 = 1.26$$",
      subtopicSlugs: ["binomial-distribution"],
    },
    {
      content:
        "A class contains $20$ students. Each student independently works on a problem and submits a correct answer with probability $0.75$.\n\na. Find the expected number of correct submissions. (1 mark)\n\nb. Find the probability at most $18$ students submit correct answers. (2 marks)",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Apply $E(X) = np$ with $n = 20$, $p = 0.75$.\n\n$$E(X) = 20 \\cdot 0.75 = 15$$\n\n**Step 2 (1 mark):** Write $\\Pr(X \\leq 18) = 1 - \\Pr(X = 19) - \\Pr(X = 20)$.\n\n$$\\Pr(X = 20) = (0.75)^{20} \\approx 0.00317$$\n\n$$\\Pr(X = 19) = 20 \\cdot (0.75)^{19}(0.25) \\approx 0.02114$$\n\n**Step 3 (1 mark):** Subtract from $1$.\n\n$$\\Pr(X \\leq 18) \\approx 1 - 0.00317 - 0.02114 \\approx 0.9757$$",
      subtopicSlugs: ["binomial-distribution"],
    },
    {
      content:
        "A biased coin has $\\Pr(H) = p$. It is tossed $n = 4$ times. The probability of getting exactly $2$ heads is $0.375$. Find $p$, assuming $0 < p < 1$.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Write the binomial pmf for $X = 2$, $n = 4$.\n\n$$\\Pr(X = 2) = \\binom{4}{2}p^2(1-p)^2 = 6p^2(1-p)^2$$\n\n**Step 2 (1 mark):** Set equal to $0.375$.\n\n$$6p^2(1-p)^2 = 0.375$$\n\n$$p^2(1-p)^2 = 0.0625$$\n\n**Step 3 (1 mark):** Take the positive square root of both sides.\n\n$$p(1-p) = 0.25$$\n\n$$p - p^2 = 0.25$$\n\n**Step 4 (1 mark):** Solve the quadratic $p^2 - p + 0.25 = 0$, which factors as $(p - 0.5)^2 = 0$.\n\n$$p = 0.5$$",
      subtopicSlugs: ["binomial-distribution"],
    },
  ],

  // ─── 8. Sample proportions and sampling ───────────────────────────────────
  "sample-proportions-and-sampling": [
    {
      content:
        "A sample of $n = 500$ voters is drawn from a population with $p = 0.6$. Find the mean and standard deviation of the sample proportion $\\hat{p}$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** The mean of $\\hat{p}$ equals $p$.\n\n$$E(\\hat{p}) = 0.6$$\n\n**Step 2 (1 mark):** Apply $\\text{SD}(\\hat{p}) = \\sqrt{\\dfrac{p(1-p)}{n}}$.\n\n$$\\text{SD}(\\hat{p}) = \\sqrt{\\dfrac{0.6 \\cdot 0.4}{500}} \\approx 0.0219$$",
      subtopicSlugs: ["sample-proportions-and-sampling"],
    },
    {
      content:
        "A random sample of $n = 100$ is taken from a population with true proportion $p = 0.2$. Using $\\Pr(Z < 1) = 0.8413$, find $\\Pr(\\hat{p} \\leq 0.24)$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Compute the standard deviation of $\\hat{p}$.\n\n$$\\text{SD}(\\hat{p}) = \\sqrt{\\dfrac{0.2 \\cdot 0.8}{100}} = 0.04$$\n\n**Step 2 (1 mark):** Standardise.\n\n$$z = \\dfrac{0.24 - 0.2}{0.04} = 1$$\n\n**Step 3 (1 mark):** Read the probability.\n\n$$\\Pr(\\hat{p} \\leq 0.24) = \\Pr(Z \\leq 1) = 0.8413$$",
      subtopicSlugs: ["sample-proportions-and-sampling"],
    },
    {
      content:
        "Two random samples of sizes $n_1 = 100$ and $n_2 = 400$ are drawn from the same population with $p = 0.5$. Let $\\text{SD}_1$ and $\\text{SD}_2$ be the standard deviations of the two sample proportions. Find the ratio $\\dfrac{\\text{SD}_1}{\\text{SD}_2}$.",
      marks: 2,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Compute the two standard deviations.\n\n$$\\text{SD}_1 = \\sqrt{\\dfrac{0.25}{100}} = 0.05, \\quad \\text{SD}_2 = \\sqrt{\\dfrac{0.25}{400}} = 0.025$$\n\n**Step 2 (1 mark):** Take the ratio.\n\n$$\\dfrac{\\text{SD}_1}{\\text{SD}_2} = \\dfrac{0.05}{0.025} = 2$$",
      subtopicSlugs: ["sample-proportions-and-sampling"],
    },
    {
      content:
        "A poll of $n = 625$ voters finds $\\hat{p} = 0.48$. Compute the $95\\%$ confidence interval for the population proportion $p$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Compute the approximate standard error.\n\n$$\\text{SE} = \\sqrt{\\dfrac{0.48 \\cdot 0.52}{625}} \\approx 0.01998$$\n\n**Step 2 (1 mark):** Apply $\\hat{p} \\pm 1.96 \\cdot \\text{SE}$.\n\n$$0.48 \\pm 1.96 \\cdot 0.01998$$\n\n**Step 3 (1 mark):** Simplify.\n\n$$\\text{CI} \\approx (0.4408, 0.5192)$$",
      subtopicSlugs: ["sample-proportions-and-sampling"],
    },
    {
      content:
        "A company claims that $60\\%$ of its customers are satisfied. A random sample of $n = 100$ customers is taken, and the sample proportion of satisfied customers is $\\hat{p} = 0.50$.\n\na. State the mean and SD of $\\hat{p}$ under the claim. (1 mark)\n\nb. Compute the $z$-score for the observed $\\hat{p} = 0.50$. (1 mark)\n\nc. Using $\\Pr(Z < -2.04) \\approx 0.0207$, find $\\Pr(\\hat{p} \\leq 0.50)$ under the claim. (1 mark)\n\nd. Comment on whether the observed proportion is consistent with the claim. (1 mark)",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Under the claim $p = 0.6$.\n\n$$E(\\hat{p}) = 0.6, \\quad \\text{SD}(\\hat{p}) = \\sqrt{\\dfrac{0.6 \\cdot 0.4}{100}} \\approx 0.04899$$\n\n**Step 2 (1 mark):** Standardise $\\hat{p} = 0.50$.\n\n$$z = \\dfrac{0.50 - 0.60}{0.04899} \\approx -2.04$$\n\n**Step 3 (1 mark):** Read the probability.\n\n$$\\Pr(\\hat{p} \\leq 0.50) \\approx 0.0207$$\n\n**Step 4 (1 mark):** Since the probability of observing $\\hat{p} \\leq 0.50$ is only about $2.1\\%$, the sample result is unlikely if the claim were true, providing evidence against the claim.",
      subtopicSlugs: ["sample-proportions-and-sampling"],
    },
  ],
};

function main(): void {
  const slugs = Object.keys(NEW_QUESTIONS);
  for (const slug of slugs) {
    const filePath = path.join(OUT_DIR, `qset-${slug}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  ${filePath}: not found, skipping.`);
      continue;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data.shortAnswer)) {
      console.warn(`⚠️  ${filePath}: shortAnswer is not an array, skipping.`);
      continue;
    }
    if (data.shortAnswer.length >= 15) {
      console.log(
        `↷  ${slug}: already has ${data.shortAnswer.length} SAs, skipping.`
      );
      continue;
    }
    const additions = NEW_QUESTIONS[slug];
    // Validate mark totals in solution step headers equal the declared marks.
    for (const q of additions) {
      const markMatches = [...q.solutionContent.matchAll(/\*\*Step \d+ \((\d+) marks?\):\*\*/g)];
      const sum = markMatches.reduce((acc, m) => acc + Number(m[1]), 0);
      if (sum !== q.marks) {
        throw new Error(
          `[${slug}] Mark mismatch: declared ${q.marks}, step headers sum to ${sum}. Content: ${q.content.slice(0, 80)}`
        );
      }
    }
    // Split any chain equalities in display math into separate single-equation blocks.
    for (const q of additions) {
      q.solutionContent = dechainSolution(q.solutionContent);
    }
    data.shortAnswer.push(...additions);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(
      `✅  ${slug}: appended ${additions.length} SAs → ${data.shortAnswer.length} total.`
    );
  }
}

main();
