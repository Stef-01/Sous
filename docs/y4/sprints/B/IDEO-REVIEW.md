# Y4 Sprint B (W5-W8) — Charity bake-sale ledger + dashboard

> **Plan ref:** `docs/YEAR-4-VIBECODE-PLAN.md` Sprint B
> **Date closed:** 2026-06-28
> **Bi-weekly IDEOs:** #3 (W5+W6) + #4 (W7+W8) absorbed.

## Build state at review

- Latest commit on main: `1aa31c7` (W7 dashboard surface).
- Test count: **2364** (was 2337 at Sprint A close — **+27 this sprint**).
- Four-gate green: lint ok, typecheck ok, test ok (2364/2364), build ok.

## What landed in Sprint B

| Week | Output                                                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------------------------------- |
| W5   | Charity-charge ledger pure helper (`charity-ledger.ts`) — aggregateCharityRaised, estimateMonthlyRaisedMicroUsd. 11 tests. |
| W6   | localStorage layer + `useCharityLedger` hook. updateCharityChargeStatus for refund webhooks. 11 tests.                     |
| W7   | `summariseCharityForDashboard` helper + CharityDashboardCard + `/path/charity-spend`. 5 tests.                             |
| W8   | Sprint B close + retro (this doc).                                                                                         |

## Substrate composition

The Sprint B work layers on the existing Y2-W49 Stripe charge dispatcher + Y2-W50 donation-display formatters + Y2-W51 bake-sale coordination helpers. Y4 added the rolling-window aggregator and the dashboard.

| Layer             | Origin  | Status                                  |
| ----------------- | ------- | --------------------------------------- |
| Stripe dispatcher | Y2 W49  | Stub mode → real on `STRIPE_SECRET_KEY` |
| Donation display  | Y2 W50  | Already real                            |
| Bake-sale coord   | Y2 W51  | Already real                            |
| Ledger aggregator | Y4 W5 ✓ | Pure helper                             |
| Storage + hook    | Y4 W6 ✓ | localStorage; Postgres swap at Sprint C |
| Dashboard         | Y4 W7 ✓ | `/path/charity-spend`                   |

## Cross-cutting wins

1. **Twin-substrate pattern.** Sprint A's LLM-spend telemetry + Sprint B's charity ledger now share an identical shape (pure helper aggregator → Zod-gated storage → React hook → summary helper → dashboard card). Sprint F's push-delivery monitoring + Sprint G's trainer-drift dashboard will inherit the same pattern.
2. **Refund webhook ready.** `updateCharityChargeStatus` is a no-op on unknown ids, so out-of-order Stripe webhooks (refund arriving before the original succeeded record finished writing) don't error. Sprint C wire-up flips this from local-only to server-synced without changing the helper.
3. **Refunded charges counted but excluded from raised.** The aggregator counts all entries but the raised total only sums `succeeded`. The dashboard surfaces the three-status breakdown so the founder sees pending vs settled.

## RCA tally

0 RCAs on main this sprint.

The streak now extends to **~103 weeks**.

Mid-sprint catches that never reached main:

- W5: First draft of `aggregateCharityRaised` summed amounts unconditionally — corrected to only sum `succeeded` before commit (refund handling).
- W7: `useCharityLedger` initial draft passed `clearAll`'s prev to `freshCharityLedgerStorage(prev.schemaVersion)` — corrected to ignore prev (the schema version is a constant).

## Acceptance for Sprint-B close

- [x] Charity ledger aggregator shipped (W5).
- [x] localStorage + hook + status update shipped (W6).
- [x] Dashboard surface shipped (W7).
- [x] Sprint B close doc filed (W8, this doc).
- [x] All four gates green throughout.
- [x] Bi-weekly IDEOs #3 + #4 absorbed.

## Carry-forward into Sprint C

- Sprint C (W9-W12) ships **Postgres + Drizzle migration substrate + R2 photo storage helpers + VAPID key registry**. The W6 + W2 localStorage hooks both sit ready for the Postgres-backed sync swap. The W7 + W3 dashboards stay unchanged through the swap.
