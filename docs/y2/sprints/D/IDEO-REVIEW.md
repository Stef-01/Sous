# Y2 Sprint D (W15-W18) — Pantry-aware suggestions

> **Plan ref:** `docs/YEAR-2-VIBECODE-PLAN.md` Sprint D
> **Date closed:** 2026-05-03
> **Bi-weekly IDEOs:** #7 (W15+W16) + #8 (W17+W18) absorbed into
> this sprint close.

## Build state at review

- Latest commit on main: `846e825` (W17 pantry badge substrate).
- Test count: **1357** (was 1309 at Sprint C close — **+48 this sprint**).
- Four-gate green: `pnpm lint` ok, `pnpm exec tsc --noEmit` ok,
  `pnpm test` ok (1357/1357), `pnpm build` ok.

## What landed in Sprint D

| Week | Output                                                                                                                                                                                                                                              |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W15  | Pure pantry-coverage helper — `normaliseIngredientName`, `pantryHasIngredient`, `computePantryCoverage`. 32 tests covering qualifier-stripping, quantity-stripping, parens, optional-exclusion, NaN-safety, fuzzy bidirectional substring matching. |
| W16  | Engine integration — `applyPantryRerank` post-processor with the discontinuous 0.7-threshold boost (×0.20 above, ×0.10 below). Wired into `pairing-engine.ts` as the 8th optional positional. 16 tests including the no-pantry regression guard.    |
| W17  | Surface substrate — SideResult gains `pantryCoverage` / `pantryHaveCount` / `pantryTotalCount` fields; result-stack eyebrow renders the badge when populated.                                                                                       |
| W18  | Sprint D close + IDEO #7 + #8 (this doc).                                                                                                                                                                                                           |

3 production commits + 1 docs commit (this).

## What's deferred (substrate ready, surface waits on data)

W17 plan also called for:

1. The "Have ingredients" reroll-bias toggle on the result-stack reroll surface
2. The W18 behavioural overlay — welcome-line "use what you have" framing when a high-coverage candidate exists

Both are deferred to a follow-on commit because they require the pairing router to populate `pantryCoverage` per candidate, which itself requires per-side ingredient data in the seed catalog. The seed catalog currently carries `tags` + `description` + `guidedCookSteps` but no normalised `ingredients[]` array.

The substrate that DID ship (W15 helper + W16 rerank + W17 SideResult fields + result-stack badge) means the follow-on is a single layer of plumbing: when the pairing router gains ingredient data, it computes coverage with `computePantryCoverage` + populates the SideResult fields + the badge appears.

This is the Y1+Y2 substrate-first pattern again — three layers of ready code waiting for one config edit. Same shape as auth-flag (Y2 W1), R2 (Y2 W3), V3 trainer (Y2 W7-W10).

## UX-recon target hit (Sprint D primary)

**Surface:** result-stack eyebrow row → adds the pantry-coverage badge.
**Patterns landed:** #2 eyebrow categorisation (extending the Sprint C upgrade).
**Sprint D's planned primary** was `/path/pantry` empty-state + add flow (patterns #11 + #12). Deferred to Sprint E or a backfill — pantry-page restructure is a larger effort than fits the single-week recon-discipline budget. The `/path/pantry` upgrade carries forward to the framework's Y1-backfill pool.

This is acceptable per the framework's acceptance contract clause 2 — the IDEO doc has to name which pattern was the upgrade target. We hit pattern #2 (eyebrow categorisation extension) and explicitly defer the larger #11+#12 to a future sprint with the larger budget.

## Cross-cutting wins

1. **Substrate-first generalises again.** Three layers of ready code (helper + rerank + UI fields) all waiting for the same data plumbing. When ingredient data lands, all three light up simultaneously.
2. **Discontinuous thresholds are defensible.** The 0.7 threshold creating a meaningful jump (rather than a smooth gradient) was a design choice the W16 plan made; the rerank tests verify the discontinuity explicitly. This pattern (threshold-driven jump rather than linear ramp) is valuable for future signal design.
3. **Engine post-process pipeline now has 2 stages.** W11 time-rerank + W16 pantry-rerank both share the same `(ranked, context) → ranked` shape. Future signals (cuisine-of-the-day, dietary-fit, etc.) can plug into the same shape — the engine's pairing-engine.ts is becoming a clean assembly line.

## RCA tally

0 RCAs on main this sprint.

Mid-sprint catches that never reached main:

- W16: Initial draft of `applyPantryRerank` accidentally mutated the input array via `.sort` on the returned reference. Fixed by `.map`-ing first then sorting the new array. Caught by the immutability test.

The 0-RCAs-on-main streak now stretches across **12 weeks** (Sprints A + B + C + D).

## Carry-forward into Sprint E

- Sprint E (W19-W22) ships **Daily rhythm + smart notifications**.
  Recon target per the framework table: `/today` rhythm card sticky compact header (pattern #6).
- Three behavioural overlays land in Sprint E (implementation intentions, streak forgiveness, identity reinforcement).
- The W17 deferred items (Have-ingredients toggle, welcome-line tiny-goals) carry forward as backfill candidates whenever ingredient data lands.

## Acceptance for Sprint-D close

- [x] Pantry-coverage pure helper shipped + tested (W15).
- [x] Engine post-process rerank shipped + tested + wired (W16).
- [x] SideResult substrate + result-stack badge shipped (W17).
- [x] Recon target named (pattern #2 extension); larger #11+#12 deferred with rationale.
- [x] All four gates green throughout.
- [x] Bi-weekly IDEOs #7 + #8 absorbed (this doc).

## Retrospective

Sprint D shipped the engine-side of pantry-aware suggestions cleanly + safely. The decision to defer the surface-side (toggle, welcome-line overlay) until ingredient data lands is the disciplined call — shipping UI for null data wastes future maintenance budget. The substrate layers are in place + tested, so when data lands the wire-up is one router edit + the surface renders end-to-end.

Sprint E opens with rhythm pattern inference — pure-data work, no founder-gating — followed by the push-notification platform substrate (which IS founder-gated on VAPID keys). The substrate-first pattern continues.
