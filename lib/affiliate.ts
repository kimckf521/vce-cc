import { prisma } from "@/lib/prisma";
import type { AffiliateType } from "@prisma/client";

// Reward amounts in cents
export const STUDENT_REFERRAL_REWARD = 500;     // $5 platform credit
export const TUTOR_REFERRAL_REWARD = 1000;      // $10 cash
export const INFLUENCER_REFERRAL_REWARD = 1000; // $10 cash

// Minimum payout threshold for cash payouts
export const MIN_PAYOUT_AMOUNT = 2000; // $20

/** Reward (in cents) for a given affiliate type's per-referral commission. */
export function rewardForType(type: AffiliateType): number {
  switch (type) {
    case "STUDENT_REFERRAL":
      return STUDENT_REFERRAL_REWARD;
    case "TUTOR_AFFILIATE":
      return TUTOR_REFERRAL_REWARD;
    case "INFLUENCER_AFFILIATE":
      return INFLUENCER_REFERRAL_REWARD;
  }
}

/** Format a cent value as AUD currency. */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Human label for affiliate type. */
export function affiliateTypeLabel(type: AffiliateType): string {
  switch (type) {
    case "STUDENT_REFERRAL":
      return "Student";
    case "TUTOR_AFFILIATE":
      return "Tutor";
    case "INFLUENCER_AFFILIATE":
      return "Influencer";
  }
}

/**
 * Generate a URL-friendly referral code from a name.
 * Format: <slug>-<4 hex chars>, e.g. "kim-a3f7".
 * Retries up to 5 times if a collision occurs.
 */
export async function generateReferralCode(seed: string | null | undefined): Promise<string> {
  const base =
    (seed ?? "user")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 20) || "user";

  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, "0");
    const code = `${base}-${suffix}`;
    const existing = await prisma.affiliate.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }

  // Fallback — extremely unlikely
  return `${base}-${Date.now().toString(36)}`;
}

/** Validate Australian Business Number (ABN) — 11 digits. */
export function isValidAbn(abn: string): boolean {
  return /^\d{11}$/.test(abn.replace(/\s+/g, ""));
}

/** Build the absolute referral link for a given code. */
export function buildReferralUrl(code: string, baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/signup?ref=${encodeURIComponent(code)}`;
}
