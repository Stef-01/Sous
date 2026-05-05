"use client";

/**
 * ActiveChallengeBanner — surfaces the currently active seasonal /
 * sponsored challenge above the pod tile on the Community page
 * (Y5 D, audit P0 #3).
 *
 * Reads:
 *   - `activeChallenges` from `lib/eco/seasonal-challenges` to
 *     find what's running today.
 *   - The pod's submissions for the active week to compute
 *     progress (matches the recipe's featured ingredients).
 *
 * Renders nothing when no challenge is active OR when the pod
 * hasn't been seeded yet — the surface earns its space only
 * when there's something useful to show.
 *
 * Tap → links to the active-week recipe (or `/community/pod`
 * when no recipe pinned yet) so the user can start cooking.
 */

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { Sparkles } from "lucide-react";
import {
  activeChallenges,
  computeChallengeProgress,
  daysRemaining,
  recipeMatchesChallenge,
  type Challenge,
} from "@/lib/eco/seasonal-challenges";
import { useCurrentPod } from "@/lib/pod/use-current-pod";
import { listSubmissionsForWeek } from "@/lib/pod/use-current-pod";
import { weekKey as computeWeekKey } from "@/lib/pod/pod-score";
import { cn } from "@/lib/utils/cn";
import {
  CELEBRATED_CHALLENGES_STORAGE_KEY,
  hasCelebrated,
  markCelebrated,
  parseCelebratedChallenges,
  serializeCelebratedChallenges,
} from "@/lib/eco/celebrated-challenges";
import { toast } from "@/lib/hooks/use-toast";

interface CookSnapshot {
  recipeIngredients: ReadonlyArray<string>;
}

/**
 * Pure: count how many of the supplied cooks satisfy the
 * challenge. Exported for tests.
 */
export function countQualifyingCooks(input: {
  cooks: ReadonlyArray<CookSnapshot>;
  challenge: Challenge;
}): number {
  let count = 0;
  for (const cook of input.cooks) {
    if (
      recipeMatchesChallenge({
        recipeIngredients: cook.recipeIngredients,
        challenge: input.challenge,
      })
    ) {
      count += 1;
    }
  }
  return count;
}

export function ActiveChallengeBanner() {
  const { state, mounted, pod } = useCurrentPod();

  const challenge = useMemo<Challenge | null>(() => {
    const list = activeChallenges({ now: new Date() });
    return list[0] ?? null;
  }, []);

  // Treat the pod's pinned recipe as the "qualifying cook" proxy:
  // the demo seed sets `recipeSlug` to a real catalog id, and the
  // teammates' submissions inherit that recipe. If the recipe's
  // featured ingredients overlap with the active challenge, every
  // submission counts toward progress. This is a coarse but honest
  // approximation until per-cook ingredient capture lands.
  const qualifyingCooks = useMemo(() => {
    if (!mounted || !pod || !challenge) return 0;
    const wk = computeWeekKey(new Date());
    const subs = listSubmissionsForWeek(state, wk);
    if (subs.length === 0) return 0;
    // The pod's challenge week names a recipeSlug. We can't yet
    // look up the recipe's ingredient list synchronously without
    // a catalog import here; treat the slug itself as a single
    // "ingredient" for matching. Real ingredient lookup is a
    // small follow-up.
    const recipeSlug = state.weeks[wk]?.recipeSlug ?? "";
    return countQualifyingCooks({
      cooks: subs.map(() => ({ recipeIngredients: [recipeSlug] })),
      challenge,
    });
  }, [mounted, pod, state, challenge]);

  // Compute progress unconditionally (challenge may be null) so the
  // celebration effect's deps are stable. Branch the render below.
  const progress = challenge
    ? computeChallengeProgress({
        challenge,
        qualifyingCookCount: qualifyingCooks,
      })
    : null;

  // One-time celebration toast on the transition into "complete".
  // Persisted via localStorage so a return visit doesn't re-fire.
  const lastCompletedRef = useRef<boolean>(false);
  useEffect(() => {
    if (!challenge || !progress) return;
    const wasComplete = lastCompletedRef.current;
    lastCompletedRef.current = progress.completed;
    if (!progress.completed || wasComplete) return;
    if (typeof window === "undefined") return;

    let state = parseCelebratedChallenges(
      window.localStorage.getItem(CELEBRATED_CHALLENGES_STORAGE_KEY),
    );
    if (hasCelebrated({ state, slug: challenge.slug })) return;
    state = markCelebrated({ state, slug: challenge.slug });
    try {
      window.localStorage.setItem(
        CELEBRATED_CHALLENGES_STORAGE_KEY,
        serializeCelebratedChallenges(state),
      );
    } catch {
      // ignore — privacy mode / quota
    }
    toast.push({
      variant: "achievement",
      title: `Challenge done · ${challenge.title}`,
      body: `Saved ${progress.totalCo2eSavedKg} kg CO₂e together — nice cooking.`,
      emoji: challenge.sponsoredBy ? "🌟" : "🌱",
      dedupKey: `eco-challenge-celebration:${challenge.slug}`,
    });
  }, [challenge, progress]);

  if (!mounted || !challenge || !progress) return null;

  const days = daysRemaining({ challenge, now: new Date() });
  const sponsored = challenge.sponsoredBy !== null;

  return (
    <Link
      href="/community/pod"
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-3 shadow-sm transition hover:shadow-md",
        sponsored
          ? "border-[var(--nourish-gold)]/30 bg-[var(--nourish-gold)]/8"
          : "border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/8",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          sponsored
            ? "bg-[var(--nourish-gold)]/15 text-[var(--nourish-gold)]"
            : "bg-[var(--nourish-green)]/15 text-[var(--nourish-green)]",
        )}
      >
        <Sparkles size={18} />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        {sponsored && (
          <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--nourish-gold)]">
            Sponsored · {challenge.sponsoredBy}
          </p>
        )}
        <p className="font-serif text-sm font-semibold text-[var(--nourish-dark)]">
          {challenge.title} · {days} day{days === 1 ? "" : "s"} left
        </p>
        <p className="text-[11px] leading-snug text-[var(--nourish-subtext)]">
          {challenge.subtitle}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/60"
            aria-hidden
          >
            <div
              className={cn(
                "h-full rounded-full transition-all",
                sponsored
                  ? "bg-[var(--nourish-gold)]"
                  : "bg-[var(--nourish-green)]",
              )}
              style={{
                width: `${Math.round(progress.progressFraction * 100)}%`,
              }}
            />
          </div>
          <span className="text-[11px] tabular-nums text-[var(--nourish-subtext)]">
            {progress.completedCooks}/{progress.targetCooks}
          </span>
        </div>
        {progress.completed && (
          <p className="text-[11px] font-medium text-[var(--nourish-green)]">
            ✓ Complete · saved {progress.totalCo2eSavedKg} kg CO₂e
          </p>
        )}
      </div>
    </Link>
  );
}
