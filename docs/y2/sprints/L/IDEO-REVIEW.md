# Y2 Sprint L (W48-W51) — Charity bake-sale tooling

> **Plan ref:** `docs/YEAR-2-VIBECODE-PLAN.md` Sprint L
> **Date closed:** 2026-05-03
> **Bi-weekly IDEOs:** #23 (W48+W49) + #24 (W50+W51) absorbed into
> this sprint close.

## Build state at review

- Latest commit on main: `2846d43` (W51 bake-sale event tooling).
- Test count: **1988** (was 1900 at Sprint K close — **+88 this sprint**).
- Four-gate green: lint ok, typecheck ok, test ok (1988/1988), build ok.

## What landed in Sprint L

| Week | Output                                                                                                                                         |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| W48  | Charity schema substrate — Zod validators for Nonprofit + PodPledge + 12-entry placeholder catalogue across 4 countries (19 tests).            |
| W49  | Stripe charge dispatcher (stub-mode V1) — idempotency-key generation + safety-gated body builder + form encoder + async dispatcher (26 tests). |
| W50  | Donation display + year identity badge — locale-aware money formatter + per-currency aggregator + threshold-gated identity claim (21 tests).   |
| W51  | Bake-sale event tooling — pod shopping list aggregator + role round-robin + reflection card formatter (22 tests).                              |

4 production commits + 1 docs commit (this).

## Cross-cutting wins

1. **Most founder-gated sprint of the year shipped clean.** Stripe + curated nonprofits + tax-form collection are all real-world friction; the substrate sidesteps every one of them without losing any logical layer. The W49 dispatcher fires today in stub mode + flips to live charges when STRIPE_SECRET_KEY + a verified nonprofit are in place.

2. **The verifiedByFounder gate is structurally enforced.** `buildStripeChargeBody` returns null when the nonprofit isn't verified, regardless of mode. There's no path through the code where an unverified nonprofit could receive a real charge — the type system + the body builder + the dispatcher all reject independently.

3. **Idempotency-key as a pure function of (pod, week, nonprofit) is the no-double-charge invariant.** Same triple → same key. Stripe's server-side idempotency rejects duplicates. Even if the cron retries the weekly close 100 times, the user is charged once.

4. **6 pure helpers compose into the bake-sale flow.** From shopping aggregation → role assignment → reflection card → the W50 donation line → year identity badge. Each is testable in isolation; the UI surface (pod-home-content.tsx) wires them together as render glue.

## UX-recon target hit (Sprint L primary)

**Surface:** bake-sale recipe cards (planned per the framework — patterns #1 + #4: hero card + save corner).
**Status:** **Substrate ready, surface deferred to a polish week before Y2 close.** The W51 reflection card formatter + W50 donation line are ready to slot into a bake-sale recipe-card variant. The visual implementation joins the existing carry-forward backfill list:

- Pod gallery made-it-ring (#10) — Sprint I
- Search results page eyebrow + filter chips (#2 + #9) — Sprint J
- Cuisine cards eyebrow + made-it ring (#2 + #10) — Sprint K
- Bake-sale recipe cards hero + save (#1 + #4) — Sprint L

Four backfill items now staged for the W52 polish + retrospective week.

## RCA tally

0 RCAs on main this sprint.

The 0-RCAs-on-main streak now stretches **44 weeks** (Sprints A through L).

Mid-sprint catches that never reached main:

- W48: nonprofit seed initially had three regional alias entries that exactly matched their canonical term. Caught by the seed-data sanity test (carried over from W44's lesson). Three small JSON edits and the test went green.
- W49: stripeFormEncode test expected URL-encoded brackets; Stripe expects literal brackets. Test corrected to match the wire spec.
- W50: Intl.NumberFormat default options dropped trailing zeros ("$20.5" instead of "$20.50"). Refactored to use `minimumFractionDigits: isWhole ? 0 : 2` so whole + cents both render correctly.
- W51: aggregator's NaN multiplier defaulted to 1 instead of dropping the item. Refactored the multiplier check to drop on any non-finite or non-positive provided value.

## Founder-unlock status (final)

- **STRIPE_SECRET_KEY:** still unset. W49 stub mode runs end-to-end today; one config edit + a verified nonprofit flips real-mode on.
- **All other Y2 H1 + H2 substrates unchanged.** Eight founder-unlock substrates ready for one-config-edit swap.

## Carry-forward into W52 close week

- Y2 retrospective doc (`docs/y2/half/H2-RETROSPECTIVE.md` + `docs/YEAR-2-RETROSPECTIVE.md`).
- Y3 plan kickoff doc.
- Four backfill items (Sprint I/J/K/L recon targets) — opportunistic landing in the polish week.

## Acceptance for Sprint-L close

- [x] Charity schema substrate shipped + tested (W48).
- [x] Stripe charge dispatcher shipped + tested (W49).
- [x] Donation display + identity badge shipped + tested (W50).
- [x] Bake-sale tooling shipped + tested (W51).
- [x] All four gates green throughout.
- [x] Bi-weekly IDEOs #23 + #24 absorbed (this doc).

## Retrospective

Sprint L was Y2's most founder-gated sprint by a wide margin — Stripe, EIN-verified nonprofits, tax forms, multi-currency display. Yet 88 tests landed without RCAs, the substrate composes cleanly with the W36 weekly-pick token + W42 chip cooldown, and the structural safety (verifiedByFounder gate, idempotency key, donation line guarding $0 framing) means founder-day is one config edit away from a working production flow.

Y2 closes at W52 with a polish week + the year-2 retrospective. The discipline that earned the 44-week 0-RCAs-on-main streak holds.
