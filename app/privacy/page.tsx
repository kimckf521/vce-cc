import type { Metadata } from "next";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";

export const metadata: Metadata = {
  title: "Privacy Policy — ATAR Hero",
  description:
    "How ATAR Hero collects, uses, and protects your personal information in accordance with the Australian Privacy Principles.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "9 April 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <MarketingNav />

      <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-12 bg-gradient-to-b from-brand-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm lg:text-base text-gray-500 dark:text-gray-400">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-5 sm:px-8 lg:px-12">
        <article className="max-w-3xl mx-auto space-y-5 text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed [&_h2]:text-xl [&_h2]:lg:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:dark:text-gray-100 [&_h2]:mt-10 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:leading-relaxed [&_a]:text-brand-600 [&_a]:dark:text-brand-400 [&_a]:hover:underline [&_strong]:text-gray-900 [&_strong]:dark:text-gray-100">
          <p>
            ATAR Hero (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is an independent revision
            platform for Victorian VCE students. We take your privacy seriously and handle your
            personal information in accordance with the{" "}
            <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles (APPs).
          </p>
          <p>
            This policy explains what information we collect, how we use it, who we share it with,
            and the choices you have. By creating an account or using vcemethods.com.au (the
            &ldquo;Service&rdquo;) you agree to this policy.
          </p>

          <h2>1. Information we collect</h2>
          <p>We only collect information that is necessary to operate and improve the Service.</p>
          <ul>
            <li>
              <strong>Account information:</strong> your name, email address, and a password hash
              when you create an account.
            </li>
            <li>
              <strong>Study activity:</strong> the questions you attempt, your answers, time spent,
              correctness, and self-marked status. This powers progress tracking and review history.
            </li>
            <li>
              <strong>Billing information:</strong> if you subscribe to a paid plan, payment details
              are collected and processed by our payment provider, Stripe. We never see or store
              your full card number — we only receive a customer identifier and subscription status.
            </li>
            <li>
              <strong>Technical data:</strong> IP address, browser type, device type, referrer, and
              pages visited, collected via standard server logs and basic first-party analytics.
            </li>
            <li>
              <strong>Cookies:</strong> we use strictly necessary cookies for authentication (to
              keep you logged in) and for remembering your theme preference (light/dark mode).
            </li>
          </ul>

          <h2>2. How we use your information</h2>
          <ul>
            <li>To provide and personalise the Service — including tracking your progress, showing
              your history, and unlocking content based on your subscription.</li>
            <li>To authenticate you and keep your account secure.</li>
            <li>To process subscription payments and send billing receipts.</li>
            <li>To send important service communications (e.g. password resets, billing notices,
              and occasional product updates).</li>
            <li>To understand how the Service is used so we can improve features, fix bugs, and
              prioritise content.</li>
            <li>To comply with our legal obligations.</li>
          </ul>
          <p>
            We do not sell your personal information, and we do not share it with third parties for
            their own marketing purposes.
          </p>

          <h2>3. Who we share information with</h2>
          <p>
            We share the minimum amount of information required with trusted service providers that
            help us run the platform:
          </p>
          <ul>
            <li>
              <strong>Supabase</strong> — hosted authentication and database.
            </li>
            <li>
              <strong>Stripe</strong> — payment processing and subscription management. Stripe is
              PCI-DSS compliant and handles your payment details directly.
            </li>
            <li>
              <strong>Vercel</strong> — web hosting and edge delivery.
            </li>
          </ul>
          <p>
            Each of these providers is bound by their own privacy and security obligations and is
            only permitted to use your information to provide services to us. Some of these
            providers may store data outside Australia (for example, in the United States or
            European Union). By using the Service you consent to that cross-border transfer, and we
            take reasonable steps to ensure providers handle your data to a standard comparable to
            the Australian Privacy Principles.
          </p>

          <h2>4. How we protect your information</h2>
          <ul>
            <li>All traffic to and from the Service is encrypted in transit using HTTPS.</li>
            <li>Passwords are never stored in plaintext — only salted password hashes are kept,
              managed by our authentication provider.</li>
            <li>Access to production systems is restricted to authorised personnel.</li>
            <li>We never see or store your full credit card number.</li>
          </ul>

          <h2>5. Your rights</h2>
          <p>Under Australian privacy law and our own policy, you have the right to:</p>
          <ul>
            <li>Request access to the personal information we hold about you.</li>
            <li>Request correction of information that is inaccurate or out of date.</li>
            <li>Request deletion of your account and associated personal data.</li>
            <li>Withdraw consent at any time, for example by cancelling your subscription or
              closing your account.</li>
          </ul>
          <p>
            To exercise any of these rights, email us at{" "}
            <a href="mailto:privacy@vcemethods.com.au">privacy@vcemethods.com.au</a>. We will
            respond within a reasonable period, usually within 30 days.
          </p>

          <h2>6. Data retention</h2>
          <p>
            We retain your account and study data while your account is active. If you delete your
            account, we delete your personal data within 30 days, except where we are required to
            retain certain information (for example, invoices and billing records) to comply with
            Australian tax and accounting law.
          </p>

          <h2>7. Children and minors</h2>
          <p>
            ATAR Hero is intended for senior-secondary students, who are typically 16–18 years
            old. If you are under 18, please use the Service with the knowledge and consent of a
            parent or guardian. We do not knowingly collect information from children under 13. If
            you believe a child under 13 has created an account, contact us and we will delete the
            account.
          </p>

          <h2>8. Changes to this policy</h2>
          <p>
            We may update this policy from time to time as the Service evolves. When we do, we will
            update the &ldquo;Last updated&rdquo; date at the top of this page. If the changes are
            material, we will also notify you by email or an in-app notice.
          </p>

          <h2>9. Contact us</h2>
          <p>
            If you have any questions about this policy or how we handle your personal information,
            please contact us at{" "}
            <a href="mailto:privacy@vcemethods.com.au">privacy@vcemethods.com.au</a>.
          </p>
        </article>
      </section>

      <MarketingFooter />
    </div>
  );
}
