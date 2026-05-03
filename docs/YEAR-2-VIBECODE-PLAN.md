# Sous — Year 2 Vibecode Autonomous Plan

> **Period:** Year-2 W1-W52 (post Year-1 close)
> **Plan-ref status:** Draft v1, locked 2026-05-02 per Stefan's
> 12-feature shortlist + minimalist-integration directive +
> NOOM/behavioural-science workstream + bi-weekly IDEO cadence.
> **Predecessor:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md`
> (Year-1, Stage 5-7).

---

## 0. Year-1 → Year-2 handoff (1 paragraph)

Year-1 closed with **1046 tests on main**, all four gates green,
27/29 surfaces ≥ 4.0, the recipe-authoring loop end-to-end live
(author → fork → quick-add autogen → community submit → admin
verify → cook → win), the household-memory loop dietary-aware
(picker → aggregator → engine filter), the voice-cook arc V1
complete (navigation + step playback + full timer control), and
the Cooking Pod Challenge MVP (Stefan-pivoted to a score-based
mechanic with consistency multiplier + 2/day cap). Year-2 doesn't
add new top-level surfaces; it deepens the intelligence layer,
extends the agentic surface (autogen, viral discovery,
conversational voice), and threads behavioural-science overlays
through every sprint. The Year-2 thesis stays the same: every
feature must make the user **cook tonight more reliably**, not
make the app feel bigger.

---

## 1. Year-2 thesis

Three compounding layers, in order of leverage:

1. **Intelligence depth.** V3 trainer with per-dimension scores +
   time/season/pantry rerankers turn Year-1's coarse weight vector
   into a personalised cooking intelligence. The recommendations
   the user sees by Y2 W26 should be measurably sharper than the
   Year-1 baseline.
2. **Agentic discovery + creation.** Viral-recipe agent +
   voice-driven authoring + LLM-pick pod challenges close the gap
   between "I saw something and want to cook it" and "I'm cooking
   it tonight". Friction asymmetry: the _good_ path (cook the
   thing) is the one-tap path; the _bad_ path (passive scroll)
   takes effort.
3. **Behavioural-science substrate.** NOOM-style implementation
   intentions, identity reinforcement, streak forgiveness, tiny
   goals — distributed across sprints rather than a single
   feature. Each sprint plants 1-2 behavioural overlays in
   existing surfaces, no new tabs.

---

## 2. Founder-unlock dependencies (act on these in parallel)

Year-2 features that depend on a real account / API key. The
substrate ships first (stub-mode V1), surface lights up when the
founder configures the key. Per CLAUDE.md rule 12 (autonomous
agents can only build what's vibe-codable), this list is the
explicit contract for what Stefan-the-human owns.

| Sprint | Feature                         | Founder-unlock dep                  | Substrate-V1 fallback              |
| ------ | ------------------------------- | ----------------------------------- | ---------------------------------- |
| A      | Auth + multi-device pods        | Clerk                               | localStorage single-pod-per-device |
| A      | Photo storage                   | Cloudflare R2                       | data-URI placeholder strings       |
| A      | Cross-device recipe sharing     | Neon Postgres                       | localStorage-only                  |
| E      | Smart-notification push         | Web Push VAPID + service worker     | in-app-only nudges                 |
| F      | Real autogen LLM call           | Anthropic API key (Y1 W50 contract) | deterministic stub response        |
| I      | Pod V2 agentic recipe pick      | Anthropic API key                   | deterministic rotation picker      |
| J      | Agentic viral recipe search     | Tavily / Brave Search + Anthropic   | curated seed-only suggestions      |
| L      | Charity Stripe + nonprofit list | Stripe Connect + curated 501c3 list | honour-system tracking             |

Each Y2 sprint that's founder-gated ships behind a runtime flag:
key configured → real call; key absent → stub. Tests cover both
modes.

---

## 3. Cross-cutting workstreams

### 3.1 Behavioural-science overlay (continuous)

Six NOOM-inspired patterns distributed across sprints, each
landing as a small minimalist integration into an existing
surface (no new tabs).

| Pattern                   | NOOM concept                  | Sprint landed           | Integration surface                                                    |
| ------------------------- | ----------------------------- | ----------------------- | ---------------------------------------------------------------------- |
| Implementation intentions | "When X happens, I'll do Y"   | E (rhythm)              | Sunday-night `/today` chip: "I commit to cooking 3 times this week"    |
| Identity reinforcement    | "I'm someone who…"            | E (rhythm) + I (Pod V2) | `/path` 14-week badge ("Tuesday-night cook"), pod gallery title        |
| Streak forgiveness        | Avoid loss aversion           | E (rhythm)              | Missed-typical-day notification: "no rush — you'll catch the next one" |
| Tiny goals                | Atomic week-sized commitments | I (Pod V2)              | Weekly twist: "try a new spice" / "plate it differently"               |
| Reflection journaling     | Weekly recap                  | G (conversational)      | End-of-week voice prompt: "what was your favourite cook?"              |
| Anchoring / peak-end      | Show personal best            | F (Voice MVP 5)         | Win-screen confetti uses your highest-ever cook score as anchor        |

Each behavioural overlay is **scoped to its sprint** and
documented in the sprint's per-week breakdown. None gets its own
sprint — they're enhancement layers, not standalone features.

### 3.2 Per-week 3-loop recursive testing (continuous)

Year-1's protocol carries forward. Every per-feature week ends
with three explicit loops:

- **Loop 1 (stress test):** generate hostile inputs, assert the
  helpers don't drop sane data, persist regression cases as
  test fixtures.
- **Loop 2 (RCA):** if any Loop-1 stress caught a real bug,
  document the root cause + the new test pinning it; update
  affected adjacent code in the same commit.
- **Loop 3 (improvement):** identify one ergonomic / readability
  / perf / a11y improvement adjacent to the week's work and
  ship it.

Each per-week CLOSE doc records all three loops explicitly
(Y1 pattern). Sprint-close docs aggregate across 4-5 weeks.

### 3.3 Bi-weekly IDEO reviews (Stefan's 2026-05-02 directive)

Y1 ran one IDEO review per sprint close (5-week cadence). Y2
moves to **bi-weekly** — every 2 weeks. 26 IDEO reviews across
Y2. Each review:

- Checks no score-≥-4 surface regressed
- Logs RCAs across the 2-week window
- Assesses the behavioural overlay landed this fortnight
- Surfaces any minimalism / UI-clutter risk early
- 1-paragraph retro

Lighter-weight than sprint closes (they continue to fire at the
4-5 week sprint boundary as deeper retros).

### 3.4 Library-research refresh (quarterly)

Y1 W26 / W39 / W52 cadence carries forward — Y2 W13 / W26 / W39 /
W52. Re-run searches for any queued category in
`docs/LIBRARY-RECOMMENDATIONS.md` master pick table. Update
adoption decisions if new viral / well-starred libraries
emerge.

### 3.5 Stanford content acquisition (continuous)

Y1's 30-40-items-per-year cadence continues. 1-2 hours/week of
content discovery + distillation. 30+ new items across Y2.

### 3.6 Founder-unlock onboarding ramp (W1-W5)

Sprint A is dedicated; thereafter founder-unlock work runs as
a 1-2 hour/week background workstream as keys come online.

### 3.7 UX reconnaissance discipline (continuous, added 2026-05-03)

Stefan's W11 review flagged that several Y1 + early-Y2 surfaces
were functional but visually thin — "rudimentary" was the word.
Fix: every sprint ships at least **one surface upgrade rooted
in a documented observation** of how the leading food apps
(Serious Eats, Bon Appétit, NYT Cooking, HelloFresh, Mealime,
Tasty, Yummly, Whisk, etc.) solve the equivalent problem.

The full framework — pattern library + sprint-by-sprint mapping +
acceptance contract — lives in `docs/UX-RECON-FRAMEWORK.md`. The
12-pattern library covers: hero recipe card, eyebrow
categorisation, time-effort-trust meta strip, save-corner
heart, servings stepper, sticky compact header, step-by-step
locked progress, ingredient checklist, filter-chip row,
made-it ring, tap-and-hold quick-add, empty-state with concrete
preview.

**IP-clean rule**: patterns are described in our own words +
implemented as original Sous-branded code. Competitor screenshots
captured for analysis stay in local `/tmp` or
`docs/ux-recon/screenshots/.gitignore'd/` — they are never
committed to the public repo.

**Sprint acceptance contract** (mirrors the 4-gate test gate):

1. The sprint's IDEO doc names which pattern (#1-#12) was the
   upgrade target.
2. The implementation is original (Sous's own colours, copy,
   spacing — no lifted CSS/code).
3. The sprint surface scoreboard shows a real numeric jump on
   the upgraded surface in the IDEO doc's rubric.

Per-sprint targets (also tabulated in the framework doc):

| Sprint | Surface focus              | Pattern reference |
| ------ | -------------------------- | ----------------- |
| C      | Today result-stack         | #1 + #2 + #3 + #4 |
| D      | Pantry add-flow            | #11 + #12         |
| E      | Daily rhythm cards         | #6                |
| F      | Cook flow step-progress    | #7 + #8           |
| G      | Servings stepper           | #5                |
| H      | Recipe-author surfaces     | #2 + #5 + #6      |
| I      | Pod gallery + filter chips | #9 + #10          |
| J      | Search results page        | #2 + #9           |
| K      | Cuisine vocabulary cards   | #2 + #10          |
| L      | Bake-sale recipe cards     | #1 + #4           |

In addition to the per-sprint primary, each sprint can adopt
**one Y1 backfill** opportunistically (Today QuestCard, Path
skill tree consistency audit, Coach quiz visual weight, etc. —
listed in the framework doc).

---

## 4. Sprint structure overview

12 feature sprints + 1 founder-unlock sprint + W52 close. Each
sprint runs 4-5 weeks; bi-weekly IDEO firing at week 2 and
week 4 of each sprint, sprint close at week 4 or 5.

| Sprint | Weeks   | Feature(s)                                   | Behavioural overlay                                     |
| ------ | ------- | -------------------------------------------- | ------------------------------------------------------- |
| A      | W1-W5   | Founder-unlock substrate + Y1 follow-ons     | (none — infra)                                          |
| B      | W6-W10  | Pairing-engine V3 (per-dimension scores)     | (none — infra)                                          |
| C      | W11-W14 | Time/season reranker + Cook-again            | Anchoring (peak-end)                                    |
| D      | W15-W18 | Pantry-aware suggestions                     | Tiny goals (use what you have)                          |
| E      | W19-W22 | Daily rhythm + smart notifications           | Implementation intentions, streak forgiveness, identity |
| F      | W23-W26 | Voice MVP 5 sequenced pointers + Y2 H1 close | Anchoring (peak-end) on win screen                      |
| G      | W27-W30 | Voice conversational follow-ups              | Reflection journaling                                   |
| H      | W31-W34 | Voice-driven recipe authoring                | (none — feature)                                        |
| I      | W35-W38 | Pod V2 agentic recipe pick                   | Identity, tiny goals (weekly twist)                     |
| J      | W39-W43 | Agentic viral recipe search                  | (carefully — variable reward, not FOMO)                 |
| K      | W44-W47 | Per-cuisine vocabulary dictionary            | (none — content)                                        |
| L      | W48-W51 | Charity bake-sale tooling                    | Identity (badge: "Pod raised $X")                       |
| close  | W52     | Year-2 retrospective + Year-3 kickoff        | (n/a)                                                   |

---

## 5. Sprint A (W1-W5) — Founder-unlock substrate

> **Goal:** when Stefan's keys + accounts come online, integration
> is one config edit. Substrate ships during this sprint as a
> series of stubs + wiring contracts; the actual swap from
> stub → real happens as keys are configured (could be Sprint B,
> could be Sprint J).

### W1 — Auth substrate

- **Acceptance:** Clerk integration wired to a feature flag
  (`SOUS_AUTH_ENABLED=true|false`); flag-off returns the existing
  mock user; flag-on uses the real Clerk session. tRPC context
  reads the flag.
- **Files:** `src/lib/auth/auth-flag.ts` (pure read-flag helper)
  - `src/lib/auth/user-context.ts` (server-side context shim) +
    `src/lib/trpc/server.ts` (context wiring update).
- **Tests:** 8 — flag on/off, context resolution, mock-user
  fallback, no-leak invariants.
- **Loop 3:** convert the existing `mockUser` constants to typed
  shapes + document migration paths.
- **Founder-unlock:** Clerk publishable + secret keys; setup
  documented in `docs/FOUNDER-UNLOCK-RUNBOOK.md`.

### W2 — Postgres substrate

- **Drizzle schema additions:** `users`, `pods`, `pod_members`,
  `pod_submissions`, `pod_challenge_weeks`, `user_recipes`,
  `recipe_score_breakdowns` (W6 V3 dependency), `notifications`
  tables. Migrations under `src/lib/db/migrations/y2/*`.
- **Pure helpers:** `src/lib/db/y2-shapes.ts` — schema-validated
  types matching the Y1 Zod schemas exactly. Z+Drizzle inference
  keeps the localStorage / Postgres parity.
- **Tests:** 12 — Drizzle table integrity, Zod-shape parity per
  table.
- **Loop 1 stress:** run a 50-record fixture round-trip through
  parse → drizzle insert → drizzle select → parse. Catches schema
  drift.
- **Founder-unlock:** Neon connection string in
  `DATABASE_URL` env.

### W3 — Cloudflare R2 photo upload

- **API route:** `src/app/api/upload/photo/route.ts` — POST a
  pre-signed URL, GET to fetch + redirect. Stub mode (no R2
  credentials) returns the data URI directly so the win-screen
  flow still works.
- **Pure helper:** `src/lib/storage/photo-pipeline.ts` —
  `signUpload(filename, contentType)`, `resolvePhotoUrl(key)`,
  client-side `compressBeforeUpload(file)` (canvas-based to <500KB).
- **Tests:** 14 — stub-mode passthrough, real-mode mock-fetch,
  compression bounds, content-type allowlist (jpeg/png/webp only).
- **Founder-unlock:** R2 access key + bucket name + custom
  domain.

### W4 — Y1 W51 follow-on: Sharing button

- The Y1 W51 plan-line item "Sharing — Share button copies cook
  deeplink" lands here as a one-day ship. Toast confirms;
  deeplink `https://sous.app/cook/<slug>?author=...`.
- **Files:** `src/lib/share/cook-deeplink.ts` pure builder
  (URL composition, author param sanitisation).
- **Tests:** 10 — author-param sanitisation, URL escape edge
  cases (Unicode dish names), toast confirm-on-success.

### W5 — Sprint A close + bi-weekly IDEO #2

- Bi-weekly IDEO at W2 (covers W1+W2) + sprint close at W5.
- Behavioural overlay: none this sprint (infra-only).
- Founder-unlock-runbook updated with all four substrate slots.

**Sprint A tests:** ~44 new. Cumulative: 1090.

---

## 6. Sprint B (W6-W10) — Pairing-engine V3

> **What we're building:** V2 (Y1 W30) trains weights from cook
> session metadata only (`cuisineFamily`, `rating`, `favorite`).
> V3 reads the _score breakdown_ the engine emitted at the moment
> of pairing — for each completed cook, we know exactly which
> dimensions scored high. Train per-dimension coefficients
> directly.
>
> **Why now:** Year-1 V2 trainer's header comment promises this
> as the next iteration. The substrate (engine returns a
> ScoreBreakdown; cook sessions exist) was built for it.

### W6 — Score-breakdown persistence

- **Schema delta:** `CookSessionRecord` gains
  `engineScoreBreakdown?: ScoreBreakdown | null`. Persisted at
  the moment the user picks a side from the result stack —
  not at cook completion. Pure helper `attachScoreBreakdown(session, breakdown)`.
- **Wiring:** `result-stack.tsx` `onCookThis` handler grabs the
  side's `scores` from the pairing query result + writes it to
  the session via `updateSession`.
- **Migration:** legacy sessions without breakdowns stay null;
  the V3 trainer treats null as "no per-dimension signal" and
  falls back to V2's metadata-only path for that record.
- **Tests:** 12 — schema migration parser, attach-score helper,
  null-safe trainer fallback.
- **Loop 2 RCA target:** likely a typing mismatch at the
  breakdown attachment site; pre-empt with a Zod shape match.

### W7 — V3 trainer math

- **Pure helpers in `src/lib/engine/user-weight-trainer-v3.ts`:**
  - `extractAcceptedAndRejectedPairs(history)` — accepted = cooks
    with rating ≥ 4 OR favorite=true; rejected = cooks with
    rating ≤ 2 OR feedback flagged "too-bland" / "miss".
  - `perDimensionDelta(accepted, rejected)` — for each
    `ScoreBreakdown` key, compute mean(accepted) - mean(rejected).
    Higher delta → user values that dimension more.
  - `composeV3Weights(history)` → `UserWeights`. Cold-start
    threshold raised to 8 cooks-with-breakdowns (richer signal).
- **Cap:** ±0.10 max per dimension shift (vs V2's ±0.05). More
  aggressive because the signal is stronger.
- **Renormalisation:** weights still sum to 1; floor at 0 per
  dimension preserved.
- **Tests:** 30 — extract correctness, per-dimension delta
  monotonicity, cold-start floor at 8, fully-saturated cap,
  renormalise invariant, no-NaN invariant under degenerate inputs
  (all-accepted, all-rejected, single-dimension dominant).

### W8 — V3 ↔ V2 hybrid + telemetry

- **Hybrid composer:** `composeUserWeights(history)` — picks V3
  when ≥ 8 score-breakdown-rich cooks exist; falls back to V2
  trainer otherwise.
- **Mode telemetry:** `useUserWeights` exposes a `trainerMode:
"default" | "v2" | "v3"` field for Sprint F's IDEO retro.
- **Tests:** 8 — hybrid switching at threshold, V3 → V2
  graceful degrade when breakdowns get wiped (privacy reset).
- **Loop 3:** consolidate V2 + V3 helper interfaces under a single
  `WeightTrainer` Strategy abstraction so future V4 plugs in
  cleanly.

### W9 — Eval harness + IDEO #4

- **Eval harness:** synthetic cook-history generator + acceptance-
  rate-improvement metric. Compare V3 against V2 across 100
  synthetic users — V3 should beat V2 on accepted-pick rate by
  ≥ 5 percentage points or we reroute (Karpathy "define success
  upfront").
- **Files:** `src/lib/engine/v3-eval.ts` + `v3-eval.test.ts`.
- **Behavioural overlay:** none yet (infra). Sprint C lands the
  first overlay.

### W10 — Sprint B close

- V3 ships behind a flag (`SOUS_PAIRING_V3=true`) — flag-off
  uses V2; flag-on uses V3 hybrid.
- Cumulative tests: 1090 + 50 + 30 + 8 + 12 + 8 = **1198**.

**Minimal UI integration:** zero. V3 is invisible — recommendations
just get sharper. The eval surface is dev-only.

---

## 7. Sprint C (W11-W14) — Time/season reranker + Cook-again

> Two small features paired in one sprint. Both are pure layers
> on top of existing engine output; both surface as small chips
> on `/today` without adding new screens.

### W11 — Time-of-day modifiers

- **Pure helper:** `src/lib/engine/context-rerank.ts` —
  `applyTimeOfDayModifier(rankedCandidates, now)`. Boost rules:
  - Mon-Thu 16:00-20:00 local: prep+cook ≤ 30 min × 1.20
  - Mon-Thu 20:00-22:00 local: prep+cook ≤ 20 min × 1.30 (rescue
    fast-cooks late evening)
  - Sat-Sun 10:00-15:00 local: prep+cook ≥ 60 min × 1.15 (project
    cooks)
  - All other times: no modifier
- **Tests:** 18 — boundary hours, weekday/weekend toggle, no-
  modifier outside windows, idempotence on re-rank, monotonicity.

### W12 — Seasonal modifiers

- **Pure helper:** `applySeasonalModifier(rankedCandidates, now)`.
  Boost rules (Northern Hemisphere V1; user-locale aware in V2):
  - Oct-Mar: candidates tagged `["soup", "stew", "warming"]` ×
    1.15
  - Apr-Sep: candidates tagged `["salad", "fresh", "no-cook"]` ×
    1.15
- **Tag derivation:** seed catalog already has tags + descriptions;
  pure derivation `deriveSeasonalTags(side)` infers warming /
  fresh from existing data.
- **Tests:** 14 — month boundary, hemisphere flag (default North),
  tag-inference correctness on sample dishes.
- **Loop 2 RCA target:** seasonality is locale-sensitive; doc
  the assumption in the helper header.

### W13 — Cook-again memory

- **Pure helper:** `src/lib/engine/cook-again.ts` —
  `pickReSuggestion(history, now)`. Returns at most one recipe
  to re-suggest:
  - Eligible: rating ≥ 5, completed ≥ 21 days ago, ≤ 90 days ago,
    not cooked since.
  - Score = recency × seasonality fit × cuisine-rotation
    diversity (don't suggest the same cuisine the user cooked
    yesterday).
  - Returns `null` when no eligible candidate.
- **Surface:** small chip on `/today` between RepeatCookChip and
  the WhosAtTable picker. Same aesthetic as RepeatCookChip — calm,
  one-liner.
- **Files:** `src/components/today/cook-again-chip.tsx`.
- **Tests:** 22 — eligibility windows, scoring monotonicity,
  null on cold-start, no-double-suggest invariant.
- **Behavioural overlay (anchoring):** chip text references the
  user's prior rating: "you rated this 5★ 4 weeks ago — make it
  again?". Personal-best anchor, not generic praise.

### W14 — Sprint C close + bi-weekly IDEOs #5 + #6

- IDEO #5 covers W11+W12; IDEO #6 covers W13+W14 (sprint close).
- **Minimal UI integration:** ZERO new screens. Reranker is
  invisible (engine-internal); cook-again chip is one row on
  `/today` and renders nothing when no eligible candidate.
- Cumulative tests: 1198 + 18 + 14 + 22 = **1252**.

---

## 8. Sprint D (W15-W18) — Pantry-aware suggestions

> Pantry hook already exists in Y1. The substrate is partial.
> Sprint D builds the engine integration + the surface chip.

### W15 — Pantry coverage helper

- **Pure helper:** `src/lib/engine/pantry-coverage.ts` —
  `computePantryCoverage(recipe, pantry)`. Normalises ingredient
  names (lowercase, strip qualifiers — "fresh basil leaves" →
  "basil"), cross-references the pantry's current ingredient set,
  returns `{ haveCount, totalCount, coverage: 0..1 }`.
- **Edge cases:** Optional ingredients excluded from
  denominator. Pantry items with quantity-only matches (e.g.
  "1 lemon" satisfies "lemon zest") count via fuzzy substring.
- **Tests:** 28 — normalisation invariants, optional exclusion,
  fuzzy match coverage matrix, no-NaN on zero denominators.

### W16 — Engine integration

- **Soft signal:** modifier in `pairing-engine.ts` —
  `coverage * 0.20` added to a candidate's `preference` score
  (after V2/V3 trainer). Doesn't filter, just weighted nudge.
- **Coverage threshold for "high-coverage":** ≥ 0.7. Below that,
  the modifier is a smaller bump (`coverage * 0.10`).
- **Tests:** 12 — coverage ranking effects, no-pantry user gets
  identical V3 output (regression guard).

### W17 — Surface integration

- **Quest card chip:** when a suggested side has coverage ≥ 0.7,
  render a small "7/9 from your pantry" badge on the card.
  Aesthetic matches the existing "Nourish ✓" badge size + position.
- **Reroll bias:** "Have ingredients" toggle on the result stack
  reroll surface — when on, only candidates with coverage ≥ 0.5
  are eligible.
- **Files:** `src/components/today/quest-card.tsx` (chip add),
  `src/components/today/result-stack.tsx` (toggle add).
- **Tests:** 16 — chip presence/absence, toggle persistence in
  localStorage, reroll bias correctness.

### W18 — Sprint D close + behavioural overlay

- **Behavioural overlay (tiny goals):** when the user opens
  `/today` and a high-coverage candidate exists, the welcome
  line includes "use what you have" framing — micro-goal
  language. NOOM pattern: small atomic week-sized commitments.
- **Minimal UI integration:** chip + toggle, no new screens.
- IDEO #7 + #8 fire here.
- Cumulative tests: 1252 + 28 + 12 + 16 = **1308**.

---

## 9. Sprint E (W19-W22) — Daily rhythm + smart notifications

> The rhythm widget already lives on `/today` (Y1 W36). Sprint E
> upgrades it to drive smart notifications: figure out the user's
> typical cook day + hour, send a nudge then. Three behavioural
> overlays land in this sprint — implementation intentions,
> streak forgiveness, identity reinforcement.

### W19 — Rhythm pattern inference

- **Pure helper:** `src/lib/engine/rhythm-pattern.ts` —
  `inferRhythmPattern(cookSessions)`. Output:
  ```ts
  { typicalDays: number[]; // 0=Sun ... 6=Sat
    typicalHour: number;   // 0-23
    confidence: number;    // 0-1
    streakHistory: { day: number; cooked: boolean }[]; // last 28 days
  }
  ```
- **Algorithm:** mode of completedAt-day-of-week with bayes-prior
  smoothing; mode of completedAt-hour weighted by recency.
- **Confidence threshold:** notifications fire only when
  confidence ≥ 0.6. Below that, no nudge (don't fabricate a
  rhythm from 3 cooks).
- **Tests:** 28 — single-day pattern, multi-day pattern,
  confidence floor, edge cases (every cook same hour vs scattered).

### W20 — Push notification platform

- **Service worker:** `public/sw.js` — listens for
  `pushsubscription` events, displays notification.
- **Web Push subscription helper:** `src/lib/notify/push-sub.ts`
  — subscribe / unsubscribe / sync state to localStorage +
  Postgres (when auth lands).
- **Stub mode:** when no VAPID key configured, in-app toast
  fires instead of OS push. The user still sees the nudge
  (just inside the app).
- **Tests:** 18 — sub state machine, stub fallback, payload
  signing in real mode (mock fetch).
- **Founder-unlock:** VAPID public + private keys.

### W21 — Smart-notification scheduler

- **Pure helper:** `scheduleNextNudge(rhythm, now)` returns a
  Date for the next nudge (or null). Logic: next typical-day at
  typical-hour minus 30 minutes (so user has time to plan).
- **Behavioural overlay (implementation intentions):** the nudge
  copy is implementation-intention-shaped:
  > "Tuesday 5:30pm — when you're heading home, what'll you cook?"
  > Not "you usually cook Tuesdays".
- **Behavioural overlay (streak forgiveness):** if the user
  missed last week's typical day, the FOLLOWING week's nudge
  reads:
  > "Skipping last Tuesday is just data. What sounds good
  > tonight?"
  > Not "you broke your streak".
- **Behavioural overlay (identity):** the rhythm widget on `/path`
  surfaces the user's longest rhythm-week-streak as identity
  language: "You're a Tuesday-night cook (12 weeks running)."
- **Tests:** 14 — schedule next nudge correctness, missed-week
  forgiveness path, identity language formatter.

### W22 — Sprint E close + IDEOs #9 + #10

- **Minimal UI integration:** the rhythm widget already exists
  (Y1 W36). Sprint E adds zero new screens — just enriches the
  widget's labels + adds a "Nudge me?" toggle.
- **Loop 3:** make the rhythm widget calm by default — no
  visual emphasis change, just deeper data.
- Cumulative tests: 1308 + 28 + 18 + 14 = **1368**.

---

## 10. Sprint F (W23-W26) — Voice MVP 5 sequenced pointers + Y2 H1 close

### W23 — AttentionPointer schema delta

- **Schema add:** `AttentionPointer.revealAtSecond?: number` —
  0 (or unset) = render immediately. Positive number = appear
  after that many seconds elapsed in this step.
- **Migration:** existing pointers without the field default to
  immediate reveal.
- **Tests:** 12 — schema migration, reveal-time monotonicity.

### W24 — Sequence runner

- **Pure helper:** `src/lib/cook/pointer-sequence.ts` —
  `getActivePointers(allPointers, elapsedSeconds)`. Returns the
  subset whose revealAtSecond ≤ elapsed.
- **Step elapsed-time tracker:** `useElapsedSeconds(stepKey)` —
  resets to 0 on stepKey change; ticks every 250ms via
  `requestAnimationFrame`. Pause when the page is hidden
  (`document.visibilityState`).
- **Tests:** 22 — empty pointers, all-immediate, sequenced reveal
  matrix, pause/resume on visibility change.

### W25 — Pointer text format extension

- **Existing format (Y1 W44):** `circle: 0.3, 0.5 - watch the
bubbles`
- **New format:** `circle: 0.3, 0.5 @ 8s - watch the bubbles`
  — the `@ Ns` segment is optional reveal-time delay. Parser
  defaults to 0 when absent.
- **Tests:** 18 — format extension, backward compatibility with
  Y1 format, error tolerance.

### W26 — Sprint F close + Y2 H1 IDEO

- **Behavioural overlay (anchoring / peak-end):** win-screen
  confetti animation now references the user's **highest-ever
  cook score** if today's cook is within 5 points of it. Copy:
  "Your best of the year — barely above 87." Frames the cook
  against personal best, not absolute.
- **Minimal UI integration:** sequenced pointers reuse the
  existing AttentionPointerOverlay component; new behavior is
  the sequence runner. No new screens.
- **Y2 H1 IDEO:** half-year retro covering Sprints A-F.
- Cumulative tests: 1368 + 12 + 22 + 18 = **1420**.

---

## 11. Sprint G (W27-W30) — Voice conversational follow-ups

> Bounded Q&A scoped to the current cook session. The user can
> ask "did I add salt?" or "what's the next step after the
> blooming one?" and the cook page answers from the recipe data
> itself (not generic).

### W27 — Step-recall intent extension

- **Intent parser additions:** "step-recall" intent type with
  variants:
  - "did I…" / "have I…" → look back through prior step instructions
  - "what's next after…" → look forward in the step list
  - "should I add…" → match an ingredient mention against prior
    - future steps
- **Pure helper:** `src/lib/voice/step-recall.ts` —
  `recallFromSteps(steps, intent, currentStepIndex)` returns
  the speakable answer + an optional "I'm not sure" fallback.
- **Tests:** 36 — intent classification, prior-step matching,
  forward-step matching, ambiguity → "I'm not sure" path.

### W28 — Conversational LLM fallback (real mode)

- **Stub mode:** "I'm not sure — re-read the step?" canned
  response.
- **Real mode (Anthropic key):** bounded prompt — system prompt
  enforces "answer ONLY with reference to the provided step list;
  if the answer isn't there, say so explicitly". User prompt
  includes prior 3 steps + the next step + the user's question.
- **Defence-in-depth:** parsed response capped at 200 chars +
  validated for "doesn't reference an off-list ingredient" via
  string-match.
- **Tests:** 24 — stub-mode bounded responses, real-mode
  contract test (mock fetch), off-list rejection.

### W29 — Win-screen reflection journaling overlay

- **Behavioural overlay (reflection journaling):** at end-of-week
  (rhythm widget detects last cook day), the win screen surfaces
  a 2-question voice prompt:
  > "What was your favourite cook this week?"
  > "What made it work?"
- Voice transcript captures the answer, stores under the
  cook-session record's existing `note` field.
- **Minimal UI integration:** reuses voice transcript hook + win-
  screen note field. No new surface.
- **Tests:** 14 — once-per-week trigger, voice-skip path, note
  persistence.

### W30 — Sprint G close

- IDEOs #11 + #12 fire here.
- Cumulative tests: 1420 + 36 + 24 + 14 = **1494**.

---

## 12. Sprint H (W31-W34) — Voice-driven recipe authoring

> The pure substrate for this is already shipped: Y1 W18 voice
> transcript + W50 autogen draft. Sprint H is integration glue.

### W31 — Quick-add voice mode toggle

- **Surface change on `/path/recipes/quick-add`:** a small
  toggle (Type / Voice). Voice mode replaces the textarea with
  a microphone button + live transcript display.
- **Live transcript:** uses existing `useVoiceTranscript`. Stops
  recording on a 2-second silence OR explicit user tap.
- **Files:** `src/app/(path)/path/recipes/quick-add/page.tsx`
  (toggle add).
- **Tests:** 18 — mode-switch state, silence-stop debouncer,
  permission-denied fallback.

### W32 — Voice → autogen pipeline

- **Pure helper:** `src/lib/recipe-authoring/voice-to-draft.ts` —
  `voiceTranscriptToDraft(transcript)`. Pipes the transcript
  through the existing `draftRecipeFromText` server-side, returns
  the same RecipeDraft.
- **Telemetry:** track transcript length + autogen success rate
  - edit-distance between draft and user's final saved version.
- **Tests:** 14 — pipe correctness, error path on empty
  transcript, network-fail fallback.

### W33 — Voice authoring UX polish

- **In-mic visual feedback:** simple animated mic icon (pulses
  on detected speech, dims on silence). Reduced-motion gated.
- **Live transcript truncation:** show last 200 chars only — full
  transcript on long-press.
- **Tests:** 12 — mic-state transitions, transcript truncation
  invariants.

### W34 — Sprint H close

- **Minimal UI integration:** one toggle on existing
  `/path/recipes/quick-add`. No new screens.
- IDEOs #13 + #14.
- Cumulative tests: 1494 + 18 + 14 + 12 = **1538**.

---

## 13. Sprint I (W35-W38) — Pod V2 agentic recipe pick

### W35 — Agentic picker substrate

- **Pure helper:** `src/lib/pod/agentic-picker.ts` — given a
  pod's metadata + last 4 weeks of cooked cuisines + voted twist,
  returns either:
  - Stub mode: deterministic rotation through Nourish-verified
    recipes filtered by dietary union, ordered by week-of-year
    seed.
  - Real mode: LLM call (Anthropic) with structured-output schema
    matching `PodChallengeWeek.recipeSlug`.
- **Tests:** 26 — stub determinism, real-mode contract test
  (mock fetch), dietary-union enforcement, repeat-avoidance over
  4-week window.

### W36 — Pick-on-Monday automation

- **Cron-equivalent:** when the pod home is opened on a Monday
  ≥ pod-local 00:00 AND no current-week PodChallengeWeek exists
  AND any admin is viewing → trigger the picker. First viewer
  wins; subsequent admin views see the picked recipe.
- **Override:** any admin can rerun the picker pre-Monday-9am
  (configurable cutoff). Past 9am locks the choice for the week.
- **Tests:** 18 — Monday detection, double-pick race avoidance,
  admin override.

### W37 — Voted twist + tiny goal overlay

- **Twist voting:** small UI on pod home Sunday afternoon — admin
  proposes 3 twist options; members vote; winner becomes the
  week's twist. Tiny default twist set:
  > "vegetarian", "spicy", "leftover-mode", "kids-cook",
  > "budget", "speedy" (≤ 30 min total)
- **Behavioural overlay (tiny goals):** the twist IS the tiny
  goal. Concrete, weekly, atomic.
- **Behavioural overlay (identity):** pod gallery surfaces the
  pod's "twist streak" — "Spicy week 4 of 4" if a pod consistently
  picks one twist. Identity language, not pressure.
- **Tests:** 22 — vote tally, tie-break (admin pick), twist
  application to picker.

### W38 — Sprint I close

- IDEOs #15 + #16.
- **Minimal UI integration:** twist voting is a small Sunday-
  afternoon expandable on the existing pod home. No new screens.
- Cumulative tests: 1538 + 26 + 18 + 22 = **1604**.

---

## 14. Sprint J (W39-W43) — Agentic viral recipe search (5 weeks)

> The Stefan-described feature: "did you hear about Kim K's
> viral smoothie!! Make the recipe now". Most complex Y2 build.
> Takes 5 weeks to do right because it intersects: web search,
> ranking, attribution, dedup, cool-down, ethics.

### W39 — Search adapter substrate

- **Pure helper:** `src/lib/agentic/search-adapter.ts` —
  abstraction over a search API (Tavily, Brave Search, SerpAPI).
  Single function:
  ```ts
  searchRecipeWeb(query: string): Promise<SearchResult[]>
  ```
  Returns title, URL, snippet, published-date, source-domain.
- **Stub mode:** curated 5-result fixture set when no API key.
- **Tests:** 16 — adapter contract, stub-mode determinism, query
  sanitisation, error path.
- **Founder-unlock:** Tavily / Brave / SerpAPI key in env.

### W40 — Virality classifier

- **Pure helper:** `src/lib/agentic/virality-classifier.ts` —
  `classifyVirality(searchResult)` returns
  `{ score: 0-1, reasons: string[] }`. Heuristics:
  - Recent published-date (< 14 days): +0.3
  - "viral" / "tiktok" / "trending" in title or snippet: +0.2
  - Social-media domain (TikTok, IG, Reddit): +0.2
  - Celebrity name detection (small allowlist + LLM-extension
    in real mode): +0.2
  - Engagement signals if available (likes, shares): +0.1 each
- **Tests:** 32 — score monotonicity, reason-trace correctness,
  empty-input edge cases, celebrity allowlist hit/miss.

### W41 — Recipe extractor + dedup

- **Pure helper:** wraps the Y1 W50 autogen pipeline — given a
  search result URL, fetch the page, extract structured recipe
  data via the LLM, return a RecipeDraft.
- **Dedup:** perceptual hash on title + key ingredient list +
  cuisine. Avoid suggesting a recipe the user already has in
  drafts or the seed catalog.
- **Cool-down:** at most 1 viral suggestion per user per 7 days.
  If declined, increment a per-user dismissal counter; back off
  to bi-weekly after 2 declines.
- **Tests:** 28 — extractor contract, dedup matrix, cool-down
  state machine.

### W42 — `/today` viral chip + ethics

- **Surface:** chip on `/today` (between cook-again and
  WhosAtTable). Renders only when:
  - Cool-down allows
  - A high-virality (≥ 0.7) suggestion exists
  - Recipe matches household dietary union
  - User's cook-history has < 80% same-cuisine concentration in
    last 14 days (don't push more of what they already cook)
- **Chip copy template:**
  > "Did you hear about ${creator}'s viral ${dish}? Make it tonight →"
- **Ethics & attribution:**
  - Source URL + creator credit always shown on the recipe
    Mission screen post-tap.
  - "View original" link prominent.
  - No claim that Sous owns the recipe.
- **Tests:** 24 — chip eligibility matrix, attribution
  rendering, dietary filter compliance.

### W43 — Sprint J close + IDEOs #17 + #18

- **Behavioural overlay (carefully — variable reward):** viral
  chip is the variable-reward novelty surface. NOT FOMO-styled
  ("everyone's making this except you") — curiosity-styled
  ("did you hear about…?"). Tone discipline reviewed at IDEO.
- **Minimal UI integration:** one chip on `/today`. No new
  screens. Recipe lands in the existing cook flow via the W31
  user-recipe → cook adapter.
- Cumulative tests: 1604 + 16 + 32 + 28 + 24 = **1704**.

---

## 15. Sprint K (W44-W47) — Per-cuisine vocabulary dictionary

> Stefan-amended scope: the vocab dictionary now also shows
> regional naming variations + ingredient substitutions in the
> popout's bottom section.

### W44 — Vocabulary substrate

- **Curated YAML/JSON file:** `src/data/cuisine-vocabulary.json`.
  ~150 terms across 11 cuisines. Each entry:
  ```ts
  {
    term: string;         // canonical, lowercased
    cuisine: string;      // primary cuisine family
    definition: string;   // 1-paragraph
    regionalNames: { region: string; name: string }[]; // e.g. "South India" → "rasam"
    substitutions: { swap: string; note: string }[];   // ingredient → alt + 1-line note
    pronunciation?: string; // e.g. "GAH-rahm mah-SAH-lah"
    origin?: string;       // 1-sentence
  }
  ```
- **Pure lookup helper:** `src/lib/cuisine/vocabulary.ts` —
  `lookupTerm(term)` returns the entry or null. Case-insensitive,
  fuzzy-match for plurals.
- **Tests:** 24 — lookup hit/miss, fuzzy plural match, all-entry
  schema validity.

### W45 — Glossify integration

- **Existing surface:** the W12-era Glossify component already
  underlines technique words inline. Sprint K extends it to
  cuisine vocabulary terms — the Y2 vocabulary file feeds the
  same matcher.
- **Tap → popup:** existing popup pattern. Body sections:
  1. Definition
  2. Pronunciation (if available)
  3. Origin (if available)
  4. Regional names (chip-row)
  5. Substitutions (footer accordion — collapsed by default to
     avoid clutter; expanded on tap)
- **Files:** `src/components/guided-cook/glossify.tsx` (extend
  matcher), `src/components/guided-cook/vocabulary-popup.tsx` (new).
- **Tests:** 22 — match priority (technique vs cuisine), popup
  state, accordion default-collapsed, dismiss on tap-out.

### W46 — Substitution-aware reroll

- **Surface enhancement:** when the user taps a substitution
  ("use lime + brown sugar instead of tamarind"), an optional
  inline action appears: "Apply this swap to my pantry?" — adds
  the suggested swap to the user's pantry context, removing
  friction next time.
- **Tests:** 12 — substitution → pantry write, no-double-write
  invariant.

### W47 — Sprint K close

- IDEOs #19 + #20.
- **Minimal UI integration:** the popup IS the integration. No
  new screens. The popup is a single component reused everywhere
  Glossify already lives.
- Cumulative tests: 1704 + 24 + 22 + 12 = **1762**.

---

## 16. Sprint L (W48-W51) — Charity bake-sale tooling

### W48 — Donation pledge schema + curated nonprofit list

- **Schema add:** `PodPledge` — `{ podId, recipeWeekKey,
amountPerCook, currency, nonprofitId, status: pending|charged|
failed, stripeSubscriptionId }`.
- **Curated nonprofit list:** seed file
  `src/data/nonprofits.json` — ~12 food-related 501(c)(3)s with
  name + URL + IRS EIN + 1-paragraph mission. Hand-curated.
- **Tests:** 18 — schema integrity, nonprofit-list validity.
- **Founder-unlock:** Stripe Connect platform account + tax-form
  collection from the nonprofits.

### W49 — Stripe wiring (founder-gated)

- **API route:** `src/app/api/charity/charge/route.ts` — POST
  with podId + week + cook count → creates a Stripe customer (if
  needed) + a one-off charge. Stub mode logs the would-be charge.
- **Tests:** 14 — stub mode logging, real-mode mock-fetch
  validation, idempotency on retried weeks.

### W50 — Pod gallery donation surface

- **Gallery enhancement:** when a pod has an active pledge, the
  weekly gallery shows the running donation total: "$36 raised
  for [Nonprofit] this week".
- **Behavioural overlay (identity):** pod profile gains a "Pod
  raised $X for charity in 2026" badge — identity reinforcement,
  not gamification pressure.
- **Files:** `src/components/community/pod-home-content.tsx`
  (gallery state add).
- **Tests:** 16 — donation-total render, badge logic at year
  boundaries.

### W51 — Bake-sale event tooling + Sprint L close

- **Bake-sale mode:** a pod admin can flag a week as a bake-sale
  week. Surface enhancements:
  - Shared shopping list across pod (combined ingredient totals)
  - Role assignment chips (baker / setup / cashier)
  - Event date/time/location field
  - Post-event "we raised $X for Y" reflection card persisted to
    the pod's history
- **NOT a payment processor** — coordination only. Real money
  flows through the Stripe charge in W49.
- IDEOs #21 + #22.
- Cumulative tests: 1762 + 18 + 14 + 16 + 18 (bake-sale) = **1828**.

---

## 17. W52 — Year-2 close + Year-3 plan kickoff

- `docs/YEAR-2-RETROSPECTIVE.md` — full 52-week scorecard.
- Year-3 plan kickoff doc with Y3 H1+H2 scoping (Y2 IDEOs
  surface what to bet on).
- Final IDEOs #23 + #24 (full sprint L close + half-year H2
  retro).
- Test-count target: ≥ 1850 by end-of-year-2 (Y1 closed at 1046,
  Y2 adds ~800).

---

## 18. Cross-feature interactions / dependency graph

| Sprint dep       | Required by                                         | Why                                                   |
| ---------------- | --------------------------------------------------- | ----------------------------------------------------- |
| A (auth)         | E (push), J (viral search dedup), L (Stripe charge) | All three need a stable user identity                 |
| A (Postgres)     | B (V3 score breakdown persistence)                  | localStorage too small for breakdowns at scale        |
| A (R2)           | I (Pod V2 photos), J (extracted recipe images)      | Real photo storage                                    |
| B (V3)           | C (reranker), D (pantry)                            | Modifiers compose on V3 weights                       |
| C (cook-again)   | E (rhythm)                                          | Re-suggestion seeds the rhythm-day nudge              |
| Y1 W50 (autogen) | H (voice authoring), J (viral extraction)           | Both pipe through existing autogen                    |
| K (vocabulary)   | I (Pod V2 twist surfacing)                          | Pod twist explanations link into the vocabulary popup |

Critical-path sprints are A, B, J. Slipping any pushes downstream
sprints.

---

## 19. Risk register

| Risk                                         | Mitigation                                                                                                      | Owner            |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------- |
| Founder-unlock keys delayed                  | Every founder-gated sprint ships a stub-mode V1; surface lights up post-key                                     | Stefan           |
| V3 trainer underperforms V2 in eval          | Sprint B W9 eval harness; if V3 < V2 by ≥ 5 points, pivot to V2-only with score-breakdown telemetry kept for V4 | autonomous agent |
| Viral search ethics (attribution, IP)        | W42 attribution rules baked into the chip; legal review at Y2 W26 IDEO half-year                                | Stefan           |
| Push notifications feel spammy               | W22 IDEO assesses opt-in rate vs nudge volume; back off if dismiss > 50%                                        | autonomous agent |
| Pod V2 LLM hallucinates a non-Nourish recipe | Stub mode is deterministic; real mode validates output slug exists in seed catalog                              | autonomous agent |
| Vocabulary popup clutters cook page          | Default state is collapsed (definition only); regional names + subs are accordion                               | autonomous agent |
| Charity Stripe complexity overruns           | Sprint L is the LAST sprint; if it slips, it slips into Y3 W1-W4 without affecting prior work                   | autonomous agent |

---

## 20. Process commitments (Y1 carry-forward + amplifications)

1. **Per-week 3-loop testing** — Loop 1 stress, Loop 2 RCA,
   Loop 3 improvement. Documented in every per-week CLOSE.md.
2. **Bi-weekly IDEO review** — every 2 weeks. 26 reviews across
   Y2 (vs Y1's 1-per-sprint = 12).
3. **Per-week CLOSE.md docs** — same Y1 structure (shipped,
   loops, acceptance, residuals, retro).
4. **Sprint-end IDEO close** — deeper retro than bi-weekly.
5. **Library-research refresh quarterly** — W13, W26, W39, W52.
6. **`pnpm verify` before every commit** — typecheck + lint +
   test + build.
7. **No new top-level tabs** — every Y2 feature integrates into
   existing surfaces. Per Stefan's 2026-05-02 directive.
8. **Behavioural overlay per sprint** — at most 1-2; never the
   feature, always an enhancement.
9. **Stub-mode-V1 for every founder-gated feature** — substrate
   ships first; key swap is one config edit.
10. **Substrate-first across every sprint** — pure helpers + tests
    before any UI. The Y1 pattern that produced zero RCAs on
    main carries forward.

---

## 21. Closing — what success looks like at Y2 W52

- ≥ 1850 tests on main, all four gates green.
- Y1's 27/29 ≥ 4.0 surface count grows to ≥ 32/34 (3 surface
  additions at high baseline).
- Pairing recommendations measurably sharper than Y1 baseline
  (V3 eval harness validates).
- Pod challenge has lived through ≥ 26 weekly reveal cycles
  with non-zero charity dollars raised.
- Voice cook arc handles conversational follow-ups + voice
  recipe authoring end-to-end.
- Viral-recipe agent has surfaced at least 4 successful
  conversions per active user (cook + 4-star rating + share).
- Vocabulary dictionary covers 150+ terms across 11 cuisines.
- Smart notifications opted-in by ≥ 40% of weekly-active users.
- Behavioural overlays integrated minimally — IDEO panel
  confirms no UI clutter regression.
- Year-3 plan kickoff doc filed for next 12 months.

---

> Written 2026-05-02 in response to Stefan's Year-2 12-feature
> shortlist + minimalist-integration + bi-weekly IDEO + 3-loop
>
> - NOOM/behavioural-science directives.
>   Plan is locked v1; revisions tracked in this doc's git history.
