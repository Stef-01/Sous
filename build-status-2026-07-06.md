# Build Status - July 6, 2026

## This Session: 40 Units Shipped

### Menu-app (W1-W20 shipped, autonomous track complete + founder preflight + queue polish)

- **W1** - Community poll 60s auto-refresh + visibilitychange refetch + clobber guard (`5bdc5fe`)
- **W2** - Meal-request vote reconcile (most already done, added request-vote path) (`ebe28e8`)
- **W3** - Feedback double-submit guard: disabled Share button during write, sheet stays open on failure (`3847873`)
- **W4** - Dish-detail allergen transform extracted + tested (`0bf38cc`)
- **W5** - Profile sheet now edits device-local display name + email; community recipe publish uses the saved display name for attribution (`380beaa`)
- **W6** - Guided-cook ingredient icons now render as stable, family-toned food marks with a quiet checked overlay; component contract covered by tests (`d7e4819`)
- **W7** - Guided-cook Grab list now carries the shared g/cups unit switch only when rows can honestly convert, using the registry-backed displayQuantity path for by-dish and by-station quantities (`75102c8`)
- **W8** - Guided-cook "Add missing" now preserves ingredient quantities and per-dish recipe source metadata into the shopping list, so grocery rows show amounts and recipe chips stay accurate (`10bb13f`)
- **W9** - Combined-cook "By station" Grab view now uses the same serving-scaled ingredient sections as "By dish", preventing stale quantities after the serving stepper changes (`4db06e4`)
- **W10** - Shopping-list recipe chips and grocery nutrition preview now read merged `contributedBy` source ledgers, so recipes do not disappear when all their ingredients aggregate into shared rows (`2514691`)
- **W11** - Shopping-list recipe-chip removal is now non-destructive for merged grocery rows, using per-recipe contribution ledgers to keep shared ingredients and recompute quantities where possible (`888b812`)
- **W12** - Shopping-list rows now use the richer ingredient-icon library for known foods while preserving the legacy aisle emoji fallback for unknown grocery items (`56b3b27`)
- **W13** - Card and kicker primitives are now contract-tested, `Card` supports semantic surfaces, and the shopping-list recipe/nutrition surfaces use the shared card + kicker treatment (`f708c23`)
- **W14** - Shopping-list captions, spacing, and row motion are token-aligned: grocery nutrition copy uses `.sous-meta`, list chrome moved to `--space-*`/`--row-gap`, and row animation routes through `motionTransition` with a design-contract test (`67b4cf3`)
- **W15** - Added a Playwright provenance smoke for the combined-cook grocery handoff and hardened localhost production/WebKit e2e by keeping HTTPS-only transport headers deployed-only: direct combined cook -> Add missing -> persisted recipe/quantity ledgers -> shopping-list recipe chips, nutrition preview, ingredient row, plus tested security-header policy (this commit)
- **W16** - Deferred Today search taxonomy, saved recipes, and friends rails behind intent/viewport loaders: closed Today no longer requests the craving-search chunk until search opens, below-fold rails load only after the app scroller reaches them, and a Today performance-budget test pins the source split (this commit)
- **W17** - Added the Cook Together deterministic local core and realtime adapter seam: presence, step progress, leave/stale handling, shared win derivation for two simulated cooks, local publish/subscribe bus, and Supabase-ready env-mode stub are covered by focused tests (this commit)
- **W18** - Added deterministic group-challenge depth and gifting polish: in-pod member leaderboards, group streak/at-risk computation, pod-share analytics payloads, canonical recipe-gift URLs/payloads, shared gift-page sanitizers, Win-screen/friends-strip gift routing, and typed viral-loop analytics are covered by focused tests (this commit)
- **W19** - Added the founder-gated integration contract: auth, storage/R2, realtime, charity payments, and AI now have one pure env switchboard with mock/stub/live status, kill switches, configured/missing env reporting, and LLM budget guard decisions covered by focused tests (this commit)
- **W20** - Closed the 20-week autonomous moat track with a regression checklist, founder-gate punch list, ROADMAP closeout, STRATEGY decision-log update, and plan progress update (this commit)
- **W21** - Added founder-unlock preflight: the gate contract now includes database readiness, `pnpm founder:preflight` prints the ordered unlock/smoke checklist without exposing secret values, and focused tests cover the report path (this commit)
- **W22** - Hardened the fullscreen Today meal-queue keyboard flow: shortcuts now resolve through an explicit contract, Escape closes the nutrition sheet before closing the queue, cook/pass/save shortcuts pause while the sheet or editable focus is active, and the core-loop Playwright smoke verifies keyboard save against the current Today UI (this commit)
- **W23** - Put the fullscreen Today meal queue on the shared modal accessibility contract: the dialog now locks background scroll via the common hook, moves focus into the full-screen queue, cycles Tab/Shift+Tab inside it, restores focus on close, and is guarded by the overlay-a11y source contract while preserving the meal-swipe shortcuts (this commit)
- **W24** - Hardened the meal-queue Info sheet as a nested modal: opening nutrition now moves focus into the sheet, Tab lands on an explicit Close info control, Escape closes the sheet while keeping the meal queue open, and the nested overlay contract plus Chromium/mobile-Safari core-loop coverage guard the flow (this commit)
- **W25** - Fixed nested focus ownership in the fullscreen meal queue: the parent queue trap now pauses while the Info sheet is open, so Tab/Shift+Tab wraps inside nutrition instead of counting background queue controls; core-loop Playwright now asserts focus remains inside the Info dialog (this commit)
- **W26** - Made the post-queue cook step visual-first by default for fresh devices and wired combined cooks to pass dish hero images into `StepCard`, so the main plate flow lands on a large food image plus compact instruction instead of a text-first step; core-loop Playwright now asserts the combined cook step is in visual mode (this commit)
- **W27** - Added a shared cook-step keyboard contract: ArrowRight/PageDown advance one step, ArrowLeft/PageUp go back one step, shortcuts pause while editing or asking step Q&A, and the core-loop Playwright smoke now verifies keyboard step navigation inside a combined cook (this commit)
- **W28** - Closed the last keyboard-only gap in guided cook: ArrowRight/PageDown now activate the final step's Done action and continue into the Win screen, with a 3-step garlic-bread Playwright smoke asserting final-step completion, diary auto-log confirmation, and rating group visibility (this commit)
- **W29** - Closed the Today meal-queue filter touch-target gap from the design audit: source tabs, filter category rows, filter option rows, reset/clear rows, and the shared dropdown option rows now keep 44px tap geometry while preserving the compact visual language; Today filter Playwright now asserts those hit areas in Chromium and mobile Safari (this commit)
- **W30** - Clarified the Today craving-search affordance: the home trigger now stays a single minimalist control, drops the tiny "Go" text, exposes an explicit accessible name, and uses a quiet 44px green arrow target so the primary meal-discovery action reads as tappable without adding another button (this commit)
- **W31** - Hardened the opened Today craving helper for touch: camera, submit, and close are now true 44px icon controls, the input reserves space so text no longer sits under the icons, and core-loop Playwright measures the helper controls in Chromium and mobile Safari (this commit)
- **W32** - Finished the Today craving helper's one-tap discovery targets: popular suggestions, recent-history chips, "Show more" rows, result rows, and semantic "Why?" controls now preserve 44px touch geometry while staying visually light; core-loop Playwright checks suggestions and search results in Chromium and mobile Safari (this commit)
- **W33** - Made the first-run Path tutorial escape harder to miss: both the top-right close icon and the bottom "Skip intro" control now use explicit 44px geometry, the text escape has visible pill treatment on the dark sheet, and Path Playwright verifies both exits plus persistence of the completed tutorial flag (this commit)
- **W34** - Removed the first-run Path interstitial from the default flow: fresh devices now land on the real Path page immediately, the empty-state hero exposes an explicit "How Path works" help action, and Path Playwright verifies both the zero-tap landing and the opt-in tutorial exits (this commit)
- **W35** - Removed the first-run Today onboarding interstitial from the default flow: fresh devices now land on the real meal surface, the first-run hint exposes a 44px "Tune taste" action, More Options keeps personalization reachable, and core-loop Playwright verifies both zero-tap landing and opt-in onboarding skip persistence (this commit)
- **W36** - Reworked the Games hub away from the audited symmetric arcade-card pattern: the page now uses local food photography, one large featured daily game, compact asymmetric rows for the other games, no "Tap to try" filler, and Playwright verifies the photo-led layout geometry plus all four routes (this commit)
- **W37** - Made the fullscreen Today meal queue more food-led and less chrome-heavy: the active card now uses a taller centered photo frame, permanent photo overlays and queue-card shadows are removed, the Info affordance is icon-only, cook time moved into the metadata line, and Playwright verifies the dominant image geometry plus the three-action bar (this commit)
- **W38** - Made guided-cook Mission screens more food-led across single and combined cooks: the hero now bleeds to the mobile rail, permanent hero overlays are removed, Save sits beside the primary cook CTA as a separate 44px action, and Playwright verifies the full-width hero plus split save/cook controls (this commit)
- **W39** - Simplified the guided-cook Win screen so completion defaults to the rating, auto-log confirmation, one dominant "Back to Today" CTA, and one 44px "More actions" disclosure; Save/Photo/Note/Again/Send remain available inside the tray with 44px targets, low-star reflection still auto-opens it, and core-loop Playwright verifies the collapsed and expanded states (this commit)
- Tests: 21 -> 149 plus strengthened core-loop Playwright coverage
- Next unit: run the preflight against real `DATABASE_URL` when available, or take one narrow core-loop friction reduction

### Casa (K11 + RF13 shipped, next: Y7)

- **K11** - Dedup cuisine term dropped (was permanently dead on shipped path) (`ef496ce`)
- **RF13** - Reanimated/Worklets alignment: plan said bump worklets -> 0.10.x but that breaks expo-modules-core peers. Real fix: pin reanimated 4.5.0 -> 4.3.1 (SDK 56 bundled). Zero peer warnings. (`66ab792`)
- Tests: 1679 core + 50 mobile
- Next unit: **Y7** (admin gated entry)

## Ready to Launch

Say "keep going" to run the next founder-unlock rehearsal, take another narrow core-loop friction reduction, or start Casa Y7.
