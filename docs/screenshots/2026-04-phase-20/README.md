# Phase 20 — Visual Regression Baseline

This directory is the home for the Phase 20 visual regression screenshot set.

## What to capture

Baseline 375×667 (iPhone SE) screenshots for every screen touched between
Phases 1–19. These serve as the ground-truth reference for future visual
regression runs.

Required shots (filename → screen, state):

- `today-idle.png` — Today, no search active, returning user
- `today-quest-pantry.png` — Today with pantry items, "you already have most
  of this" chip visible
- `today-quick-win.png` — Today with "Under 20 min" filter toggled on
- `today-tonight-committed.png` — Today after committing to a dish via
  TonightChip
- `today-repeat-cook.png` — Today showing the Repeat Cook chip for a recent
  4-star cook
- `today-cook-for-two.png` — Today with "Cook for two" slider expanded
- `path-hero-welcome-back.png` — Path hero in "Welcome back" variant
  (>3 days since last cook)
- `path-constellation.png` — Cuisine Constellation with ≥3 cuisines lit
- `path-confidence-dial.png` — Confidence Dial showing the "Bold" tier
- `path-journey-montage.png` — Journey Montage strip populated
- `path-rest-day.png` — StreakCounter with rest-day outline active
- `cook-step-readaloud.png` — Cook step with read-aloud button visible
- `cook-step-big-hands.png` — Cook step with big-hands mode enabled
- `cook-combined-timer-stack.png` — Combined cook with 2+ active timers
- `cook-win-gift.png` — Win screen showing "Send to a friend" action
- `gift-preview.png` — `/gift/caesar-salad?from=Stefan&stars=5` preview

## How to regenerate

1. Boot dev server: `pnpm dev`
2. With devtools open, set viewport to iPhone SE (375×667).
3. For each shot, reproduce the state (seed via localStorage if needed),
   then capture a full-viewport PNG and save here with the filename above.
4. Commit the new set.

Once the baseline exists, a Playwright visual regression job (not yet
configured — see `planning.md`) can `toHaveScreenshot()` against these.
