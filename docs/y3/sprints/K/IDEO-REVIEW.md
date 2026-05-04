# Y3 Sprint K (W41-W44) — Empty / loading / error states + WCAG 2.1 AA

> **Plan ref:** `docs/YEAR-3-VIBECODE-PLAN.md` Sprint K
> **Date closed:** 2026-05-03
> **Bi-weekly IDEOs:** #15 (W41+W42) + #16 (W43+W44) absorbed.

## Build state at review

- Latest commit on main: `7194c85` (W42+W43 SkeletonCard + ErrorState).
- Test count: **2293** (was 2280 at Sprint G close — **+13 this sprint** plus the W37 motion tokens (+13) crossing into Sprint J = +26 since W30).
- Four-gate green: lint ok, typecheck ok, test ok (2293/2293), build ok.

## What landed in Sprint K

| Week | Output                                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| W41  | EmptyState reusable (W30 ahead of schedule). Recipe / scrapbook / cuisine / shopping migrate as they're polished anyway; new surfaces use it directly. |
| W42  | SkeletonCard primitive — three variants (card / list-item / avatar-row), reduced-motion safe, aria-hidden + role='status' aria-label='Loading'.        |
| W43  | ErrorState primitive — three tiers (recoverable / degraded / blocking), aria-live + role='alert' on blocking, retry + secondary action slots.          |
| W44  | WCAG 2.1 AA audit checklist (this doc).                                                                                                                |

## WCAG 2.1 AA audit checklist

Single audit list each surface routes through. The Sprint K
primitives + W30 EmptyState consolidate the audit surface from
"every component" to "five primitives + per-surface review."

### Primitives (substrate-tier audit)

- [x] **EmptyState** (W30) — role='status' present; primary CTA
      passes 4.5:1 contrast ratio; focus ring visible.
- [x] **SkeletonCard** (W42) — aria-hidden so screen-readers
      don't repeat shimmer; role='status' aria-label='Loading'
      announced once.
- [x] **ErrorState** (W43) — recoverable + degraded use
      role='status' aria-live='polite'; blocking uses
      role='alert' aria-live='assertive'. Icon has aria-hidden;
      headline carries the semantic.
- [x] **MadeItRing** (W1) — role='img' with descriptive
      aria-label; SVG strokes meet 3:1 contrast against page bg.
- [x] **TapFeedback / ChipFeedback** (W40) — aria-pressed on
      ChipFeedback; whileTap respects reduced-motion.

### Per-surface audit (Sprint H+ surfaces)

- [x] **/today** — every chip + section has heading hierarchy;
      reduced-motion paths in DailyNoveltyChip + TodayPlannedSlot.
- [x] **/today/search** — input has aria-label; filter chip row
      uses aria-pressed; results list has heading; empty +
      loading + error states already routed.
- [x] **/path/cuisines** — section headings + per-card aria-label;
      identity strip uses semantic span/p for screen-reader
      semantics.
- [x] **/path/pantry/scan** — capture button has clear label;
      detected-item chips have aria-label='Remove <name>';
      done-state confirmation announced via aria-live.
- [x] **/path/plan** — swipe surface action buttons have icon +
      label; progress strip text is the source of truth for
      X-of-7 announcement.
- [x] **/path/plan/week** — calendar cells have descriptive
      aria-label ('Lunch on Tue: empty. Tap to add.').
- [x] **/path/recipes** — pantry-coverage line has visible dot + text content (not colour-only signal).
- [x] **Pod gallery** — ring strip has role='group'
      aria-label='Household members at the table tonight'.

### Continuing items (carry to W47 design-system docs)

- [ ] **Cook flow Step screen** — Mission step polished W9
      (eyebrow + 16:10); Grab phase has pantry dots W4-wire.
      Cook phase + win-screen still inline patterns.
- [ ] **Path tab subpages** (/path/recipes/[id]/edit,
      /path/recipes/new) — recipe-authoring forms inherit
      shared classes; field-level error states use inline
      announcements not the W43 ErrorState yet.
- [ ] **Profile sheet** — Stage-2 W9 surface; uses inline
      patterns; migration to shared primitives is a Y4
      polish-week task.

These are documentation-only carries, not blockers — every
touched surface in Sprint H/I/J/K has passed the audit.

## Cross-cutting wins

1. **Audit-by-construction.** Routing every empty / loading / error state through the W30/W42/W43 primitives means the Sprint K WCAG check is a one-time per-primitive review. New surfaces inherit compliance.
2. **Reduced-motion respected at the primitive level.** SkeletonCard drops its pulse animation when `prefers-reduced-motion` is set. TapFeedback / ChipFeedback short-circuit whileTap. EmptyState has no animations to gate. This means the W39 reduced-motion audit consolidates to "do consumers gate motion at all?" rather than "audit every animation call."
3. **W3 design tokens compound.** Every primitive uses the W3 colour + W37 motion tokens. Dark-mode swap (Y3 W3 prep) lands when the toggle ships — primitives carry through unchanged.

## RCA tally

0 RCAs on main this sprint.

The streak continues into Y3 W44.

Mid-sprint catches that never reached main:

- W40: TapFeedback initial draft used `Omit<ButtonHTMLAttributes>` which conflicted with motion's onDrag typing. Switched to `HTMLMotionProps<'button'>`.
- W42: SkeletonCard's `animate-pulse` initially fired regardless of preference; added the reduced-motion gate before commit.

## Acceptance for Sprint-K close

- [x] EmptyState reusable shipped (W30 ahead of schedule).
- [x] SkeletonCard primitive shipped (W42).
- [x] ErrorState primitive shipped (W43).
- [x] WCAG 2.1 AA audit checklist filed (W44, this doc).
- [x] All four gates green throughout.
- [x] Bi-weekly IDEOs #15 + #16 absorbed.

## Carry-forward into Sprint L

- Sprint L (W45-W48) ships **Performance + bundle audit + design-system docs**. The W47 design-system doc is the natural home for the W30/W42/W43 primitive contracts + the WCAG audit checklist above.
- Cook flow Step + Win screen continue using inline patterns until a follow-up polish-week migrates them through the primitives.
- The Y4 plan kickoff (W51) carries forward the Profile sheet migration as a Y4 polish-week task.

## Retrospective

Sprint K's headline: 0 RCAs across the W41-W44 stretch despite touching three reusable primitives that compound across many surfaces. The audit-by-construction approach (one-place WCAG review per primitive) feels like the right shape for a polish year — every sprint from here adds primitives or surfaces, never both at once, so the audit surface stays bounded.
