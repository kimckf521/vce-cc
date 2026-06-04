/**
 * History is free for every signed-in user — reviewing your own practice
 * record (your sessions) is part of the free tier. No gating here; the parent
 * `(app)/layout.tsx` already enforces login.
 */
export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
