# Sous V2 Ambitious Upgrade Plan — 20 Phases

## Current State (April 14, 2026 Audit)

- **76 meals**: 35 with images, 41 without
- **203 sides**: 96 with images, 107 without
- **129 image files** in `/public/food_images/`
- **Home page shows SIDES as quest cards** — should show MEALS 80% of time
- **Quest card uses emoji fallback** even when real images exist for some items
- **Images exist but aren't always being displayed** (mapping issues)

---

## Phase 1: Meal-First Home Page (80% Meals)
Rewrite `quest-card.tsx` to build quest deck from **meals** 80% of the time, sides 20%. Show meal name, cuisine, heroImageUrl, description. "Start cooking" → cook flow for that meal with side pairing. This is the single biggest UX win.

## Phase 2: Fix Image Display in Quest Cards
Ensure quest cards actually SHOW the food images when they exist instead of emoji fallback. Fix the image → fallback logic.

## Phase 3: Map Unreferenced Images
Match the 2 unreferenced images (`cucumber_tomato_raita.png`, `mint_raita.png`) to their sides. Audit all 129 images against all 279 entries.

## Phase 4: Generate Meal Images Batch 1 — Japanese (6 meals)
Generate realistic food images for: teriyaki-salmon, chicken-katsu, gyudon, yakitori, miso-cod, tempura-udon.

## Phase 5: Generate Meal Images Batch 2 — Korean (5 meals)
Generate: kimchi-jjigae, bulgogi, soondubu-jjigae, japchae-main, dakgalbi.

## Phase 6: Generate Meal Images Batch 3 — Thai (5 meals)
Generate: green-curry, massaman-curry, tom-kha-gai, khao-pad, basil-chicken.

## Phase 7: Generate Meal Images Batch 4 — Chinese (5 meals)
Generate: kung-pao-chicken, char-siu, mapo-tofu-main, steamed-fish-cantonese, wonton-noodle-soup.

## Phase 8: Generate Meal Images Batch 5 — Vietnamese (4 meals)
Generate: bun-bo-hue, com-tam, banh-xeo, ca-kho-to.

## Phase 9: Generate Meal Images Batch 6 — Filipino (16 meals)
Generate: chicken-adobo, sinigang-na-baboy, kare-kare, tinola, bistek-tagalog, eggplant-adobo, tortang-talong-with-chicken, open-lumpia-bowl, grilled-pompano, arroz-caldo, open-face-pandesal-sandwich, chia-champorado, bbq-chicken-filipino, veg-pancit, filipino-grilled-shrimp, tocino-rice-bowl.

## Phase 10: Generate Side Images Batch 1 — Japanese/Korean/Thai Sides (30+)
Generate images for all Japanese, Korean, and Thai sides that lack images.

## Phase 11: Generate Side Images Batch 2 — Chinese/Vietnamese/Filipino Sides (25+)
Generate images for remaining Asian cuisine sides.

## Phase 12: Generate Side Images Batch 3 — American/Mediterranean/General Sides (40+)
Generate images for Western, Mediterranean, and general sides.

## Phase 13: Update meals.json with New Image URLs
Wire all 41 newly generated meal images into meals.json heroImageUrl fields.

## Phase 14: Update sides.json with New Image URLs
Wire all 107 newly generated side images into sides.json imageUrl fields.

## Phase 15: Side Pool Validation & Repair
Audit every meal's `sidePool` — verify all referenced side IDs exist. Fix broken references. Ensure every meal has 6-12 sides in its pool.

## Phase 16: Pairing Engine Improvements
Ensure `pairings.json` covers all 76 meals. Expand ENGINE_MAIN_TO_MEAL_ID mappings. Add tier validation.

## Phase 17: Visual QA Round 1 — Screenshot Every Page
Run Playwright across all routes with new images. Verify: images load, no broken references, correct aspect ratios, proper fallbacks only when genuinely needed.

## Phase 18: Visual QA Round 2 — Mobile Viewports
Test 3 viewports (iPhone SE, iPhone 14 Pro, Pixel 7). Verify image sizing, touch targets, scroll behavior with new image-heavy cards.

## Phase 19: Performance Optimization
Add `next/image` sizes attribute, implement blur placeholder, lazy load below-fold images. Verify no LCP regression.

## Phase 20: Final Push + Summary
Commit everything, push to main, write summary of what changed. Update CLAUDE.md Rule 11 to reflect new image state.
