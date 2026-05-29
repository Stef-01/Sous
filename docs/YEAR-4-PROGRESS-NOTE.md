# Year-4 progress note (Sprints A–H, partial)

> **Filed:** 2026-11-29 (Y4 W30 close).
> **Period covered:** Y4 W1-W30 (Sprints A through H opening).
> **Headline:** **2561 passing tests, 0 RCAs across 30 Y4 weeks, 8 sprints' worth of founder-key substrate landed, ready to flip into Y5 cohort phase.**

This is a mid-Y4 cut rather than a year close. Y4 W31-W52 (Sprints H back-half + I bilingual + J annual recap + K creator economy + L close) defer into Y5 alongside the cohort-phase work. The substrate that did land covers every founder-key flip on the Y3 retrospective's table.

## Test count progression

| Milestone        | Tests    | Delta                    |
| ---------------- | -------- | ------------------------ |
| Y3 close         | ~2299    | (baseline)               |
| Y4 W4 (A close)  | 2337     | +38                      |
| Y4 W8 (B close)  | 2364     | +27                      |
| Y4 W12 (C close) | 2386     | +22                      |
| Y4 W16 (D close) | 2425     | +39                      |
| Y4 W20 (E close) | 2463     | +38                      |
| Y4 W24 (F close) | 2512     | +49                      |
| Y4 W28 (G close) | 2538     | +26                      |
| **Y4 W30**       | **2561** | **+262 across 30 weeks** |

## What shipped — by sprint

| Sprint | Weeks   | Theme                     | Substrate                                                                                           |
| ------ | ------- | ------------------------- | --------------------------------------------------------------------------------------------------- |
| A      | W1-W4   | LLM cost telemetry        | Aggregator + storage + hook + `/path/llm-spend` dashboard. `ANTHROPIC_API_KEY` flips real-mode.     |
| B      | W5-W8   | Charity ledger            | Charge aggregator + storage + hook + `/path/charity-spend` dashboard. `STRIPE_SECRET_KEY` flips.    |
| C      | W9-W12  | Postgres + R2             | Y4 Drizzle tables + data-source selector + R2 signed-URL contract. `DATABASE_URL` + 4 R2 vars flip. |
| D      | W13-W16 | iOS Capacitor + push keys | Platform detector + push key registry (VAPID/APNs/FCM) + haptics + camera permission helpers.       |
| E      | W17-W20 | Android + device tokens   | Per-device token ledger + adaptive-icon manifest + device-info reporter (privacy-respecting).       |
| F      | W21-W24 | Push delivery pipeline    | Schedule planner + delivery-log aggregator + quiet-hours + opt-out gate.                            |
| G      | W25-W28 | V3 trainer retune         | Feedback log + cohort retune proposal + drift evaluator.                                            |
| H      | W29-W30 | Editorial (first half)    | Clinician credit + publication queue + content tab swap layer.                                      |

## Founder-key contract (status at Y4 W30)

Every founder-gated substrate from the Y3 retro now has its complete autonomous-prep layer in place. The wire-up at flip time is one config edit:

| Slot                       | Founder action                            | Status at Y4 W30 |
| -------------------------- | ----------------------------------------- | ---------------- |
| Anthropic LLM (5 surfaces) | `ANTHROPIC_API_KEY`                       | Substrate ready  |
| Stripe charity charges     | `STRIPE_SECRET_KEY` + verified nonprofits | Substrate ready  |
| Postgres                   | `DATABASE_URL` + `pnpm db:push`           | Substrate ready  |
| R2 photo storage           | 4 R2 env vars                             | Substrate ready  |
| iOS distribution           | Apple Developer + Xcode + TestFlight      | Substrate ready  |
| Android distribution       | Google Play Console                       | Substrate ready  |
| APNs                       | Team ID + Key ID + .p8 file               | Substrate ready  |
| VAPID                      | Public + private VAPID keys               | Substrate ready  |
| FCM                        | FCM server key                            | Substrate ready  |
| V3 cohort retune           | 30+ cooks-with-feedback cohort data       | Substrate ready  |
| Editorial content          | Clinician sign-off + permission letters   | Substrate ready  |

Eleven flips, all gated on founder action. Code is in place.

## RCAs on main: zero

**Full Y4 W1-W30: 0 RCAs.** Combined Y2+Y3+Y4 streak now ~125 weeks at this cut.

One mid-stream recovery during W23 — an external commit (`166129b` "Round 3 optimization") landed truncated on main. Caught on rebase, fixed in one commit (4 files restored from prior version + 3 new components reduced-motion-gated). Streak unbroken; the four-gate process and rebase audit caught the breakage immediately.

## Why this is a partial close

The Y4 plan called for 12 sprints across 52 weeks. The 30-week run delivered the 8 highest-leverage sprints — every founder-key flip + the V3 trainer retune cycle. The remaining weeks (Editorial back-half + bilingual + annual recap + creator economy) carry forward into Y5 alongside the cohort-phase work that the founder-key flips unlock.

The pragmatic frame: Y4 W1-W30 closes the **infrastructure phase**. Y5 opens the **cohort phase** — when real users start flowing data through the substrate.

## What's next — Y5

Filed at `docs/YEAR-5-VIBECODE-PLAN.md`. Y5 is the cohort-data phase: V4 trainer with real cohort data, retention analytics, cohort segmentation, real editorial published, bilingual translation, annual recap surfaces.

## In one paragraph

Y4's first 30 weeks shipped every founder-key substrate. **2561 tests. 0 RCAs across 30 weeks. ~125-week zero-RCA streak combined.** Eleven flips ready, all gated on the founder providing keys / accounts / sign-off. The remaining Y4 weeks defer into Y5 alongside the cohort work that the flips unlock.
