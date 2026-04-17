# Sous — Next 20 Build Phases

> **Focus:** features only (no new recipes, images, or content).
> **Audience lens:** middle-aged to senior home cook. Zero clutter. One decision per screen. Big targets. Plain language.
> **Path lens:** the Path screen should feel alive and beautiful, not busy.
> **North star:** every phase must deepen at least one moat — preference memory, guided cook quality, or the habit loop.

---

## Global design rules (apply to every phase)

| Rule                   | Value                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Minimum tap target     | 48×48 px                                                                                                          |
| Body text minimum      | 15 px; 17 px for any prose read while cooking                                                                     |
| CTA per screen         | Exactly one primary. Secondary is always visually subordinate                                                     |
| No-scroll rule         | Primary CTA visible on 375×667 (iPhone SE)                                                                        |
| Language               | No raw cooking jargon. Inline gloss on any technique term ("deglaze → splash liquid in to lift the stuck flavor") |
| Settings               | None. Preferences are learned or set via playful single-prompt moments                                            |
| Motion                 | Respect `prefers-reduced-motion`. No spin/flash; gentle spring or fade only                                       |
| Empty states           | Calm, never lonely. One line of welcome + one clear next step                                                     |
| Irreversible actions   | Always confirm softly (inline chip, not modal wall)                                                               |
| Every phase finishes w | `pnpm lint && pnpm test && pnpm build` clean, then commit + push to `main`                                        |

---

## Theme 1 — Foundations for readability (Phases 1–3)

Low-risk groundwork that makes everything after it friendlier to older eyes and hands. Ship before touching visual work so every later phase inherits the new baseline.

### Phase 1 — Readable-by-default typography pass

- Audit every rendered text node in `src/app/**` and `src/components/**`. Anything < 15 px body or < 13 px secondary gets lifted.
- Increase cook-step prose to 17 px with 1.55 line-height (only on `/cook/[slug]` and `/cook/combined`).
- Introduce `--sous-text-body`, `--sous-text-caption`, `--sous-text-cook` CSS tokens in `src/app/globals.css` so future screens consume the same scale.
- Verify: screenshots of Today, Path, Cook (Mission/Grab/Cook/Win) at 375×667.
- Deliverable: one commit, one PR-sized change, zero new features.

### Phase 2 — Tap-target + contrast audit

- Sweep icon-only buttons (close, back, heart, bookmark, reroll, tab bar) to 48 px minimum with invisible padding where the icon itself stays small.
- Check color-contrast ratios on muted text against cream; bump any AA failures.
- New shared primitive `IconButton` in `src/components/ui/icon-button.tsx` wrapping Lucide icons with standardized hit area + focus ring.
- Verify: keyboard tab order on Today + Path, focus ring visible, Lighthouse a11y ≥ 95 on `/today` and `/path`.

### Phase 3 — Plain-language pass on cook steps

- Add a lightweight inline-gloss component: underlined technique word reveals a 1-line explanation on tap (reuses the `Aside` pattern from the landing page).
- Build a small curated glossary (~40 terms) in `src/data/cook-glossary.ts` — deglaze, julienne, fold, temper, bloom, etc.
- Wrap known terms at render time in `step-card.tsx` via a `glossify()` helper. No changes to source step text.
- Verify: a random sample of 10 cook flows shows sensible underlines, no false positives.

---

## Theme 2 — Make the Path screen beautiful (Phases 4–7)

This is the explicit ask. Today Path has the right bones (tree + summary + goal + grid); we make it breathe.

### Phase 4 — Path ambient hero

- Replace the current bare `PathHeader` backdrop with a soft, time-of-day-aware gradient:
  - morning → warm cream + peach
  - afternoon → pale olive + cream
  - evening → dusk lavender + green
  - late night → ink + green
- One-line dynamic greeting under the gradient: "Good evening, Stefan — you're one cook from your weekly goal." Draws from `useCookSessions` + `WeeklyGoalCard` data; no new state.
- File: `src/components/path/path-hero.tsx` (new), consumed from `src/app/(path)/path/page.tsx`.

### Phase 5 — Living skill tree

- Replace the straight SVG connectors in `skill-connector.tsx` with hand-drawn stroke paths (Bezier, 2 px, ink-style) that animate stroke-draw on first view.
- Node unlock: bloom animation — node pulses once, connector ahead ink-fills over 800 ms.
- Subtle parallax: tree scrolls at 0.96× page scroll for depth. Disable under `prefers-reduced-motion`.
- Completed nodes gain a quiet gold rim (not a filled badge) — celebration without clutter.

### Phase 6 — Cuisine constellation view

- Replace the cuisines grid inside the skill tree with a curved "constellation" row: 8 cuisine orbs on a gentle arc, size scaled by your cook count in that cuisine, sparkle only on the most-cooked one.
- One tap opens the existing cuisine detail sheet — no new destinations.
- File: `src/components/path/cuisine-constellation.tsx`. Feeds from `stats.cuisinesCovered` + per-cuisine session counts.

### Phase 7 — Journey montage strip

- At the bottom of Path, above the quick-links grid, a single horizontal scroll strip of your last ~12 cook photos (blur-placeholder to avoid loading jank). Fades to cream at the edges.
- Tap a photo → jumps to that scrapbook entry.
- Empty state: one illustration, "Your story starts with the first dish."
- File: `src/components/path/journey-montage.tsx`.

---

## Theme 3 — Intuition at decision moments (Phases 8–11)

These features remove friction at the exact seconds where users stall.

### Phase 8 — "Tonight" commitment

- On any result card, one tap "I'll cook this tonight" locks it as tonight's plan.
- Today page, on return visit the same day, skips pairing and opens directly into Mission for the committed dish.
- Optional local notification (browser `Notification` API, opt-in via first use prompt only) at user-chosen meal time.
- Hook: `src/lib/hooks/use-tonight.ts`; persisted to localStorage with a date key so it auto-expires at midnight.

### Phase 9 — Plan-my-cook

- In Mission screen, a new chip: "When do you want to eat?" → time picker.
- App computes `start_at = eat_at − total_cook_time` and shows "Start cooking at 6:42 pm."
- Optional 10-min-before reminder via the same notification primitive from Phase 8.
- Reads `cook-sequencer` total time for combined cooks, so parallelization savings flow through.

### Phase 10 — Pantry-aware quest ranking

- Extend `buildQuestDishes()` scoring with a `pantryFit` factor: dishes whose listed ingredients are ≥60% already in pantry score higher, surfaced as a "You already have most of this" chip.
- Reuses `usePantry` (Phase 3 of last round); no new storage surface.
- Test: unit test in `src/lib/engine/quest-builder.test.ts` or wherever `buildQuestDishes` lives.

### Phase 11 — Quick-win chip

- On Today, one gently-pinned chip at the top of the results: "Under 20 min." Tap → filters the result stack to only fast sides.
- On Path hero: after a 7-day break the hero greeting switches to "Welcome back. Let's start easy." and the chip becomes sticky for that session.
- No new settings page; behavior derived from streak + recent session count.

---

## Theme 4 — Hands-free + accessible cooking (Phases 12–14)

Once hands are in flour, cognitive and motor load goes up. These phases meet the user there.

### Phase 12 — Read-aloud step player

- Cook step screen gets a speaker icon. One tap plays the current step via the Web Speech API (free, client-side, works offline).
- Auto-advance is **off by default** — the user still owns pacing. A second tap replays the step.
- Voice defaults to the system's preferred English voice; no picker.
- Fallback message if the browser doesn't support speech synthesis: "Read-aloud isn't available on this browser."

### Phase 13 — Big-hands mode

- A calm inline toggle at the end of the Mission screen: "Make everything bigger during this cook."
- When on, cook UI uses 1.2× font and 1.25× button padding for the duration of the session only (session-scoped, not a permanent setting).
- Auto-suggest: if the step advance button is tapped near the edge 3+ times in one session, the app inline-offers big-hands mode via a small chip — tap to accept.

### Phase 14 — Timer stack timeline

- In `/cook/combined`, add a slim horizontal timeline strip at the top: each active timer is a pill showing remaining time, laid out in parallel lanes.
- Lets the user see at a glance "rice has 4 min, curry has 9 min" without tapping around.
- Driven by existing `useCookStore` timer state.
- File: `src/components/guided-cook/timer-stack.tsx`.

---

## Theme 5 — Compounding the habit loop (Phases 15–17)

Every phase here makes cook N+1 easier because of cook N.

### Phase 15 — Repeat-cook shortcut

- Today page, just under the bird mascot, a soft one-line row: "Last time you loved **Masala Dal**. Make it again?"
- Only appears if the most recent completed cook was rated ≥ 4 stars and is < 14 days old.
- One tap → straight into Mission for that dish.
- Data: `useCookSessions().completedSessions[0]`; no new storage.

### Phase 16 — Rest day grace

- On the streak counter, a tiny "…" menu reveals one option: "Take a rest day." Confirms inline.
- Rest days don't reset the streak; they're stored in the XP ledger as a zero-XP "rest" event and the counter shows a dotted ring around today.
- Max 1 rest day per 7-day window — gently enforced.
- Hook: extend `use-xp-system.ts` with a `markRestDay()` action.

### Phase 17 — Kitchen confidence dial

- On Path, below the constellation, a single radial gauge showing overall "kitchen confidence" — a derived metric from cook count + cuisine diversity + rating distribution.
- No number. Just a dial with a label: "Steady," "Bold," "Fluent," "Master." This hides the moat in plain sight (the more you cook, the more this moves).
- File: `src/components/path/confidence-dial.tsx`. Pure derivation from existing stats; no new storage.

---

## Theme 6 — Gentle social (Phases 18–19)

Network effects without the overhead of a social graph.

### Phase 18 — Recipe gift

- On the Win screen, a new secondary action: "Send to a friend."
- Generates a shareable `sous.app/gift/<slug>?from=<firstname>` link that opens a read-only preview of the dish card + your star rating, with a single "Try it yourself" CTA.
- No signup wall for the recipient — preview works anonymously; CTA lands on Today with the dish pre-cued.
- Files: `src/app/gift/[slug]/page.tsx` (new), share action in `win-screen.tsx`.

### Phase 19 — Household taste blend

- One-time playful prompt on Path: "Cooking for someone else tonight too?" → yes reveals a single slider "More theirs ↔ More yours." No account, no second profile, no settings page.
- Slider value is stored locally and blends into the preference vector passed to the pairing engine for the next pairing request.
- Auto-hides until explicitly re-invoked via a "Cook for two" chip on Today.

---

## Theme 7 — Verification (Phase 20)

### Phase 20 — Final audit + polish

- Full lint + test + build.
- Manual pass on iPhone SE viewport (375×667) for every new screen — CTA visible without scroll.
- Lighthouse mobile: accessibility ≥ 95, performance ≥ 85 on `/today`, `/path`, `/cook/[slug]`.
- E2E: add 3 new Playwright scenarios — read-aloud control present, "Tonight" commitment round-trips to Mission, rest-day confirmation doesn't reset streak.
- Update `ROADMAP.md` and `STRATEGY.md` decision log with a one-line entry per shipped phase.
- One visual regression screenshot set checked into `docs/screenshots/2026-04-phase-20/`.

---

## Sequencing + execution notes

- **Order matters.** Phases 1–3 land first because they raise the floor for every later phase. Phase 4–7 are the visible Path rework. Phases 8–17 are the intuition + habit work. Phases 18–19 open the network-effect door.
- **One phase = one commit on `main`.** If a phase grows beyond ~300 changed lines, split it mid-phase and commit twice.
- **Every phase ends with visual proof.** A screenshot of the before/after in the commit body for any UI-touching phase.
- **No new settings pages ever.** If a phase seems to need one, the answer is an inline chip or a one-time playful prompt.
- **If a phase misses the "senior-friendly" smell test** — can a 62-year-old use it while holding a dish towel — it doesn't ship.
