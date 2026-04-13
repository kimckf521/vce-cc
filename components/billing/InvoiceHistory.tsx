"use client";

import { FileText, Download } from "lucide-react";

type Invoice = {
  id: string;
  date: string | null;
  amount: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
  productName: string;
};

type Props = {
  invoices: Invoice[];
  loading: boolean;
};

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400",
  open: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
  void: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  draft: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  uncollectible:
    "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400",
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg"
        />
      ))}
    </div>
  );
}

export default function InvoiceHistory({ invoices, loading }: Props) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-5">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">
        Invoice History
      </p>

      {loading ? (
        <Skeleton />
      ) : invoices.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No invoices yet.
        </p>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center gap-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-3"
            >
              <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {inv.productName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {inv.date ? formatDate(inv.date) : "—"}
                </p>
              </div>

              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-shrink-0">
                {formatCurrency(inv.amount, inv.currency)}
              </p>

              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold flex-shrink-0 ${
                  STATUS_STYLES[inv.status] ?? STATUS_STYLES.draft
                }`}
              >
                {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
              </span>

              {inv.pdfUrl && (
                <a
                  href={inv.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Download PDF"
                >
                  <Download className="h-4 w-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
