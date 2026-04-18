# NEXT 20 PHASES — Sprint D: Habit, Trust, Polish

Purpose: a fourth 20-phase sprint that deepens the habit loop (rhythm + recall),
closes the remaining relationship surfaces from Sprint C (post-cook invite, new-
friend signalling), sharpens the guided cook as a living performance (step
re-read, substitution memory, consolidated watchlist, low-star capture), and
tightens craft quality (reduced-motion, a11y, landing lazy-load).

Every phase must pass the Sous Test, preserve the no-settings-page rule, and
leave `pnpm lint`, `pnpm test`, `pnpm build` green. All phases ship directly to
`main`.

## Non-negotiables

- No invented dishes or images — all new UI runs on existing data only.
- No new settings pages. Preferences are learned, never configured.
- Every new surface stays silent until real data is available (≥3 cooks /
  ≥1 share / etc.).
- Minimalist bias: prefer a single ambient line or headless hook over a panel.

---

## Theme A — Rhythm + recall (P1–P4)

**Moat:** _Data (preference memory)._ Sprint C made the engine's memory
visible on Path. This theme brings that memory onto Today and Mission, where
it biases the _next_ decision instead of looking backwards.

- **Phase 1 — Cook-rhythm line on Today**
  A single, italic caption under the craving bar: _"You usually cook Tues +
  Thurs evenings."_ Derived deterministically from `completedSessions` via a
  new `deriveCookRhythm` utility. Silent below 3 completed cooks. Never
  shown more than once per day.

- **Phase 2 — Ingredient-reuse hint on `QuestCard`**
  When a suggested dish shares a named pantry ingredient with a cook from the
  last 7 days, surface a one-line ambient hint: _"reuses cilantro from
  Friday's tacos."_ Computed by `matchIngredientReuse` over `cookSessions` +
  the candidate's ingredient list. Only rendered when a real match exists —
  no false positives.

- **Phase 3 — "You made this before" recall on Mission**
  On entering the Mission screen for a dish that exists in
  `completedSessions`, show a subtle stat line above the hero: _"Last cooked
  12 days ago — you rated it 5 stars."_ No scolding tone, no auto-rebook.

- **Phase 4 — Streak-aware welcome line on Today**
  The header's `Sous` wordmark gets an optional 11px sub-caption that rotates
  based on streak: _"Day 3 of cooking."_ / _"Back after a week."_ /
  _"You're cooking again."_ Only renders once per session.

---

## Theme B — Relationships (P5–P7)

**Moat:** _Network effects._ Closes the post-cook invite sheet from Sprint C
(P6) and adds two tiny signals that turn `FriendsStrip` from wallpaper into
a noticeboard.

- **Phase 5 — Post-cook invite sheet**
  One-time (per dish) on Win. Shows: _"Cook this with someone next week?"_ +
  a single input for a name and a deep-link button that opens
  `sms:?&body=<gift-url>` with the existing gift URL + a short message. No
  contacts API, no persistence — intention lives client-side.

- **Phase 6 — FriendsStrip new-since-last-visit dot**
  `useFriendsStripVisited` stamps a `lastSeenAt` on every visit to Today.
  Friend cook tiles that arrived after that timestamp render a 6px warm dot
  in the corner. First visit shows no dots. Self-resetting on each visit.

- **Phase 7 — Gift page CTA polish**
  The `/gift/[slug]` preview currently reads passively. Elevate the primary
  `Cook this too` link into the dominant button visual, star row beside
  sender's name when present. Zero new routes.

---

## Theme C — Search polish (P8–P10)

**Moat:** _Friction reduction._

- **Phase 8 — Camera input 6s typing fallback copy**
  Today's `CameraInput` recognition hangs in a thin loading state.
  Non-invasive: after 6s of recognition, show a secondary "Didn't work — try
  typing instead" link that dismisses the camera. Preserves the auto-
  dismiss-on-success behaviour.

- **Phase 9 — Empty-state starter chips on `TextPrompt`**
  When the craving input is focused and empty AND no history exists, show a
  single row of 4 evergreen starter chips: "chicken pasta", "tacos", "quick
  rice bowl", "something cozy". Tap to submit. Silent once `useCravingHistory`
  has ≥1 entry.

- **Phase 10 — Local result cap + "show more"**
  Closest-match results can blow past the screen on broad queries. Cap to 6
  visible with a `Show 4 more` inline expander that reveals the rest.

---

## Theme D — Guided cook (P11–P14)

**Moat:** _Content quality._

- **Phase 11 — Pre-cook watchlist**
  A single collapsed chip at the top of the Grab step: _"3 things to watch
  for in this cook."_ On expand, lists every step's mistake warning
  (respecting the `useMistakeSuppression` map from Sprint C). Pulled from
  the same `guidedCookSteps` source — zero editorial invention.

- **Phase 12 — Step re-read via tap**
  Tapping a step card's body re-speaks the current instruction via
  `speechSynthesis`. Guarded by `hasSpeech` detection already used by the
  read-aloud player. No UI change in default state — purely an additive
  affordance.

- **Phase 13 — Substitution memory**
  `useSubstitutionMemory` persists accepted substitutions keyed by
  `<dishSlug>::<ingredientId>` for 90 days. `IngredientList` reads this map
  and pre-selects the remembered substitute on the next cook of the same
  dish.

- **Phase 14 — Win-screen low-star capture**
  For 1–2 star ratings, reveal a single 3-chip capture inline: _"What went
  wrong?"_ → `too salty / too dry / instructions unclear`. Chip selection
  stores into the session's `feedback` field for engine learning. No
  multi-question form.

---

## Theme E — Quality + ship (P15–P20)

**Moat:** _Craft signal._

- **Phase 15 — Landing lazy-load + Core Web Vitals pass**
  `AppPreviewSection`, `ScreenshotCarousel`, `TrustStrip`: wrap via
  `next/dynamic` with `ssr: false`, guarded by `useInView`. Target LCP
  improvement on the marketing page.

- **Phase 16 — A11y sweep on sprint-C surfaces**
  `FilterDropdown`, `MistakeChip` dismiss, `CooksSharedLine`,
  `PreferenceStrip`, `IngredientList` station toggle: add `aria-label`s to
  bare icon buttons, ensure visible focus rings, verify tab order.

- **Phase 17 — Reduced-motion sweep on new components**
  Honour `useReducedMotion()` in: `SkillNode` preference-decay halo
  (static gradient, no pulse), `WinScreen` confetti (suppress), Path
  preference-strip expand (instant open), `CooksSharedLine` (no motion).

- **Phase 18 — New-hook unit tests**
  `useShareLog`, `useCravingHistory`, `useMistakeSuppression`,
  `deriveCookRhythm`, `matchIngredientReuse`, `useSubstitutionMemory` each
  get ≥3 deterministic tests (happy, edge, TTL/expiry).

- **Phase 19 — Full verification**
  `pnpm lint`, `pnpm test`, `pnpm build`. Fix everything red before P20.

- **Phase 20 — Commit + ROADMAP STAGE 0.9**
  One commit with a single detailed message capturing every phase. Update
  `ROADMAP.md` with a STAGE 0.9 section. Push to `main`.

---

## Why this sprint

Sprint C made Sous _remember_ the user. Sprint D makes Sous _act on that
memory at the decision point_: when they open the home screen, when they
start a cook, when they rate a bad one, when a friend cooks something new.
Every phase here converts passive data into active, unobtrusive help.
