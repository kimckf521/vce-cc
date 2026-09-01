import MathContent from "@/components/MathContent";
import FunctionGraph from "@/components/FunctionGraph";
import CartesianGrid from "@/components/CartesianGrid";

export interface SolutionContentPart {
  questionId: string;
  part: string | null;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
}

function SolutionVisual({ imageUrl }: { imageUrl?: string | null }) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("function:")) {
    const cfg = JSON.parse(imageUrl.slice(9));
    return <FunctionGraph {...cfg} />;
  }
  if (imageUrl.startsWith("grid:")) {
    const cfg = JSON.parse(imageUrl.slice(5));
    return <CartesianGrid {...cfg} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={imageUrl}
      alt="Solution diagram"
      className="my-4 max-w-full rounded-lg border border-gray-100 dark:border-gray-800"
    />
  );
}

// Parse MCQ solution content into answer letter + explanation — duplicated
// from SolutionModal.tsx deliberately (small, pure, no shared state) so this
// file stays a plain presentational component with no dependency on the
// modal's chrome/lifecycle.
function parseMCQSolution(content: string): { answer: string | null; explanation: string } {
  const m = content.match(/\*\*Answer:\s*([A-E])\*\*/);
  if (!m) return { answer: null, explanation: content };
  const explanation = content.slice(m.index! + m[0].length).trim();
  return { answer: m[1], explanation };
}

/**
 * Worked-solution content with NO modal chrome (no overlay, backdrop, close
 * button, skeleton). Renders the same MCQ-answer-badge / MathContent /
 * diagram / video-link layout as SolutionModal's body, for QuestionGroup's
 * `solutionDisplay="inline"` mode.
 *
 * Why this exists: SolutionModal is imported via `dynamic(..., {ssr:false})`,
 * so on the public, search-indexed exam/question pages the worked solution
 * NEVER appears in server-rendered HTML — Googlebot renders the DOM but
 * never clicks "Show solution", so it never sees solution text, even though
 * every page's title/meta promises one. This component is a plain server-
 * renderable leaf (no "use client", no browser-only APIs) that QuestionGroup
 * mounts unconditionally and toggles visible with a CSS `hidden` class
 * instead of conditionally mounting/unmounting — an accordion/expand
 * pattern, which Google explicitly indexes the same as always-visible
 * content (unlike a node that's never present in the DOM at all). The
 * click-to-reveal UX for real visitors is unchanged: the solution is still
 * invisible until they click "Show solution".
 */
export default function SolutionContent({ solutions }: { solutions: SolutionContentPart[] }) {
  const isMultiPart = solutions.length > 1;
  return (
    <div className="space-y-6">
      {solutions.map((s, i) => {
        const mcq = parseMCQSolution(s.content);
        const isMCQ = mcq.answer !== null;
        return (
          <div key={s.questionId + (s.part ?? "")}>
            {isMultiPart && s.part && (
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400 mb-2">
                Part {s.part.toUpperCase()}
              </p>
            )}

            {isMCQ ? (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white text-base font-bold">
                      {mcq.answer}
                    </span>
                    <span className="text-base font-semibold text-green-700 dark:text-green-400">
                      Correct answer
                    </span>
                  </div>
                </div>
                {mcq.explanation && <MathContent content={mcq.explanation} />}
              </>
            ) : (
              <MathContent content={s.content} />
            )}

            <SolutionVisual imageUrl={s.imageUrl} />

            {s.videoUrl && (
              <a
                href={s.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-medium hover:underline text-sm"
              >
                Watch video solution →
              </a>
            )}

            {isMultiPart && i < solutions.length - 1 && (
              <div className="mt-6 border-t border-dashed border-gray-200 dark:border-gray-700" />
            )}
          </div>
        );
      })}
    </div>
  );
}
