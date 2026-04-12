"use client";

import { useState, useEffect } from "react";
import { Loader2, UserPlus, Check, Eye, EyeOff } from "lucide-react";

type Subject = { id: string; name: string; slug: string };
type EnrolmentTier = "NONE" | "FREE" | "PAID";

export default function CreateAccountForm({ isSuperAdmin = false }: { isSuperAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<
    "STUDENT" | "TUTOR" | "INFLUENCER" | "ADMIN" | "SUPER_ADMIN"
  >("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [enrolments, setEnrolments] = useState<Record<string, EnrolmentTier>>({});

  useEffect(() => {
    if (!open) return;
    fetch("/api/admin/subjects")
      .then((r) => r.json())
      .then((data) => setSubjects(data.subjects || []))
      .catch(() => {});
  }, [open]);

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("STUDENT");
    setEnrolments({});
    setError("");
    setSuccess("");
  };

  const setSubjectTier = (subjectId: string, tier: EnrolmentTier) => {
    setEnrolments((prev) => ({ ...prev, [subjectId]: tier }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const enrolmentPayload = Object.entries(enrolments)
        .filter(([, tier]) => tier === "FREE" || tier === "PAID")
        .map(([subjectId, tier]) => ({ subjectId, tier }));

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, enrolments: enrolmentPayload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");
      setSuccess(`Account created for ${data.email} (${data.role})`);
      setName("");
      setEmail("");
      setPassword("");
      setRole("STUDENT");
      setEnrolments({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        Create account
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-brand-200 dark:border-brand-800 shadow-sm p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Create New Account</h3>
        <button
          onClick={() => { setOpen(false); reset(); }}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Cancel
        </button>
      </div>

      {success && (
        <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 px-4 py-3 mb-4 flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 mb-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as typeof role)
                }
                className="w-full appearance-none px-3 py-2 pr-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 cursor-pointer focus:outline-none focus:border-brand-500"
              >
                <option value="STUDENT">Student</option>
                <option value="TUTOR">Tutor</option>
                <option value="INFLUENCER">Influencer</option>
                <option value="ADMIN">Admin</option>
                {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
              </select>
              <svg
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {role === "STUDENT" && subjects.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Subject enrolments
            </label>
            <div className="space-y-2">
              {subjects.map((subj) => {
                const tier = enrolments[subj.id] ?? "NONE";
                return (
                  <div
                    key={subj.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                  >
                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                      {subj.name}
                    </span>
                    <div className="flex gap-1 flex-shrink-0">
                      {(["NONE", "FREE", "PAID"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSubjectTier(subj.id, t)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                            tier === t
                              ? t === "PAID"
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : t === "FREE"
                                  ? "bg-sky-600 text-white border-sky-600"
                                  : "bg-gray-600 text-white border-gray-600"
                              : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {t === "NONE" ? "None" : t === "FREE" ? "Free" : "Paid"}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
}
