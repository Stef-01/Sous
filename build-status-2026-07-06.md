# Build Status — July 6, 2026

## This Session: 14 Units Shipped

### Menu-app (W1-W13 shipped, next: W14)

- **W1** — Community poll 60s auto-refresh + visibilitychange refetch + clobber guard (`5bdc5fe`)
- **W2** — Meal-request vote reconcile (most already done, added request-vote path) (`ebe28e8`)
- **W3** — Feedback double-submit guard: disabled Share button during write, sheet stays open on failure (`3847873`)
- **W4** — Dish-detail allergen transform extracted + tested (`0bf38cc`)
- **W5** — Profile sheet now edits device-local display name + email; community recipe publish uses the saved display name for attribution (`380beaa`)
- **W6** — Guided-cook ingredient icons now render as stable, family-toned food marks with a quiet checked overlay; component contract covered by tests (`d7e4819`)
- **W7** — Guided-cook Grab list now carries the shared g/cups unit switch only when rows can honestly convert, using the registry-backed displayQuantity path for by-dish and by-station quantities (`75102c8`)
- **W8** — Guided-cook "Add missing" now preserves ingredient quantities and per-dish recipe source metadata into the shopping list, so grocery rows show amounts and recipe chips stay accurate (`10bb13f`)
- **W9** — Combined-cook "By station" Grab view now uses the same serving-scaled ingredient sections as "By dish", preventing stale quantities after the serving stepper changes (`4db06e4`)
- **W10** — Shopping-list recipe chips and grocery nutrition preview now read merged `contributedBy` source ledgers, so recipes do not disappear when all their ingredients aggregate into shared rows (`2514691`)
- **W11** - Shopping-list recipe-chip removal is now non-destructive for merged grocery rows, using per-recipe contribution ledgers to keep shared ingredients and recompute quantities where possible (`888b812`)
- **W12** - Shopping-list rows now use the richer ingredient-icon library for known foods while preserving the legacy aisle emoji fallback for unknown grocery items (`56b3b27`)
- **W13** - Card and kicker primitives are now contract-tested, `Card` supports semantic surfaces, and the shopping-list recipe/nutrition surfaces use the shared card + kicker treatment (this commit)
- Tests: 21 → 72
- Next unit: **W14** (pick next highest-value menu-app polish/bug from current repo state)

### Casa (K11 + RF13 shipped, next: Y7)

- **K11** — Dedup cuisine term dropped (was permanently dead on shipped path) (`ef496ce`)
- **RF13** — Reanimated/Worklets alignment: plan said bump worklets→0.10.x but that breaks expo-modules-core peers. Real fix: pin reanimated 4.5.0→4.3.1 (SDK 56 bundled). Zero peer warnings. (`66ab792`)
- Tests: 1679 core + 50 mobile
- Next unit: **Y7** (admin gated entry)

## Ready to Launch

Say "keep going" to start W14 + Y7.
