# Year-5 Vibecode Plan — Sous

> **Filed:** 2026-11-29 · **Updated:** 2026-05-04 (intelligence-layer pivot).
> **Period covered:** Y5 W1-W52.
> **Theme:** **Intelligence + cohort phase.** Y4 shipped every founder-key substrate; Y5 turns implicit user signals (swipes, cooks, time-of-day) into an _editable_ preference profile that drives every recommendation surface. An agentic recipe agent fills the long tail with clearly-labeled Unverified results. End-of-year ships an "Eat Out" agentic dish-first venue surface. Non-vibe-codeable work (translator hires, clinician editorial workstream, real Yelp/Google Places API, real-cohort weight tuning) pushes to Y7 — Y6 already has Y4 founder-flips + creator-economy V1.

## Single-sentence framing

Y5 turns Sous into a personalised app: every swipe builds a profile the user owns and can edit; an agentic fallback handles cravings the catalog can't; an "Eat Out" mode brings the same intelligence to dining-out moments.

## Founder-key contract carrying in (unchanged from prior Y5 plan)

The 11 founder-flip substrates from Y4 W30 still need their actual founder action to light up. None are blockers for Y5 weeks — every Y5 sprint is **AUTO-BUILD** on its own.

## Sprint structure (12 sprints × 4 weeks + 4 polish weeks)

| Sprint | Weeks       | Theme                               | Output                                                                                                                                                                                                                                                                         | Status         |
| ------ | ----------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| A      | W1-W4       | Cohort segmentation                 | Pure helper for cohort buckets (acquisition × engagement) + dashboard summary.                                                                                                                                                                                                 | ✓ Shipped      |
| B      | W5-W8       | V4 trainer (cohort + temporal)      | Time-windowed cohort retune; recency weighting; per-segment weight vectors.                                                                                                                                                                                                    | ✓ Shipped (W5) |
| **C**  | **W9-W12**  | **Intelligence-layer foundation**   | **PreferenceProfile + signal aggregator + time-of-day classifier + manual-merge + Verified/Unverified taxonomy. (✓ substrate landed; UI wire-up next.)**                                                                                                                       | Substrate ✓    |
| **D**  | **W13-W16** | **Profile editor UI**               | **Profile sheet `Preferences` section · cuisine/flavor/dislike chips · "Where this came from" detail · suppress + reset flows.**                                                                                                                                               | New            |
| **E**  | **W17-W20** | **Agentic recipe search**           | **"Send agent" CTA on empty craving search · Anthropic+Tavily wrapper · Unverified recipe cards · separate-shelf surfacing in search.**                                                                                                                                        | New            |
| F      | W21-W24     | Annual recap surface                | "Your year of cooking" Spotify-Wrapped-style recap generator.                                                                                                                                                                                                                  | Kept           |
| G      | W25-W28     | Pod challenges 2.0                  | Cohort-aware pod matching · weekly theme rotation · cross-pod leaderboard.                                                                                                                                                                                                     | Kept           |
| H      | W29-W32     | Retention analytics                 | D7/D30 retention aggregator + cohort retention curves.                                                                                                                                                                                                                         | Kept (was C)   |
| I      | W33-W36     | Cohort-data dashboard polish        | Roll up the 5 internal-monitoring dashboards into one `/path/internal` surface with auth gate.                                                                                                                                                                                 | Kept (was K)   |
| **J**  | **W37-W40** | **Eat Out agentic mode**            | **`/eat-out` route · Michelin-Guide dish-first card stack · venue-reveal swipe · agent search wrapper · stub-mode venue fixtures.**                                                                                                                                            | New            |
| **N**  | **W41-W44** | **Cuisine Compass map game**        | **GeoGuessr-grade daily dish-pinning game · MapLibre custom-style world map · drag-and-drop pin · 5000-pt distance+time scoring · Wordle-style emoji share grid · pod-vs-pod leaderboard · 50-dish curated dataset (substrate + UI). See `CUISINE-COMPASS-MAP-GAME-PLAN.md`.** | New            |
| K      | W45-W48     | Performance + bundle audit (Y5 cut) | Same shape as Y3 W45-W48; measure impact of Y4-Y5 substrate adds on bundle.                                                                                                                                                                                                    | Kept (was L)   |
| L      | W49-W50     | Intelligence-layer real-mode polish | Once cohort data flows: confidence-threshold tuning, edge-case copy, profile-editor UX iteration. (Compressed to 2 weeks to make room for Sprint N.)                                                                                                                           | New            |
| M      | W51-W52     | Year close + Y6 plan                | Y5 retro + Y6 plan + final 4-gate. (Compressed to 2 weeks; Y5 close is a doc + final 4-gate, no new substrate needed.)                                                                                                                                                         | Kept           |

## What pushed to Y7

The following sprints from the _prior_ Y5 plan are non-vibe-codeable on their own — they require external workstreams (human translators, clinician hires, real-cohort production data, third-party API agreements). They move to **`docs/YEAR-7-VIBECODE-PLAN.md`** so Y5 stays AUTO-BUILD throughout:

| Pushed-out item                  | Reason                                                   | Y7 sprint |
| -------------------------------- | -------------------------------------------------------- | --------- |
| Bilingual launch                 | Needs real translator engagement; can't ship without     | Y7 D-F    |
| Editorial real content           | Needs Stanford clinician outreach + permission letters   | Y7 A-C    |
| Pantry vision real-mode tuning   | Needs cohort data + ANTHROPIC_API_KEY production traffic | Y7 G-H    |
| Push notification quality tuning | Needs real production push delivery data                 | Y7 I      |
| Creator economy V1 launch        | Needs Stripe Connect + creator outreach                  | Y7 J-L    |
| Real Yelp/Google Places          | Eat Out wires to fixtures in Y5; real APIs in Y7         | Y7 K      |

This keeps Y6 free for the founder-key flips themselves (Y4 unlocks land in Y6 production) and **Y7 becomes the human-workstream year**.

## AUTO-BUILD sequencing

Every Y5 week ships a pure substrate that's testable + four-gates-green without needing the upstream founder key:

- **Sprint A (cohort segmentation)** — pure helper composition over the existing cook session log; ships in stub mode against synthetic data; flips to real cohort once Postgres is live.
- **Sprint B (V4 trainer)** — consumes the W25 feedback log + adds time windowing; the actual cohort retune runs founder-gated; the math is autonomously testable.
- **Sprint C (intelligence layer foundation)** — PreferenceProfile + signal aggregator + time-of-day classifier + manual-merge are pure helpers + Zod schema. Land before the editor UI consumes them. **Substrate shipped this commit.**
- **Sprint D (profile editor UI)** — surfaces the inferred + manual tags in the existing Profile & Settings sheet. New `Preferences` section. No backend dependency.
- **Sprint E (agentic recipe search)** — wraps the existing Y2 W3 `autogen-provider.ts` for recipe lookups. Stub mode V1 returns canned fixtures; real-mode-flips on `ANTHROPIC_API_KEY`. Unverified taxonomy + filter UI is pure presentation.
- **Sprint F (annual recap)** — pure renderer over cook session log + V3 ScoreBreakdown.
- **Sprint G (pod challenges 2.0)** — layers on the existing Y2 W14-W18 pod infrastructure with cohort-aware matching.
- **Sprint H (retention analytics)** — pure aggregator over `cook_sessions`. Stub fixtures drive tests.
- **Sprint I (cohort dashboard polish)** — UI roll-up of existing per-substrate dashboards (Y4 W3 + W7 + W17 + W22 + W27).
- **Sprint J (Eat Out)** — substrate is intelligence-layer-driven dish ranking + venue card stack. Real Yelp/Google Places API is **Y7 K**; Y5 J ships fixtures + the agent wrapper.
- **Sprint K (performance audit)** — same shape as Y3 W45-W48; measures the bundle-cost of Y4+Y5 substrate adds.
- **Sprint L (intelligence-layer polish)** — once cohort data flows, threshold-tune the confidence levels, refine cold-start copy, iterate on the editor UX.

## RCA discipline

Same load-bearing rules from Y2-Y4 carry forward:

- 4-gate green before every commit (lint + typecheck + test + build).
- 3-loop testing protocol per week (the protocol the Y4 W30 + 2026-05-04 sweeps demonstrated).
- Substrate-first (pure helpers + storage + hooks before UI).
- W15 RCA pattern (freshDefault factory + schema-version + partial-recovery parser) on every new localStorage hook.
- Stub-mode V1 + real-mode flip on one config edit.
- Audit-by-construction WCAG (every empty/loading/error state through the W30/W42/W43 primitives).

The streak target: **0 RCAs across Y2+Y3+Y4+Y5 = ~177 weeks at Y5 close.**

## Behavioural overlay

The 9 overlays carry forward unchanged. Y5 introduces no new manipulation patterns. The intelligence layer is observation-driven (passive signals → editable profile) and explicitly user-controlled (manual tags override the ML).

## Bi-weekly IDEO #s

Y5 IDEOs continue the running counter from Y4. Y5 W1+W2 = #15. Y5 close at #40.

## What success looks like at Y5 W52

- 2700+ passing tests (continuing the +250-300/year rhythm).
- 0 RCAs on main across the full year.
- PreferenceProfile substrate flowing signals into recommendations across QuestCard + ResultStack + search + Eat Out.
- Profile editor available; users can read and edit their inferred tags.
- Time-of-day patterns visible in the profile editor for users with 5+ signals per bucket.
- Verified vs Unverified taxonomy clearly separated in the search UI.
- Agentic recipe fallback shipping as substrate; real-mode-flips on `ANTHROPIC_API_KEY`.
- Eat Out mode shipping as substrate with 8-dish fixture stack; real-mode-flips on Yelp/Google Places API (Y7 K).
- Cohort data flowing through V4 trainer with retention curves visible in the internal dashboard.
- Annual recap shipped + tested as a pure renderer.

## In one sentence

Y5 = intelligence + cohort phase: every swipe builds a profile the user owns; an agentic fallback handles the long tail; an "Eat Out" mode extends the same intelligence to dining-out moments — all vibe-codeable today, with the human-workstream items pushed to Y7.
