"use client";

/**
 * PodHomeContent — populated state of /community/pod (W46).
 *
 * Branches between two sub-states:
 *
 *   - Mid-week: current challenge recipe + binary member
 *     completion list + "Cook this week's challenge" deeplink.
 *   - Gallery dropped (after Sunday revealAtHour pod-local):
 *     photo grid + score chips + reaction emoji + pod weekly
 *     score with consistency multiplier.
 *
 * Wraps the W45 substrate. No new score logic — the page is a
 * thin display over the pure helpers.
 */

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera, Play, Users } from "lucide-react";
import {
  computePodWeeklyScore,
  shouldRevealGallery,
  weekKey as computeWeekKey,
} from "@/lib/pod/pod-score";
import {
  activeMemberIds,
  listSubmissionsForWeek,
} from "@/lib/pod/use-current-pod";
import type {
  ChallengePod,
  PodChallengeWeek,
  PodMember,
  PodSubmission,
} from "@/types/challenge-pod";
import { SectionKicker } from "@/components/shared/section-kicker";
import { cn } from "@/lib/utils/cn";

export interface PodHomeContentProps {
  pod: ChallengePod;
  weeks: Record<string, PodChallengeWeek>;
  submissions: Record<string, PodSubmission>;
}

export function PodHomeContent({
  pod,
  weeks,
  submissions,
}: PodHomeContentProps) {
  const now = useMemo(() => new Date(), []);
  const currentWeekKey = useMemo(() => computeWeekKey(now), [now]);
  const currentWeek = weeks[currentWeekKey] ?? null;

  const weekSubmissions = useMemo(() => {
    if (!currentWeek) return [] as PodSubmission[];
    return listSubmissionsForWeek(
      { schemaVersion: 1, pod, weeks, submissions },
      currentWeek.weekKey,
    );
  }, [pod, weeks, submissions, currentWeek]);

  const isRevealTime = useMemo(() => {
    if (!currentWeek) return false;
    return shouldRevealGallery({
      weekStartedAt: new Date(currentWeek.startedAt),
      revealAtHour: pod.revealAtHour,
      now,
    });
  }, [currentWeek, pod.revealAtHour, now]);

  // Pod paused → mid-week shell with paused banner; never
  // reveals (admin pause week).
  if (pod.pausedThisWeek) {
    return <PausedShell pod={pod} />;
  }

  // Pre-challenge (Monday morning before the admin set the
  // week's recipe) — show the pod identity but no challenge yet.
  if (!currentWeek) {
    return <NoChallengeYetShell pod={pod} weekKey={currentWeekKey} />;
  }

  if (isRevealTime) {
    return (
      <GalleryState
        pod={pod}
        week={currentWeek}
        submissions={weekSubmissions}
      />
    );
  }

  return (
    <MidWeekState pod={pod} week={currentWeek} submissions={weekSubmissions} />
  );
}

// ── States ──────────────────────────────────────────────────

function MidWeekState({
  pod,
  week,
  submissions,
}: {
  pod: ChallengePod;
  week: PodChallengeWeek;
  submissions: ReadonlyArray<PodSubmission>;
}) {
  const submittedMemberIds = useMemo(
    () => new Set(submissions.map((s) => s.memberId)),
    [submissions],
  );

  return (
    <>
      <PodHeader pod={pod} week={week} />

      {/* Challenge tile */}
      <section className="space-y-3 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
        <SectionKicker as="p" size="10px">
          This week&apos;s challenge
        </SectionKicker>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--nourish-green)]/10">
            <span aria-hidden className="text-2xl">
              🍽️
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-base font-semibold text-[var(--nourish-dark)]">
              {prettySlug(week.recipeSlug)}
            </h2>
            {week.twist && (
              <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--nourish-green)]">
                Twist: {week.twist}
              </p>
            )}
            <p className="mt-1 text-[11px] text-[var(--nourish-subtext)]">
              {submittedMemberIds.size} of {pod.members.length} cooked
            </p>
          </div>
        </div>
        <Link
          href={`/cook/${week.recipeSlug}?pod=${pod.id}&week=${week.weekKey}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--nourish-green)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--nourish-dark-green)]"
        >
          <Play size={14} aria-hidden /> Cook this week&apos;s challenge
        </Link>
      </section>

      {/* Binary member completion list — no day-of-cook info
          per the V2 anxiety mitigation. */}
      <section className="space-y-3 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
        <SectionKicker as="p" size="10px">
          Pod ({pod.members.length})
        </SectionKicker>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {pod.members.map((m) => (
            <MemberCompletionChip
              key={m.id}
              member={m}
              submitted={submittedMemberIds.has(m.id)}
            />
          ))}
        </ul>
        <p className="text-[10px] text-[var(--nourish-subtext)]/70">
          Photos drop Sunday {pod.revealAtHour}:00 pod-local. Until then,
          everyone&apos;s progress is just a checkmark.
        </p>
      </section>
    </>
  );
}

function GalleryState({
  pod,
  week,
  submissions,
}: {
  pod: ChallengePod;
  week: PodChallengeWeek;
  submissions: ReadonlyArray<PodSubmission>;
}) {
  const activeIds = useMemo(() => activeMemberIds(pod), [pod]);
  const podScore = useMemo(
    () =>
      computePodWeeklyScore({
        submissions: submissions.map((s) => ({
          memberId: s.memberId,
          dayKey: s.dayKey,
          score: s.computedScore,
        })),
        activeMemberIds: activeIds,
      }),
    [submissions, activeIds],
  );

  const memberById = useMemo(() => {
    const m = new Map<string, PodMember>();
    for (const member of pod.members) m.set(member.id, member);
    return m;
  }, [pod]);

  return (
    <>
      <PodHeader pod={pod} week={week} />

      {/* Pod weekly score headline */}
      <section className="space-y-2 rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
        <SectionKicker as="p" size="10px">
          This week&apos;s gallery
        </SectionKicker>
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-base font-semibold text-[var(--nourish-dark)]">
            {prettySlug(week.recipeSlug)}
          </h2>
          <span className="text-2xl font-bold tabular-nums text-[var(--nourish-green)]">
            {Math.round(podScore.total)}
          </span>
        </div>
        <p className="text-[11px] text-[var(--nourish-subtext)]">
          {Math.round(podScore.raw)} raw × {podScore.multiplier.toFixed(2)}{" "}
          consistency = {Math.round(podScore.total)} pod points
        </p>
      </section>

      {/* Photo grid */}
      {submissions.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-200 bg-white/40 px-4 py-6 text-center text-xs text-[var(--nourish-subtext)]">
          No one submitted this week. Try again Monday.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {submissions.map((sub) => (
            <GalleryCard
              key={sub.id}
              submission={sub}
              author={memberById.get(sub.memberId)}
            />
          ))}
        </ul>
      )}
    </>
  );
}

function PausedShell({ pod }: { pod: ChallengePod }) {
  return (
    <>
      <PodHeader pod={pod} week={null} />
      <section className="space-y-2 rounded-2xl border border-amber-200/60 bg-amber-50 p-4 text-center">
        <p className="font-serif text-sm font-semibold text-amber-900">
          Vacation week
        </p>
        <p className="text-[11px] text-amber-800">
          An admin paused the pod for this week. No challenge, no leaderboard.
          Back to it next Monday.
        </p>
      </section>
    </>
  );
}

function NoChallengeYetShell({
  pod,
  weekKey,
}: {
  pod: ChallengePod;
  weekKey: string;
}) {
  return (
    <>
      <PodHeader pod={pod} week={null} />
      <section className="space-y-2 rounded-2xl border border-dashed border-neutral-200 bg-white/40 p-4 text-center">
        <p className="font-serif text-sm font-semibold text-[var(--nourish-dark)]">
          Waiting on this week&apos;s challenge
        </p>
        <p className="text-[11px] text-[var(--nourish-subtext)]">
          The admin hasn&apos;t picked {weekKey}&apos;s recipe yet. Check back
          soon.
        </p>
      </section>
    </>
  );
}

// ── Sub-components ──────────────────────────────────────────

function PodHeader({
  pod,
  week,
}: {
  pod: ChallengePod;
  week: PodChallengeWeek | null;
}) {
  return (
    <section className="rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
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
          <h2 className="font-serif text-base font-semibold text-[var(--nourish-dark)]">
            {pod.name}
          </h2>
          <p className="text-[11px] uppercase tracking-[0.06em] text-[var(--nourish-subtext)]/70">
            {pod.members.length} members
            {week ? ` · ${week.weekKey}` : ""}
            {pod.dietaryFlags.length > 0
              ? ` · ${pod.dietaryFlags.join(", ")}`
              : ""}
          </p>
        </div>
      </div>
    </section>
  );
}

function MemberCompletionChip({
  member,
  submitted,
}: {
  member: PodMember;
  submitted: boolean;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5",
        submitted
          ? "border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/10"
          : "border-neutral-200 bg-neutral-50/60",
      )}
    >
      <span aria-hidden className="text-sm">
        {member.avatar || "•"}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[12px]",
          submitted
            ? "font-semibold text-[var(--nourish-dark)]"
            : "text-[var(--nourish-subtext)]",
        )}
      >
        {member.displayName}
      </span>
      {submitted && (
        <span
          aria-label="cooked"
          className="text-[12px] font-bold text-[var(--nourish-green)]"
        >
          ✓
        </span>
      )}
    </li>
  );
}

function GalleryCard({
  submission,
  author,
}: {
  submission: PodSubmission;
  author: PodMember | undefined;
}) {
  const isPlaceholder =
    !submission.photoUri.startsWith("http") &&
    !submission.photoUri.startsWith("data:");
  return (
    <li className="overflow-hidden rounded-2xl border border-neutral-100/80 bg-white shadow-sm">
      <div className="relative aspect-[4/5] bg-neutral-100">
        {isPlaceholder ? (
          <div className="flex h-full w-full items-center justify-center text-[var(--nourish-subtext)]/60">
            <Camera size={24} aria-hidden />
          </div>
        ) : (
          <Image
            src={submission.photoUri}
            alt={`${author?.displayName ?? "Pod member"}'s ${prettySlug(
              "this-cook",
            )}`}
            fill
            sizes="(max-width: 768px) 50vw, 200px"
            className="object-cover"
            unoptimized
          />
        )}
        <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold tabular-nums text-white backdrop-blur">
          {Math.round(submission.computedScore)}
        </span>
      </div>
      <div className="space-y-1 p-2.5">
        <p className="flex items-center gap-1 text-[12px] font-semibold text-[var(--nourish-dark)]">
          <span aria-hidden>{author?.avatar || "•"}</span>
          {author?.displayName ?? submission.memberId}
        </p>
        {submission.caption && (
          <p className="line-clamp-2 text-[11px] text-[var(--nourish-subtext)]">
            {submission.caption}
          </p>
        )}
        {submission.donateTags.length > 0 && (
          <p className="flex flex-wrap gap-1 pt-0.5">
            {submission.donateTags.map((tag) => (
              <span key={tag} aria-label={tag} className="text-[12px]">
                {tag === "shared" ? "🥡" : tag === "bake-sale" ? "🍰" : "🤝"}
              </span>
            ))}
          </p>
        )}
      </div>
    </li>
  );
}

// ── Helpers ────────────────────────────────────────────────

/** Slug → human title — "caesar-salad" → "Caesar Salad". */
function prettySlug(slug: string): string {
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
