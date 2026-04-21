import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-brand-700 dark:text-brand-400"
            >
              <BookOpen className="h-6 w-6" />
              ATAR Hero
            </Link>
            <p className="mt-3 text-sm lg:text-base text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
              From zero to hero — master VCE with real VCAA past exam questions, worked
              solutions, and progress tracking built for Year 12 students.
            </p>
            <p className="mt-4 text-xs lg:text-sm text-gray-400 dark:text-gray-500">
              Not affiliated with, endorsed by, or sponsored by VCAA.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Product
            </h3>
            <ul className="mt-4 space-y-3 text-sm lg:text-base">
              <li>
                <Link
                  href="/topics"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Topics
                </Link>
              </li>
              <li>
                <Link
                  href="/exams"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Past Papers
                </Link>
              </li>
              <li>
                <Link
                  href="/practice"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Practice
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Pricing
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
                  href="/faqs"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 lg:mt-16 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs lg:text-sm text-gray-400 dark:text-gray-500">
          <p>© {year} ATAR Hero. Made for Victorian Year 12 students.</p>
          <p>VCAA® is a registered trademark of the Victorian Curriculum and Assessment Authority.</p>
        </div>
      </div>
    </footer>
  );
}
