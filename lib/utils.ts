import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// VCE topics with subtopics — used by the seed API route.
// NOTE: Names/slugs must stay in sync with TOPICS in lib/topics-config.ts (used by practice pages).
export const VCE_TOPICS = [
  {
    name: "Algebra, Number, and Structure",
    slug: "algebra-number-and-structure",
    subtopics: [
      "Polynomials",
      "Logarithms and Exponentials",
      "Circular Functions",
    ],
  },
  {
    name: "Functions, Relations, and Graphs",
    slug: "functions-relations-and-graphs",
    subtopics: [
      "Types of Functions",
      "Transformations",
      "Inverse Functions",
      "Piecewise Functions",
    ],
  },
  {
    name: "Calculus",
    slug: "calculus",
    subtopics: [
      "Limits and Continuity",
      "Differentiation",
      "Applications of Differentiation",
      "Integration",
      "Applications of Integration",
    ],
  },
  {
    name: "Data Analysis, Probability, and Statistics",
    slug: "data-analysis-probability-and-statistics",
    subtopics: [
      "Probability",
      "Discrete Random Variables",
      "Binomial Distribution",
      "Continuous Random Variables",
      "Normal Distribution",
      "Sampling and Estimation",
    ],
  },
] as const;
