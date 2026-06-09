/**
 * W31 — evidence-freshness job. Herb evidence isn't static: new meta-analyses
 * land, strengths shift. This is the checklist generator — given a date, it
 * returns the herbs whose evidence is older than the review cadence and should be
 * re-checked against the literature. Pure (the "now" is passed in), so it's
 * testable and can be run from a script or a scheduled task.
 */

import { AYURVEDIC_HERBS } from "@/data/ayurvedic-evidence";

/** ISO date each herb's evidence was last reviewed. Override per-herb as you
 *  re-check; the default applies to any herb not listed. */
const REVIEWED_AT: Record<string, string> = {};
const DEFAULT_REVIEWED_AT = "2026-06-08";

export const EVIDENCE_REVIEW_CADENCE_DAYS = 365;
const DAY_MS = 86_400_000;

export function herbReviewedAt(id: string): string {
  return REVIEWED_AT[id] ?? DEFAULT_REVIEWED_AT;
}

/** Herb ids whose evidence is older than `cadenceDays` as of `asOfMs`. */
export function herbsDueForReview(
  asOfMs: number,
  cadenceDays = EVIDENCE_REVIEW_CADENCE_DAYS,
): string[] {
  const cutoff = asOfMs - cadenceDays * DAY_MS;
  return AYURVEDIC_HERBS.filter(
    (h) => Date.parse(herbReviewedAt(h.id)) < cutoff,
  ).map((h) => h.id);
}
