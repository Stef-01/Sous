# Polish Checklist — Recurring UI Quality Guard

> **Authored:** 2026-05-01
> **Status:** Active — referenced from each weekly polish slot in [`STAGE-1-2-6MO-TIMELINE.md`](./STAGE-1-2-6MO-TIMELINE.md)
> **Owner:** Whoever ships the week's deliverable runs the checklist before commit.
> **Karpathy guard:** Polish is not a phase, it's a recurring tax. Each timeline week reserves ~half a day; bigger animation work gets its own dedicated week.

---

## 1. The four passes

Each polish slot runs four passes against the surface that just shipped. None take more than 10 minutes if the surface was built thoughtfully; they catch the regressions that make an app feel unloved.

### Pass A — Navigation integrity (5 min)

The "stuck on Content" bug shipped in Stage 3 because no one walked the routes. From now on, every new route is walked end-to-end:

- [ ] Tab bar visible on every non-modal route in the new surface.
- [ ] Back button or `BackLink` returns to a sensible parent (not blank).
- [ ] Browser back/forward + in-app back agree.
- [ ] Deep links work cold (open a sub-route via URL, not just from Today).
- [ ] Modal/sheet `×` closes to the route the user came from, not always to `/today`.
- [ ] Keyboard `Esc` dismisses any open sheet.

### Pass B — Layout fit & scaling (5 min)

- [ ] 375 × 667 (iPhone SE) — primary CTA above fold per CLAUDE.md rule 10.
- [ ] 390 × 844 (iPhone 13/14) — most-common viewport.
- [ ] 414 × 896 (iPhone 11 Pro Max) — wider gutter check.
- [ ] 768 × 1024 (iPad mini portrait) — phone-frame stretches sensibly.
- [ ] Long copy doesn't break (German-length test string in copy fields).
- [ ] Headline doesn't wrap to ≥ 3 lines on default viewport.
- [ ] No horizontal scroll anywhere except the named horizontal rails.
- [ ] Safe-area-inset-bottom respected (tab bar, sheets) on standalone-PWA frames.

### Pass C — Minimalism cull (5 min)

CLAUDE.md rule 6: when in doubt, remove it. Apply to every new component:

- [ ] Every chip/badge/icon answers: "does removing this hurt the cook decision?" If no, remove.
- [ ] No more than one accent colour per surface (green is the accent; warm-orange is reserved for streaks/highlights).
- [ ] No icon-with-redundant-label unless the icon is non-obvious.
- [ ] Section headers are 11pt-bold-uppercase-tracking; never serif unless it's a hero.
- [ ] No drop shadows on top of drop shadows.
- [ ] Empty states don't shout (no large illustrations, just one quiet line + an action).
- [ ] Counts that say "0" should hide the whole element, not display "0".

### Pass D — Animation polish (10 min)

The Duolingo bar:

- [ ] Every state transition is animated, but only with motion that earns its frame budget.
- [ ] Spring physics, not linear easing, for any UI that bounces (`stiffness: 300-400`, `damping: 20-30`).
- [ ] Tap targets get `whileTap={{ scale: 0.92 }}` micro-feedback.
- [ ] Lists stagger their entrance (`delay: i * 0.05`) on first reveal, never on re-render.
- [ ] Page transitions use `PageTransition` (existing) — never manual.
- [ ] Confetti / celebration moments respect `useReducedMotion`.
- [ ] Skeleton loaders use a soft shimmer, not a hard pulse.
- [ ] Animations stop if the user navigates away mid-transition (no orphaned spinners).
- [ ] Haptic feedback on every primary tap (`useHaptic`).

---

## 2. Where the passes happen in the timeline

| Week                               | Pass focus                    | Rationale                                                                                                  |
| ---------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| W2 polish slot                     | A + B                         | Foundation week — no new visible surface, but verify tab-bar + scaling didn't regress on existing screens. |
| W4 polish slot                     | A + C                         | Spotlight engine indirectly affects QuestCard back-face copy density.                                      |
| W6 polish slot                     | A + B + C                     | Scorer changes are invisible; verify no QuestCard regression.                                              |
| W9 polish slot                     | A + B + C + D                 | First visible Parent Mode surface — full pass.                                                             |
| W10 polish slot                    | A + B + D                     | Spice slider is a new in-cook control — animate with care.                                                 |
| W11 polish slot                    | A + B + C + D                 | Kid-swap chip + bottom sheet is a new modal pattern — full pass.                                           |
| W12 polish slot                    | A + B + C + D                 | Win screen + nutrient spotlight + content track — full pass on three surfaces.                             |
| **W19 dedicated polish week**      | All four, every surface       | After Phase B is done, before content/legal/beta — the canonical sweep.                                    |
| **W22b Reels V2 + animation week** | All four + Duolingo deep-dive | Reels overhaul + Duolingo-grade animation pass on Today, Path, Win, Skill-tree.                            |
| W24 polish slot                    | A + B + C + D                 | Beta-feedback-driven fixes.                                                                                |
| W26 polish slot                    | All four                      | Pre-launch full sweep.                                                                                     |

---

## 3. The "Duolingo-grade animation week" (W22b expanded)

Sous already uses Framer Motion throughout; the next bar is choreography, not capability. Concrete moves:

- **Skill tree node bloom**: when a node unlocks, ripple from centre with a 600ms outward circle + colour wash + sound. Today the bloom is a single scale tween.
- **Win screen confetti**: replace the current confetti with a spring-physics sparkle burst that respects the dish's accent colour. Duolingo's owl-celebration analog.
- **Streak-flame animation**: a continuous gentle flicker on the streak counter when ≥ 3 days, not just a static icon.
- **QuestCard swipe**: add a satisfying snap when the card hits the discard / save threshold; today's drag is functional but mute.
- **Coach quiz**: each answer fires a confetti pulse on the chosen chip + a soft chime — currently a colour change only.
- **Achievement toast**: reframe as a slide-up sheet with the achievement icon doing a small entrance animation; today's toast is too quiet for a real win.
- **Pull-to-refresh**: bird-mascot blink + dot-trail spinner — currently a system spinner.
- **Page transitions**: cross-fade with subtle horizontal motion based on tab order (Today → Path = right, Path → Today = left). Today is fade-only.

Acceptance for the dedicated week:

- All eight moves above shipped + reduced-motion fallbacks.
- Lighthouse Mobile score doesn't regress > 3 points on Today / Path / Win.
- 60fps on a 2019-era iPhone reference device under throttled conditions.
- No animation runs longer than 1.2 s end-to-end.
- A "before / after" 30-second screen recording lives in `docs/screenshots/2026-09-w22b/`.

---

## 4. The minimalism standing principles

These are immutable across passes. If a debate happens during a polish slot, defer to these:

1. **Cream beats grey.** `--nourish-cream` is the canonical background. Don't introduce a new grey.
2. **Green is the only primary.** Warm-orange is the secondary accent and is reserved.
3. **Serif is for hero typography only.** Body and captions are sans.
4. **One CTA per screen.** Visual subordination of alternatives is mandatory.
5. **No icon shall stand alone unless its meaning is obvious.** Otherwise label.
6. **Chips quietly disappear when their value is zero.** Never display "0".
7. **Decorative emoji is forbidden.** Functional emoji (skill-tree, achievements) is permitted.
8. **No vertical scroll-blocking modals.** Sheets only.
9. **No autoplay of audio anywhere.** Reels V2 included.
10. **No popovers that obscure the primary CTA.** Sheets only.

---

## 5. The "make it Duolingo" north-star

When in doubt about a polish call, the question is: _would Luis von Ahn merge this?_

- Is the motion warm enough?
- Does it celebrate the human at the keyboard?
- Does it never make them feel scolded?
- Is the next action one tap away, every time?

If the answer is no, the polish isn't done.
