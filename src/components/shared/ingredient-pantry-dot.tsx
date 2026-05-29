/**
 * IngredientPantryDot — feature 1.3 visual layer.
 *
 * Tiny status dot rendered at the start of each recipe
 * ingredient line. Three visual states matching the
 * IngredientStatus union from the colorizer helper:
 *   - "have":    solid green dot
 *   - "low":     outlined gold dot (lighter stroke; nudge, not alarm)
 *   - "missing": outlined neutral dot (lightest stroke)
 *
 * Pure rendering — no hooks, no effects. Server-component-safe.
 * Reduced-motion safe (no animations). aria-label per dot for
 * screen readers; sighted users read the colour, screen-reader
 * users hear the status word.
 */

import { cn } from "@/lib/utils/cn";
import type { IngredientStatus } from "@/lib/engine/ingredient-pantry-status";

export interface IngredientPantryDotProps {
  status: IngredientStatus;
  /** Optional days-to-expiration when status === "low" — folded
   *  into the aria-label so the screen reader reports e.g.
   *  "Low — expires in 1 day." */
  daysToExpiration?: number;
  /** Visual treatment scales down for the optional-ingredient
   *  case so the dot doesn't compete with required ones. */
  optional?: boolean;
  className?: string;
}

const STATUS_COPY: Record<IngredientStatus, string> = {
  have: "In pantry",
  low: "Low or expiring soon in pantry",
  missing: "Need to buy",
};

export function IngredientPantryDot({
  status,
  daysToExpiration,
  optional = false,
  className,
}: IngredientPantryDotProps) {
  const baseAria = STATUS_COPY[status];
  const ariaLabel =
    status === "low" && typeof daysToExpiration === "number"
      ? `${baseAria} — ${daysToExpiration === 0 ? "expires today" : daysToExpiration === 1 ? "expires in 1 day" : `expires in ${daysToExpiration} days`}`
      : baseAria;

  // Visual treatment is intentionally subtle — see the W4
  // pantry-novelty plan: 'small dot at the start of each line,
  // never the whole line backgrounded'.
  const baseClasses =
    "inline-block flex-shrink-0 rounded-full border-2 transition-none";
  const sizeClasses = optional ? "h-1.5 w-1.5" : "h-2 w-2";
  const colourClasses =
    status === "have"
      ? "border-[var(--nourish-green)] bg-[var(--nourish-green)]"
      : status === "low"
        ? "border-[var(--nourish-gold)] bg-transparent"
        : "border-[var(--nourish-border-strong)] bg-transparent";

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={cn(baseClasses, sizeClasses, colourClasses, className)}
    />
  );
}

/** Pure helper: format a coverage summary for a strip-style
 *  hero ("you have 6 of 8 — 1 expiring soon"). Avoids the
 *  '$0 raised' shape — when nothing is in pantry, returns a
 *  shorter copy. */
export function formatCoverageStrip(opts: {
  haveCount: number;
  lowCount: number;
  totalCount: number;
}): string {
  const { haveCount, lowCount, totalCount } = opts;
  if (totalCount === 0) return "";
  const covered = haveCount + lowCount;
  if (covered === 0) {
    return `Need ${totalCount} ingredient${totalCount === 1 ? "" : "s"}`;
  }
  const head = `You have ${covered} of ${totalCount}`;
  if (lowCount > 0) {
    return `${head} — ${lowCount} expiring soon`;
  }
  return head;
}
