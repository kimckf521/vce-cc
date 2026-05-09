// /practice routes are no longer gated as a group. Exam 1 is free; the
// individual exam2a / exam2b / exam2ab pages and the /practice/session page
// gate themselves so free users get a paywall only on the paid surfaces.
export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
