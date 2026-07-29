import Link from "next/link";
import BrandMark from "@/components/BrandMark";

export default function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-brand-700 dark:text-brand-400"
            >
              <BrandMark className="h-10 w-auto" />
              ATAR Hero
            </Link>
            <p className="mt-3 text-sm lg:text-base text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
              From zero to hero — master VCE with real VCAA past exam questions, worked
              solutions and progress tracking built for Year 12 students.
            </p>
            <p className="mt-4 text-xs lg:text-sm text-gray-400 dark:text-gray-500">
              Not affiliated with, endorsed by or sponsored by VCAA.
            </p>
          </div>

          {/* VCE Maths subjects — sitewide links to the indexable subject
              landing pages (and their public past papers). */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              VCE Maths
            </h3>
            <ul className="mt-4 space-y-3 text-sm lg:text-base">
              <li>
                <Link
                  href="/methods"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Mathematical Methods
                </Link>
              </li>
              <li>
                <Link
                  href="/specialist"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Specialist Mathematics
                </Link>
              </li>
              <li>
                <Link
                  href="/general"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  General Mathematics
                </Link>
              </li>
              <li>
                <Link
                  href="/foundation"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Foundation Mathematics
                </Link>
              </li>
            </ul>
          </div>

          {/* Past papers — one hub per subject so crawlers (and students) can
              reach every subject's public exam library from any page. */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Past papers
            </h3>
            <ul className="mt-4 space-y-3 text-sm lg:text-base">
              <li>
                <Link
                  href="/vce/methods/exams"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Methods past papers
                </Link>
              </li>
              <li>
                <Link
                  href="/vce/specialist/exams"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Specialist past papers
                </Link>
              </li>
              <li>
                <Link
                  href="/vce/general/exams"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  General past papers
                </Link>
              </li>
              <li>
                <Link
                  href="/vce/foundation/exams"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Foundation past papers
                </Link>
              </li>
            </ul>
          </div>

          {/* Free tools — the public /tools hub plus its tools, so every page
              links the indexable collection page. */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Free tools
            </h3>
            <ul className="mt-4 space-y-3 text-sm lg:text-base">
              <li>
                <Link
                  href="/tools"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  All free tools
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/study-score-calculator"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Study score calculator
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/exam-countdown"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Exam countdown
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Help
            </h3>
            <ul className="mt-4 space-y-3 text-sm lg:text-base">
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Contact us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Terms and conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 lg:mt-16 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 text-xs lg:text-sm text-gray-400 dark:text-gray-500 text-center sm:text-left">
          <p>© {year} ATAR Hero. Made for Victorian Year 12 students.</p>
          <p className="text-[10px] sm:text-xs lg:text-sm">VCAA® is a registered trademark of the Victorian Curriculum and Assessment Authority.</p>
        </div>
      </div>
    </footer>
  );
}
