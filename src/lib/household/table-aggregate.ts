/**
 * Aggregate household constraints across "who's at the table"
 * tonight.
 *
 * W35 substrate from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md
 * (Sprint G household memory). Pairs with the W32 schema +
 * W34 per-member preferences to feed the picker on /today.
 *
 * Contract: given the full members list + the set of selected
 * ids for tonight, return an aggregate that the pairing engine
 * can read — union of dietary flags (any single member's
 * restriction binds the whole table), min spice tolerance (the
 * least heat-tolerant member sets the upper bound), per-member
 * names + avatars for display.
 *
 * Pure / dependency-free so unit tests cover the matrix without
 * touching React or storage.
 */

import type { HouseholdMember } from "@/types/household-member";

export interface AggregatedTable {
  /** Number of members at the table. */
  count: number;
  /** Selected members (ordered as in the input list, not the
   *  selection set, so the UI renders deterministically across
   *  re-renders). */
  members: HouseholdMember[];
  /** Union of every selected member's dietary flags, deduped. */
  dietaryFlags: string[];
  /** Union of cuisine preferences across every selected member,
   *  deduped — a soft signal the pairing engine can layer into
   *  cuisineFit. Empty when no member listed any preference. */
  cuisinePreferences: string[];
  /** Lowest spice tolerance among selected members. The pairing
   *  engine should treat this as the upper bound on heat. When
   *  no members are selected, defaults to 5 (no restriction). */
  minSpiceTolerance: number;
  /** True iff at least one selected member has ageBand="child".
   *  Switches kid-friendliness scoring on. */
  hasChild: boolean;
}

const DEFAULT_AGGREGATE: AggregatedTable = {
  count: 0,
  members: [],
  dietaryFlags: [],
  cuisinePreferences: [],
  minSpiceTolerance: 5,
  hasChild: false,
};

/** Build the aggregate from a list of all household members and
 *  the set of selected ids. Pure — preserves input ordering. */
export function aggregateTable(
  allMembers: ReadonlyArray<HouseholdMember>,
  selectedIds: ReadonlyArray<string>,
): AggregatedTable {
  if (selectedIds.length === 0 || allMembers.length === 0) {
    return { ...DEFAULT_AGGREGATE, members: [] };
  }
  const selectedSet = new Set(selectedIds);
  const selectedMembers = allMembers.filter((m) => selectedSet.has(m.id));
  if (selectedMembers.length === 0) {
    return { ...DEFAULT_AGGREGATE, members: [] };
  }

  const dietary = new Set<string>();
  const cuisines = new Set<string>();
  let minSpice = Infinity;
  let hasChild = false;

  for (const m of selectedMembers) {
    for (const f of m.dietaryFlags) dietary.add(f);
    for (const c of m.cuisinePreferences) cuisines.add(c);
    if (m.spiceTolerance < minSpice) minSpice = m.spiceTolerance;
    if (m.ageBand === "child") hasChild = true;
  }

  return {
    count: selectedMembers.length,
    members: selectedMembers,
    dietaryFlags: Array.from(dietary).sort(),
    cuisinePreferences: Array.from(cuisines).sort(),
    minSpiceTolerance: minSpice === Infinity ? 5 : minSpice,
    hasChild,
  };
}

/** Format the aggregate as a short display label —
 *  "👋 Alex · 🦄 Sam · vegan, gluten-free". Empty when nothing
 *  selected so callers can hide the surface. */
export function formatTableLabel(agg: AggregatedTable): string {
  if (agg.count === 0) return "";
  const names = agg.members
    .map((m) => (m.avatar ? `${m.avatar} ${m.name}` : m.name))
    .join(" · ");
  if (agg.dietaryFlags.length === 0) return names;
  return `${names} — ${agg.dietaryFlags.join(", ")}`;
}
