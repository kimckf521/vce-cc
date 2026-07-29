/**
 * Advisory scoring for teacher-account applications.
 *
 * Pure functions — computed once at submit time and stored on the
 * TeacherApplication row for display in the admin review queue. These signals
 * NEVER auto-approve anyone: the VIT register cross-check (manual, admin-side)
 * is the sole authority on "is a registered teacher". The signals answer a
 * different question — "is this mailbox plausibly the claimed person's, and
 * is it a staff or a student mailbox?".
 *
 * Domain-tier semantics (Victoria):
 *   GOV_STAFF      @education.vic.gov.au — Department of Education STAFF
 *                  domain (teachers AND non-teaching staff; students never).
 *   STUDENT_DOMAIN @schools.vic.gov.au — government-school STUDENT accounts.
 *                  A hard red flag for a teacher application.
 *   SCHOOL         *.edu.au — Catholic/independent school domains. Staff and
 *                  students often SHARE these, so the name-prefix match and
 *                  VIT check carry the weight here.
 *   PERSONAL       Known consumer mail providers. Expected for private
 *                  tutors and CRTs; weak signal for school teachers.
 *   OTHER          Anything else (e.g. a tutoring-business domain).
 */

export type DomainTier =
  | "GOV_STAFF"
  | "STUDENT_DOMAIN"
  | "SCHOOL"
  | "PERSONAL"
  | "OTHER";

const FREEMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "outlook.com.au",
  "hotmail.com",
  "hotmail.com.au",
  "live.com",
  "live.com.au",
  "yahoo.com",
  "yahoo.com.au",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
]);

/** Lower-cased domain part of an email address ("" if malformed). */
function emailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  return at === -1 ? "" : email.slice(at + 1).trim().toLowerCase();
}

/** Lower-cased localpart of an email address ("" if malformed). */
export function emailLocalpart(email: string): string {
  const at = email.lastIndexOf("@");
  return at === -1 ? "" : email.slice(0, at).trim().toLowerCase();
}

export function domainTier(email: string): DomainTier {
  const domain = emailDomain(email);
  if (!domain) return "OTHER";
  if (domain === "education.vic.gov.au") return "GOV_STAFF";
  if (domain === "schools.vic.gov.au" || domain.endsWith(".schools.vic.gov.au"))
    return "STUDENT_DOMAIN";
  if (FREEMAIL_DOMAINS.has(domain)) return "PERSONAL";
  if (domain.endsWith(".edu.au")) return "SCHOOL";
  return "OTHER";
}

/**
 * Does the email localpart plausibly encode the claimed full name?
 *
 * School email conventions vary wildly (jsmith / j.smith / john.smith /
 * smithj / smith.john …), so this generates the common candidate shapes from
 * the name and checks them against the localpart with digits and separators
 * stripped. A non-match is NOT evidence of fraud (some schools use staff
 * IDs) — the admin queue shows it as a neutral "no match" and the application
 * simply gets a closer look.
 */
export function nameMatchesLocalpart(fullName: string, email: string): boolean {
  const local = emailLocalpart(email).replace(/[^a-z]/g, "");
  if (!local) return false;

  const parts = fullName
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, "")
    .replace(/['-]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return false;

  const first = parts[0];
  const last = parts[parts.length - 1];
  const fi = first[0] ?? "";
  const li = last[0] ?? "";

  const candidates = new Set<string>(
    parts.length === 1
      ? [first]
      : [
          `${first}${last}`, // john.smith / johnsmith
          `${last}${first}`, // smith.john
          `${fi}${last}`, // jsmith / j.smith
          `${last}${fi}`, // smithj
          `${first}${li}`, // johns
          first,
          last,
        ]
  );

  for (const candidate of Array.from(candidates)) {
    if (candidate.length < 3) {
      // Very short candidates (e.g. "li", "wu") only count as exact matches —
      // substring checks would fire on almost any localpart.
      if (local === candidate) return true;
      continue;
    }
    if (local === candidate || local.startsWith(candidate) || local.endsWith(candidate)) {
      return true;
    }
  }
  return false;
}

/**
 * Student accounts at many schools embed an enrolment/graduation year in the
 * localpart (jsmith2026@, 26jsmith@). Detecting a plausible year is a soft
 * "this looks like a student account" flag — advisory only, since a few
 * schools number duplicate staff addresses too (john.smith2@).
 */
export function hasGradYearDigits(email: string): boolean {
  const local = emailLocalpart(email);
  // 4-digit years 2015–2039 anywhere in the localpart.
  const fourDigit = local.match(/20[1-3][0-9]/);
  if (fourDigit) {
    const year = Number(fourDigit[0]);
    if (year >= 2015 && year <= 2039) return true;
  }
  // 2-digit year prefixes/suffixes (26jsmith, jsmith26) in a plausible range.
  const twoDigit = local.match(/(?:^|[^0-9])([1-3][0-9])(?:[^0-9]|$)/);
  if (twoDigit) {
    const year = Number(twoDigit[1]);
    if (year >= 15 && year <= 39) return true;
  }
  return false;
}

export interface ApplicationScore {
  domainTier: DomainTier;
  nameMatch: boolean;
  gradYearFlag: boolean;
}

export function scoreApplication(fullName: string, schoolEmail: string): ApplicationScore {
  return {
    domainTier: domainTier(schoolEmail),
    nameMatch: nameMatchesLocalpart(fullName, schoolEmail),
    gradYearFlag: hasGradYearDigits(schoolEmail),
  };
}

/** Public VIT register search — the admin queue links here for the manual check. */
export const VIT_REGISTER_URL = "https://www.vit.vic.edu.au/search-the-register";
