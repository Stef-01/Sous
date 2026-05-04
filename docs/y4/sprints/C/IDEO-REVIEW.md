# Y4 Sprint C (W9-W12) — Postgres + R2 substrate

> **Plan ref:** `docs/YEAR-4-VIBECODE-PLAN.md` Sprint C
> **Date closed:** 2026-07-26
> **Bi-weekly IDEOs:** #5 (W9+W10) + #6 (W11+W12) absorbed.

## Build state at review

- Latest commit on main: `93f881d` (W11 signed-URL contract).
- Test count: **2386** (was 2364 at Sprint B close — **+22 this sprint**).
- Four-gate green: lint ok, typecheck ok, test ok, build ok.

## What landed in Sprint C

| Week | Output                                                                                                      |
| ---- | ----------------------------------------------------------------------------------------------------------- |
| W9   | `src/lib/db/y4-tables.ts` — meal_plan_slots, llm_call_entries, charity_charge_entries Drizzle definitions.  |
| W10  | `source-selector.ts` — local/Postgres mode picker + SSR-safe runtime detection.                             |
| W11  | `signed-url.ts` — composeSignedUrlPayload + clampExpirySec + validateSignedUrlExpiry + buildPhotoObjectKey. |
| W12  | Sprint C close + retro (this doc).                                                                          |

## Founder-key contract

Three independent unlock paths consolidate in this sprint:

| Substrate        | Founder key          | Real-mode flip behaviour                                                                       |
| ---------------- | -------------------- | ---------------------------------------------------------------------------------------------- |
| Postgres tables  | `DATABASE_URL`       | `pnpm db:push` creates the W9 tables; `selectDataSource` flips reads to Postgres on mount.     |
| R2 photo storage | 4 R2 env vars        | Photo pipeline (Y2 W3) routes through real signer; W11 canonical contract dictates the format. |
| VAPID push       | (Sprint F follow-on) | Web Push key registry needs the public/private VAPID pair before SW subscription works.        |

## Cross-cutting wins

1. **Migration boundary stays explicit.** Y4 tables live in their own module (`y4-tables.ts`), exactly mirroring the Y2 pattern. Drizzle-kit picks them up via the schema barrel; the application code reads through the existing `db/index.ts` proxy. No schema-version conflicts.
2. **Stub→real is mechanical.** The W11 canonical string is what the real signer will hash. Once R2 creds land, the API route swap is "replace the stub fetch with the SigV4 client" — the call sites + the validate path stay unchanged.
3. **bigint over int32.** `cost_micro_usd` + `amount_micro_usd` columns use bigint. A high-volume user could exceed 2^31 micro-USD over a year; a charity bake sale could top \$2k easily; bigint avoids silent truncation.

## RCA tally

0 RCAs on main this sprint.

The streak now extends to **~107 weeks**.

Mid-sprint catches that never reached main:

- W9: First draft of `y4-tables.ts` referenced `users` from `y2-tables` for FKs. Caught when realising y2-tables.users redefines schema.ts.users with a different shape; resolved by dropping FK references and using bare `text("owner_id")`. App-level enforcement.
- W10: First sketch had `selectDataSource` infer "isBrowser" via a heuristic. Lifted to an input parameter for purity + made tests deterministic.

## Acceptance for Sprint-C close

- [x] Y4 Drizzle tables shipped (W9).
- [x] Data-source selector shipped (W10).
- [x] R2 signed-URL contract shipped (W11).
- [x] Sprint C close doc filed (W12, this doc).
- [x] All four gates green throughout.
- [x] Bi-weekly IDEOs #5 + #6 absorbed.

## Carry-forward into Sprint D

- Sprint D (W13-W16) ships **iOS Capacitor scaffold + APNs key registry + native haptics + camera permission**. The Y3 photo pipeline + Y4 W11 signed-URL contract land in the iOS shell unchanged — Capacitor's Filesystem + Camera plugins return native blob URIs that the existing Y2 W3 stub passthrough already handles.
- The W10 source-selector picks up an additional axis ("native vs web") in Sprint D so push tokens, etc., route to the right backend.
