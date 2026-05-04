# Year-5 Vibecode Plan — Sous

> **Filed:** 2026-11-29 (alongside `YEAR-4-PROGRESS-NOTE.md`).
> **Period covered:** Y5 W1-W52.
> **Theme:** **Cohort phase.** Y4 shipped every founder-key substrate; Y5 is when real users flow data through it. V4 trainer with cohort data. Retention analytics. Bilingual launch. Editorial-real swap. Annual recap surfaces. Creator economy stub. Sprint M close.

## Single-sentence framing

Year-5 takes Sous from "founder-key substrate ready" to "real cohort data flowing — V4 trainer retuned from real cooks, retention analytics surfaced, bilingual launch, editorial swapped to real Stanford-attributed content, creator-economy stub V1."

## Founder-key contract carrying in

The 11 founder-flip substrates from Y4 W30 still need their actual founder action to light up. None are blockers for Y5 weeks — every Y5 sprint is **AUTO-BUILD** on its own and lands working substrate that real-mode-flips when the upstream key arrives. No Y5 week is gated on a Y4 founder flip.

## Sprint structure (12 sprints × 4 weeks + 4 polish weeks)

| Sprint | Weeks   | Theme                               | Output                                                                                         |
| ------ | ------- | ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| A      | W1-W4   | Cohort segmentation substrate       | Pure helper for cohort buckets (acquisition cohort × engagement tier) + dashboard.             |
| B      | W5-W8   | V4 trainer (cohort + temporal)      | Time-windowed cohort retune; recency weighting; per-segment weight vectors.                    |
| C      | W9-W12  | Retention analytics                 | D7/D30 retention aggregator + cohort retention curves.                                         |
| D      | W13-W16 | Bilingual translation substrate     | i18n message catalog scaffold + per-locale rendering tests + translator-handoff format.        |
| E      | W17-W20 | Editorial real-content swap         | Y4 W30 queue resolver wires up to real Stanford content; mode flip from preview → production.  |
| F      | W21-W24 | Annual recap surface                | "Your year of cooking" Spotify-Wrapped-style recap generator.                                  |
| G      | W25-W28 | Creator economy stub V1             | Recipe attribution + revenue-share contract; per-creator dashboard substrate.                  |
| H      | W29-W32 | Pod challenges-2.0                  | Cohort-aware pod matching; weekly theme rotation; cross-pod leaderboard.                       |
| I      | W33-W36 | Pantry vision real-mode polish      | Once `ANTHROPIC_API_KEY` flips: confidence threshold tuning + correction UI from real misses.  |
| J      | W37-W40 | Push notification quality           | Once VAPID/APNs/FCM flip: A/B test scheduling windows; quiet-hours adoption rate; CTR tuning.  |
| K      | W41-W44 | Cohort-data dashboard polish        | Roll up the 5 internal-monitoring dashboards into one `/path/internal` surface with auth gate. |
| L      | W45-W48 | Performance + bundle audit (Y5 cut) | Same shape as Y3 W45-W48; measure impact of Y4-Y5 substrate adds on bundle.                    |
| M      | W49-W52 | Year close + Y6 plan                | Y5 retro + Y6 plan + final 4-gate.                                                             |

## AUTO-BUILD sequencing

Every Y5 week ships a pure substrate that's testable + four-gates-green without needing the upstream founder key:

- **Cohort segmentation** is a pure-helper composition over the existing cook session log. Ships in stub mode against synthetic data; flips to real cohort once Postgres is live.
- **V4 trainer** consumes the W25 feedback log + adds time windowing. The actual cohort retune runs founder-gated; the math is autonomously testable.
- **Retention analytics** aggregates over `cook_sessions`. Stub data drives the test fixtures.
- **Bilingual** ships the message-catalog scaffolding + per-locale rendering tests. Translator engagement is FOUNDER-GATED but the framework lands first.
- **Editorial swap** uses the Y4 W30 queue resolver's mode flag. Substrate is in place; switching from `mode: "preview"` to `"production"` is a one-line change once content lands.
- **Annual recap** generates from the cook session log + V3 ScoreBreakdown persistence. Pure rendering pipeline.
- **Creator economy** is a Zod schema + revenue-share contract + per-creator metrics aggregator. Real payouts are founder-gated on Stripe Connect onboarding.
- **Pod challenges 2.0** layers on the existing Y2 W14-W18 pod infrastructure with cohort-aware matching.
- **Pantry vision polish + push polish** are the only two sprints whose meaningful work depends on the founder-keys being live in production. They ship as "substrate ready for tuning" with synthetic data drivers.
- **Cohort dashboard** rolls up the 5 internal-monitoring surfaces (Y4 W3 + W7 + W17 + W22 + W27) under one auth-gated `/path/internal` route.

## RCA discipline

Same load-bearing rules from Y2-Y4 carry forward:

- 4-gate green before every commit (lint + typecheck + test + build).
- 3-loop testing protocol per week.
- Substrate-first (pure helpers + storage + hooks before UI).
- W15 RCA pattern (freshDefault factory + schema-version + partial-recovery parser) on every new localStorage hook.
- Stub-mode V1 + real-mode flip on one config edit.
- Audit-by-construction WCAG (every empty/loading/error state through the W30/W42/W43 primitives).

The streak target: **0 RCAs across Y2+Y3+Y4+Y5 = ~177 weeks at Y5 close.**

## Behavioural overlay

The 9 overlays carry forward unchanged. Y5 introduces no new manipulation patterns; cohort phase is observation, not behavioural engineering.

## Bi-weekly IDEO #s

Y5 IDEOs continue the running counter from Y4 (#14 was W27+W28). Y5 W1+W2 = #15. Y5 close at #40.

## What success looks like at Y5 W52

- 2700+ passing tests (continuing the +250-300/year rhythm).
- 0 RCAs on main across the full year.
- Real cohort data flowing through V4 trainer.
- Retention curves visible in the internal dashboard.
- Editorial content swapped to real Stanford-attributed entries.
- Bilingual scaffold tested across 2+ locales.
- Annual recap shipped + tested as a pure renderer.
- Substrate complete for creator economy V2 wire-up in Y6.

## In one sentence

Y5 = cohort phase: Y4 lit the substrate, Y5 measures + tunes from the data the substrate captures.
