// Static VCE Methods topics — these match the DB and don't change.
// Used by practice pages to avoid Prisma calls at build time.
// NOTE: Names/slugs must stay in sync with VCE_TOPICS in lib/utils.ts (used for seeding).
export const TOPICS = [
  { id: "cmmuq9gcp000e5pjsa0l9l742", name: "Algebra, Number, and Structure",        slug: "algebra-number-and-structure"              },
  { id: "cmn63mova000e1zyi0vv8lukz", name: "Functions, Relations, and Graphs",       slug: "functions-relations-and-graphs"            },
  { id: "cmmuq9eru00015pjsmpbjocik", name: "Calculus",                               slug: "calculus"                                  },
  { id: "cmmuq9h8w000l5pjsuia1hoc8", name: "Data Analysis, Probability, and Statistics", slug: "data-analysis-probability-and-statistics" },
] as const;
