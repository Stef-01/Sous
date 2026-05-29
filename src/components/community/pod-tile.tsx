"use client";

/**
 * PodTile — entry point for the Cooking Pod Challenge from the
 * /community home (W46).
 *
 * Three states (mirrors the /community/pod page itself but in
 * miniature):
 *
 *   - No pod yet → "Cook with friends" pitch tile linking to
 *     /community/pod (which shows the full no-pod state).
 *   - Pod, mid-week → "Pod challenge" tile showing the recipe
 *     + completion ratio.
 *   - Pod, gallery dropped → "Gallery is up" tile with the
 *     pod's weekly score.
 *
 * Stays minimal per CLAUDE.md rule 6 (simplicity-first UI).
 * Renders a small skeleton until useCurrentPod hydrates so the
 * tile doesn't flash from "no pod" → "in pod" on first paint.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Sparkles, Users } from "lucide-react";
import { useCurrentPod } from "@/lib/pod/use-current-pod";
import {
  computePodWeeklyScore,
  shouldRevealGallery,
  weekKey as computeWeekKey,
} from "@/lib/pod/pod-score";
import {
  activeMemberIds,
  listSubmissionsForWeek,
} from "@/lib/pod/use-current-pod";
import { DemoChallengePicker } from "./demo-challenge-picker";

export function PodTile() {
  const { state, pod, weeks, mounted } = useCurrentPod();
  const [pickerOpen, setPickerOpen] = useState(false);

  const view = useMemo(() => {
    if (!mounted) return { kind: "loading" as const };
    if (!pod) return { kind: "no-pod" as const };

    const now = new Date();
    const wk = computeWeekKey(now);
    const currentWeek = weeks[wk];
    if (!currentWeek || pod.pausedThisWeek) {
      return { kind: "in-pod" as const, podName: pod.name };
    }

    const weekSubs = listSubmissionsForWeek(state, currentWeek.weekKey);
    const reveal = shouldRevealGallery({
      weekStartedAt: new Date(currentWeek.startedAt),
      revealAtHour: pod.revealAtHour,
      now,
    });

    if (reveal) {
      const score = computePodWeeklyScore({
        submissions: weekSubs.map((s) => ({
          memberId: s.memberId,
          dayKey: s.dayKey,
          score: s.computedScore,
        })),
        activeMemberIds: activeMemberIds(pod),
      });
      return {
        kind: "gallery" as const,
        podName: pod.name,
        total: Math.round(score.total),
      };
    }

    return {
      kind: "mid-week" as const,
      podName: pod.name,
      recipeSlug: currentWeek.recipeSlug,
      submitted: new Set(weekSubs.map((s) => s.memberId)).size,
      total: pod.members.length,
    };
  }, [mounted, pod, weeks, state]);

  if (view.kind === "loading") {
    return <div className="h-16 animate-pulse rounded-2xl bg-white/40" />;
  }

  if (view.kind === "no-pod") {
    return (
      <>
        <div className="space-y-2">
          <Link
            href="/community/pod"
            className="flex items-center gap-3 rounded-2xl border border-neutral-100/80 bg-white p-3 shadow-sm transition hover:shadow-md"
          >
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--nourish-green)]/10"
            >
              <Users
                size={18}
                className="text-[var(--nourish-green)]"
                aria-hidden
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-sm font-semibold text-[var(--nourish-dark)]">
                Cook with friends
              </p>
              <p className="text-[11px] text-[var(--nourish-subtext)]">
                Form a pod, cook the same recipe each week, share photos Sunday.
              </p>
            </div>
            <ChevronRight
              size={16}
              className="shrink-0 text-[var(--nourish-subtext)]"
              aria-hidden
            />
          </Link>
          {/* Demo affordance: lets the user spin up a pod with AI
              teammates + an active challenge instantly, no admin
              gate. Substrate at src/lib/demo/seed-pod-challenge.ts. */}
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--nourish-gold)]/40 bg-[var(--nourish-gold)]/5 px-3 py-2 text-[11px] font-medium text-[var(--nourish-gold)] hover:border-[var(--nourish-gold)]/60 transition-colors"
          >
            <Sparkles size={12} />
            Pick a challenge (demo with AI teammates)
          </button>
        </div>
        <DemoChallengePicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
        />
      </>
    );
  }

  if (view.kind === "in-pod") {
    return (
      <PodTileShell href="/community/pod">
        <p className="font-serif text-sm font-semibold text-[var(--nourish-dark)]">
          {view.podName}
        </p>
        <p className="text-[11px] text-[var(--nourish-subtext)]">
          Waiting on this week&apos;s challenge.
        </p>
      </PodTileShell>
    );
  }

  if (view.kind === "mid-week") {
    return (
      <PodTileShell href="/community/pod">
        <p className="font-serif text-sm font-semibold text-[var(--nourish-dark)]">
          {view.podName}
        </p>
        <p className="text-[11px] text-[var(--nourish-subtext)]">
          {prettySlug(view.recipeSlug)} · {view.submitted}/{view.total} cooked
        </p>
      </PodTileShell>
    );
  }

  // gallery
  return (
    <PodTileShell href="/community/pod" trailing={view.total}>
      <p className="font-serif text-sm font-semibold text-[var(--nourish-dark)]">
        {view.podName}
      </p>
      <p className="text-[11px] text-[var(--nourish-subtext)]">
        Gallery is up — tap to see this week&apos;s plates.
      </p>
    </PodTileShell>
  );
}

function PodTileShell({
  href,
  children,
  trailing,
}: {
  href: string;
  children: React.ReactNode;
  trailing?: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-neutral-100/80 bg-white p-3 shadow-sm transition hover:shadow-md"
    >
      <span
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--nourish-green)]/10"
      >
        <Users size={18} className="text-[var(--nourish-green)]" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">{children}</div>
      {typeof trailing === "number" ? (
        <span className="shrink-0 rounded-full bg-[var(--nourish-green)]/10 px-2.5 py-1 text-[12px] font-bold tabular-nums text-[var(--nourish-green)]">
          {trailing}
        </span>
      ) : (
        <ChevronRight
          size={16}
          className="shrink-0 text-[var(--nourish-subtext)]"
          aria-hidden
        />
      )}
    </Link>
  );
}

function prettySlug(slug: string): string {
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
