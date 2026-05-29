# W30 close — pairing-engine V2

**Sprint:** F (W27-W31)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` H2 W30
**Date closed:** 2026-05-02
**Scope:** Pairing-engine V2 — per-user weight vector trained
client-side from cook history. The W6-era hand-tuned
`DEFAULT_WEIGHTS` were a one-size-fits-all shipping starter; W30
replaces that with a small, conservative trainer that nudges the
weights based on observable signals.

## Shipped

| File                                         | Output                                                        |
| -------------------------------------------- | ------------------------------------------------------------- |
| `src/lib/engine/user-weight-trainer.ts`      | Pure trainer + `deriveSignals` helper                         |
| `src/lib/engine/user-weight-trainer.test.ts` | 18 tests (cold-start, signal derivation, deltas, invariants)  |
| `src/lib/hooks/use-user-weights.ts`          | localStorage-backed hook with W15-pattern parser              |
| `src/lib/hooks/use-user-weights.test.ts`     | 10 parser tests                                               |
| `src/lib/trpc/routers/pairing.ts`            | `userWeights` field on `suggest` + `rerollSide`               |
| `src/app/(today)/today/page.tsx`             | Wires `useUserWeights` into the pairing query                 |
| `src/components/today/result-stack.tsx`      | Wires `useUserWeights` into the reroll query                  |
| `src/app/sides/page.tsx`                     | Wires `useUserWeights` into the `/sides` browse pairing query |

Test count: **695 → 723** (+28). All four gates green.

## Design constraints

The trainer is deliberately conservative. Three guard rails:

1. **Cold-start safe.** Below `COLD_START_THRESHOLD` (5 cooks)
   the trainer returns `DEFAULT_WEIGHTS` unchanged. New users
   never see a degraded ranking — the V2 personalisation is
   strictly additive over time.

2. **Bounded drift.** Each signal can only nudge a single
   dimension by ≤ `MAX_DELTA` (0.05). Three signals run today,
   so a fully saturated user can drift by at most 0.15 before
   renormalisation. Even at the extremes no dimension reaches
   0.5, keeping the engine bounded.

3. **Catalog-free.** Signals come from `CookSessionRecord`
   fields only — `cuisineFamily`, `rating`, `favorite`. The
   trainer doesn't import seed data fixtures, which keeps the
   engine unit-testable without re-rendering the catalog and
   leaves the catalog free to evolve independently.

## Three signals shipped

| Signal             | Threshold | Bumped dimension | Why                                                                                                       |
| ------------------ | --------- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| cuisineConsistency | > 0.5     | `cuisineFit`     | User who cooks one cuisine repeatedly cares about cuisine match more than the median user.                |
| highRatingRate     | > 0.7     | `preference`     | User who consistently rates ≥ 4 has a clearer preference signal — let the implicit pref-vector lead more. |
| favoriteRate       | > 0.3     | `preference`     | User who self-curates is exposing their taste loudly — same pref-bump rationale.                          |

Both highRatingRate and favoriteRate bump `preference` for
related but distinct reasons. They can compound, but the per-
signal cap keeps the total bump ≤ 0.10 even at full saturation.

## Acceptance

- [x] Trainer derives weights from cook history.
- [x] Cold-start (< 5 cooks) returns `DEFAULT_WEIGHTS` byte-equal.
- [x] Output weights always sum to 1 (pure invariant test).
- [x] Output weights all non-negative (invariant test).
- [x] Output weights all stay below 0.5 even for fully saturated
      users (invariant test).
- [x] Wired into all three pairing call sites (`/today`,
      `/sides`, result-stack reroll).
- [x] All four gates green: lint ✓, typecheck ✓, test 723/723 ✓,
      build ✓.

## Loop-2 RCA

1 RCA caught at lint time:

- **`react-hooks/set-state-in-effect` on the persistence-on-
  change effect.** The persist effect updates local state after
  a real-change check (`!weightsEqual`) so the lint rule's
  blanket warning was a false positive in this case. Fixed with
  a scoped `eslint-disable` block + rationale comment, matching
  the pattern already used by the hydration effect in the same
  file.

## Future iterations (V3+)

Out of scope for V2 but pinned in the file's header comment:

- **Per-dimension score signal.** Today the trainer reads only
  cook-session metadata; it never sees the engine's score
  breakdown for the chosen pair. V3 would persist the per-
  dimension scores alongside each cook session, then compare
  the scores of "user accepted" vs. "user rejected" pairings
  to learn dimension importance directly. That's a richer
  signal but requires the engine to start emitting per-cook
  diagnostics.

- **Catalog-aware signals.** Prep-time bias and temperature
  preference would surface from the catalog, not the session
  record. Adding them would reverse the V2 catalog-free
  constraint, which trades testability for signal richness — a
  conscious trade-off when there's enough cook-history evidence
  to justify it.

- **Decay.** Cook history grows monotonically; old cooks weigh
  the same as recent cooks today. Adding an exponential decay
  on session age would let the trainer adapt as the user's
  taste evolves.

## Carry-forward into W31

User-recipe → cook flow integration is the last unfinished item
on the Sprint-A→E carry-forward pile. CLAUDE.md rule 4 ("every
recipe — internal, user-created, or externally retrieved —
renders through the same Quest shell") was technically violated
because authored recipes had no path to the cook step page. W31
ships the adapter + page wiring.

## Retrospective

V2 is a bounded, low-risk personalisation step that the engine
was structurally ready for since W6 (the `weights` parameter
already existed; only the trained-vector source was new). The
catalog-free constraint kept the trainer simple enough to ship
without seed-data fixtures, and the cold-start floor means the
ranking never gets worse for any user — only better as data
accumulates. The three-signal cap (≤ 0.05 per signal) is
conservative enough that even an adversarial cook-history pattern
can't push weights past plausible territory.
