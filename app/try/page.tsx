import { redirect } from "next/navigation";

// Bare /try (typed by hand or from a trimmed share link) previously 404'd.
// Send it to the default guest-trial subject; the full path is
// /try/[curriculum]/[subject].
export default function TryIndexPage() {
  redirect("/try/vce/methods");
}
