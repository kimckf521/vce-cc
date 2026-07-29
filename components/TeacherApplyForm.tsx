"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ApplicantType = "SCHOOL_TEACHER" | "PRIVATE_TUTOR";

const inputClass =
  "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

/**
 * Teacher/tutor application form. POSTs to /api/teachers/apply; on success the
 * server page re-renders with the PENDING_EMAIL status card (router.refresh).
 */
export default function TeacherApplyForm({ initialName = "" }: { initialName?: string }) {
  const router = useRouter();
  const [applicantType, setApplicantType] = useState<ApplicantType>("SCHOOL_TEACHER");
  const [fullName, setFullName] = useState(initialName);
  const [schoolName, setSchoolName] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [vitNumber, setVitNumber] = useState("");
  const [abn, setAbn] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isTeacher = applicantType === "SCHOOL_TEACHER";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/teachers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantType,
          fullName,
          schoolName: isTeacher ? schoolName : undefined,
          schoolEmail,
          vitNumber,
          abn: abn || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40 p-6 text-center">
        <p className="font-semibold text-gray-900 dark:text-gray-100">
          Application submitted!
        </p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Check {schoolEmail} for a verification link — clicking it moves your
          application into review.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 space-y-5">
      {/* Applicant type */}
      <div>
        <span className={labelClass}>I am a</span>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Applicant type">
          {(
            [
              ["SCHOOL_TEACHER", "School teacher"],
              ["PRIVATE_TUTOR", "Private tutor"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={applicantType === value}
              onClick={() => setApplicantType(value)}
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                applicantType === value
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="fullName" className={labelClass}>
          Full name <span className="text-gray-400">(as on your VIT registration)</span>
        </label>
        <input
          id="fullName"
          required
          minLength={2}
          maxLength={100}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Smith"
          className={inputClass}
        />
      </div>

      {isTeacher && (
        <div>
          <label htmlFor="schoolName" className={labelClass}>
            School
          </label>
          <input
            id="schoolName"
            required={isTeacher}
            minLength={2}
            maxLength={150}
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="e.g. Box Hill High School"
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label htmlFor="schoolEmail" className={labelClass}>
          {isTeacher ? "School email" : "Contact email"}
        </label>
        <input
          id="schoolEmail"
          type="email"
          required
          maxLength={200}
          value={schoolEmail}
          onChange={(e) => setSchoolEmail(e.target.value)}
          placeholder={isTeacher ? "j.smith@education.vic.gov.au" : "you@example.com"}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {isTeacher
            ? "We'll send a verification link here. Using your school address speeds up approval."
            : "We'll send a verification link here. Any address is fine — approval rests on your VIT registration."}
        </p>
      </div>

      <div>
        <label htmlFor="vitNumber" className={labelClass}>
          VIT registration number
        </label>
        <input
          id="vitNumber"
          required
          inputMode="numeric"
          pattern="\d{3,10}"
          title="Numeric VIT registration number"
          value={vitNumber}
          onChange={(e) => setVitNumber(e.target.value.replace(/\D/g, ""))}
          placeholder="e.g. 123456"
          className={inputClass}
        />
      </div>

      {!isTeacher && (
        <div>
          <label htmlFor="abn" className={labelClass}>
            ABN <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="abn"
            inputMode="numeric"
            pattern="\d{11}"
            title="11-digit ABN"
            value={abn}
            onChange={(e) => setAbn(e.target.value.replace(/\D/g, ""))}
            placeholder="11 digits"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Handy later if you join our referral program — not required.
          </p>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-600 py-3 text-base font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
      >
        {loading ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
