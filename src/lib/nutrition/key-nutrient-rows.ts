/**
 * Key-nutrient row selection (starring fix, 2026-06-10). RCA: two gates kept
 * starred nutrients out of "Key nutrients" — buildRows skips nutrients ABSENT
 * from the day's vector entirely, and the old top-4 filter required value>0.
 * A goal nutrient you've eaten NONE of (the exact thing a goal exists to
 * surface) could therefore never pin, and high-%DV unstarred rows (vit C/K)
 * kept the seats.
 *
 * Contract: ALL starred nutrients render — present-at-zero or absent rows are
 * synthesized at 0 from the FDA display table — ordered by %DV desc, then
 * unstarred rows top up to the 4-slot minimum. More stars than slots = the
 * grid grows (overflow by design).
 */

import {
  NUTRIENT_DISPLAY,
  type NutrientGroup,
} from "@/data/nutrition/nutrient-display";

export interface KeyRow {
  key: string;
  label: string;
  unit: string;
  dv: number | null;
  value: number;
  group: NutrientGroup;
}

/** Headline macros live in the ring + Daily targets, never in Key nutrients. */
export const HEADLINE_KEYS: ReadonlySet<string> = new Set([
  "calories",
  "protein_g",
  "totalCarbs_g",
  "totalFat_g",
]);

const pct = (value: number, dv: number) => (dv > 0 ? (value / dv) * 100 : 0);

export function selectKeyNutrientRows<R extends KeyRow>(
  rows: ReadonlyArray<R>,
  stars: ReadonlySet<string>,
  minSlots = 4,
): KeyRow[] {
  const byKey = new Map(rows.map((r) => [r.key, r]));

  // Every starred key gets a row: real when composed, synthesized at 0 when
  // the day's vector never mentions it (that 0% is the point of a goal).
  const starred: KeyRow[] = [];
  for (const key of stars) {
    if (HEADLINE_KEYS.has(key)) continue;
    const real = byKey.get(key);
    if (real?.dv != null) {
      starred.push(real);
      continue;
    }
    const meta = NUTRIENT_DISPLAY.find((m) => String(m.key) === key);
    if (meta?.dv != null) {
      starred.push({
        key,
        label: meta.label,
        unit: meta.unit,
        dv: meta.dv,
        value: real?.value ?? 0,
        group: meta.group,
      });
    }
  }
  starred.sort((a, b) => pct(b.value, b.dv!) - pct(a.value, a.dv!));

  const fillers = rows
    .filter(
      (r) =>
        r.dv != null &&
        r.value > 0 &&
        !HEADLINE_KEYS.has(r.key) &&
        !stars.has(r.key),
    )
    .sort((a, b) => pct(b.value, b.dv!) - pct(a.value, a.dv!));

  return [...starred, ...fillers].slice(0, Math.max(minSlots, starred.length));
}
