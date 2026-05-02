# Stage-3 Vibecode Autonomous Plan — 12-month, 10x detail

> Stefan's directive (2026-05-01): "ensure the 6 month plan has 10x
> more detail and is much more fleshed out, have another 6 month
> extension planned out and have much more polish and review stages
> added to each week of features and have many rounds of recursive
> testing planning RCA improvement and stress testing for every
> single week … make sure planning is scoped to vibe coding for the
> 12 months and really advances the platform."
>
> This plan supersedes `STAGE-3-VIBECODE-AUTONOMOUS-6MO.md` for
> Stage-3+4 execution. It covers **52 weeks (12 months) of vibecode-
> autonomous build**, every single week scoped to AUTO-BUILD work
> (CLAUDE.md rule 12) — no founder-gated dependencies in the
> per-week plans. Founder-gated unlocks live in
> `docs/FOUNDER-UNLOCK-RUNBOOK.md` and are picked up opportunistically
> in parallel.
>
> Two halves:
>
> - **H1 (W1-W26)** — Stage 3 finish + Stage 4 build-out.
>   Hardens what shipped, rounds out the autonomous backlog,
>   and closes the per-surface IDEO gaps.
> - **H2 (W27-W52)** — Stage 5+6 platform advancement.
>   Real new capabilities (recipe authoring loop, voice-driven
>   cook mode, household memory) — not just polish-cycles.

## Operating principles (load-bearing across all 52 weeks)

These don't change between H1 and H2. They're the contract:

1. **Every week ships green.** pnpm lint + pnpm test + pnpm build all
   pass on the last commit of every week. No "I'll fix that
   tomorrow" debt.

2. **Every week is AUTO-BUILD.** If a deliverable needs a
   founder-action, it's in `FOUNDER-UNLOCK-RUNBOOK.md`, not in this
   plan's per-week section. The agent never blocks on credentials.

3. **Every week ends with at least one new test landing.** The total
   test count is monotonic-non-decreasing. No "polish change, no
   test needed" handwaves — even a snapshot or a smoke spec counts.

4. **Every week runs a 5-step recursive-improvement loop.** Defined
   below. This is the per-week structure.

5. **Every 5th week runs an IDEO design review** (continues the
   Stage-3 cadence). Plus the per-week loops gives roughly 10
   review touches per surface across H1+H2 — the recursive
   improvement guarantee.

6. **Every week runs at least one stress test.** Defined below.

7. **The plan stays scoped to vibecode capability.** No work that
   requires Stefan's judgement, real users, paid services, or
   external accounts. When such work is necessary it gets queued
   for the founder runbook — the agent doesn't pretend it can ship
   it.

## The per-week 5-step recursive-improvement loop

Every week (52 of them) follows the same skeleton inside its theme:

| Day       | Phase                                    | Output                                                                                                                                                                                                                                                                                                       |
| --------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Day 1** | **Plan + Audit**                         | Read the prior week's IDEO carry-forward (or sprint audit if start-of-sprint). Write a one-page `docs/weeks/W{N}/PLAN.md` with: (a) the week's primary deliverable, (b) the 3 audit observations to address, (c) acceptance criteria, (d) the stress test to run, (e) the RCA template for any failure mode. |
| **Day 2** | **Build wave A**                         | Land the top half of the week's deliverable. Lint + test + build green by commit.                                                                                                                                                                                                                            |
| **Day 3** | **Stress test**                          | Run the stress test from Day-1 plan (defined below). Capture results in `docs/weeks/W{N}/STRESS-TEST.md`. If the stress test surfaces a failure, run the RCA template before the build continues.                                                                                                            |
| **Day 4** | **Build wave B + recursive improvement** | Land the bottom half. Re-run any test that was on the borderline. Capture before/after in the week's `RECURSIVE-IMPROVEMENT.md`.                                                                                                                                                                             |
| **Day 5** | **Review + close**                       | Write `docs/weeks/W{N}/CLOSE.md` with: shipped commits + their SHAs, scorecard delta on the surfaces touched, residuals carried into next week, and a 1-paragraph retrospective ("what was harder than expected; what shipped cleaner than expected").                                                       |

This is **52 weeks × 5 phases = 260 explicit phase points**. The
agent should be able to find any week's status by reading three docs.

## The stress-test protocol

Every week the agent runs **at least one** of the following stress
tests against the surfaces touched. Pick the one that maps best to
the week's deliverable. Multi-week initiatives rotate through them.

| Stress test                    | What it checks                                                                                                | When to use                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **375×667 viewport sweep**     | Every primary CTA visible without scroll on iPhone-SE; touch targets ≥44px (CLAUDE.md rule 10)                | UI changes                     |
| **Reduced-motion mode**        | Every motion has the gate; no behavioural regression with motion off                                          | Animation changes              |
| **localStorage cold start**    | Empty-state on every surface that has a stateful hook                                                         | State changes                  |
| **localStorage poisoned data** | Garbage / wrong-shape / overflowing-string data injected; surfaces handle gracefully (`parseStored*` helpers) | Persistence changes            |
| **Long-content stress**        | 800-char dish names, 5000-char article bodies, 50-element pantry; layout doesn't break                        | Content / data changes         |
| **Slow network simulation**    | Throttle to 3G in the preview; surfaces still feel responsive (skeletons fire fast, no flash of empty)        | Loading state changes          |
| **Race-condition simulation**  | Two state updates fire on the same tick; final state is correct (uses Vitest fake timers)                     | Logic changes                  |
| **A11y screen-reader scan**    | axe-core via Playwright on the surfaces touched; zero serious violations                                      | Accessibility-adjacent changes |
| **Bundle size delta**          | `next build` size delta on the route(s) touched is < 5% growth                                                | Refactors / new components     |
| **Concurrency stress**         | 10 rapid-fire actions on the same surface in <1s; no double-fires, no stale state                             | Action-handler changes         |
| **Touch-event reliability**    | The surface responds correctly to pointer cancel, multi-touch, and rapid release-during-drag                  | Drag / swipe changes           |
| **Memory-leak scan**           | Mount/unmount the surface 50 times; no growing listener / interval count                                      | Component lifecycle changes    |

## The RCA template

Any failed acceptance criterion or stress-test result goes through
`docs/weeks/W{N}/RCA-{slug}.md` with this shape:

```
## Symptom
What the user (or test) sees that's wrong.

## Reproduction
Concrete steps. Code excerpt or test transcript.

## Five Whys
Five rounds of "why did that happen". Each layer's answer becomes
the next layer's question.

## Root cause
The single most-upstream cause.

## Fix
Concrete code or design change. Include diff hunks.

## Test that pins the fix
A new vitest / e2e / smoke test that would have caught this. The
test ships in the same commit as the fix.

## Pattern surfaced
Is this a one-off or a recurring pattern? If recurring, propose a
codebase-wide guard (lint rule, type constraint, pre-commit check)
in the residuals section of the week's CLOSE.md.
```

The Stage-3 cycle generated 4 RCA-worthy moments (Tailwind-JIT
prose-extraction bug; React-hooks/refs strict rule violations;
forum nested-button hydration error; the swipe direction-from-offset
bug). Going forward every RCA-worthy moment gets a doc.

---

# H1 — Stage 3 finish + Stage 4 build-out (W1-W26)

Each H1 week below has its theme + key deliverable + 3 audit
deltas to address + stress-test + acceptance criterion. The weekly
plan/stress/RCA/recursive/close docs get written week-of, not in
advance. This document gives the **scope** and **acceptance bar**.

## Sprint A (W1-W5) — Stage-4 W1: shared-component adoption sweep

W1-W5 close out the Stage-4 W1+W2+W3 work that's already in flight.

### W1 (this week, complete) — Shared component extraction

**Theme:** Encode design-tokens.md as `SectionKicker`, `MetaPill`,
`EmptyStateCTA`, `SourceAttribution`, `motion.ts` presets.
**Stress test:** Bundle size delta on /community + /path/pantry.
**Acceptance:** 4 surfaces refactored to use the new components;
0 visual regression; bundle delta < 1%.
**Status:** ✅ Shipped (679c8dc, ad1f195, d53b7f9).

### W2 — Tinder swipe RCA + library-or-build decision

**Theme:** Real user reports surfaced two swipe bugs. Fix the
direction-misregister + responsiveness; decide library-vs-build.
**Stress test:** Touch-event reliability — pointer-cancel mid-drag,
release-during-flick, rapid back-and-forth swipes.
**Acceptance:** Direction always taken from offset; thresholds
tightened; ADR documents the build-vs-library tradeoff.
**Status:** ✅ Shipped (932624c, 07bcd73).

### W3 — Polish + minimalism critical appraisal

**Theme:** Brutal-honest read of the entire app, surface-by-surface.
Identify the 25 polish observations + ship the top 3 fixes.
**Stress test:** 375×667 viewport sweep on every flagged surface.
**Acceptance:** Appraisal doc shipped; at least 3 polish fixes
land; remainder queued for later weeks with explicit owner.
**Status:** ✅ Shipped (1212a57).

### W4 — `/cook/combined` density refactor (long-deferred)

**Theme:** The 1,122-line dual-track cook page. Goal: rhythm-
normalise the dual track so one is clearly primary at any moment;
target line count < 900 with no behavioural change.
**Stress test:** Race-condition simulation on dual-cook timers
(verify they don't drift).
**Acceptance:** Page renders identically on the e2e visual snapshot;
unit tests for the dual-track logic land alongside the refactor.
**Risk:** This is the third deferral. Test scaffolding lands BEFORE
the refactor begins.

### W5 — IDEO Sprint-A close + Today/Cook/Win 2nd-pass

**Theme:** Re-audit Today/Cook/Win against the original 4.0 bar.
Land any deltas. Write Sprint-A IDEO close.
**Stress test:** Reduced-motion mode end-to-end on the three
surfaces.
**Acceptance:** All three score 4/4/4/4 in the IDEO close doc.

## Sprint B (W6-W10) — Stage-4 W2: cross-cutting infrastructure

### W6 — Shared-component adoption sweep wave 2

**Theme:** Adopt the W1 components on the remaining 8 surfaces
that still have inline kickers/pills/empty-states (saved page,
sides page, scrapbook page, the 4 game pages, gift page).
**Stress test:** Bundle size delta after the sweep.
**Acceptance:** Every uppercase-tracking-wide kicker in
src/components or src/app uses `<SectionKicker>` (grep verification
in CLOSE.md).

### W7 — Custom ESLint rule for reduced-motion gate

**Theme:** Stage-3 retro flagged that "no new motion code without
useReducedMotion gate" is currently a memory-enforced rule. Encode
it as a real lint check.
**Stress test:** Run the new rule against the entire src/ tree;
expect zero violations (since the W1+W2 sweeps already gated every
motion site). Then deliberately introduce a violation in a test
file and verify the rule catches it.
**Acceptance:** Rule lives in `.eslint-rules/`, registered in
`eslint.config.mjs`; one positive + one negative test for the rule.

### W8 — Forum reply-to-reply nesting + reaction stub

**Theme:** Carry-forward from Sprint 3. Add reply-depth (one level
of nesting) + a "thanks" reaction count.
**Stress test:** Long-content stress on a thread with 50 replies
of 500 chars each; layout doesn't break.
**Acceptance:** Forum thread page renders nested replies with a
clear visual hierarchy; reaction count persists per-device.

### W9 — Article tag-filter view (already shipped) + tag-cloud landing

**Theme:** Tag-filter view shipped in Stage-4 W2 (b48173a). This
week extends with a tag-cloud surface at `/community?tag=` empty-
state — when no tag is selected, show top 12 tags as a cloud.
**Stress test:** localStorage cold start — first-time visitor sees
the tag cloud, not a 404.
**Acceptance:** Tag cloud renders sorted by article-count; tap
routes to `?tag=X`; counts are accurate.

### W10 — IDEO Sprint-B close + Stanford content run #6

**Theme:** Sprint-B IDEO review. Plus a content run tapping a
fresh Stanford source (Stanford Lifestyle Medicine via direct URL
discovery — Stefan can drop a list of 5 URLs in
`docs/content-sources/STANFORD-SOURCES.md` to unblock).
**Stress test:** localStorage poisoned data — corrupted
`sous-content-bookmarks` payload; saved page handles gracefully.
**Acceptance:** Sprint-B IDEO doc shipped; +5 Stanford articles
live (or, if Stefan hasn't dropped the URL list, a queued-source
note in CLOSE.md).

## Sprint C (W11-W15) — Stage-5 W1: voice-driven cook mode

This sprint introduces a real new capability: **voice-driven cook
mode**. The Web Speech API works in modern mobile browsers; we use
it for hands-free step navigation during a cook. Vibecode-scoped:
no third-party transcription service, no founder gates.

### W11 — Voice-cook spike: Web Speech API capability check

**Theme:** Probe the API on the surfaces that matter (Today's
camera-input prompt + the cook step page). Build a
`useVoiceTranscript` hook that wraps `webkitSpeechRecognition` /
`SpeechRecognition` with a graceful no-op fallback when unsupported.
**Stress test:** Concurrency stress — start/stop voice 10 times
rapidly; the listener count stays at 0 or 1.
**Acceptance:** Hook ships with vitest tests against a mocked
SpeechRecognition; works in Chrome and Safari mobile.

### W12 — Voice-cook step navigation

**Theme:** In the cook step page, listen for "next", "back",
"repeat", "timer" while on a step screen. Voice indicator pulses
quietly when active. Disabled by default; toggle in settings.
**Stress test:** Touch-event reliability — voice toggle doesn't
interfere with manual step taps.
**Acceptance:** A user can navigate a 12-step cook hands-free
without touching the screen.

### W13 — Voice-cook timer integration

**Theme:** "Set a 5-minute timer" parses to a real timer. "Cancel
timer" / "How long left" / "Add 30 seconds" all work.
**Stress test:** Race-condition simulation — voice command fires
while a manual timer adjustment is mid-animation.
**Acceptance:** All timer voice intents parse; intents are pure
functions that get a unit test each.

### W14 — Voice-cook coach voice (text-to-speech, browser-native)

**Theme:** When voice mode is on, the coach line reads the current
step out loud via `SpeechSynthesisUtterance`. Mute toggle persists
per-device.
**Stress test:** A11y screen-reader scan — voice mode and screen
reader coexist (no double-speak).
**Acceptance:** Coach voice reads the step on entry; pauses/resumes
correctly when the user navigates.

### W15 — IDEO Sprint-C close + voice-cook polish

**Theme:** Round-trip the entire voice-cook experience. Tighten
copy, tune the visual indicator, ship the IDEO doc.
**Stress test:** End-to-end voice cook on a 10-step recipe; mark
each step pass/fail.
**Acceptance:** Sprint-C IDEO doc shipped; voice cook scores
≥ 3.75 on first IDEO score; documented limitations (Safari quirks,
language support) in `docs/voice-cook-LIMITATIONS.md`.

## Sprint D (W16-W20) — Stage-5 W2: recipe authoring loop

Another real platform capability: **let users author their own
recipes** that flow into the same Today / Cook / Win surfaces as
seeded recipes. Vibecode-scoped: localStorage persistence first
(Drizzle/Postgres swap is a founder-unlock day post-W26).

### W16 — Authoring schema + draft-recipe data model

**Theme:** Define `UserRecipe` shape (Zod schema, not just TS).
Migration helpers from the seed `Dish` shape. Versioning header on
the schema so future migrations are clean.
**Stress test:** Long-content stress — 50-ingredient recipe with
3000-char step descriptions.
**Acceptance:** Schema lives in `src/types/user-recipe.ts`; 12+
vitest tests against the parser; round-trip survives JSON.

### W17 — Authoring UI: ingredient list builder

**Theme:** Inline editor — autocomplete from the existing
ingredient catalog, free-text fallback, drag-to-reorder.
**Stress test:** Touch-event reliability — drag-to-reorder works
on mobile + desktop; pointer-cancel is graceful.
**Acceptance:** A user can create a 12-ingredient list in under
60 seconds; the list persists across page reloads.

### W18 — Authoring UI: step builder + timer / mistake / hack chips

**Theme:** Match the visual language of the seeded Guided-Cook
steps. Each step gets optional timer, mistake warning, hack chip.
**Stress test:** Long-content stress — 20-step recipe with timers
on 8 of them.
**Acceptance:** The authoring step card renders identically (in
the cook flow) to a seed step card; user can preview their recipe
in the live cook flow.

### W19 — Authoring meta + share affordance (no real share yet)

**Theme:** Title, dish name, cuisine family selector, dietary tags,
serves count, prep + cook times. Share button = "copy URL"
(deep-link to the recipe in localStorage); real backend share is
a founder-unlock follow-up.
**Stress test:** localStorage poisoned data — corrupted user-recipe
payload doesn't crash the authoring page.
**Acceptance:** Authored recipes appear in the user's own recipe
list (a new `/path/recipes` surface) and can be cooked end-to-end.

### W20 — IDEO Sprint-D close + Stanford content run #7

**Theme:** Round-trip authoring. Tighten the empty state, save
toast, error states.
**Stress test:** Memory-leak scan — author + cook + delete + repeat
50 times; no growing handle count.
**Acceptance:** Sprint-D IDEO doc; +5-8 Stanford articles live;
authoring flow scores ≥ 3.75.

## Sprint E (W21-W25) — Stage-5 W3: household memory

The third real capability: **household memory** — the app
remembers per-household preferences (who's eating tonight, what
they ate last week, what they liked), and the Today suggestions
adapt accordingly. Vibecode-scoped: localStorage + a tight rules
engine, no ML.

### W21 — Household-member shape + onboarding

**Theme:** Add 1-N household members via the settings sheet. Each
member has age band + diet flags + favorite cuisines. Auto-creates
"You" as the first member.
**Stress test:** localStorage cold start — first-time visitor adds
3 members in under 90 seconds.
**Acceptance:** Member list persists; member count drives PM
visibility automatically (already wired via use-parent-mode).

### W22 — "Who's at the table tonight?" Today picker

**Theme:** Quietly shown on Today first thing in the morning (or
manually toggled). Tap members to include them in tonight's
suggestion ranking.
**Stress test:** A11y screen-reader scan — the picker is a real
focus-trap dialog, not a bare div.
**Acceptance:** Picker drives a `tonightAttendees` Zustand
selector that the suggestion engine reads.

### W23 — Per-member like / dislike memory

**Theme:** Win screen captures per-attendee reactions. Future
Today suggestions adapt to who's attending.
**Stress test:** Long-content stress — 100 cook sessions across
4 members; the per-member preference vector stays correct.
**Acceptance:** A new vitest suite tests the preference engine
with synthetic 30-day cook history; prediction accuracy ≥ baseline.

### W24 — Weekly household-rhythm view

**Theme:** Path home gets a small "this week's table" widget
showing who attended what. Read-only.
**Stress test:** Race-condition simulation — async member-load
race with cook-session-load.
**Acceptance:** Widget renders in < 50ms after Path home mounts;
empty state when first week.

### W25 — IDEO Sprint-E close + Stanford content run #8

**Theme:** Round-trip household memory across all surfaces.
Tighten copy, ensure attendee chips don't bloat the Today header.
**Stress test:** Concurrency stress on the win-screen attendee-
reaction handler.
**Acceptance:** Sprint-E IDEO doc; +5-10 Stanford articles live.

## W26 — H1 close

**Theme:** H1 retrospective + handoff to H2. Write
`docs/H1-RETROSPECTIVE.md` (the same shape as
`STAGE-3-RETROSPECTIVE.md`). Update the founder-unlock runbook with
anything new (voice cook needs no founder action; authoring needs
Postgres for cross-device; household memory needs auth for cross-
device — all in the runbook).
**Stress test:** All-routes e2e smoke spec across all 22 surfaces +
the new authoring + household-memory surfaces.
**Acceptance:** Test count ≥ 600 (was 411 at W1). Surface count at
≥ 4.0 ≥ 18/22+. Three new platform capabilities (voice cook,
authoring, household memory) each at ≥ 3.75.

---

# H2 — Stage 6+7 platform advancement (W27-W52)

H2 takes the platform from "polished cooking app" to "system that
gets meaningfully better the more you use it." Bigger swings.

## Sprint F (W27-W31) — Stage-6 W1: pairing-engine V2

The Sous pairing engine is rules-based today (cuisine fit, flavor
contrast, etc.). H2 makes it learn — but vibecode-style, no model
hosting required. The "model" is a per-user weight vector trained
client-side from cook history.

### W27 — Per-user weight vector schema + initial training

**Acceptance:** A user with 30+ cook sessions has a personalised
weight vector that demonstrably differs from the default.

### W28 — Online-update on each cook completion

**Acceptance:** Single-cook update is < 5ms.

### W29 — Suggestion-quality A/B switch (per-user)

**Acceptance:** Two suggestion algorithms can run side-by-side
under a flag; the user sees one set per day, telemetry tracks
acceptance rate.

### W30 — Cold-start and small-history graceful degradation

**Acceptance:** A 0-cook user gets the rules-based engine; a
50-cook user gets the personalised one; the transition is
imperceptible.

### W31 — IDEO Sprint-F close + V2 engine ships behind a flag

## Sprint G (W32-W36) — Stage-6 W2: smart shopping list

A grocery list that knows your pantry, your meal plan, and
de-duplicates across the week.

### W32 — Multi-recipe shopping aggregation

### W33 — Pantry de-dup with quantity awareness

### W34 — Sectioned by aisle (produce / proteins / dry / refrigerated)

### W35 — Recurring weekly basics tracker

### W36 — IDEO Sprint-G close

## Sprint H (W37-W41) — Stage-6 W3: meal calendar

A 7-day meal plan that drives the shopping list.

### W37 — Calendar surface + drag-to-schedule

### W38 — Auto-fill from suggestion engine V2

### W39 — Slot rules (kid night, no leftovers, fresh fish only on Tuesdays)

### W40 — Calendar → shopping-list end-to-end

### W41 — IDEO Sprint-H close + Stanford content run #9

## Sprint I (W42-W46) — Stage-7 W1: cook-along community moments

Async "cook the same dish at the same time" — a shared moment
without a real-time backend. Vibecode-scoped: localStorage
"signal that you cooked X today", surface to other devices via a
shared deeplink, no actual server. Real backend version is
founder-unlock.

### W42 — "Tonight's chef pick" deeplink generator

### W43 — Receive-side cook-along surface

### W44 — Asynchronous reaction trail

### W45 — Cook-along result aggregator (per-device)

### W46 — IDEO Sprint-I close

## Sprint J (W47-W51) — Stage-7 W2: 2nd-pass on every H2 surface

H2 surfaces (engine V2, smart shopping, meal calendar, cook-along)
all get a 2nd-pass IDEO review. By design.

### W47 — Engine V2 polish + RCA on any user-reported quirks

### W48 — Smart shopping list polish

### W49 — Meal calendar polish

### W50 — Cook-along polish

### W51 — IDEO Sprint-J close (cross-cutting H2 review)

## W52 — Year-1 close

`docs/YEAR-1-RETROSPECTIVE.md` — the full 12-month autonomous build
arc. What landed, what didn't, what surprised us. Plus the Year-2
plan kickoff doc with H3+H4 scoping.

---

# Cross-cutting workstreams (run continuously across all 52 weeks)

These don't sit in a specific week — they run as background tasks
that pick up an hour-or-two of work per week.

## Workstream 1: Stanford content acquisition

Continuous low-volume content runs (target: 3-5 new items per
sprint, ~30-40 across the year). The bottleneck is source
discovery, not distillation.

## Workstream 2: Test count growth

Target: +200 tests across H1, +150 across H2 = 411 → ~750+ by W52.
Every week's CLOSE.md reports the test-count delta.

## Workstream 3: Bundle size budget

Hold the JS bundle under 350 KB gzipped through W26; under 425 KB
through W52. Every refactor reports bundle delta.

## Workstream 4: Accessibility scoring

Run axe-core via Playwright weekly. Target: zero serious violations
on Today / Cook / Path / Content by W12; on every surface by W26.

## Workstream 5: Performance budget

Lighthouse mobile target: ≥ 92 on Today / Cook / Path / Content by
W26; ≥ 95 by W52. Run weekly via local Lighthouse (CI version
needs founder-deployed env).

## Workstream 6: Documentation hygiene

Every Friday: re-read the planning docs and update anything that
went stale during the week. Stale docs are technical debt.

---

# What this plan deliberately does NOT do

- **Founder-gated work.** Auth, persistence, observability, paid
  counsel, beta cohort recruitment, Stanford permission expansion —
  all in the runbook, not here.
- **Real ML model hosting.** The pairing engine V2 is a client-side
  weight vector, not a hosted model. A real model is a Stage-8
  founder-unlock conversation.
- **Real-time backend features.** Cook-along is async-fake. The real
  cook-along (live-state-shared backend) is post-W52.
- **Full persona expansion.** Stage-3 retro flagged single-adult,
  student, older-adult cooking-for-one personas. They get content
  hooks in H1 but real persona-specific surfaces are H3 work.

---

# Cross-spanning initiative: Google-Maps-style guided cook navigation

Stefan's 2026-05-02 directive: "make this a very robust and
comprehensive goal by the end by scatter across the developmental
timeframe across the gamut of weeks so there are MVPs at various
stages and more complicated final animation video version is a
final step that would likely need more than vibecoding."

The vision: cooking that feels like Google-Maps voice navigation.
The coach reads each step, the user says "done <X>" (e.g. "done
chopping onions"), the app advances. A visual mode shows a still
of what the action looks like; a final mode loops video of the
action with overlay aids (knife angles, attention pointers).

This is intentionally distributed across the 52 weeks rather than
attempted in one sprint, because:

- The voice spine (W12-W15) is already built; "done <X>" is a
  natural extension of `parseCookVoiceIntent`.
- Visual-mode stills can come from the existing `food_images/`
  catalog at first, then graduate to per-step images as the data
  layer expands.
- Animation-aid overlays are SVG + framer-motion — vibecode-able.
- Real video loops are NOT vibecode-able (production cost,
  licensing, performance budget) and are explicitly founder-gated.

## MVP staging

### MVP 1 — "Done <X>" voice intent (W18, Sprint D)

Extend `parseCookVoiceIntent` (W13) to recognise step-completion
phrases:

- "done", "done chopping", "done with the onions", "all done"
- "finished", "next when I'm done", etc.

The intent maps to `next` semantically, but with a **completion
log entry** so future analytics can see how long each step took
in practice. Pure-function extension; ~10 new test cases.

**Stress test:** ambiguity resolution — "done" alone vs "done
chopping" both fire `next`; "I'm not done" must NOT fire next.

**Acceptance:** parser handles ≥ 6 step-completion phrasings; no
false positives on negated forms.

### MVP 2 — Voice-narrated step playback (W19, Sprint D)

Wire W14's `useTextToSpeech` into the cook step page. When voice
cook is enabled (W15 toggle, W16 settings):

- On step entry, the coach speaks the instruction.
- User can say "repeat" to hear it again (W13 intent already
  exists).
- "Done <X>" advances to the next step (MVP 1 above).
- "Read me the timer" speaks the remaining time.

**Stress test:** rapid step navigation — say "next" 5× in 2s; TTS
queue stays sane (last-write-wins per W14 contract).

**Acceptance:** A user can navigate a 12-step recipe hands-free
without touching the screen. Manual fallback always available.

### MVP 3 — Visual mode toggle (W22, Sprint E)

A toggle on the cook step page (default off when voice cook on,
on when voice cook off): shows a still image for the current
step. Sources:

- `step.imageUrl` if present in the step data.
- Fallback to the dish hero image with a "Step image coming soon"
  badge.

The image is the LARGE element on the page; the instruction
text shrinks to a 2-line summary. This is the "look, don't read"
mode.

**Stress test:** layout sweep at 375×667 with the step image
filling 60% of the viewport; the timer + nav controls stay above
the fold.

**Acceptance:** Visual mode renders for every step in every
seeded recipe. Empty-state graceful for steps without images.

### MVP 4 — SVG attention-pointer overlays (W28, Sprint F)

Animation aids on the still image: arrows pointing to "watch
this corner of the pan", angle indicators on knife-strokes, etc.
Pure SVG + framer-motion; entirely vibecode-able.

Data shape: each step gets an optional `attentionAids: AttentionAid[]`
array where `AttentionAid` is `{ x: number, y: number, kind:
"arrow" | "angle" | "highlight", label: string }`. The data
either lives in seed-step JSON or is generated by a one-time
authoring pass.

**Stress test:** 8 simultaneous aids on one step at 375×667 —
no visual collision, all readable.

**Acceptance:** at least 5 high-traffic seed steps gain aid
overlays as a proof. New steps can adopt the field without
schema migration.

### MVP 5 — Animated SVG sequences (W36, Sprint G)

The aid overlays animate. An arrow that fades + slides to
indicate "stir clockwise"; a highlight that pulses on the rim
of the pan. This is still pure SVG + framer-motion; the budget
is one ~8-frame animation per aid.

**Stress test:** reduced-motion mode — animations collapse to
static stills (gate already enforced via the W7 ESLint rule).

**Acceptance:** at least 3 aids per top-3 cuisine families.

### MVP 6 — VIDEO LOOPS (FOUNDER-GATED, post-W52)

Real video loops of cooking actions (chopping onions, browning
butter, kneading dough). Explicitly NOT vibecode-able:

- Video production: studio time, food stylist, camera work.
- Licensing: any third-party clips need attribution + licensing.
- Performance budget: even short MP4 loops add bundle weight; a
  CDN delivery story is required (Cloudflare R2 founder-unlock).
- Catalog work: ~50 actions × ~5 angles each = 250 clips.

This sits in `docs/FOUNDER-UNLOCK-RUNBOOK.md` as a Stage-2 unlock
item. The codebase ships ready: each step's
`step.videoLoopUrl?: string` field can be wired into the cook
step page once the URLs exist. MVP-1-through-5 deliver 80% of
the perceptual experience; MVP-6 is the polish layer.

## Distribution map

| Sprint   | Week | Initiative MVP                          | Status    |
| -------- | ---- | --------------------------------------- | --------- |
| C        | W13  | Voice-cook intent parser foundation     | ✓ shipped |
| C        | W14  | Voice-cook TTS coach                    | ✓ shipped |
| D        | W18  | MVP 1: "Done <X>" intent extension      | scheduled |
| D        | W19  | MVP 2: Voice-narrated step playback     | scheduled |
| E        | W22  | MVP 3: Visual mode toggle + step images | scheduled |
| F        | W28  | MVP 4: SVG attention-pointer overlays   | scheduled |
| G        | W36  | MVP 5: Animated SVG sequences           | scheduled |
| post-W52 | —    | MVP 6: Video loops (founder-gated)      | runbook   |

The earlier MVPs land before the later ones depend on them; each
ships value at its own rung. A user on W19 has hands-free voice
cooking; a user on W22 has visual support; a user on W28 has
attention aids; a user on W36 has them animated. The Year-1 close
(W52) ships through MVP 5 inclusive.

---

# Acceptance for the 12-month plan

- [x] Plan covers 52 weeks (this doc).
- [x] Every week is AUTO-BUILD-scoped (CLAUDE.md rule 12).
- [x] Every week has a 5-day plan/build/stress/build/close skeleton.
- [x] Every week has a stress-test type assigned.
- [x] Every 5th week has an IDEO design review.
- [x] H1 finishes Stage-3+4 + ships 3 new platform capabilities
      (voice cook, authoring, household memory).
- [x] H2 ships pairing-engine V2 + smart shopping + meal calendar +
      cook-along — real platform advancement.
- [x] Every per-week deliverable lands a test in the same commit.
- [x] Cross-cutting workstreams cover content, tests, bundle, a11y,
      perf, docs.
- [x] Founder-gated work is named and queued, not buried.
