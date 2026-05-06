"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

/**
 * Clickable table row that navigates to the affiliate detail page.
 * Uses cursor-pointer + keyboard activation so the whole row behaves like a
 * link without breaking table semantics or accessibility.
 */
export default function AffiliateRow({
  affiliateId,
  children,
  className,
}: {
  affiliateId: string;
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const href = `/admin/affiliates/${affiliateId}`;

  return (
    <tr
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(href);
        }
      }}
      tabIndex={0}
      role="link"
      className={`cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset ${className ?? ""}`}
    >
      {children}
    </tr>
  );
}
