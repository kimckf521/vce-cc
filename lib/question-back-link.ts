/**
 * Resolves the "back" affordance for a single-question detail page
 * (`/[curriculum]/[subject]/questions/[id]` and `…/questions/set/[id]`).
 *
 * The destination is driven by the `from` query param that the linking list
 * sets (e.g. the bookmark list links with `?from=bookmark`). Targets are
 * subject-scoped so the user returns to the same subject's list, with the one
 * exception of global search.
 */
import { parseExamSlug } from "@/lib/exam-slug";

export function questionBackLink(
  from: string | undefined,
  curriculum: string,
  subject: string,
): { href: string; label: string } {
  // Public exam pages link questions with `?from=exam:<slug>` (e.g.
  // `exam:2023-exam-1`) so the back affordance returns to that paper. The
  // slug is validated before being echoed into an href.
  if (from?.startsWith("exam:")) {
    const slug = from.slice("exam:".length);
    if (parseExamSlug(slug)) {
      return { href: `/${curriculum}/${subject}/exams/${slug}`, label: "Back to paper" };
    }
  }
  switch (from) {
    case "bookmark":
      return { href: `/${curriculum}/${subject}/bookmark`, label: "Back to bookmarks" };
    case "search":
      return { href: "/search", label: "Back to search" };
    case "topics":
      return { href: `/${curriculum}/${subject}/topics`, label: "Back to topics" };
    case "history":
    default:
      return { href: `/${curriculum}/${subject}/history`, label: "Back to history" };
  }
}
