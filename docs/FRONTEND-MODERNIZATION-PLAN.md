# Frontend Modernization Plan

> Date: 2026-07-13
>
> Scope: Today, Path, Community, guided Cook, and the shared mobile shell
>
> Method: live mobile audit at 390 x 844, source inspection, and screenshot comparison

## 1. Product Goal

Sous should feel like a calm cooking tool whose primary material is food, not interface chrome. The redesign must improve visual quality by removing competition, reducing containment, and clarifying the next action. Existing behavior, routes, saved state, accessibility controls, and content depth remain intact.

The governing principle is **deference to food**:

- Photography receives the largest uninterrupted area.
- One primary action is visually dominant per screen.
- Borders communicate structure only when whitespace cannot.
- Secondary controls remain discoverable without competing with the current task.
- Motion explains state changes and never decorates static content.

## 2. Live Audit

### Today

The food card is strong, but a large search surface and a two-action first-run card delay it. Below the hero, multiple bordered cards, pills, and optional prompts create a second dashboard. The fixed tab bar also needs an explicit content inset so it never obscures the final interactive row.

**Change:** retain search as the entry action, reduce its height and decoration, render the meal immediately after it, and move first-run personalization below the hero as one dismissible inline row. Remove card shadows from the supporting surfaces.

### Path

The page gives equal visual weight to the header, level ring, three kitchen shortcuts, a large empty-state card, and two disclosure rows. The result is a stack of containers rather than a clear path from meal planning to skill progress.

**Change:** make Pantry, Plan, and Groceries a compact horizontal workflow; replace the first-run card with an unframed empty state; reduce header height; preserve the expandable kitchen and progression sections as lower-priority disclosure rows.

### Community

The page contains good content but exposes almost all of it in one long feed. Articles and research cards repeat until the page becomes difficult to scan. The sticky section control navigates a document instead of helping users choose a content mode.

**Change:** make Community a curated hub. Show a featured story, a short reels rail, four current reads, two research briefs, expert voices, and four questions. Add explicit `See all` destinations where routes exist. Tag filtering can show all matching reads because that is an intentional search state.

### Guided Cook

This is the strongest surface. The full-width food image and single start action already establish the right hierarchy. The remaining friction is in secondary controls: outlined flavor pills, a dashed scheduling chip, and a separate centered accessibility pill create visual fragments below the CTA.

**Change:** preserve the flow and image scale. Use quiet text metadata, a flat planning row, and a low-emphasis accessibility action. Keep Save distinct from Start because they represent different intents.

### Shared Shell

The current design language relies on 16-22px radii and soft shadows for nearly every container. That makes distinct information types look equivalent. The active tab is another rounded card, and the navigation casts a shadow over content.

**Change:** adopt an 8px maximum card radius, hairline borders, no default card shadows, a stable 64px tab-bar content height plus safe-area inset, and a simple active icon/label state. Raised shadows remain reserved for modal sheets and transient overlays.

## 3. Design Foundation

### Color

- Canvas: `#F7F7F5`, used only where a page needs separation from white content.
- Primary surface: white.
- Ink: existing near-black.
- Brand: existing forest green.
- Secondary text: existing AA-compliant gray.
- Border: 6-8% black hairline.
- No gradients on standard app surfaces. Image scrims remain allowed only when text must sit over photography.

### Geometry

- Page gutter: 20px.
- Major section gap: 28px.
- Standard surface radius: 8px.
- Small controls and thumbnails: 6px.
- Pills are reserved for filters, statuses, and binary selections.
- Touch targets remain at least 44 x 44px even when their visible glyph is smaller.

### Elevation

- Cards: no shadow.
- Sticky navigation and headers: hairline separator only.
- Sheets/modals: one restrained raised shadow.
- CTA: no glow; color and contrast establish priority.

### Type

- Hanken Grotesk remains the display family and Inter remains the UI family.
- Page titles: 24-28px.
- Section titles: 18-20px.
- Body: 15-16px.
- Metadata: 12-13px with WCAG AA contrast.
- Letter spacing is zero for display text; uppercase labels retain modest positive spacing.

### Motion

- 150ms press feedback for buttons and tabs.
- 220ms state transitions for disclosure and segmented controls.
- No staggered entrance animation on static lists.
- All motion respects `prefers-reduced-motion`.

## 4. Implementation Map

### Shared components

- `src/app/globals.css`: modern surface/radius/elevation tokens, app-safe bottom inset utility, flat shared surface classes.
- `src/components/shared/tab-bar.tsx`: remove the active lozenge and shadow; use a quiet top rule and stable geometry.

### Today

- `src/components/today/mascot.tsx`: compact the craving trigger and remove its shadow.
- `src/app/(today)/today/page.tsx`: move the first-run coachmark below the meal hero and reduce vertical spacing.
- `src/components/today/first-run-coachmark.tsx`: replace the card and second button with one inline personalization action and a dismiss control.

### Path

- `src/components/path/path-header.tsx`: reduce vertical depth and flatten badge styling.
- `src/app/(path)/path/page.tsx`: compact the three workflow shortcuts and simplify the first-run state.

### Community

- `src/app/(community)/community/page.tsx`: cap default article and research previews, add clear continuation links, and simplify sticky navigation styling.
- `src/components/content/article-card.tsx`, `research-brief-card.tsx`, and `featured-hero.tsx`: remove default shadows and reduce radii.

### Cook

- `src/components/guided-cook/mission-screen.tsx`: simplify metadata and optional controls while preserving food dominance and action order.
- `src/components/guided-cook/plan-cook-chip.tsx`: replace the dashed pill with a flat full-width utility row.
- `src/components/guided-cook/big-hands-toggle.tsx`: render as a quiet text action.

## 5. Acceptance Criteria

1. Today shows the search and meal hero before optional onboarding guidance on a fresh profile.
2. No core page uses a default card shadow; modal/sheet elevation is unaffected.
3. Bottom navigation never overlaps page content at 375 x 667, 390 x 844, or desktop widths.
4. Path's primary kitchen workflow fits in one compact row and its fresh-user state is not a framed card.
5. Community's unfiltered home renders at most four article cards and two research cards.
6. Community tag filtering still exposes every matching article.
7. Cook retains distinct Save and Start actions, a full-width food hero, scheduling, voice, and larger-controls accessibility.
8. All interactive targets remain at least 44px and keyboard focus remains visible.
9. Existing focused tests, full Vitest, lint, and production build pass.
10. Mobile and desktop screenshots show no content overlap, clipped controls, or unexpected horizontal scrolling.

## 6. Verification

- Static design-contract tests for ordering, preview budgets, and banned shadow/dashed treatments.
- Existing Today, Path, Community, Cook, offline, and navigation Playwright suites.
- Fresh mobile screenshots of `/today`, `/path`, `/community`, and `/cook/garlic-bread`.
- Desktop screenshots of the same routes to verify centered-rail behavior.
- `pnpm lint`, `pnpm test`, and `pnpm build` before commit.

## 7. Delivery

This modernization is one coherent visual-system slice. Functional redesigns such as new community search, content ranking, or cook recommendations are explicitly out of scope. They should build on this quieter shell after the core visual hierarchy is stable.

## 8. Execution Result

Status: **implemented and verified 2026-07-13**.

- Shared shell: persistent cards, headers, CTAs, and bottom navigation are flat; standard radii are 6-8px; the active tab uses a restrained underline instead of a lozenge.
- Today: the food hero precedes optional personalization, the craving trigger is compact, supporting nutrition surfaces are quieter, nutrition-gap suggestions route only to real guided-cook Missions, and the home Community strip remains visible without delayed entrance animation.
- Meal queue: the photo owns the flexible viewport while the title, metadata, Save, Pass, and Cook controls occupy a separate bottom region, preventing text or controls from covering food.
- Saved meals: Save is a reversible queue action with in-panel feedback, and the flat Saved for later rail reuses canonical direct-cook, side-pairing, or exact Eat Out destinations instead of losing context or bypassing recommended sides.
- Path: Pantry, Plan, and Groceries form one compact workflow row; the fresh-user state is unframed and the progression content is secondary.
- Community: the destination is consistently named Community, the default hub is curated to four reads and two research briefs, and users can reveal the full collection intentionally.
- Cook: the Mission hero is larger, metadata is plain text, and planning/accessibility controls are flat while Save and Start remain distinct actions.
- Verification: 4,388 Vitest assertions across 388 files, 14 modernization Playwright cases across Chromium and mobile Safari, 22 core-loop cases in Chromium, 2 Today nutrition doorway cases across Chromium and mobile Safari, lint, production build, and mobile/desktop screenshot review all passed.

### Follow-on Work

1. Extend the same flat surface grammar to lower-traffic utility routes only when those routes are actively changed; avoid a broad mechanical restyle.
2. Replace placeholder editorial content before public launch under Deferred Ledger item L8.
3. Reassess Community ranking and search only after real content volume and engagement data exist.
4. Preserve the food-first queue contract: no permanent title, metadata, or action overlays may be reintroduced over meal photography.
