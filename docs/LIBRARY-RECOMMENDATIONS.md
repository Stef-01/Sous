# Library recommendations for the 12-month plan

> Stefan's 2026-05-02 directive: "do integration of this for every
> single new feature add in the 12 month plan. Do thorough online
> search for existing viral and well-starred github repos to
> incorporate that feature, gain a consensus of the best one. for
> example text to speech non AI API ones, or nutrition data, do
> this for all features."
>
> This doc is the **library-research policy** + the consensus-pick
> table for every per-feature week in the
> `STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` plan. New planning weeks
> follow the policy; existing weeks have their pick recorded
> retroactively where applicable.

## Policy: search before you build

Before any per-week build wave begins, the agent does:

1. **Web search** for the feature category — "X library github
   stars 2026", "best Y npm 2026", etc. Use real WebSearch (not
   memory) so the comparison reflects the current state of the
   ecosystem.
2. **Consensus check** — at least one of:
   - GitHub stars + npm weekly downloads
   - Recent (≤ 12 months old) blog comparison
   - Bundle size on bundlephobia
   - Maintainer activity in the past 6 months
3. **Build-vs-adopt decision** — captured in an ADR or in the
   per-week PLAN.md when the decision is non-trivial (see ADR-0002
   on react-tinder-card vs hand-rolled for the format).
4. **Lock the choice** — once adopted, the library is part of the
   per-week CLOSE.md residuals. Future weeks consume the same lib
   unless a concrete bug forces a re-evaluation.

**Override rule:** if a hand-rolled implementation is a tighter
fit (bundle weight + feature parity), document the tradeoff in an
ADR (CLAUDE.md rule 12 lineage). Don't adopt for the sake of
adopting.

## Master pick table

For every feature category in the 12-month plan, the consensus
library is recorded here. Bold picks are already adopted. Italic
picks are queued for the week shown.

| Category                 | Sprint / Week                 | Consensus pick                                                                | Status                                                                                                                  | Source                                                                                                        |
| ------------------------ | ----------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Animation primitives     | shipped                       | **framer-motion**                                                             | adopted Stage-3                                                                                                         | de-facto standard for React UI animation                                                                      |
| Decorative animations    | optional                      | **lottie-react**                                                              | not needed                                                                                                              | only useful for marketing onboarding flair; cook surfaces don't need it                                       |
| State (server)           | shipped                       | **TanStack Query** (via tRPC)                                                 | adopted                                                                                                                 | already in tech stack                                                                                         |
| State (client)           | shipped                       | **Zustand**                                                                   | adopted                                                                                                                 | already in tech stack                                                                                         |
| Schema validation        | shipped                       | **Zod**                                                                       | adopted                                                                                                                 | UserRecipe (W17), pairing engine, tRPC routers                                                                |
| Speech recognition       | shipped (hand-rolled)         | **react-speech-recognition** (Brill)                                          | NOT adopted; hand-rolled `useVoiceTranscript` (W12) is tighter for our needs                                            | top by stars; Web Speech API wrapper                                                                          |
| Speech synthesis         | shipped (hand-rolled)         | **react-speech-kit** (Parton)                                                 | NOT adopted; hand-rolled `useTextToSpeech` (W14) is tighter                                                             | next-best after react-speech-recognition for input                                                            |
| Voice intent parsing     | shipped (hand-rolled)         | **compromise.js**                                                             | NOT adopted at W13 (parser is small, hand-rolled is sufficient); RECONSIDER at W23 if intent list grows past 30 phrases | rule-based NLP; ~1MB/s throughput; small enough for client-side                                               |
| Timer / countdown        | W23 (timer reducer)           | _react-timer-hook_                                                            | queued                                                                                                                  | top recommended; useTimer / useStopwatch / useTime hooks; clean lifecycle                                     |
| Drag-and-drop            | W37+ (meal calendar)          | _dnd-kit_                                                                     | queued                                                                                                                  | modern, mobile-friendly, 60fps, lighter than react-dnd; superior for calendar drag-to-schedule                |
| Form management          | W18-W19 (recipe authoring UI) | _react-hook-form_                                                             | queued                                                                                                                  | half the bundle of formik, no deps, perf via uncontrolled inputs, fastest-growing                             |
| Fuzzy string match       | W32 (smart shopping list)     | _fuse.js_ for general search; _fuzzball_ for ingredient dedup with token-sort | queued                                                                                                                  | fuse for cross-field weighted; fuzzball's token_sort_ratio for "diced onion" ≈ "onion, diced"                 |
| LocalStorage abstraction | optional                      | **direct localStorage** for now; **idb-keyval** when we hit 5MB or need async | not adopted                                                                                                             | Jake Archibald's lightweight wrapper; if we hit quota on cook session history or scrapbook entries, swap      |
| Heavy offline storage    | post-W26                      | _Dexie.js_                                                                    | queued for founder-unlock window                                                                                        | only if real offline mode is in scope post-Drizzle/Postgres unlock                                            |
| Nutrition data           | W3 + W19+                     | **USDA FoodData Central API** + `fooddata-central` npm wrapper                | partially adopted                                                                                                       | already covered in `docs/adr/0001-nutrition-data-source.md`; npm wrapper queued for the recipe authoring loop |
| Image lazy-load          | shipped (Next.js)             | **next/image**                                                                | adopted                                                                                                                 | already in stack via Next 16                                                                                  |
| BlurHash placeholders    | optional                      | _blurhash_                                                                    | low priority                                                                                                            | only if image LCP becomes a measurable problem                                                                |
| ML / embeddings          | post-W52                      | _Transformers.js_ (HuggingFace browser-side)                                  | queued                                                                                                                  | if pairing-engine V3 wants real embeddings without a hosted model                                             |

## Per-feature decision log

### Voice transcription (W12)

**Categories evaluated:** browser-native Web Speech API, react-speech-recognition (JamesBrill), react-speech-kit (Parton), react-speech-to-text (Riley-Brown).

**Decision:** hand-rolled `useVoiceTranscript`.

**Rationale:** The Web Speech API surface is small (~5 events) and our state-based hook contract requirements (last-write-wins, unmount-cancel, graceful-no-op) don't map cleanly to react-speech-recognition's `Commands` API. Hand-rolled cost: ~150 lines + 9 tests; library cost: external dep + would need wrapping anyway. The build is the right call here. ADR-style note: re-evaluate if locale support (W22+) requires platform-specific quirks the lib already handles.

### Voice synthesis (W14)

**Categories evaluated:** browser-native SpeechSynthesis, react-speech-kit (Parton).

**Decision:** hand-rolled `useTextToSpeech`.

**Rationale:** Same as W12 — the API surface is small, the hand-rolled version is ~200 lines + 16 tests, and the codebase needs the same lifecycle pattern for both transcription and synthesis (consistency win). The `pickVoiceForLang` pure helper is too useful to lose to library opacity. Re-evaluate if SSML support is ever required.

### Voice intent parsing (W13)

**Categories evaluated:** compromise.js, node-nlp, hand-rolled phrase matcher.

**Decision:** hand-rolled `parseCookVoiceIntent`.

**Rationale:** Our intent set is < 15 phrases. compromise.js (1MB/s, small footprint) is overkill. node-nlp is server-only (heavy). Hand-rolled cost: ~200 lines + 38 tests, fully under our control for negation guards (which Loop 1 of W13 caught + W18 extended).

**Re-evaluation trigger:** if the intent list grows past 30 phrases OR multi-locale support requires per-locale grammar, port to compromise.js with a thin adapter.

### Recipe authoring UI (W18-W19, slipped to Sprint E)

**Categories evaluated:** react-hook-form, formik, vanilla controlled inputs.

**Decision (queued):** **react-hook-form**.

**Rationale:** Recipe authoring is a multi-section form (title / cuisine / ingredients[] / steps[] / meta) — exactly the use case react-hook-form is best at: nested arrays, no-deps, half the bundle of formik, performance via uncontrolled inputs (matters at 50 ingredients × 50 steps from the W17 stress test). Schema validation already lives in `userRecipeSchema`; react-hook-form has first-class Zod integration via `@hookform/resolvers/zod`.

### Timer reducer + voice-timer commands (W23, originally W22)

**Categories evaluated:** react-timer-hook, react-countdown, easytimer-react-hook, hand-rolled.

**Decision (queued):** **react-timer-hook**.

**Rationale:** The cook flow already has a `<CookTimer>` component but no shared timer hook for voice commands to dispatch into. react-timer-hook gives us `useTimer({ expiryTimestamp, onExpire })` with start/pause/resume/restart out of the box. The voice-cook coordinator (W19) can call `restart(addSeconds(now, voiceIntent.seconds))` on `timer-set` and `pause()` on `timer-cancel`. Pure-function-ish, well-maintained.

### Smart shopping list — ingredient dedup (W32)

**Categories evaluated:** Fuse.js, fuzzball.js, fuzzyset.js, microfuzz.

**Decision (queued):** **fuzzball.js** for dedup; **Fuse.js** for general search.

**Rationale:** Dedup needs token-sort similarity ("diced onion" ≈ "onion, diced") — that's fuzzball's `token_sort_ratio` exactly. Fuse.js is the better cross-field weighted search (better for the Content tab if it ever gets a search bar). Both ship; the codebase can have one of each because they serve different jobs.

### Meal calendar drag-to-schedule (W37+)

**Categories evaluated:** dnd-kit, react-dnd.

**Decision (queued):** **dnd-kit**.

**Rationale:** Modern, lighter than react-dnd, native mobile support (no html5-touch-backend dance), 60fps performance. The 7-day calendar is the right canvas for it. react-dnd's plugin architecture is overkill for our use case.

### Animation aids (W28-W36, MVPs 4-5 of cook-nav initiative)

**Categories evaluated:** framer-motion (already adopted), lottie-react.

**Decision:** **framer-motion** (continue) for SVG attention pointers + animated sequences. Lottie-react NOT adopted because:

- Animations we need (knife-angle indicator, attention arrow that slides clockwise) are simple enough that framer-motion's `motion.path` + `pathLength` does it.
- Lottie requires JSON files exported from After Effects — we don't have a designer pipeline for that yet. Pulling in Lottie + creating designer assets is a multi-week effort that doesn't pay off until MVP 6 (real video).
- Bundle size: lottie-react is ~50KB gzipped; framer-motion already paid.

**Re-evaluation trigger:** if MVP 6 (video loops, founder-gated) ever ships, the post-MVP-6 polish pass might want Lottie for the empty-state / loading-state flair.

## Library-adoption budget

The 12-month plan's stress catalog (under "12 stress tests") includes
**Bundle size delta** — every refactor reports the delta. A library
adoption is measured against the same bar:

- **Threshold:** any new dep adding > 20KB gzipped to the JS
  bundle requires an ADR.
- **Budget:** total H1 (W1-W26) bundle growth ≤ 50KB gzipped over
  the Sprint-A baseline.
- **Audit:** `pnpm build` runs the bundle delta at each per-week
  CLOSE; the agent flags any week that uses > 5% of the H1 budget.

Currently consumed: framer-motion (~30KB), Zod (~15KB), react +
deps (baseline). Headroom remaining at W22: ~5KB.

react-hook-form (~9KB minified) and react-timer-hook (~3KB) fit
inside the headroom; dnd-kit (~17KB core) needs the W26 budget
reset.

## Process record — when this doc updates

- **Per-week PLAN.md** (Day 1) — when a feature week starts, the
  PLAN doc cites this table for its consensus pick OR records a
  build-vs-adopt decision with reason.
- **Per-week CLOSE.md** (Day 5) — captures any divergence from
  the table (lib swap, hand-roll override) with rationale.
- **This file** — re-runs every quarter (W13, W26, W39, W52) to
  refresh ecosystem signals. Each refresh is a commit so the
  history shows when consensus winners change.
