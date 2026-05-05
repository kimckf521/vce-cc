import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** Tailwind classes for sizing — e.g. "h-6 w-6" or "h-6 w-6 lg:h-7 lg:w-7". */
  className?: string;
  /** Optional alt text override. Defaults to "ATAR Hero". */
  alt?: string;
}

/**
 * The ATAR Hero brand mark — a kangaroo superhero on a navy rounded square.
 * Renders the PNG from /public/logo.png. Uses a plain <img> (not next/image)
 * so consumers can size it freely with Tailwind classes.
 */
export default function BrandMark({ className, alt = "ATAR Hero" }: BrandMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt={alt}
      width={481}
      height={512}
      className={cn("flex-shrink-0 object-contain", className)}
    />
  );
}
