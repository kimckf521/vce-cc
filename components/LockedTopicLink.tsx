"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import PaywallModal from "@/components/PaywallModal";

type LockedTopicLinkProps = {
  href: string;
  /** When true, clicking opens the paywall modal instead of navigating. */
  locked: boolean;
  /** Topic name shown in the modal headline. */
  topicName: string;
  className?: string;
  children: ReactNode;
};

/**
 * Wraps a topic link so that locked topics open a paywall modal instead of
 * navigating. Free topics behave like a normal Link.
 */
export default function LockedTopicLink({
  href,
  locked,
  topicName,
  className,
  children,
}: LockedTopicLinkProps) {
  const [open, setOpen] = useState(false);

  if (!locked) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        {children}
      </button>
      <PaywallModal open={open} onClose={() => setOpen(false)} topicName={topicName} />
    </>
  );
}
