"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUBJECTS } from "@/lib/subject-context";
import { saveStudyingSubjects } from "@/app/actions/save-studying-subjects";

type Props = {
  /** Currently registered subjects (URL slugs). Empty = stored as "all". */
  initialSubjects: string[];
};

/**
 * Profile → Subjects editor. Lets a student register which maths subjects they
 * study; the personal subject switcher (SubjectSidebar / MobileDrawer) then
 * shows only these. Display preference only — never affects access, billing,
 * or saved work (attempts / bookmarks / history stay put).
 *
 * Guardrail: at least one subject must stay registered, so the switcher is
 * never empty. An empty stored value means "all subjects", so the toggles seed
 * from every subject when nothing has been registered yet — the student starts
 * from a true picture and narrows down.
 */
export default function SubjectRegistration({ initialSubjects }: Props) {
  const router = useRouter();

  const seed =
    initialSubjects.length > 0
      ? initialSubjects
      : SUBJECTS.map((s) => s.urlSlug);

  const [selected, setSelected] = useState<string[]>(seed);
  const [savedSnapshot, setSavedSnapshot] = useState<string[]>(seed);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(slug: string) {
    setError(null);
    setJustSaved(false);
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  const isEmpty = selected.length === 0;
  // Order-independent comparison against the last saved state.
  const dirty =
    selected.length !== savedSnapshot.length ||
    selected.some((s) => !savedSnapshot.includes(s));

  async function handleSave() {
    if (isEmpty || saving || !dirty) return;
    setSaving(true);
    setError(null);
    try {
      // Persist in canonical SUBJECTS order for a stable stored value.
      const ordered = SUBJECTS.map((s) => s.urlSlug).filter((slug) =>
        selected.includes(slug),
      );
      const res = await saveStudyingSubjects(ordered);
      if (!res.ok) {
        setError("Couldn't save your subjects. Please try again.");
        return;
      }
      setSavedSnapshot(ordered);
      setSelected(ordered);
      setJustSaved(true);
      // Re-render the sidebar / drawer switcher with the new registered list.
      router.refresh();
    } catch {
      setError("Couldn't save your subjects. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">
          Your maths subjects
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Choose the subjects you&apos;re studying. Only these show in your
          subject switcher — change it any time. This doesn&apos;t affect your
          access or saved work.
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
        {SUBJECTS.map((s) => {
          const checked = selected.includes(s.urlSlug);
          // Block unchecking the final subject so the switcher is never empty.
          const lastOne = checked && selected.length === 1;
          return (
            <label
              key={s.urlSlug}
              className={cn(
                "flex items-center gap-3 px-4 lg:px-5 py-3.5 transition-colors",
                lastOne
                  ? "cursor-not-allowed"
                  : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={lastOne}
                onChange={() => toggle(s.urlSlug)}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              />
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold flex-shrink-0",
                  s.colors.badge,
                )}
              >
                {s.badge}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {s.shortName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {s.displayName}
                </p>
              </div>
              {checked && (
                <Check className="h-4 w-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
              )}
            </label>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isEmpty || saving || !dirty}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors",
            "bg-brand-600 hover:bg-brand-700 text-white",
            (isEmpty || saving || !dirty) && "opacity-60 cursor-not-allowed",
          )}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {justSaved && !dirty && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
            <Check className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>
    </div>
  );
}
