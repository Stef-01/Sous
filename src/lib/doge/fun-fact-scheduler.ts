/**
 * fun-fact-scheduler — choose which fun fact the Doberman says.
 *
 * pickFact is PURE (roll injected, no Math.random) so it's deterministic and
 * testable. Priority ladder: a fact about the dish you just cooked → a fact about
 * a nutrient you're short on (PetState.need) → a fact about the cuisine → any
 * fact. An exhausted tier recycles rather than running dry, and a `seen` set
 * avoids repeats until a tier is used up.
 */
import { ALL_FUN_FACTS, type PetFunFact } from "@/data/pet-fun-facts";

const SEEN_KEY = "sous-doge-fact-seen";

export interface FactContext {
  /** dish just cooked (meals/sides id) — highest priority. */
  dishSlug?: string;
  /** dish/meal cuisine. */
  cuisine?: string;
  /** the nutrient the pet most needs (PetState.need.key), if any. */
  need?: string | null;
  /** ids already shown — recycled when a whole tier is exhausted. */
  seen?: ReadonlySet<string>;
}

function chooseFrom(
  tier: PetFunFact[],
  seen: ReadonlySet<string>,
  roll: number,
): PetFunFact | null {
  if (tier.length === 0) return null;
  const fresh = tier.filter((f) => !seen.has(f.id));
  const pool = fresh.length > 0 ? fresh : tier; // exhausted → recycle the whole tier
  const idx = Math.min(Math.floor(roll * pool.length), pool.length - 1);
  return pool[idx];
}

/**
 * Pick a fact for the context. `roll` ∈ [0,1). Returns null only if there are no
 * facts at all. Walks the priority ladder and returns from the first applicable,
 * non-empty tier.
 */
export function pickFact(ctx: FactContext, roll: number): PetFunFact | null {
  const seen = ctx.seen ?? new Set<string>();
  const tiers: PetFunFact[][] = [];

  if (ctx.dishSlug) {
    tiers.push(
      ALL_FUN_FACTS.filter((f) => f.dishSlugs?.includes(ctx.dishSlug!)),
    );
  }
  if (ctx.need) {
    tiers.push(ALL_FUN_FACTS.filter((f) => f.nutrient === ctx.need));
  }
  if (ctx.cuisine) {
    tiers.push(ALL_FUN_FACTS.filter((f) => f.cuisines?.includes(ctx.cuisine!)));
  }
  tiers.push(ALL_FUN_FACTS); // generic fallback (always non-empty)

  for (const tier of tiers) {
    const picked = chooseFrom(tier, seen, roll);
    if (picked) return picked;
  }
  return null;
}

// ---- seen-set persistence (localStorage; used by the /doge wiring) ----------

export function readSeenFacts(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? (arr as string[]) : []);
  } catch {
    return new Set();
  }
}

export function markFactSeen(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const seen = readSeenFacts();
    seen.add(id);
    // Self-heal: once every fact has been seen, clear so the pool refreshes.
    const next = seen.size >= ALL_FUN_FACTS.length ? [id] : Array.from(seen);
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(next));
  } catch {
    /* best effort */
  }
}
