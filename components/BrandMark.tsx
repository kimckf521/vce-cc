import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** Tailwind classes for sizing — e.g. "h-10 w-auto" or "h-12 w-auto lg:h-14". */
  className?: string;
  /** Optional alt text override. Defaults to "ATAR Hero". */
  alt?: string;
}

/**
 * The ATAR Hero brand mark — a kangaroo superhero holding an open book.
 * Renders TWO logos and swaps via Tailwind's `dark:` modifier so the right
 * variant shows in each theme:
 *   - logo-light.png — dark silhouette for use on light backgrounds
 *   - logo-dark.png  — cream/white silhouette for use on dark backgrounds
 *
 * Uses next/image so the source PNGs are served as resized AVIF/WebP (a few KB)
 * instead of the full ~120–150 KB originals on every page. Consumers still size
 * it freely with Tailwind classes; `sizes` caps the generated width to the
 * actual display size (the mark renders at ~40–56px tall).
 */
export default function BrandMark({ className, alt = "ATAR Hero" }: BrandMarkProps) {
  return (
    <>
      {/* Light-theme logo (dark silhouette) — 444x512 */}
      <Image
        src="/logo-light.png"
        alt={alt}
        width={444}
        height={512}
        sizes="64px"
        priority
        className={cn("flex-shrink-0 object-contain dark:hidden", className)}
      />
      {/* Dark-theme logo (cream silhouette) — 422x512 */}
      <Image
        src="/logo-dark.png"
        alt=""
        aria-hidden="true"
        width={422}
        height={512}
        sizes="64px"
        priority
        className={cn("hidden flex-shrink-0 object-contain dark:block", className)}
      />
    </>
  );
}
