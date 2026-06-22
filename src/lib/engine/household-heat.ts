/**
 * Household heat-tolerance → side filter (W37).
 *
 * Completes the deck-spice wire to the SIDE pairing: the deck penalty
 * (quest-pool `contextBoost`) only de-prioritised spicy MAINS for a low-spice
 * table — the paired sides could still come back spicy. When the least
 * heat-tolerant member at tonight's table can't take heat, an explicitly-spicy
 * side shouldn't be suggested either.
 *
 * Mirrors the household DIETARY filter (a hard exclude in pairing.suggest) — safe
 * because only a handful of sides are spicy, so the ~200-side pool never empties.
 */

/** Lowest spice tolerance (1–5) at/below which the table can't take an
 *  explicitly-spicy side. Matches the deck's `LOW_SPICE_THRESHOLD`. */
export const LOW_HEAT_TOLERANCE = 2;

/** Tag / flavor-profile entries that mark a dish as explicitly spicy. */
const SPICY_MARKERS: ReadonlySet<string> = new Set(["spicy", "hot", "fiery"]);

/**
 * Pure: should a side be excluded for a table whose least heat-tolerant member
 * is `householdMaxHeat` (1–5)? True only when the table's tolerance is low AND
 * the side is explicitly tagged spicy. Returns false for tolerant tables (and
 * the default 5 when no table is set), so non-household users get an identical
 * candidate pool — and a non-finite input is treated as "no restriction".
 */
export function sideTooSpicyForTable(
  tags: ReadonlyArray<string>,
  flavorProfile: ReadonlyArray<string>,
  householdMaxHeat: number,
): boolean {
  if (
    !Number.isFinite(householdMaxHeat) ||
    householdMaxHeat > LOW_HEAT_TOLERANCE
  ) {
    return false;
  }
  return [...tags, ...flavorProfile].some((t) =>
    SPICY_MARKERS.has(t.toLowerCase().trim()),
  );
}
