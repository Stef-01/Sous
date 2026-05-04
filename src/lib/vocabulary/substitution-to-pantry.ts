/**
 * Substitution → pantry write helper (Y2 Sprint K W46).
 *
 * When the user taps a substitution in the W45 vocabulary popup
 * ("use lime + brown sugar instead of tamarind"), an inline
 * "Apply this swap to my pantry?" affordance fires this helper.
 * It extracts the swap-side ingredients + writes them to the
 * pantry without duplication.
 *
 * Pure / dependency-free. The hook layer wraps this with a
 * setItems call from the existing usePantry hook.
 */

import { normalizePantryName } from "@/lib/hooks/use-pantry";
import type { Substitution } from "@/types/cuisine-vocabulary";

/** Pure: extract ingredient names from the "swap" side of a
 *  substitution.  The swap field is free-text — typically
 *  "lime + brown sugar" or "leeks for onion" or "vinegar + soy".
 *
 *  Conservative parsing — we extract clear nouns separated by
 *  '+' / ',' / 'and'. Prepositions like "for" or "instead of"
 *  end the swap-side (since they introduce the original
 *  ingredient being replaced). */
export function extractSwapIngredients(swap: string): string[] {
  if (typeof swap !== "string" || swap.length === 0) return [];
  // Cut at the first preposition that introduces the original.
  const cutoffMatch = swap
    .toLowerCase()
    .search(
      /\b(?:for|instead of|in place of|as a sub for|as substitute for)\b/,
    );
  const head = cutoffMatch >= 0 ? swap.slice(0, cutoffMatch) : swap;

  // Split on connectors.
  const parts = head.split(/[+,]|\band\b/i);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const norm = normalizePantryName(part);
    if (norm.length === 0) continue;
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(norm);
  }
  return out;
}

export interface ApplySubstitutionResult {
  /** New pantry items (after the swap-write). */
  nextPantry: string[];
  /** Items added in this call (for telemetry / "Added X to your
   *  pantry" toast). */
  added: string[];
}

/** Pure: apply a substitution to the user's current pantry +
 *  return the new pantry array. No-double-write invariant: an
 *  ingredient that's already in the pantry is silently skipped.
 *
 *  The result.added list is the subset that actually got
 *  inserted — used for the confirmation toast. */
export function applySubstitutionToPantry(
  currentPantry: ReadonlyArray<string>,
  substitution: Substitution,
): ApplySubstitutionResult {
  const existing = new Set(currentPantry.map((p) => p.toLowerCase()));
  const swapNames = extractSwapIngredients(substitution.swap);
  const added: string[] = [];
  const next: string[] = [...currentPantry];
  for (const name of swapNames) {
    if (existing.has(name)) continue;
    next.push(name);
    existing.add(name);
    added.push(name);
  }
  return { nextPantry: next, added };
}
