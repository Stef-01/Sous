/**
 * Pod scoring — pure helpers for the W45 Cooking Pod
 * Challenge mechanic.
 *
 * V2 mechanic per `docs/COOKING-POD-CHALLENGE.md` (Stefan's
 * 2026-05-02 directive): drop streaks, use cook scores.
 *
 *   - cook_score = step_completion × 0.30 +
 *                  self_rating     × 0.30 +
 *                  aesthetic       × 0.40        (× 100)
 *     + caption bonus (+5 if non-empty)
 *     + step-image bonus (+5 if used)
 *     capped at 100.
 *
 *   - daily cap: 2 cooks per member per day count toward pod
 *     score. The 3rd+ cook still completes (the user can keep
 *     cooking) — it just doesn't add to the pod score.
 *
 *   - pod_weekly = sum(member_totals) ×
 *                  clamp(1 - cv × 0.5, 0.5, 1.0)
 *     where cv = std/mean of per-member totals. Even
 *     distribution → 1.0; wildly uneven → 0.5 floor.
 *     Positive-sum, not zero-sum.
 *
 * Pure / dependency-free. Tested without rendering React or
 * touching the cook store. The W46 surface (pod home, win-
 * screen toggle) wraps this layer.
 */

/** Clamp a value to a closed range. NaN-safe (collapses to lo). */
function clamp(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return lo;
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

/** Clamp to [0, 1]. */
function clamp01(v: number): number {
  return clamp(v, 0, 1);
}

// ── computeCookScore ────────────────────────────────────────

export interface CookScoreInput {
  /** 0..1 — fraction of guided cook steps the user actually
   *  tapped through. Comes from the cook store's
   *  step-progression telemetry. Rewards engaging with the
   *  guided flow over snapping a photo of food cooked off-app. */
  stepCompletion: number;
  /** 0..1 — user's 1-5 star rating of their own cook,
   *  normalised. Self-rating gives the user agency: a 5-star
   *  self-rating is "I'm proud of this cook." */
  selfRating: number;
  /** 0..1 — AI vision aesthetic score (V2 with OpenAI Vision).
   *  V1 default 0.5 placeholder. Doesn't judge correctness —
   *  that's what self-rating + step-completion handle. */
  aesthetic: number;
  /** Length in characters of the user's "what I'd do
   *  differently" caption. Non-empty (> 0) earns a +5 bonus. */
  captionLength: number;
  /** True if the cook used a per-step image (visual-mode
   *  authored). Earns a +5 bonus. */
  hasStepImage: boolean;
}

/** Compute a single cook's score on the 0-100 scale. */
export function computeCookScore(input: CookScoreInput): number {
  const base =
    (clamp01(input.stepCompletion) * 0.3 +
      clamp01(input.selfRating) * 0.3 +
      clamp01(input.aesthetic) * 0.4) *
    100;
  const captionBonus = input.captionLength > 0 ? 5 : 0;
  const imageBonus = input.hasStepImage ? 5 : 0;
  return Math.min(100, base + captionBonus + imageBonus);
}

/** Helper: convert a 1-5 star self-rating to the 0..1 input
 *  shape `computeCookScore` expects. Off-range values clamp. */
export function normaliseStarRating(stars: number): number {
  if (!Number.isFinite(stars)) return 0;
  return clamp(stars, 1, 5) / 5;
}

// ── enforceDailyCap ─────────────────────────────────────────

export const DEFAULT_DAILY_CAP = 2;

export interface DailyCappable {
  /** Stable id of the pod member who submitted. */
  memberId: string;
  /** Local-day key in YYYY-MM-DD format (pod-timezone-aware). */
  dayKey: string;
}

/** Filter submissions so each (memberId, dayKey) pair has at
 *  most `maxPerDay` entries. The first `maxPerDay` entries in
 *  input order are kept; the rest are dropped from the
 *  pod-score denominator (but the cook itself still happened
 *  — the caller decides what to do with the dropped entries). */
export function enforceDailyCap<T extends DailyCappable>(
  submissions: ReadonlyArray<T>,
  maxPerDay: number = DEFAULT_DAILY_CAP,
): T[] {
  if (maxPerDay <= 0) return [];
  const counts = new Map<string, number>();
  const kept: T[] = [];
  for (const sub of submissions) {
    const key = `${sub.memberId}|${sub.dayKey}`;
    const seen = counts.get(key) ?? 0;
    if (seen < maxPerDay) {
      kept.push(sub);
      counts.set(key, seen + 1);
    }
  }
  return kept;
}

// ── computeConsistencyMultiplier ───────────────────────────

/** Compute the pod-consistency multiplier in [0.5, 1.0] from a
 *  list of per-member weekly totals. Even distribution → 1.0;
 *  wildly uneven → 0.5 floor. Empty / single-member / all-zero
 *  inputs short-circuit to 1.0 (no penalty when there's
 *  nothing to compare). */
export function computeConsistencyMultiplier(
  totals: ReadonlyArray<number>,
): number {
  if (totals.length < 2) return 1.0;
  const sum = totals.reduce((a, b) => a + b, 0);
  if (sum <= 0) return 1.0;
  const mean = sum / totals.length;
  let varianceSum = 0;
  for (const t of totals) {
    const d = t - mean;
    varianceSum += d * d;
  }
  const std = Math.sqrt(varianceSum / totals.length);
  const cv = std / mean;
  return clamp(1 - cv * 0.5, 0.5, 1.0);
}

// ── computePodWeeklyScore ──────────────────────────────────

export interface PodSubmission extends DailyCappable {
  /** Per-cook score on the 0-100 scale (output of
   *  `computeCookScore`). */
  score: number;
}

export interface PodWeeklyScore {
  /** Sum of per-member scores after the daily cap is enforced.
   *  Before the consistency multiplier. */
  raw: number;
  /** Consistency multiplier in [0.5, 1.0]. */
  multiplier: number;
  /** raw × multiplier — the headline pod weekly score. */
  total: number;
  /** Per-member contribution after the daily cap. Submissions
   *  for non-active members are dropped. */
  perMember: Record<string, number>;
}

export interface ComputePodWeeklyInput {
  /** All submissions for the week (any number per member;
   *  daily cap is enforced internally). */
  submissions: ReadonlyArray<PodSubmission>;
  /** Active member ids — vacationing members are excluded. The
   *  consistency multiplier is computed across this list. */
  activeMemberIds: ReadonlyArray<string>;
}

/** Compute the pod's weekly score from a list of submissions
 *  and the active-member roster. Pure / deterministic. */
export function computePodWeeklyScore(
  input: ComputePodWeeklyInput,
): PodWeeklyScore {
  const capped = enforceDailyCap(input.submissions);
  const perMember: Record<string, number> = {};
  for (const id of input.activeMemberIds) perMember[id] = 0;
  for (const sub of capped) {
    if (Object.prototype.hasOwnProperty.call(perMember, sub.memberId)) {
      perMember[sub.memberId] += sub.score;
    }
  }
  const totals = input.activeMemberIds.map((id) => perMember[id]);
  const raw = totals.reduce((a, b) => a + b, 0);
  const multiplier = computeConsistencyMultiplier(totals);
  return {
    raw,
    multiplier,
    total: raw * multiplier,
    perMember,
  };
}

// ── weekKey ────────────────────────────────────────────────

/** Format a Date as an ISO 8601 week key — "2026-W18".
 *  Computed in UTC for V1; multi-timezone pods get TZ-aware
 *  versions when the auth/server unlock lands. */
export function weekKey(date: Date): string {
  const d = new Date(date.getTime());
  // ISO 8601: Thursday determines the week year. Shift the
  // input date to the Thursday of its ISO week, then derive
  // the week number from the year start.
  const day = d.getUTCDay() || 7; // Sun=7
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

/** Format a Date as a local-day key — "2026-05-02" — for the
 *  daily cap. Uses the host's local timezone in V1 (single-pod-
 *  per-device); when multi-timezone pods land, the pod's tz
 *  will be passed in. */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ── shouldRevealGallery ────────────────────────────────────

export interface RevealInput {
  /** Monday 00:00 of the challenge week, in the pod's local
   *  timezone (V1: host's local time). */
  weekStartedAt: Date;
  /** Hour of Sunday at which the gallery reveals. 0-23.
   *  Default 21 (9pm) per Stefan's directive. */
  revealAtHour?: number;
  /** Reference time. */
  now: Date;
}

/** True iff the current time is at or past the pod's reveal
 *  time (Sunday revealAtHour, pod-local). Used by the gallery
 *  surface to switch from "mid-week" to "reveal" rendering. */
export function shouldRevealGallery(input: RevealInput): boolean {
  const revealHour = input.revealAtHour ?? 21;
  const reveal = new Date(input.weekStartedAt.getTime());
  // Week starts Monday; Sunday is 6 days later.
  reveal.setDate(reveal.getDate() + 6);
  reveal.setHours(revealHour, 0, 0, 0);
  return input.now.getTime() >= reveal.getTime();
}
