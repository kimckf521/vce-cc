import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Returns true if the role has admin-level privileges. */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/** Returns a display label for the role. */
export function roleLabel(role: string | null | undefined): string {
  if (role === "SUPER_ADMIN") return "Super Admin";
  if (role === "ADMIN") return "Admin";
  return "Student";
}

// VCE topics with subtopics — used by the seed API route.
// NOTE: Names/slugs must stay in sync with TOPICS in lib/topics-config.ts (used by practice pages).
export const VCE_TOPICS = [
  {
    name: "Algebra, Number, and Structure",
    slug: "algebra-number-and-structure",
    subtopics: [
      "Polynomial Equations",
      "Exponential Equations",
      "Logarithmic Equations",
      "Trigonometric Equations",
      "Simultaneous Equations",
      "Exponent and Logarithm Laws",
    ],
  },
  {
    name: "Functions, Relations, and Graphs",
    slug: "functions-relations-and-graphs",
    subtopics: [
      "Polynomial Functions",
      "Exponential Functions",
      "Logarithmic Functions",
      "Trigonometric Functions",
      "Rational Functions",
      "Domain and Range",
      "Transformations",
      "Inverse Functions",
      "Composite Functions",
    ],
  },
  {
    name: "Calculus",
    slug: "calculus",
    subtopics: [
      "Differentiation",
      "Chain Rule",
      "Product Rule",
      "Quotient Rule",
      "Tangents and Normals",
      "Rates of Change",
      "Stationary Points and Curve Sketching",
      "Optimisation",
      "Antidifferentiation",
      "Definite Integrals",
      "Area Under Curves",
      "Fundamental Theorem of Calculus",
    ],
  },
  {
    name: "Data Analysis, Probability, and Statistics",
    slug: "data-analysis-probability-and-statistics",
    subtopics: [
      "Probability Rules",
      "Conditional Probability",
      "Discrete Random Variables",
      "Binomial Distribution",
      "Continuous Random Variables",
      "Normal Distribution",
      "Confidence Intervals",
      "Sample Proportions and Sampling",
    ],
  },
] as const;
