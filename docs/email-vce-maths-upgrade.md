# VCE Maths upgrade email — draft for review

**Audience**: existing PAID Methods subscribers (5 users as of B1 migration; 3 real + 2 test accounts)
**When to send**: any time after B1 migration completes — not automated
**Channel**: existing Resend infra in `lib/billing-emails.ts` (pattern after `sendPaymentFailedEmail`)
**Status**: DRAFT — review and edit before sending

---

## Subject line options

1. **You just got 3 more subjects (no extra charge)** — recommended; shortest, surprise-led, value-first
2. Your VCE Maths subscription just grew — Specialist, Foundation and General are unlocked
3. We added 3 subjects to your subscription. Nothing to do.

---

## Email body

**Subject**: You just got 3 more subjects (no extra charge)

---

Hi {{firstName}},

Good news — your ATAR Hero subscription now unlocks **all 4 VCE Maths subjects**, not just Methods.

That means Specialist, Foundation and General are all sitting in your account, ready when you want them. Worked solutions, past papers, practice mode — same as Methods.

**What's changed:**

- Same $9.99/month price
- Nothing to click, nothing to update — everything's already unlocked
- Cancel any time from Profile → Billing (unchanged)

We've been working on broadening ATAR Hero from Methods to every Australian curriculum. Bundling the 4 VCE Maths subjects into the same subscription is the first step.

If you're only studying Methods, no need to think about the rest. If you're juggling more than one maths subject, the others are right there in your sidebar.

Thanks for being one of the first to back us — it means a lot.

— The ATAR Hero team
[atarhero.com](https://atarhero.com)

P.S. Got a friend studying VCE Maths? Your referral link is in Profile → Referrals. They get 50% off their first month; you get a $5 credit when they stick around.

---

## Sending notes

**Personalisation**

- `{{firstName}}` → pull from `User.name` (split on first whitespace, take first word). Fallback to `there` if name is null.

**Recipient list** (real users only — skip test accounts)

- chiuoiping@outlook.com
- dicksonly@hotmail.com
- chuajustin1@gmail.com

Test accounts to skip:

- freetiertest@vcemethods.local
- test-paid-1@example.com

**Format**

Plain text via Resend is fine. If you want HTML, mirror the existing `sendPaymentFailedEmail` template style — simple header with the kangaroo logo, brand-tinted CTA button.

**Implementation sketch**

1. Add `sendVceMathsUpgradeEmail({ to, firstName })` to `lib/billing-emails.ts` (mirrors existing functions)
2. One-off script `scripts/send-vce-maths-upgrade-email.ts` — loops the recipient list, calls the send function, logs success/failure per user
3. Default dry-run (prints what it would send); `--execute` to actually send
4. Manually trigger after reviewing the copy

---

## Why we're sending

These users paid for a Methods-only subscription. The new product (VCE Maths at the same $9.99/month price) unlocks 3 more subjects automatically. The email:

1. **Manages expectations** — they shouldn't be surprised to find new subjects in their account
2. **Earns a touch point** — gentle reminder ATAR Hero exists, drives a return visit
3. **Signals ongoing investment** — communicates we're expanding the product, not stagnating
4. **Soft referral nudge** — the P.S. is the only ask

The email deliberately does **not** mention future pricing tiers (e.g. "Sciences will be $9.99 each"). That would invite speculation about price changes. Stay focused on the immediate benefit.

---

## Voice check

- Australian English (e.g., "behaviour" not "behavior" — none in current copy, just a heads-up)
- Team voice: **we/us/our**, never I/me/my (per project convention)
- Casual but not slang: "ready when you want them" not "ready whenever, mate"
- Confident, not begging: avoids "We hope you'll love it" / "Please log in to see"
