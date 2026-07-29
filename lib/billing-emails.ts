import { sendEmail, type SendEmailResult } from "@/lib/email";

const SITE_NAME = "ATAR Hero";
const BILLING_URL = "https://atarhero.com.au/profile";

function formatAmount(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency.toLowerCase(),
  }).format(amountCents / 100);
}

function formatDate(unixSeconds: number | null | undefined): string | null {
  if (!unixSeconds) return null;
  return new Date(unixSeconds * 1000).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Sent to the user when Stripe fails to charge their card on a renewal.
 * Stripe will keep retrying for ~3 weeks (depending on dashboard settings),
 * and the user keeps access during that window. The email tells them what
 * happened and links them to the billing page to update their card.
 */
export async function sendPaymentFailedEmail(args: {
  to: string;
  amountCents: number;
  currency: string;
  /** Unix seconds — when Stripe will next attempt the charge, if known. */
  nextAttemptAt?: number | null;
}): Promise<void> {
  const amount = formatAmount(args.amountCents, args.currency);
  const nextAttemptDate = formatDate(args.nextAttemptAt);

  const lines = [
    `Hi,`,
    ``,
    `We weren't able to process your ${amount} payment for your ${SITE_NAME} subscription.`,
    ``,
    `Don't worry — your access is still active. We'll automatically retry the payment over the next few weeks${nextAttemptDate ? ` (next attempt on ${nextAttemptDate})` : ""}.`,
    ``,
    `To avoid losing access, please update your payment method:`,
    BILLING_URL,
    ``,
    `Common reasons payments fail:`,
    `  • Insufficient funds`,
    `  • Card expired`,
    `  • Card was reported lost or stolen`,
    `  • Bank declined the charge (try contacting them, or use a different card)`,
    ``,
    `If you've already updated your card, you can ignore this email.`,
    ``,
    `— The ${SITE_NAME} team`,
  ];

  await sendEmail({
    to: args.to,
    subject: `Payment failed for your ${SITE_NAME} subscription`,
    text: lines.join("\n"),
  });
}

/**
 * Sent to the user when their charge has been refunded. Two flavours:
 *   - Full refund: subscription is also being cancelled at period end → user
 *     gets to use the rest of the billing period they paid for.
 *   - Partial refund: subscription continues unchanged.
 */
export async function sendRefundEmail(args: {
  to: string;
  amountCents: number;
  currency: string;
  /** True if we just scheduled cancel_at_period_end on their subscription. */
  subscriptionCancelled: boolean;
  /** Unix seconds — last day they have access (only used when cancelled). */
  accessUntil?: number | null;
}): Promise<void> {
  const amount = formatAmount(args.amountCents, args.currency);
  const accessUntilLabel = formatDate(args.accessUntil);

  const lines = args.subscriptionCancelled
    ? [
        `Hi,`,
        ``,
        `We've refunded ${amount} to your card. The refund should appear on your statement in 5–10 business days, depending on your bank.`,
        ``,
        `Your subscription has been cancelled — you won't be charged again.${accessUntilLabel ? ` You'll keep access until ${accessUntilLabel}.` : ""}`,
        ``,
        `If you change your mind, you can resubscribe anytime from your billing page:`,
        BILLING_URL,
        ``,
        `Thanks for trying ${SITE_NAME}. If there's anything we could have done better, just reply to this email.`,
        ``,
        `— The ${SITE_NAME} team`,
      ]
    : [
        `Hi,`,
        ``,
        `We've issued a partial refund of ${amount} to your card. The refund should appear on your statement in 5–10 business days, depending on your bank.`,
        ``,
        `Your subscription is still active and will renew as scheduled. To make changes, visit your billing page:`,
        BILLING_URL,
        ``,
        `— The ${SITE_NAME} team`,
      ];

  await sendEmail({
    to: args.to,
    subject: args.subscriptionCancelled
      ? `Refund processed — your ${SITE_NAME} subscription has been cancelled`
      : `Partial refund processed for your ${SITE_NAME} subscription`,
    text: lines.join("\n"),
  });
}

/**
 * Renders the one-off "you now have all 4 VCE Maths subjects" announcement
 * for existing PAID subscribers. Copy was drafted and reviewed in
 * docs/email-vce-maths-upgrade.md — keep the two in sync if either changes.
 *
 * Split out from the send function so the dispatch script can print the
 * exact rendered email in dry-run mode without duplicating the copy.
 */
export function renderVceMathsUpgradeEmail(args: {
  /** First word of User.name; pass "there" when the user has no name set. */
  firstName: string;
}): { subject: string; text: string } {
  const lines = [
    `Hi ${args.firstName},`,
    ``,
    `Good news — your ${SITE_NAME} subscription now unlocks all 4 VCE Maths subjects, not just Methods.`,
    ``,
    `That means Specialist, Foundation and General are all sitting in your account, ready when you want them. Worked solutions, past papers, practice mode — same as Methods.`,
    ``,
    `What's changed:`,
    `  • Same $9.99/month price`,
    `  • Nothing to click, nothing to update — everything's already unlocked`,
    `  • Cancel any time from Profile → Billing (unchanged)`,
    ``,
    `We've been working on broadening ${SITE_NAME} from Methods to every Australian curriculum. Bundling the 4 VCE Maths subjects into the same subscription is the first step.`,
    ``,
    `If you're only studying Methods, no need to think about the rest. If you're juggling more than one maths subject, the others are right there in your sidebar.`,
    ``,
    `Thanks for being one of the first to back us — it means a lot.`,
    ``,
    `— The ${SITE_NAME} team`,
    `https://atarhero.com.au`,
    ``,
    `P.S. Got a friend studying VCE Maths? Your referral link is in Profile → Referrals. They get 50% off their first month; you get a $5 credit when they stick around.`,
  ];

  return {
    subject: `You just got 3 more subjects (no extra charge)`,
    text: lines.join("\n"),
  };
}

/**
 * Sends the VCE Maths upgrade announcement to one subscriber. Only ever
 * dispatched manually via scripts/send-vce-maths-upgrade-email.ts — never
 * called from webhook or app code.
 *
 * Unlike the webhook-driven emails above (which return void because their
 * callers can't act on a failure), this returns the SendEmailResult so the
 * dispatch script can log success/failure per recipient.
 */
export async function sendVceMathsUpgradeEmail(args: {
  to: string;
  firstName: string;
}): Promise<SendEmailResult> {
  const { subject, text } = renderVceMathsUpgradeEmail({
    firstName: args.firstName,
  });
  return sendEmail({ to: args.to, subject, text });
}
