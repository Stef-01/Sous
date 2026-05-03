"use client";

/**
 * HouseholdFilterHint — small visual badge that surfaces when
 * the W37 household dietary filter is active. Tells the user
 * which dietary flags are binding the current pairing query so
 * they understand why the candidate list is narrower than usual.
 *
 * W42 from Sprint I (W42-W46 content polish). Carry-forward from
 * the Sprint H IDEO review:
 *   "/sides household-aware visual hint. The /sides browse page
 *    filters via the household constraint but doesn't show the
 *    user it's filtering."
 *
 * Renders nothing when no flags are active so it stays out of
 * the way for users who haven't invested in the household-memory
 * loop. Pairs naturally with the WhosAtTable picker on /today
 * (which shows the same data as part of its aggregate summary
 * line — this component is for surfaces that don't have the
 * picker present).
 */

import Link from "next/link";
import { Filter } from "lucide-react";

export interface HouseholdFilterHintProps {
  flags: ReadonlyArray<string>;
  /** Optional href the user can tap to inspect / change the
   *  filter source. Defaults to the /path/household roster. */
  manageHref?: string;
}

export function HouseholdFilterHint({
  flags,
  manageHref = "/path/household",
}: HouseholdFilterHintProps) {
  if (flags.length === 0) return null;

  return (
    <Link
      href={manageHref}
      className="mb-3 flex items-center gap-2 rounded-xl border border-amber-200/60 bg-amber-50 px-3 py-2 text-xs text-amber-900 transition hover:bg-amber-100"
      aria-label="Active household dietary filter"
    >
      <Filter size={12} className="shrink-0 text-amber-600" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="font-semibold">Filtered for:</span> {flags.join(", ")}
      </span>
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-amber-700/80">
        manage
      </span>
    </Link>
  );
}
