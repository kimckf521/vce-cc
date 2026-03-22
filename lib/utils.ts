import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const VCE_TOPICS = [
  {
    name: "Functions and Graphs",
    slug: "functions-and-graphs",
    subtopics: [
      "Types of Functions",
      "Transformations",
      "Inverse Functions",
      "Piecewise Functions",
    ],
  },
  {
    name: "Algebra",
    slug: "algebra",
    subtopics: [
      "Polynomials",
      "Logarithms and Exponentials",
      "Circular Functions",
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
    name: "Probability and Statistics",
    slug: "probability-and-statistics",
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
