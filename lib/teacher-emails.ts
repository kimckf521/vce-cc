import { sendEmail, type SendEmailResult } from "@/lib/email";
import { SITE_URL, SITE_NAME } from "@/lib/site";

/**
 * Transactional emails for the teacher-application pipeline.
 * Mirrors the plain-text style of lib/billing-emails.ts. All senders are
 * best-effort at the call site — a failed email never rolls back the
 * underlying state change.
 */

/** Sent to the applicant's school/contact email with the verification link. */
export async function sendTeacherVerificationEmail(args: {
  to: string;
  firstName: string;
  verifyUrl: string;
}): Promise<SendEmailResult> {
  const lines = [
    `Hi ${args.firstName},`,
    ``,
    `Thanks for applying for a ${SITE_NAME} teacher account.`,
    ``,
    `Please confirm this email address by clicking the link below:`,
    args.verifyUrl,
    ``,
    `Once confirmed, our team reviews your application against the Victorian`,
    `Institute of Teaching register — usually within one school day. We'll`,
    `email you as soon as it's approved.`,
    ``,
    `If you didn't apply, you can safely ignore this email.`,
    ``,
    `— The ${SITE_NAME} team`,
  ];
  return sendEmail({
    to: args.to,
    subject: `Confirm your email — ${SITE_NAME} teacher account`,
    text: lines.join("\n"),
  });
}

/** Sent to the applicant's ACCOUNT email when the application is approved. */
export async function sendTeacherApprovedEmail(args: {
  to: string;
  firstName: string;
}): Promise<SendEmailResult> {
  const lines = [
    `Hi ${args.firstName},`,
    ``,
    `Great news — your ${SITE_NAME} teacher account is approved!`,
    ``,
    `You now have access to the assessment builder:`,
    `  • Build tests and SACs from our original question bank`,
    `  • Filter by topic, difficulty and calculator rules`,
    `  • Print a student paper and a marking guide in one click`,
    ``,
    `Get started: ${SITE_URL}/teacher`,
    ``,
    `It's free for registered teachers. If you have feedback or feature`,
    `requests, just reply to this email — we read everything.`,
    ``,
    `— The ${SITE_NAME} team`,
  ];
  return sendEmail({
    to: args.to,
    subject: `Your ${SITE_NAME} teacher account is ready`,
    text: lines.join("\n"),
  });
}

/** Sent to the applicant's ACCOUNT email when the application is rejected. */
export async function sendTeacherRejectedEmail(args: {
  to: string;
  firstName: string;
  reason?: string | null;
}): Promise<SendEmailResult> {
  const lines = [
    `Hi ${args.firstName},`,
    ``,
    `Thanks for your interest in a ${SITE_NAME} teacher account. We weren't`,
    `able to approve your application at this time.`,
    ...(args.reason ? [``, `Reviewer note: ${args.reason}`] : []),
    ``,
    `The most common reason is that we couldn't match the application against`,
    `the Victorian Institute of Teaching register. If you believe this is a`,
    `mistake, reply to this email with your VIT registration number and we'll`,
    `take another look — or simply apply again at ${SITE_URL}/teachers.`,
    ``,
    `— The ${SITE_NAME} team`,
  ];
  return sendEmail({
    to: args.to,
    subject: `About your ${SITE_NAME} teacher account application`,
    text: lines.join("\n"),
  });
}
