import type { Metadata } from "next";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";

export const metadata: Metadata = {
  title: "Terms & Conditions — ATAR Hero",
  description:
    "The terms that govern your use of ATAR Hero, including accounts, subscriptions, acceptable use, and intellectual property.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "9 April 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <MarketingNav />

      <section className="py-16 lg:py-24 px-5 sm:px-8 lg:px-12 bg-gradient-to-b from-brand-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-sm lg:text-base text-gray-500 dark:text-gray-400">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-5 sm:px-8 lg:px-12">
        <article className="max-w-3xl mx-auto space-y-5 text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed [&_h2]:text-xl [&_h2]:lg:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:dark:text-gray-100 [&_h2]:mt-10 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:leading-relaxed [&_a]:text-brand-600 [&_a]:dark:text-brand-400 [&_a]:hover:underline [&_strong]:text-gray-900 [&_strong]:dark:text-gray-100">
          <p>
            These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to and use of
            ATAR Hero (the &ldquo;Service&rdquo;), operated from Victoria, Australia. By creating
            an account or using the Service you agree to be bound by these Terms. If you do not
            agree, you must not use the Service.
          </p>

          <h2>1. Who we are</h2>
          <p>
            ATAR Hero is an independent VCE revision platform. We are not affiliated with,
            endorsed by, or sponsored by the Victorian Curriculum and Assessment Authority (VCAA).
            VCAA&reg; is a registered trademark of the Victorian Curriculum and Assessment
            Authority and is used here only to refer to publicly available past examinations for
            the purposes of educational review and study.
          </p>

          <h2>2. Eligibility and accounts</h2>
          <ul>
            <li>
              You must be at least 13 years old to create an account. If you are under 18, you
              should use the Service with the knowledge and consent of a parent or guardian.
            </li>
            <li>
              You are responsible for keeping your login credentials confidential and for all
              activity that occurs under your account.
            </li>
            <li>
              You must provide accurate information when signing up and keep it up to date.
            </li>
            <li>
              One account per person. Accounts are non-transferable.
            </li>
          </ul>

          <h2>3. Subscriptions and billing</h2>
          <ul>
            <li>
              The Service offers a Free plan (limited content) and a paid Standard plan. Pricing
              and plan features are shown on our{" "}
              <a href="/pricing">Pricing</a> page.
            </li>
            <li>
              The Standard plan is billed monthly in Australian dollars (AUD) through our payment
              processor, Stripe. Prices include GST where applicable.
            </li>
            <li>
              By starting a Standard subscription you authorise us (via Stripe) to charge your
              nominated payment method on a recurring monthly basis until you cancel.
            </li>
            <li>
              <strong>Cancellations:</strong> you can cancel at any time from the billing portal in
              your profile. Your access continues until the end of the billing period you have
              already paid for, and you will not be charged again.
            </li>
            <li>
              <strong>Refunds:</strong> because the Service is a low-cost monthly subscription that
              you can cancel at any time, we do not generally provide refunds for partial months.
              Nothing in these Terms limits your rights under the Australian Consumer Law.
            </li>
            <li>
              We may change pricing or plan features from time to time. If we change the price of
              your active subscription, we will give you at least 14 days&apos; notice by email
              before the change takes effect, and you may cancel before the new price applies.
            </li>
          </ul>

          <h2>4. Acceptable use</h2>
          <p>When using the Service, you must not:</p>
          <ul>
            <li>Share your account, credentials, or paid content with anyone else.</li>
            <li>Scrape, copy, republish, redistribute, or resell any part of the Service or its
              content, including worked solutions.</li>
            <li>Attempt to reverse-engineer, probe, or circumvent any part of the Service or any
              paywall or access control.</li>
            <li>Upload malicious code, attempt to disrupt the Service, or use the Service to
              attack another system.</li>
            <li>Use the Service to engage in academic dishonesty or to cheat on any school
              assessment, School-Assessed Coursework (SAC), or external examination. The Service
              is a revision tool intended for personal study.</li>
            <li>Use the Service in violation of any applicable law.</li>
          </ul>
          <p>
            We may suspend or terminate any account that breaches these rules, with or without
            notice.
          </p>

          <h2>5. Intellectual property</h2>
          <ul>
            <li>
              The Service, including our code, interface design, original explanations, worked
              solutions, progress-tracking tools, and branding, is owned by ATAR Hero and is
              protected by Australian and international copyright and trademark law.
            </li>
            <li>
              Past exam questions are produced by the Victorian Curriculum and Assessment Authority
              (VCAA) and remain the intellectual property of VCAA. We display them here for
              educational, review, and non-commercial study purposes only. Any copyright in those
              questions belongs to VCAA.
            </li>
            <li>
              We grant you a limited, personal, non-exclusive, non-transferable licence to access
              and use the Service for your own private study while your account is in good
              standing. No other rights are granted.
            </li>
          </ul>

          <h2>6. Content accuracy and educational use</h2>
          <p>
            We take great care to make our worked solutions and explanations accurate, but the
            Service is provided as a study aid &mdash; not as an official marking guide or a
            substitute for advice from your teacher or the VCAA. We do not guarantee any particular
            exam result. If you notice an error, please let us know so we can fix it.
          </p>

          <h2>7. Service availability</h2>
          <p>
            We aim to keep the Service available at all times, but we do not guarantee uninterrupted
            access. We may temporarily suspend the Service for maintenance, upgrades, or to protect
            its security or integrity. We are not liable for any loss caused by downtime.
          </p>

          <h2>8. Privacy</h2>
          <p>
            Our collection and use of your personal information is described in our{" "}
            <a href="/privacy">Privacy Policy</a>, which forms part of these Terms.
          </p>

          <h2>9. Termination</h2>
          <ul>
            <li>You may delete your account at any time from your profile page or by emailing us.</li>
            <li>We may suspend or terminate your account if you breach these Terms, if your
              payment fails, or if we are required to by law.</li>
            <li>On termination, your right to use the Service ends immediately. Clauses relating
              to intellectual property, disclaimers, and liability survive termination.</li>
          </ul>

          <h2>10. Australian Consumer Law and disclaimers</h2>
          <p>
            To the maximum extent permitted by law, the Service is provided &ldquo;as is&rdquo;
            without warranty of any kind. We do not warrant that the Service will be error-free or
            that any information on it is complete or up to date.
          </p>
          <p>
            Nothing in these Terms excludes, restricts, or modifies any consumer guarantee, right,
            or remedy conferred by the Australian Consumer Law that cannot lawfully be excluded.
            Where our liability for breach of a consumer guarantee cannot be excluded but can be
            limited, our liability is limited, at our option, to re-supplying the Service or paying
            the cost of re-supply.
          </p>
          <p>
            Subject to the above, our total liability to you for all claims arising out of or
            relating to the Service is limited to the amount you have paid us in the 12 months
            immediately before the claim arose.
          </p>

          <h2>11. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. When we do, we will update the
            &ldquo;Last updated&rdquo; date at the top of this page. If the changes are material,
            we will also notify you by email or an in-app notice at least 14 days before they take
            effect. Your continued use of the Service after that date constitutes acceptance of
            the new Terms.
          </p>

          <h2>12. Governing law</h2>
          <p>
            These Terms are governed by the laws of the State of Victoria, Australia. You and we
            each submit to the non-exclusive jurisdiction of the courts of Victoria for any dispute
            arising out of or relating to the Service or these Terms.
          </p>

          <h2>13. Contact us</h2>
          <p>
            Questions about these Terms? Email us at{" "}
            <a href="mailto:support@vcemethods.com.au">support@vcemethods.com.au</a>.
          </p>
        </article>
      </section>

      <MarketingFooter />
    </div>
  );
}
