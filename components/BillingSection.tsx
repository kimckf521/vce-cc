"use client";

import { useEffect, useState, useCallback } from "react";
import { CreditCard, Gift } from "lucide-react";
import SubscriptionCard from "@/components/billing/SubscriptionCard";
import PaymentMethodCard from "@/components/billing/PaymentMethodCard";
import InvoiceHistory from "@/components/billing/InvoiceHistory";
import PaymentFailedBanner from "@/components/billing/PaymentFailedBanner";
import CheckoutButton from "@/components/CheckoutButton";

function formatDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function AccountCreditCard({ cents, hasSubscription }: { cents: number; hasSubscription: boolean }) {
  return (
    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 p-5 lg:p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 rounded-xl bg-emerald-100 dark:bg-emerald-900 p-3">
          <Gift className="h-5 w-5 lg:h-6 lg:w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs lg:text-sm font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Account credit
          </p>
          <p className="text-2xl lg:text-3xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
            {formatDollars(cents)}
          </p>
          <p className="text-xs lg:text-sm text-emerald-700/80 dark:text-emerald-400/80 mt-1.5">
            {hasSubscription
              ? "Automatically applied to your next invoice."
              : "Will apply to your first invoice when you subscribe."}
          </p>
        </div>
      </div>
    </div>
  );
}

type Props = {
  hasSubscription: boolean;
  planName: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hideTitle?: boolean;
};

type SubscriptionDetails = {
  id: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  planName: string;
  priceAmount: number;
  priceCurrency: string;
  priceInterval: string;
};

type PaymentMethodDetails = {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

type InvoiceItem = {
  id: string;
  date: string | null;
  amount: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
  hostedUrl: string | null;
  productName: string;
};

function DetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="rounded-xl bg-gray-100 dark:bg-gray-800 h-40" />
      <div className="rounded-xl bg-gray-100 dark:bg-gray-800 h-28" />
      <div className="rounded-xl bg-gray-100 dark:bg-gray-800 h-36" />
    </div>
  );
}

export default function BillingSection({
  hasSubscription,
  planName: _planName,
  status: _status,
  currentPeriodEnd: _currentPeriodEnd,
  cancelAtPeriodEnd: _cancelAtPeriodEnd,
  hideTitle = false,
}: Props) {
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodDetails | null>(null);
  const [accountCreditCents, setAccountCreditCents] = useState(0);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    setDetailsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/billing/details");
      if (!res.ok) throw new Error("Failed to load billing details");
      const data = await res.json();
      setSubscription(data.subscription);
      setPaymentMethod(data.paymentMethod);
      setAccountCreditCents(typeof data.accountCreditCents === "number" ? data.accountCreditCents : 0);
    } catch {
      setFetchError("Could not load billing details. Please try again.");
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    try {
      const res = await fetch("/api/billing/invoices");
      if (!res.ok) throw new Error("Failed to load invoices");
      const data = await res.json();
      setInvoices(data.invoices);
    } catch {
      // Non-critical — invoice section will show empty state
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  useEffect(() => {
    // Always fetch details — even free users may have account credit
    // (admin gifts, prior referral payouts).
    fetchDetails();
    if (hasSubscription) {
      fetchInvoices();
    }
  }, [hasSubscription, fetchDetails, fetchInvoices]);

  function handleChanged() {
    fetchDetails();
    fetchInvoices();
  }

  // Free user — show upgrade CTA (and credit card if any)
  if (!hasSubscription) {
    return (
      <div>
        {!hideTitle && (
          <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 lg:mb-5">
            Billing
          </h2>
        )}
        <div className="space-y-4">
          {accountCreditCents > 0 && (
            <AccountCreditCard cents={accountCreditCents} hasSubscription={false} />
          )}
          <div
            className={
              hideTitle
                ? ""
                : "rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5 lg:p-7"
            }
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-xl bg-brand-50 dark:bg-brand-950 p-3">
                <CreditCard className="h-5 w-5 lg:h-6 lg:w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">
                  Free plan
                </p>
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Upgrade to Standard for full access to Mathematical Methods.
                </p>
              </div>
            </div>
            <div className="mt-5">
              <CheckoutButton className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
                Upgrade to Standard
              </CheckoutButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Paid user — show full billing dashboard
  return (
    <div>
      {!hideTitle && (
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 lg:mb-5">
          Billing
        </h2>
      )}

      {detailsLoading && !subscription ? (
        <DetailsSkeleton />
      ) : fetchError ? (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-5">
          <p className="text-sm text-red-600 dark:text-red-400">{fetchError}</p>
          <button
            type="button"
            onClick={() => {
              fetchDetails();
              fetchInvoices();
            }}
            className="mt-3 text-sm font-semibold text-red-700 dark:text-red-300 underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {subscription?.status === "past_due" && (
            <PaymentFailedBanner currentPeriodEnd={subscription.currentPeriodEnd} />
          )}

          {accountCreditCents > 0 && (
            <AccountCreditCard cents={accountCreditCents} hasSubscription={true} />
          )}

          {subscription ? (
            <SubscriptionCard
              planName={subscription.planName}
              status={subscription.status}
              priceAmount={subscription.priceAmount}
              priceCurrency={subscription.priceCurrency}
              priceInterval={subscription.priceInterval}
              currentPeriodEnd={subscription.currentPeriodEnd}
              cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
              onChanged={handleChanged}
            />
          ) : (
            /* Fallback when Stripe API hasn't returned (e.g. transient error
               or test-data row with no real Stripe sub). Surface what we
               know from the DB so the tab never renders empty for a paid
               user. */
            <SubscriptionCard
              planName={_planName ?? "VCE Maths"}
              status={_status ?? "active"}
              priceAmount={999}
              priceCurrency="aud"
              priceInterval="month"
              currentPeriodEnd={_currentPeriodEnd}
              cancelAtPeriodEnd={_cancelAtPeriodEnd}
              onChanged={handleChanged}
            />
          )}

          {paymentMethod && (
            <PaymentMethodCard
              brand={paymentMethod.brand}
              last4={paymentMethod.last4}
              expMonth={paymentMethod.expMonth}
              expYear={paymentMethod.expYear}
            />
          )}

          <InvoiceHistory invoices={invoices} loading={invoicesLoading} />
        </div>
      )}
    </div>
  );
}
