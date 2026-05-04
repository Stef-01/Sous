import { cn } from "@/lib/utils/cn";

/**
 * MetaPill — quiet metadata chip used in the games hub (best score),
 * pantry (auto-applied hint), shopping-list (bought-progress strip),
 * forum reply count, the "NEW" badge on never-played games, and the
 * expert article-count pill.
 *
 * Codified from `docs/design-tokens.md`.
 *
 * Variants:
 * - default: gray subtle chip on white
 * - subtle:  on neutral-50 background, no ring
 * - green:   tinted green for attribution / celebratory state
 * - amber:   for streak/warmth chips
 */

type Variant = "default" | "subtle" | "green" | "amber";

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  size?: "xs" | "sm";
  className?: string;
  /** Optional aria-label for screen readers when the chip's content
   *  alone would not be self-descriptive. */
  "aria-label"?: string;
}

const VARIANT: Record<Variant, string> = {
  default: "bg-white ring-1 ring-neutral-200 text-[var(--nourish-subtext)]",
  subtle: "bg-neutral-50 text-[var(--nourish-subtext)]",
  green:
    "bg-[var(--nourish-green)]/8 text-[var(--nourish-green)] ring-1 ring-[var(--nourish-green)]/20",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
};

export function MetaPill({
  children,
  variant = "default",
  size = "sm",
  className,
  ...rest
}: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full",
        size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1.5 text-[11px]",
        VARIANT[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
