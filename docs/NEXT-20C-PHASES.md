# NEXT 20 PHASES — Sprint C: Memory, Relationships, Performance

Purpose: a third 20-phase sprint that makes Sous's compounding moats visible to
the user. The prior two sprints shipped the surface (decluttered Today,
semantic craving matcher, landing polish). This sprint makes the _depth_ of the
product legible: the engine's memory of what you cook, the shape of your
cooking relationships, the feel of the guided cook as a performance instead of
a checklist.

Every phase is tied back to a specific moat in `STRATEGY.md`.

## Non-negotiables

- No invented dishes or images — add guided cook steps only for meals/sides
  already in `sides.json` / `meals.json`.
- No new settings pages. Preferences are learned or captured through a single
  playful interaction, never a checklist.
- One primary action per screen. Every new surface must pass the Sous Test.
- All changes committed to `main`. No feature branches, no worktrees.
- Every phase must leave `pnpm lint`, `pnpm test`, and `pnpm build` green.

---

## Theme A — The app remembers (P1–P4)

**Moat:** _Data (preference memory)._
**Problem:** The engine has been learning since Sprint A, but the user cannot
see it learning. "The recommendations feel smarter than last week" is exactly
the moment a habit forms — and right now we hide it.

- **Phase 1 — Visible preference vector (honest, not creepy)**
  A single strip on the Path page, under `ConfidenceDial`, that renders the
  top three learned signals as warm sentences: _"You reach for bowls when
  you're tired. You cook spicier on weekends. Tuesday carbs are a pattern."_
  No percentages, no bars — observations written in the voice of a partner
  who has watched you cook. Derived from `cookHistoryStats` + day-of-week
  frequency + pantry co-occurrence. Lives behind a subtle "What Sous has
  learned" pill that expands; collapses by default after the third view so
  it does not become noise.

- **Phase 2 — "Because you cooked X, we picked Y"**
  Each pair card in `ResultStack` / `QuestCard` gets an optional one-line
  reason surfaced when (a) the pick shares ≥2 taxonomy axes with a completed
  session from the last 21 days, and (b) the user has cooked ≥5 times. Below
  that threshold, stay silent. The line sits at 11 px, italic, text-subtext
  colour — ambient, not loud. Reason strings generated deterministically by
  `buildPairingRationale(currentDish, cookHistory)`.

- **Phase 3 — Rerun-after-break gentle nudges**
  If a dish with rating ≥4 hasn't been cooked in 21–90 days, surface a warm
  one-liner on the Today page — _"It's been 24 days since your last
  carbonara"_ — as a link inside `RepeatCookChip` that jumps straight into
  the cook flow. Cap at one nudge visible at a time. After 90 days drop the
  nudge so it never becomes a guilt-screen.

- **Phase 4 — Preference decay visualization**
  Replace the static skill dots on the Path skill tree with a subtle warm
  halo whose opacity fades as `lastCookedAt` age grows, decayed at the same
  10 %/30 days rate the engine uses internally. Users see their practice
  cooling off without a number — keeps the moat visible, never scolds.

---

## Theme B — Real social loops (P5–P8)

**Moat:** _Network effects._ Today's `FriendsStrip` shows a mock dataset and
the `Send to friend` button in the Win screen is disabled in the mockup. The
primitives for real sharing already exist (`/gift/[slug]` read-only preview)
— we just need to wire them into the behavioural loops.

- **Phase 5 — Wire "Send to friend" from Win screen**
  Replace the disabled mock button with a real action that (a) builds a gift
  URL via existing `buildGiftUrl(slug, { from, stars })`, (b) on touch
  devices calls the Web Share API with the URL + a one-line message, (c) on
  desktop copies the URL to clipboard and shows a `useToast` confirmation
  ("Copied — paste into a text"). No sign-in wall. The friend opens
  `/gift/<slug>?from=<name>&stars=4` and sees the read-only preview plus a
  single CTA: _"Cook this too."_

- **Phase 6 — Post-cook invite sheet**
  After Win, show a one-time sheet (per dish) with _"Cook this with Alex
  next Tuesday?"_. Contacts are drawn from the `mockFriends` dataset for now
  — phase 8 swaps in a real picker. On confirm, deep-links to iMessage /
  SMS with a prefilled message including the gift URL and suggested
  date-time. No server persistence — the intention lives client-side only,
  and any reciprocal action by the friend happens organically via their own
  gift link.

- **Phase 7 — Tappable friend feed rows → gift preview**
  Currently `FriendsStrip` entries are cosmetic. Make each tile tappable and
  route to `/gift/<dishSlug>?from=<friendName>&stars=<n>` in read-only
  preview mode. This turns the feed from a wallpaper into a discovery
  surface: each friend's cook becomes a direct path into the cook flow.
  Zero new API work — reuses the existing gift route.

- **Phase 8 — "Cooks shared" tally on Path**
  Tiny typographic line on the Path page: _"3 meals shared — Alex cooked
  one of them."_ Uses `localStorage` share log (set on every successful
  phase-5 action) plus a phase-2-style rationale. No graphs, no dashboard
  — a single honest sentence near the confidence line.

---

## Theme C — Sharper craving intake (P9–P12)

**Moat:** _Friction reduction._ Craving → pairing is already < 10 s in most
cases. These four phases close the remaining rough edges.

- **Phase 9 — Camera input polish**
  The `CameraInput` flow currently has thin loading / retry states. Add a
  live confidence bar that counts up as the Vision API responds, an explicit
  "Didn't work — try typing instead" fallback after 6 s, and a
  misidentification correction chip that wires into `findClosestDishes` so
  the user can land on the nearest database match even when Vision misreads.

- **Phase 10 — Craving history chip row**
  On `CravingSearchBar` focus, show a row of the user's last 5 unique
  queries (stored in `localStorage`, 30-day TTL). One-tap re-run. Oldest
  queries drop off silently. No "clear history" button — the TTL handles
  it. Reduces friction for users who rotate a small set of cravings.

- **Phase 11 — Live filter application in craving results**
  Active cook-time and cuisine filters from `QuestCard` are session-scoped.
  When the user opens `TextPrompt` / `CravingSearchBar`, pass those filters
  in so search results honour them too (and show a tiny "Filters on:
  ≤30 min · Indian" pill at the top of results, tappable to clear). Keeps
  the mental model unified: filters apply to the whole Today surface, not
  just the quest card.

- **Phase 12 — "Why this match?" tap-to-expand**
  Semantic search results currently show a one-line reason ("same sauce
  family, creamy"). Tapping the reason opens a small inline expander
  listing every matched axis with a short label — "protein: chicken ✓,
  form: pasta ✓, sauce: cream ✓, cuisine: Italian ✓". Trust builder,
  teachable surface, zero server cost. Closes on outside-tap.

---

## Theme D — Guided cook as performance (P13–P16)

**Moat:** _Content (guided cook quality)._ The moat thesis: competitors can
copy the UI but not 500 hand-authored flows with domain-specific mistake
warnings. This theme sharpens the performance of each cook without inventing
new recipes.

- **Phase 13 — Pre-cook prep-list coalescing**
  Before the first timer starts, show a single consolidated prep screen
  that merges mise-en-place from the main + each side, grouped by station
  (cutting board, stove, oven, blender). Duplicate items are deduped. This
  saves the "read every step first" mental pass that experienced cooks do
  naturally. Generated deterministically from the existing
  `guidedCookSteps` data — zero recipe invention, just coalescing what is
  already authored.

- **Phase 14 — Step transitions at 60 fps on older phones**
  Profile the `StepCard` → `StepCard` transition on a mid-2021 Android
  reference (Pixel 4a baseline) and cut the animation path to ≤ 16 ms per
  frame. Suspects: `AnimatePresence` layout thrash, image re-decode, lucide
  icon tree-shaking. Measured with React Profiler + Web Vitals in dev.
  Target: no dropped frames during step change; reduced-motion users get a
  simple fade.

- **Phase 15 — Mistake-chip evolution (dismissible with memory)**
  Mistake warnings ("don't stir the rice") are excellent for first cooks
  and insulting for the 5th. Add a small `x` on each mistake chip that,
  when tapped, records a `suppress(dishId, mistakeId)` in `localStorage`.
  Suppressed chips stay gone for that dish only, for 180 days. After 180
  days they reappear once — a kind, low-frequency reminder. Preserves
  editorial value for new users while respecting expertise.

- **Phase 16 — Win screen: real rating + real gift-send**
  Win screen currently has a five-star control that writes into the session
  store but no immediate outlet for enthusiasm. Wire Theme B Phase 5 here so
  a 5-star rating surfaces the gift-send affordance inline ("Send to a
  friend?") with a 6-second auto-dismiss. 4-star shows the repeat-cook
  affordance. 1–2 star triggers a single gentle question: "What went
  wrong?" with a 3-chip answer (too salty / too dry / instructions unclear)
  stored in the session for engine learning. No multi-question form.

---

## Theme E — Quality gates (P17–P20)

**Moat:** _Craft signal._ A YC-quality product passes its own bar without
asking reviewers to overlook roughness.

- **Phase 17 — Landing page Core Web Vitals pass**
  Audit `startup-landing.tsx` LCP/CLS/INP on a throttled 4G simulation.
  Expected wins: lazy-load `AppPreviewSection` + `ScreenshotCarousel` +
  `TrustStrip` via `next/dynamic` with `ssr: false`, guarded by
  `useInView`. Convert hero `motion.h1` scroll progress hook to CSS
  `@supports (animation-timeline: scroll())` with a Framer fallback. Target:
  LCP ≤ 1.8 s on Moto G Power simulation, CLS < 0.02.

- **Phase 18 — A11y audit (label pass + focus traps)**
  Sweep the newly shipped components (`FilterDropdown`, `MoreOptionsSheet`,
  `AchievementsLauncher`, `FriendsStrip`, `AppPreviewSection`) for: (a)
  `aria-label` on decorative lucide icons where needed, (b) visible focus
  rings on every interactive surface, (c) tab order rational on keyboard
  nav, (d) focus return after modal close. Run `@axe-core/playwright` as a
  one-off against `/today` and `/path` and fix every A+ issue.

- **Phase 19 — Verification + visual regression baseline**
  `pnpm lint`, `pnpm test`, `pnpm build` all green. Capture Playwright
  screenshots of `/today`, `/path`, `/cook/pasta-carbonara/step-1`, `/win`,
  and the marketing landing at both 375 px and 1280 px widths, diffed
  against a checked-in baseline. Any visible regression must be explained
  in the commit.

- **Phase 20 — Commit + STRATEGY / ROADMAP update**
  STAGE 0.7 section added to `ROADMAP.md`. `STRATEGY.md` decision log gains
  a new entry with one sentence per theme explaining which moat each theme
  deepened and why. Commit to `main`, push.

---

## Phase sequencing rules

- **Parallelism cap:** At most three phases in progress at any time, as per
  CLAUDE.md operational guardrails. Themes A and B can run in parallel since
  they touch separate surfaces; Theme C depends on D for the Win-screen
  gift-send wiring.
- **Checkpoint commits:** Every phase ends with a commit to `main`. Partial
  work ships with a WIP suffix. Never leave more than one phase uncommitted.
- **Test discipline:** Each new engine function (rationale builder, pantry
  coalescer, preference-vector observation strings) gets a minimum of 3
  vitest cases covering the happy path, an edge case, and deterministic
  ordering.

---

## Why this sprint (strategic read)

Sprint A and Sprint B pushed the _front of the product_ forward — the first
impressions on Today and the landing page. Sprint C pushes the _back of the
product_ forward: the memory that builds under the user, the relationships
that compound with each share, the performance feel of the guided cook, and
the quality gates that let this ship to real users.

If Sprint C lands, a user on their 20th cook will visibly experience the
thesis: the app remembers them, the app's picks are measurably sharper, their
friends are here, and every second of the cook feels considered. That is the
habit loop closing — not on paper, on their phone.
