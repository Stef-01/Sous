/**
 * gallerySequence — the ordered list of meal slugs the /everywhere/gallery
 * rotator cross-fades through. Same craving brain as `cravingForNow`, but the
 * whole daypart-eligible pool rather than the top-1: image-bearing meals first
 * (vividness — a gallery of plated photos), then a date-seeded shuffle so the
 * order rotates day to day. Returns slugs only; the route resolves images.
 *
 * Pure + deterministic for a given `(hour, month, seed)`. Every slug is a real
 * `meals.json` id (rule 7).
 */

import mealsData from "@/data/meals.json";
import { mealDaypartFromHour } from "@/lib/engine/craving-for-now";

interface MealRecord {
  id: string;
  heroImageUrl?: string | null;
  dayparts?: string[];
}

const MEALS = mealsData as unknown as MealRecord[];

export interface GalleryContext {
  hour: number;
  month: number;
  seed: number;
}

/** Seed mixed into the initial state (see craving-for-now for why). */
function seededUnit(key: string, seed: number): number {
  let h = (5381 ^ (seed >>> 0)) >>> 0;
  for (let i = 0; i < key.length; i++)
    h = ((h << 5) + h + key.charCodeAt(i)) >>> 0;
  return (h % 100000) / 100000;
}

/** Ordered meal slugs for the rotating gallery — photographed dishes lead. */
export function gallerySequence(ctx: GalleryContext): string[] {
  const daypart = mealDaypartFromHour(ctx.hour);
  const eligible = MEALS.filter((m) => (m.dayparts ?? []).includes(daypart));
  const pool = eligible.length > 0 ? eligible : MEALS;

  return [...pool]
    .map((m) => ({
      id: m.id,
      hasImage: !!m.heroImageUrl,
      jitter: seededUnit(m.id, ctx.seed),
    }))
    .sort((a, b) => {
      // Image-bearing meals first; within a group, the seeded shuffle, then a
      // stable id tie-break so the order is fully deterministic.
      if (a.hasImage !== b.hasImage) return a.hasImage ? -1 : 1;
      if (a.jitter !== b.jitter) return a.jitter - b.jitter;
      return a.id < b.id ? -1 : 1;
    })
    .map((m) => m.id);
}
