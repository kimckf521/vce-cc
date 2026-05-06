import { sendEmail } from "@/lib/email";

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
