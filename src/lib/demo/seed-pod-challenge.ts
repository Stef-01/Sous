/**
 * Demo seed: pod + AI teammates + active challenge.
 *
 * Pure helper that returns a fully-formed PodState with a pod
 * called "Sunday Sous", three AI teammates (Maya, Theo, Riley),
 * an active challenge week with the user-selected challenge,
 * and two pre-filled submissions from the AI teammates so the
 * demo always shows the gallery with content.
 *
 * For prototype use: tapping "Pick a challenge → Cook with
 * Beyond Meat" instantly seeds this state. No admin gate, no
 * waiting for real teammates.
 *
 * Pure / dependency-free / deterministic given (now, challenge).
 */

import {
  POD_SCHEMA_VERSION,
  type ChallengePod,
  type PodChallengeWeek,
  type PodMember,
  type PodState,
  type PodSubmission,
} from "@/types/challenge-pod";
import { weekKey } from "@/lib/pod/pod-score";

export interface SeedChallengeOption {
  /** Stable id used to key the active week. */
  slug: string;
  /** Recipe slug from the catalog (the challenge week's
   *  recipeSlug). For demo challenges, points at a curated
   *  starter recipe representative of the challenge theme. */
  recipeSlug: string;
  /** Display title shown in the chooser. */
  title: string;
  /** One-line subtitle / hook copy. */
  subtitle: string;
  /** Optional sponsor name; null for seasonal/eco. */
  sponsoredBy: string | null;
  /** Twist tag enabled this week. */
  twist: string | null;
}

/** Curated demo-challenge options the user can pick from. Each
 *  recipeSlug points to a REAL id in src/data/sides.json or
 *  src/data/meals.json so the cook flow downstream of the demo
 *  seed actually loads a recipe. (Catalog verified 2026-05-04;
 *  remapped 4 placeholder slugs that didn't exist.)
 *
 *  Includes the user-flagged challenges:
 *    - "Cook with Beyond Meat" (sponsored)
 *    - Spring Greens (eco-conscious / seasonal)
 *  Plus two more so the chooser feels populated. */
export const DEMO_CHALLENGE_OPTIONS: ReadonlyArray<SeedChallengeOption> = [
  {
    slug: "demo-spring-greens",
    // src/data/sides.json — actual asparagus dish in the catalog.
    recipeSlug: "asparagus-stir-fry-subzi",
    title: "Spring Greens",
    subtitle:
      "Asparagus, peas, radishes — local + in-season. See your carbon avoided.",
    sponsoredBy: null,
    twist: null,
  },
  {
    slug: "demo-beyond-meat",
    // src/data/meals.json — al-pastor tacos. The demo positions
    // these as a Beyond-Meat-protein-swap; the vegetarian twist
    // surfaces the plant-protein angle in the pod copy.
    recipeSlug: "tacos-al-pastor",
    title: "Cook with Beyond Meat",
    subtitle: "Three plant-protein dinners this week. Beyond Meat presents.",
    sponsoredBy: "Beyond Meat",
    twist: "vegetarian",
  },
  {
    slug: "demo-eco-week",
    // src/data/meals.json — plant-forward main; low-carbon.
    recipeSlug: "bell-pepper-curry",
    title: "Eco Week",
    subtitle: "Lowest-carbon meals across the week. Track your impact.",
    sponsoredBy: null,
    twist: null,
  },
  {
    slug: "demo-budget-week",
    // src/data/meals.json — classic Indian lentil meal; ~$5/serving.
    recipeSlug: "masoor-dal",
    title: "Budget Week",
    subtitle: "$5 dinners — pantry-led + filling.",
    sponsoredBy: null,
    twist: "budget",
  },
];

/** AI-teammate fixtures for the demo. Three personalities so the
 *  pod feels alive without needing real cohort data. */
export interface DemoTeammate {
  id: string;
  displayName: string;
  avatar: string;
  ageBand: PodMember["ageBand"];
  /** ISO timestamp of when this AI teammate "submits" relative
   *  to the user's cook (negative = before; positive = after). */
  submitOffsetHours: number;
  /** Self-rating they "give" their own cook. */
  selfRating: 1 | 2 | 3 | 4 | 5;
  /** Caption attached to their submission. */
  caption: string;
  /** stepCompletion fraction (0..1). */
  stepCompletion: number;
  /** aestheticScore (0..1). */
  aestheticScore: number;
}

export const DEMO_TEAMMATES: ReadonlyArray<DemoTeammate> = [
  {
    id: "ai-maya",
    displayName: "Maya",
    avatar: "🍳",
    ageBand: "adult",
    submitOffsetHours: -2,
    selfRating: 5,
    caption: "Subbed pancetta for tofu — held together really well.",
    stepCompletion: 1,
    aestheticScore: 0.9,
  },
  {
    id: "ai-theo",
    displayName: "Theo",
    avatar: "🥗",
    ageBand: "adult",
    submitOffsetHours: -26, // yesterday
    selfRating: 4,
    caption: "Thought I overcooked it; pod said no, was actually great.",
    stepCompletion: 0.85,
    aestheticScore: 0.75,
  },
  {
    id: "ai-riley",
    displayName: "Riley",
    avatar: "🌶️",
    ageBand: "adult",
    submitOffsetHours: -72, // 3 days ago
    selfRating: 5,
    caption: "Doubled the garlic. Worth it.",
    stepCompletion: 1,
    aestheticScore: 0.85,
  },
];

export interface SeedDemoInput {
  /** The challenge the demo user picked. */
  challenge: SeedChallengeOption;
  /** Caller's "now" reference for deterministic seeding. */
  now: Date;
  /** Whether to pre-fill teammate submissions (demo flow always
   *  wants this; tests use the false branch to verify the
   *  no-submissions case). */
  withPrefilledSubmissions?: boolean;
}

/** Pure: produce the complete PodState for the demo. */
export function buildDemoPodState(input: SeedDemoInput): PodState {
  const { challenge, now } = input;
  const withSubmissions = input.withPrefilledSubmissions ?? true;
  const wk = weekKey(now);

  // Member 0 is the demo user; the AI teammates are members 1-3.
  const userMember: PodMember = {
    schemaVersion: POD_SCHEMA_VERSION,
    id: "user-demo",
    displayName: "You",
    avatar: "👋",
    ageBand: "adult",
    dietaryFlags: [],
    cuisinePreferences: [],
    joinedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    weeksMissed: 0,
  };

  const aiMembers: PodMember[] = DEMO_TEAMMATES.map((t) => ({
    schemaVersion: POD_SCHEMA_VERSION,
    id: t.id,
    displayName: t.displayName,
    avatar: t.avatar,
    ageBand: t.ageBand,
    dietaryFlags: [],
    cuisinePreferences: [],
    joinedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    weeksMissed: 0,
  }));

  const pod: ChallengePod = {
    schemaVersion: POD_SCHEMA_VERSION,
    id: "pod-sunday-sous",
    name: "Sunday Sous",
    createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    ownerId: userMember.id,
    adminIds: [],
    members: [userMember, ...aiMembers],
    dietaryFlags: [],
    podTimezone: "",
    revealAtHour: 21,
    inviteCode: "DEMO12",
    pausedThisWeek: false,
  };

  // Compute the Monday-00:00 of this week as startedAt (matches
  // pod-score's week-key boundary).
  const startedAt = startOfIsoWeek(now);

  const week: PodChallengeWeek = {
    schemaVersion: POD_SCHEMA_VERSION,
    weekKey: wk,
    podId: pod.id,
    recipeSlug: challenge.recipeSlug,
    twist: challenge.twist,
    startedAt: startedAt.toISOString(),
    donationTagsEnabled: true,
  };

  const submissions: Record<string, PodSubmission> = {};
  if (withSubmissions) {
    for (const t of DEMO_TEAMMATES) {
      const submittedAt = new Date(
        now.getTime() + t.submitOffsetHours * 60 * 60 * 1000,
      );
      // Skip teammates whose offset would land before the week
      // started — keeps the gallery within the active week.
      if (submittedAt.getTime() < startedAt.getTime()) continue;
      const sub: PodSubmission = {
        schemaVersion: POD_SCHEMA_VERSION,
        id: `sub-${t.id}-${wk}`,
        podId: pod.id,
        weekKey: wk,
        memberId: t.id,
        dayKey: dayKey(submittedAt),
        submittedAt: submittedAt.toISOString(),
        photoUri: `data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' fill='%23F0E5D6'/><text x='40' y='52' font-size='40' text-anchor='middle'>${t.avatar}</text></svg>`,
        )}`,
        selfRating: t.selfRating,
        caption: t.caption,
        donateTags: ["cooked-together"],
        stepCompletion: t.stepCompletion,
        aestheticScore: t.aestheticScore,
        hasStepImage: false,
        computedScore: 0, // computed at score time
      };
      submissions[sub.id] = sub;
    }
  }

  return {
    schemaVersion: POD_SCHEMA_VERSION,
    pod,
    weeks: { [wk]: week },
    submissions,
  };
}

/** Pure: compute the start of the ISO week (Monday 00:00 local). */
function startOfIsoWeek(d: Date): Date {
  const out = new Date(d.getTime());
  const day = out.getDay() || 7; // Sunday(0) → 7
  out.setHours(0, 0, 0, 0);
  if (day !== 1) out.setDate(out.getDate() - (day - 1));
  return out;
}

/** Pure: YYYY-MM-DD local. Same shape as pod-score's dayKey but
 *  inlined to keep the seed module self-contained. */
function dayKey(d: Date): string {
  if (!Number.isFinite(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Pure: locate a challenge option by slug. Returns null when
 *  the slug is unknown. Used by the demo trigger to map a URL
 *  param like ?demo=beyond-meat → option. */
export function findChallengeOption(slug: string): SeedChallengeOption | null {
  const lc = slug.toLowerCase().trim();
  return (
    DEMO_CHALLENGE_OPTIONS.find(
      (o) => o.slug === lc || o.slug === `demo-${lc}` || o.recipeSlug === lc,
    ) ?? null
  );
}
