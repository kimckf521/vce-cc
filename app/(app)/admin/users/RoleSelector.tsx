"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "STUDENT", label: "Student", color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" },
  { value: "ADMIN", label: "Admin", color: "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-400" },
  { value: "SUPER_ADMIN", label: "Super Admin", color: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400" },
];

export default function RoleSelector({
  userId,
  currentRole,
  isSelf,
  currentUserRole,
}: {
  userId: string;
  currentRole: string;
  isSelf: boolean;
  currentUserRole: string;
}) {
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canChange = currentUserRole === "SUPER_ADMIN" && !isSelf;
  const currentOption = ROLE_OPTIONS.find((o) => o.value === role) || ROLE_OPTIONS[0];

  if (!canChange) {
    return (
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs lg:text-sm font-medium ${currentOption.color}`}
      >
        {currentOption.label}
      </span>
    );
  }

  const handleChange = async (newRole: string) => {
    if (newRole === role || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setRole(data.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      ) : (
        <select
          value={role}
          onChange={(e) => handleChange(e.target.value)}
          className={`rounded-full px-2.5 py-0.5 text-xs lg:text-sm font-medium border-0 cursor-pointer appearance-none pr-6 ${currentOption.color}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 6px center",
          }}
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
      {error && (
        <span className="text-[10px] text-red-500 dark:text-red-400">{error}</span>
      )}
    </div>
  );
}
