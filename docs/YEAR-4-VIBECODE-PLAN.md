# Year-4 Vibecode Plan — Sous (Reach Phase)

> **Filed:** 2026-05-03 (Y3 W51).
> **Coverage:** Y4 W1-W52, twelve sprints + close week.
> **Status at filing:** ~2310 passing tests, 0 RCAs on main
> across ~95 weeks (full Y2+Y3), 11+ stub-mode-V1 substrates
> ready for one-config-edit swap.
> **Thesis:** Y2 was substrate. Y3 was polish. **Y4 is reach.**
> Six founder-key config edits light up 11+ Y2-Y3 substrates
> simultaneously. Native distribution opens the iOS + Android
> channels. Real editorial partnerships fill Stage-3 Content.
> Bilingual launch widens the audience. The polish + RCA
> discipline that defined Y3 carries unchanged.

---

## 0. Y3 → Y4 handoff (one paragraph)

Y3 closed with the substrate for Y4 in better shape than Y2 closed for Y3. Eleven founder-unlock substrates wait for six unique config edits (Clerk + Postgres + R2 + VAPID + Anthropic + Tavily + Stripe). Every Y2 + Y3 surface is polished + WCAG audited. The pantry-novelty MVPs (color-coded ingredients, photo pantry, novelty engine, smart leftovers, swipe planner) all ship as working stub-mode demos. Zero RCAs on main across the full Y2 + Y3 stretch. Y4 doesn't need to invent — it needs to wire + distribute + onboard.

## 1. Y4 thesis

**Real-mode wire-up days are the load-bearing piece.** When Stefan delivers any single env-var, a slate of features lights up simultaneously without engineering blocking. The Y4 sprint structure sequences founder-gated capabilities so each unlock day cascades cleanly.

Three priorities ranked:

1. **Wire-up days first.** Sprint A (Anthropic), Sprint B (Stripe), Sprint C (Postgres + R2) flip the substrates into real mode. Each is a single dedicated wire-up week.
2. **Native distribution second.** Sprint D (iOS) + Sprint E (Android) ship the Capacitor wrappers. Apple TestFlight + Play internal-track in the same window so review cycles overlap.
3. **Editorial + bilingual + V3 retune third.** Sprints F-I onboard real partnerships, hire translators, retune V3 against real-cohort data accumulated post-Postgres unlock.

The polish + recon discipline that defined Y3 continues unchanged. New surfaces inherit the W3 design tokens, W37 motion tokens, and the W30/W42/W43 state primitives.

## 2. Founder-unlock dependency map

Inheriting from Y3 close. Each Y4 sprint flips one or more keys.

| Sprint | Keys flipped                                        | Surfaces lit                                                                                                                                                    |
| ------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A      | `ANTHROPIC_API_KEY` (+ `TAVILY_API_KEY` for search) | 5 surfaces: voice conversation (Y2 W28), voice-to-draft (Y2 W31-W33), pod agentic pick (Y2 W35), viral search + extraction (Y2 W39+W41), pantry vision (Y3 W13) |
| B      | `STRIPE_SECRET_KEY` + verified nonprofits           | Charity bake-sale charges (Y2 W49); bake-sale events surface (Y4 J)                                                                                             |
| C      | `DATABASE_URL` + `pnpm db:push`                     | All 8 Y2 tables migrate; recipe-score breakdowns persist; user-recipes cross-device                                                                             |
| C      | 4 R2 env vars                                       | Pod gallery photos persist + cross-device                                                                                                                       |
| C      | VAPID keys                                          | OS-level push notifications (Y2 W20)                                                                                                                            |
| D      | Apple Developer account                             | iOS Capacitor wrap + TestFlight                                                                                                                                 |
| E      | Google Play Console                                 | Android Capacitor wrap + internal track                                                                                                                         |
| F      | APNs auth-key + FCM sender-id                       | Real OS push (replaces in-app toast stub)                                                                                                                       |
| G      | (data-driven, not config) — V3 retune               | Pairing engine V3 against real cohort breakdowns                                                                                                                |
| H      | Real clinician + creator partnerships               | Stage-3 Content tab editorial                                                                                                                                   |
| I      | Translator hires                                    | Spanish + Hindi launch                                                                                                                                          |
| J      | (no new keys — uses Stripe from B)                  | Bake-sale calendar events surface                                                                                                                               |
| K      | (no new keys)                                       | Skill-tree depth visualisation                                                                                                                                  |
| L      | (no new keys)                                       | Annual recap + creator economy substrate                                                                                                                        |

Six unique unlock days; eleven cascading surface lights.

## 3. Sprint structure

Twelve sprints + close week. Each sprint 4 weeks except where noted. No founder-gated work scheduled before its key is in hand — substrate stays in stub mode if the key slips.

| Sprint | Weeks   | Theme                                          |
| ------ | ------- | ---------------------------------------------- |
| A      | W1-W4   | LLM real-mode wire-up day (Anthropic + Tavily) |
| B      | W5-W8   | Stripe + bake-sale events                      |
| C      | W9-W12  | Postgres migration + R2 + VAPID                |
| D      | W13-W16 | iOS Capacitor wrapper + TestFlight             |
| E      | W17-W20 | Android Capacitor wrapper + Play Console       |
| F      | W21-W24 | APNs + FCM real push bridges                   |
| G      | W25-W28 | V3 trainer retune on real-cohort data          |
| H      | W29-W32 | Stage-3 Content editorial onboarding           |
| I      | W33-W36 | Bilingual UX (Spanish + Hindi)                 |
| J      | W37-W40 | Bake-sale events surface (depends on B)        |
| K      | W41-W44 | Recipe import V2 (any URL → draft)             |
| L      | W45-W48 | Annual recap + creator economy substrate       |
| —      | W49-W52 | Y4 close + Y5 plan kickoff                     |

---

## 4. Cross-cutting workstreams

### 4.1 Per-week 3-loop recursive testing (continuous)

Same as Y3 W1-W52. Every per-feature week ends with three loops:

- **Loop 1 — stress + edge.** Hostile inputs, viewport extremes (375×667 mandatory; 320×568 graceful), reduced-motion path, screen-reader path, slow-network simulation, empty-state path.
- **Loop 2 — RCA.** Anything caught in Loop 1 that wasn't already covered becomes an RCA — root cause + fix in the SAME commit.
- **Loop 3 — improvement.** One ergonomic / readability / a11y win adjacent to the week's work.

Y4 close target: **0 RCAs on main across the full year** — extending the streak from ~95 to ~147 weeks.

### 4.2 Critical-appraise → plan → build → improve cycle (every week)

Documented per-week below. Same cadence as Y3.

### 4.3 Per-feature screenshot flow

Each MVP feature week ends with screenshots saved to `docs/screenshots/<feature>/`. Six PNGs per feature: cold / mid / win / empty / error / reduced-motion (+ dark-mode once the toggle ships).

### 4.4 Bi-weekly IDEO reviews (24 across Y4)

Same cadence as Y3. Filed under `docs/y4/ideos/`.

### 4.5 UX-recon discipline (continuous)

12-pattern library carries forward. Y4 specific targets:

| Sprint | Pattern target                                       |
| ------ | ---------------------------------------------------- |
| A      | (wire-up — no new patterns)                          |
| B      | Pattern #5 servings stepper (deferred from Y3)       |
| C      | (infra — no new patterns)                            |
| D      | iOS-specific affordances (back-gesture, safe-area)   |
| E      | Android-specific affordances (back-button, NFC stub) |
| F      | (infra)                                              |
| G      | Made-it ring extensions (recipe detail, household)   |
| H      | Author profile cards (Stage-3 Content)               |
| I      | i18n string-length resilience across surfaces        |
| J      | Calendar event surface                               |
| K      | URL-import preview + attribution overlay             |
| L      | Annual recap "your year in cooking" surface          |

### 4.6 Daily four-gate (continuous)

`pnpm lint` + `pnpm exec tsc --noEmit` + `pnpm test` + `pnpm build` green at every commit.

### 4.7 Stanford content acquisition (continuous)

1-2 hours/week. Y4 cadence unchanged.

### 4.8 Library-research refresh (quarterly)

Y4 W13 / W26 / W39 / W52.

---

## 5. Sprint A (W1-W4) — LLM real-mode wire-up

> When `ANTHROPIC_API_KEY` lands, five Y2-Y3 surfaces light up
> simultaneously. Sprint A is the validation + cost-monitoring
> sprint that confirms each surface fires correctly + the
> spend stays bounded.

### W1 — Voice conversation real-mode end-to-end

- **Appraise:** Y2 W28 stub mode runs end-to-end today. Real mode swaps `STUB_FALLBACK_MESSAGE` for actual Anthropic call. Need to confirm bounded prompt + off-list rejection + 200-char cap fire correctly against real responses.
- **Plan:** Run scripted voice queries against the real API; verify response shape; confirm rejection paths work (test with a query that asks about an off-list ingredient).
- **Build:** No code change to the engine — it's already wired. Sprint A is testing + monitoring.
- **Loop 1:** Edge cases — empty steps, very long steps, ambiguous queries.
- **Loop 2:** Any spec violation → fix in same commit.
- **Loop 3:** Cost dashboard surface (`/api/_internal/anthropic-spend`) — daily total across the 5 LLM-backed surfaces.
- **Screenshot flow:** voice query mid-session → response → fallback path.

### W2 — Voice-to-draft + pod agentic pick + viral search end-to-end

- Three Y2 substrates lit by the same key. One day per substrate validation.
- Tests: 24 across the three substrates.

### W3 — Pantry vision detection real-mode

- Y3 W13 stub fixture replaced by real Anthropic vision call. Confirm structured-output schema parses; confidence threshold tunes against real photos.
- Tests: 18.

### W4 — Sprint A close + IDEO #1 + cost dashboard

- Cumulative tests: ~2310 + 24 + 18 + 12 = **~2364**.

---

## 6. Sprint B (W5-W8) — Stripe + bake-sale events

### W5 — Stripe charge real-mode

- Y2 W49 stub mode flips to live charges. Verify webhook handler + idempotency-key reattempt + refund path.
- Tests: 18.

### W6 — Verified-nonprofit data review

- Stefan's curation pass — replace 12 placeholder entries with real EIN-verified nonprofits.
- Tests: 8 (catalog integrity).

### W7 — Bake-sale event substrate

- Y4 J builds the calendar event surface; W7 ships the schema.
- Tests: 14.

### W8 — Sprint B close + IDEO #2

- Cumulative: **~2400**.

---

## 7. Sprint C (W9-W12) — Postgres + R2 + VAPID

### W9 — Postgres migration day

- `pnpm db:push` against a real Neon DB. All 8 Y2 tables migrate. Boot-time validator confirms every Drizzle table parses.
- Tests: 14.

### W10 — Schema parity sweep

- Verify every client-side Zod schema matches its server-side Drizzle counterpart at runtime.
- Tests: 18.

### W11 — R2 + VAPID wire-up day

- 4 R2 env vars + VAPID keys flip the photo + push substrates. Pod gallery photos persist cross-device; OS-level push fires (in-app toast stub fades).
- Tests: 12.

### W12 — Sprint C close + IDEO #3

- Cumulative: **~2444**.

---

## 8. Sprint D (W13-W16) — iOS Capacitor

### W13 — Capacitor scaffolding

- `pnpm add @capacitor/core @capacitor/cli @capacitor/ios`.
- Verify Next build wraps cleanly (or pivot to per-platform config tweaks).

### W14 — iOS-specific affordances

- Safe-area insets, native back-gesture, haptic feedback hooks.

### W15 — Apple Developer + TestFlight

- Provisioning profile + first internal build.

### W16 — Sprint D close + IDEO #4

---

## 9. Sprint E (W17-W20) — Android Capacitor

### W17 — Android scaffolding

- `pnpm add @capacitor/android`.

### W18 — Android-specific affordances

- Back-button handling, NFC stub for tap-to-share recipes.

### W19 — Play Console + signing key

- First internal-track build.

### W20 — Sprint E close + IDEO #5 + Y4 H1 retro

---

## 10. Sprint F (W21-W24) — APNs + FCM real push

### W21 — APNs auth-key wire-up

- iOS push: device-token registration + APNs delivery.

### W22 — FCM sender-id wire-up

- Android push: same shape, FCM bridge.

### W23 — Real-push integration tests

- W21 scheduler now fires real OS notifications.

### W24 — Sprint F close + IDEO #6

---

## 11. Sprint G (W25-W28) — V3 trainer retune

### W25 — Real-cohort eval

- `runV3Eval` against accumulated user breakdowns from W12-W24.
- Compare against the Y2 W9 synthetic baseline (V3 was -4.5pp).

### W26 — Hyperparameter tune

- Adjust `V3_MAX_DELTA`, `V3_NOISE_FLOOR`, `V3_COLD_START_THRESHOLD` based on real-cohort variance.

### W27 — Flag flip preparation

- Prepare `SOUS_V3_TRAINER_ENABLED="true"` flip for staging A/B.

### W28 — Sprint G close + IDEO #7

---

## 12. Sprint H (W29-W32) — Stage-3 Content editorial

### W29 — Author + verified-credential schema

- `Author` (clinicianTitle, affiliation, license # — schema only; founder onboards real partners).

### W30 — Per-author content listing

- `/community/author/[id]` lists all content by author with verification badge.

### W31 — Editorial workflow tooling

- Founder-only admin surface for staging + publishing editorial content.

### W32 — Sprint H close + IDEO #8

---

## 13. Sprint I (W33-W36) — Bilingual UX

### W33 — i18n substrate

- `src/lib/i18n/dictionary.ts` keyed by (locale, key) → translated string. Translation key extraction sweep across existing UI strings.

### W34 — Spanish translation

- ~600 strings translated (founder-unlock: real translator hire).

### W35 — Hindi translation

- ~600 strings translated.

### W36 — Sprint I close + IDEO #9

---

## 14. Sprint J (W37-W40) — Bake-sale events surface

### W37 — Calendar event affordance

- Pod admin schedules a bake-sale (date + time + location).

### W38 — Reminder notifications

- Push at -7d / -1d / day-of (uses W21+ APNs/FCM bridges).

### W39 — Post-event reflection card persistence

- Y2 W51 substrate's `formatReflectionCard` writes to Postgres-backed pod history.

### W40 — Sprint J close + IDEO #10

---

## 15. Sprint K (W41-W44) — Recipe import V2

### W41 — Universal-URL extractor

- Real-mode Anthropic call against any URL → RecipeDraft.

### W42 — Attribution + ethics gate

- Same shape as Y2 W42 — source URL + creator credit + "View original" affordance always required.

### W43 — Import surface

- `/path/recipes/import` — paste URL, see preview, confirm + save.

### W44 — Sprint K close + IDEO #11

---

## 16. Sprint L (W45-W48) — Annual recap + creator economy

### W45 — "Your 2027 in cooking" recap

- Year-end Spotify-Wrapped-shaped recap: cuisines tried, favourite cook, hours in the kitchen, charity raised, identity reveal from the Y2 behavioural overlays.

### W46 — Creator economy substrate

- Schema for verified creators + their published recipes. Stripe Connect platform → creator subscription tiers.

### W47 — Creator profile surface

- Each creator gets a public profile page surfacing their recipes + bio.

### W48 — Sprint L close + IDEO #12

---

## 17. W49-W52 — Year-4 close

- W49 — Final integration smoke + screenshot regression.
- W50 — Y4 retrospective (`docs/YEAR-4-RETROSPECTIVE.md`).
- W51 — Y5 plan kickoff (`docs/YEAR-5-VIBECODE-PLAN.md`).
- W52 — Year-4 close commit.

**Test target:** ≥ 2700 by Y4 close. Y3 closed at ~2310; Y4 adds ~400 across the year.

---

## 18. What this plan deliberately does NOT cover

- **Real-time multiplayer cook flow** — Y5+.
- **Image-generation pipeline integration** — separate workstream per CLAUDE.md rule 7.
- **Hardware integrations** (smart kitchen scales, sous-vide controllers) — Y5+.
- **Offline-first cook mode** — partial via service worker but not a Y4 priority.

---

## 19. Acceptance for the Y4 plan

- [x] Y3 → Y4 handoff documented.
- [x] Y4 thesis stated.
- [x] Founder-unlock map enumerated.
- [x] 12 sprints + close week scoped.
- [x] Each sprint has at least one IDEO + per-week appraise/plan/build/loop cycle.
- [x] Out-of-scope explicitly listed.

---

## 20. The single sentence

**Y4 is the reach phase: turn the keys, ship native, onboard editorial, retune the engine on real-cohort data — keeping the polish + RCA discipline that worked across Y2 and Y3.**
