/**
 * useReelsFeedCursor — deterministic-shuffle infinite feed builder.
 *
 * Real TikTok streams are infinite via server-side recommendation. Sous
 * has a small static reel catalog; we simulate "infinite" by repeating
 * the catalog in three deterministic passes:
 *   1. chronological newest-first
 *   2. seeded shuffle of the same set
 *   3. reverse of the shuffled set
 *
 * That gives us 3× catalog size in a single mount without relying on
 * pagination. When the catalog passes ~50 entries we'll swap this for
 * a real /api/reels?cursor=... loader (V2.5).
 */

import type { Reel } from "@/types/content";

/**
 * Pure function; SSR-safe. Caller is responsible for passing a stable
 * seed (e.g. today's date) so the order is consistent across renders
 * within the same session but rotates day-to-day.
 */
export function buildInfiniteReelsFeed(reels: Reel[], seed: string): Reel[] {
  if (reels.length === 0) return [];
  const chrono = [...reels].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  const shuffled = deterministicShuffle(chrono, seed);
  const reversed = [...shuffled].reverse();
  return [...chrono, ...shuffled, ...reversed];
}

/**
 * Mulberry32-style deterministic shuffle. Same input + seed → same
 * output. SSR-safe; uses no Math.random.
 */
export function deterministicShuffle<T>(items: T[], seed: string): T[] {
  const out = [...items];
  const seedNum = hashSeed(seed);
  let s = seedNum;
  // Fisher-Yates with the seeded PRNG.
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Today's-date seed in ISO YYYY-MM-DD form. Stable per calendar day. */
export function todaySeed(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
