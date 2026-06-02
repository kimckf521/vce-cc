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
  if (role === "TUTOR") return "Tutor";
  if (role === "INFLUENCER") return "Influencer";
  return "Student";
}

/** Strip LaTeX commands from content to produce a readable plain-text preview. */
export function stripLatex(s: string): string {
  return s
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\\\(/g, "").replace(/\\\)/g, "")
    .replace(/\\dfrac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
    .replace(/\\sqrt\{([^}]*)\}/g, "√$1")
    .replace(/\\(cos|sin|tan|log|ln|sec|csc|cot)\b/g, "$1")
    .replace(/\\[,;!]/g, " ")                  // thin/medium/neg spaces
    .replace(/\\(left|right|quad|qquad|text|mathrm|mathbf|boldsymbol)\b/g, "")
    .replace(/\\(to|rightarrow)/g, "→")
    .replace(/\\(leq|le)\b/g, "≤").replace(/\\(geq|ge)\b/g, "≥")
    .replace(/\\(times)\b/g, "×").replace(/\\(pi)\b/g, "π")
    .replace(/\\(in)\b/g, "∈").replace(/\\(infty)\b/g, "∞").replace(/\\(alpha)\b/g, "α")
    .replace(/\\(beta)\b/g, "β").replace(/\\(Delta)\b/g, "Δ")
    .replace(/\\(mathbb\{R\})/g, "ℝ")
    .replace(/\\\\/g, " ")                     // line breaks
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}]/g, "").replace(/\$/g, "")
    .replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}

