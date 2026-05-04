/**
 * Bake-sale event tooling (Y2 Sprint L W51).
 *
 * Pure helpers for the bake-sale-mode surface enhancements on
 * pod home. Coordination only — NOT a payment processor (real
 * money flows through the W49 Stripe charge).
 *
 * Three pieces:
 *   - aggregatePodShoppingList — combine each member's
 *     ingredient list into a single quantity-summed master list.
 *   - assignRoles — pure round-robin role allocator from a
 *     proposed pool to the pod members.
 *   - formatReflectionCard — post-event "we raised $X for Y"
 *     one-liner persisted to the pod's history.
 *
 * Pure / dependency-free / deterministic.
 */

import { normaliseIngredientName } from "@/lib/engine/pantry-coverage";
import { formatMoneyMinor } from "./donation-display";
import type { Nonprofit, SupportedCurrency } from "@/types/charity";

// ── Shopping list aggregation ─────────────────────────────

export interface MemberShoppingItem {
  /** Free-text ingredient line ('2 cups flour', 'sugar', etc). */
  item: string;
  /** Optional integer count multiplier when one cook will be
   *  done multiple times (e.g. doubling for the bake-sale).
   *  Defaults to 1. */
  multiplier?: number;
}

export interface AggregatedShoppingItem {
  /** Normalised ingredient name. */
  name: string;
  /** Sum of all member multipliers — coarse "how many cooks
   *  worth" of this ingredient does the pod need. */
  totalCount: number;
  /** Member display names (or ids) that contributed. */
  contributors: string[];
}

/** Pure: combine per-member shopping items into a single
 *  pod-level master list. Item names are normalised so
 *  "Fresh Basil Leaves" + "basil" collapse to the same row.
 *  Output sorted alphabetically by normalised name. */
export function aggregatePodShoppingList(
  members: ReadonlyArray<{
    name: string;
    items: ReadonlyArray<MemberShoppingItem>;
  }>,
): AggregatedShoppingItem[] {
  const map = new Map<string, AggregatedShoppingItem>();
  for (const member of members) {
    for (const item of member.items) {
      const norm = normaliseIngredientName(item.item);
      if (norm.length === 0) continue;
      // Default to 1 when multiplier is unset; treat any non-
      // finite or non-positive provided value as a defensive
      // drop (caller passed bad data).
      let mult = 1;
      if (item.multiplier !== undefined) {
        if (!Number.isFinite(item.multiplier)) continue;
        if (item.multiplier <= 0) continue;
        mult = item.multiplier;
      }
      const existing = map.get(norm);
      if (existing) {
        existing.totalCount += mult;
        if (!existing.contributors.includes(member.name)) {
          existing.contributors.push(member.name);
        }
      } else {
        map.set(norm, {
          name: norm,
          totalCount: mult,
          contributors: [member.name],
        });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// ── Role assignment ────────────────────────────────────────

export const DEFAULT_BAKE_SALE_ROLES: ReadonlyArray<string> = [
  "baker",
  "setup",
  "cashier",
  "runner",
];

export interface RoleAssignment {
  member: string;
  role: string;
}

/** Pure: round-robin allocator. Pads or trims the role list
 *  to match the member count.
 *
 *  - If members > roles: roles repeat (a 6-member pod with 3
 *    roles assigns each role twice).
 *  - If roles > members: roles tail off (3 members + 4 roles
 *    means cashier-and-runner go uncovered, surfaced in the
 *    `unassignedRoles` field).
 *
 *  Stable: same (members, roles) input → same output order. */
export function assignRoles(
  members: ReadonlyArray<string>,
  roles: ReadonlyArray<string> = DEFAULT_BAKE_SALE_ROLES,
): {
  assignments: RoleAssignment[];
  unassignedRoles: string[];
} {
  if (members.length === 0) {
    return { assignments: [], unassignedRoles: [...roles] };
  }
  if (roles.length === 0) {
    return { assignments: [], unassignedRoles: [] };
  }
  const assignments: RoleAssignment[] = [];
  const coveredRoles = new Set<string>();
  for (let i = 0; i < members.length; i++) {
    const role = roles[i % roles.length];
    if (role === undefined) continue;
    const member = members[i];
    if (member === undefined) continue;
    assignments.push({ member, role });
    coveredRoles.add(role);
  }
  const unassignedRoles = roles.filter((r) => !coveredRoles.has(r));
  return { assignments, unassignedRoles };
}

// ── Reflection card ───────────────────────────────────────

export interface ReflectionCardInput {
  /** Total raised in minor units. */
  raisedMinor: number;
  /** Currency for the totalRaised. */
  currency: SupportedCurrency;
  /** Nonprofit the raise went to. */
  nonprofit: Pick<Nonprofit, "name">;
  /** Optional event date — when the bake sale happened. */
  eventDate?: string;
  /** Optional pod name for the headline. */
  podName?: string;
  /** Optional locale for currency formatting. */
  locale?: string;
}

/** Pure: format the post-event reflection card. The card
 *  persists to the pod's history; copy is celebratory but
 *  understated per the W51 'NOT gamification pressure' rule.
 *
 *  Always returns a non-empty string. When raisedMinor is 0
 *  (bake sale ran but charge failed / no completed cooks),
 *  returns a different shape that thanks the participants
 *  rather than highlighting the zero. */
export function formatReflectionCard(input: ReflectionCardInput): string {
  const { raisedMinor, currency, nonprofit, eventDate, podName, locale } =
    input;
  const podPrefix =
    podName && podName.trim().length > 0 ? `${podName.trim()} ` : "";
  const datePostfix =
    eventDate && eventDate.trim().length > 0 ? ` (${eventDate.trim()})` : "";

  if (raisedMinor <= 0 || !Number.isFinite(raisedMinor)) {
    return `${podPrefix}thank you for showing up to the bake sale${datePostfix}.`;
  }
  const money = formatMoneyMinor(raisedMinor, currency, locale);
  const charity = nonprofit.name.trim() || "the chosen charity";
  return `${podPrefix}raised ${money} for ${charity}${datePostfix}.`;
}
