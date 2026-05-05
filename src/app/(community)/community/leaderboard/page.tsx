"use client";

/**
 * /community/leaderboard — cross-pod weekly leaderboard
 * (Y5 G, Sprint G).
 *
 * V1 surface: shows the active week's ranking + a rolling
 * 7-day ranking + the user's own pod's row called out at the
 * top. The substrate (`rankWeeklyLeaderboard`,
 * `rankRolling7Leaderboard`, `findOwnPodRow`) is pure — this
 * page just stitches the user's pod state together with stub
 * peer pods so the leaderboard reads as a real comparison
 * until the multi-pod server state lands in Y6.
 *
 * Stub peer pods are clearly badged "Other Sous pods" and use
 * fictional names; their per-cook computedScores are seeded
 * deterministically per ISO week so the leaderboard is the
 * same ranking for everyone in a given week.
 */

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Users } from "lucide-react";
import {
  findOwnPodRow,
  rankRolling7Leaderboard,
  rankWeeklyLeaderboard,
  type PodEntry,
  type PodLeaderboardEntry,
} from "@/lib/pod/cross-pod-leaderboard";
import { resolveWeeklyTheme } from "@/lib/pod/weekly-themes";
import { weekKey as computeWeekKey } from "@/lib/pod/pod-score";
import { useCurrentPod } from "@/lib/pod/use-current-pod";
import { POD_SCHEMA_VERSION, type PodSubmission } from "@/types/challenge-pod";
import { cn } from "@/lib/utils/cn";

// Deterministic stub peers for the V1 cross-pod ranking.
// Real multi-pod data lives in Postgres post-Y6.
function buildStubPeers(weekKey: string): PodEntry[] {
  const seedSubs = (
    podId: string,
    memberCount: number,
    scores: number[],
  ): PodSubmission[] =>
    scores.map((s, i) => ({
      schemaVersion: POD_SCHEMA_VERSION,
      id: `stub-${podId}-${weekKey}-${i}`,
      podId,
      weekKey,
      memberId: `${podId}-m${i}`,
      dayKey: weekKey.slice(0, 4) + "-05-04",
      submittedAt: new Date().toISOString(),
      photoUri: "data:,",
      selfRating: 4,
      caption: null,
      donateTags: [],
      stepCompletion: 1,
      aestheticScore: 0.7,
      hasStepImage: false,
      computedScore: s,
    }));
  return [
    {
      podId: "stub-sunday-sous",
      name: "Sunday Sous Club",
      memberCount: 5,
      submissions: seedSubs("stub-sunday-sous", 5, [88, 84, 81, 76, 70]),
    },
    {
      podId: "stub-fridge-friends",
      name: "Fridge Friends",
      memberCount: 3,
      submissions: seedSubs("stub-fridge-friends", 3, [78, 72, 68]),
    },
    {
      podId: "stub-pho-real",
      name: "Pho Real Pod",
      memberCount: 4,
      submissions: seedSubs("stub-pho-real", 4, [92, 89, 84, 80]),
    },
    {
      podId: "stub-mise-en-place",
      name: "Mise en Place",
      memberCount: 6,
      submissions: seedSubs("stub-mise-en-place", 6, [82, 78, 74, 70, 66, 60]),
    },
  ];
}

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-[var(--nourish-cream)]">
          <header className="app-header px-4 py-3">
            <h1 className="font-serif text-lg text-[var(--nourish-dark)]">
              Leaderboard
            </h1>
          </header>
        </div>
      }
    >
      <LeaderboardInner />
    </Suspense>
  );
}

function LeaderboardInner() {
  const { state, pod, mounted } = useCurrentPod();

  const wk = useMemo(() => computeWeekKey(new Date()), []);
  const theme = useMemo(() => resolveWeeklyTheme({ weekKey: wk }), [wk]);

  const allPods: PodEntry[] = useMemo(() => {
    if (!mounted) return [];
    const peers = buildStubPeers(wk);
    if (!pod) return peers;
    const ownSubs = Object.values(state.submissions).filter(
      (s) => s.podId === pod.id,
    );
    const ownEntry: PodEntry = {
      podId: pod.id,
      name: pod.name,
      memberCount: pod.members.length,
      submissions: ownSubs,
    };
    return [ownEntry, ...peers];
  }, [mounted, pod, state.submissions, wk]);

  const weekly = useMemo(
    () => rankWeeklyLeaderboard({ pods: allPods, weekKey: wk }),
    [allPods, wk],
  );
  const rolling = useMemo(
    () => rankRolling7Leaderboard({ pods: allPods, now: new Date() }),
    [allPods],
  );
  const ownRow = pod ? findOwnPodRow({ rows: weekly, podId: pod.id }) : null;

  return (
    <div className="min-h-dvh bg-[var(--nourish-cream)] pb-28">
      <header className="app-header px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link
            href="/community"
            aria-label="Back to Community"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] hover:bg-neutral-50"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--nourish-green)]">
              Leaderboard · {wk}
            </p>
            <h1 className="font-serif text-lg font-semibold leading-tight text-[var(--nourish-dark)]">
              How pods stack up
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
        {/* Theme banner for context. */}
        <section className="rounded-2xl border border-[var(--nourish-green)]/20 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--nourish-green)]/10 text-2xl"
            >
              {theme.emoji}
            </span>
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--nourish-subtext)]">
                This week
              </p>
              <p className="font-serif text-sm font-semibold text-[var(--nourish-dark)]">
                {theme.title}
              </p>
              <p className="text-[11px] leading-snug text-[var(--nourish-subtext)]">
                {theme.blurb}
              </p>
            </div>
          </div>
        </section>

        {/* User's own pod call-out. */}
        {ownRow && (
          <section className="rounded-2xl border border-[var(--nourish-gold)]/30 bg-[var(--nourish-gold)]/5 p-4 shadow-sm">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--nourish-gold)]">
                  Your pod
                </p>
                <p className="font-serif text-sm font-semibold text-[var(--nourish-dark)]">
                  {ownRow.name}
                </p>
              </div>
              <p className="font-serif text-2xl font-bold tabular-nums text-[var(--nourish-dark)]">
                #{ownRow.rank}
              </p>
            </div>
            <p className="mt-1.5 text-[11px] text-[var(--nourish-subtext)]">
              {ownRow.averageScore} avg · {ownRow.submissionCount} cook
              {ownRow.submissionCount === 1 ? "" : "s"} this week
            </p>
          </section>
        )}

        {/* Weekly leaderboard. */}
        <LeaderboardList
          title="This week"
          rows={weekly}
          ownPodId={pod?.id}
          emptyHint="No pods have submitted yet — be the first."
        />

        {/* Rolling 7-day leaderboard. */}
        <LeaderboardList
          title="Rolling 7 days"
          rows={rolling}
          ownPodId={pod?.id}
          emptyHint="Rolling window fills as pods cook through the week."
          subtle
        />

        {/* Provenance line — make the stub state explicit. */}
        <p className="flex items-start gap-1 rounded-xl bg-white/60 px-3 py-2 text-[11px] leading-snug text-[var(--nourish-subtext)]">
          <Sparkles size={12} className="mt-px shrink-0" aria-hidden />
          Peer pods are seeded for the V1 demo. Multi-pod cross-server ranking
          lands in Y6 with the auth + Postgres flip.
        </p>
      </main>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function LeaderboardList({
  title,
  rows,
  ownPodId,
  emptyHint,
  subtle = false,
}: {
  title: string;
  rows: ReadonlyArray<PodLeaderboardEntry>;
  ownPodId?: string;
  emptyHint: string;
  subtle?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-dashed border-neutral-200/80 bg-transparent p-4",
          subtle && "opacity-90",
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--nourish-subtext)]">
          {title}
        </p>
        <p className="mt-2 text-[12px] text-[var(--nourish-subtext)]">
          {emptyHint}
        </p>
      </section>
    );
  }
  return (
    <section className="rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--nourish-subtext)]">
        {title}
      </p>
      <ol className="mt-2 space-y-1">
        {rows.map((row) => {
          const own = row.podId === ownPodId;
          return (
            <li
              key={row.podId}
              className={cn(
                "flex items-center gap-3 rounded-xl px-2 py-1.5 text-[13px]",
                own && "bg-[var(--nourish-gold)]/10",
              )}
            >
              <span
                className={cn(
                  "w-5 text-[var(--nourish-subtext)] tabular-nums",
                  own && "font-semibold text-[var(--nourish-gold)]",
                )}
              >
                {row.rank}
              </span>
              <span
                className={cn(
                  "flex-1 truncate",
                  own
                    ? "font-semibold text-[var(--nourish-dark)]"
                    : "text-[var(--nourish-dark)]",
                )}
              >
                {row.name}
                {own && (
                  <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-[var(--nourish-gold)]/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--nourish-gold)]">
                    <Users size={9} aria-hidden /> you
                  </span>
                )}
              </span>
              <span className="tabular-nums text-[var(--nourish-subtext)]">
                {row.averageScore}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
