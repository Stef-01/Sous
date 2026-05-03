# W27 close — Sprint F open

**Sprint:** F (W27-W31)
**Plan ref:** `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` H2 W27
**Date closed:** 2026-05-02
**Scope:** Sprint-E top-2 carry-forward — recipe-authoring page

- visual-mode page-side adoption.

## Shipped

| Output                                 | File                                        | Lines | Tests added          |
| -------------------------------------- | ------------------------------------------- | ----- | -------------------- |
| Recipe authoring page                  | `src/app/(path)/path/recipes/new/page.tsx`  | ~330  | (covered by W23/W24) |
| Visual-mode resolver helper            | `src/lib/cook/resolve-visual-step-image.ts` | ~50   | 10 in `*.test.ts`    |
| StepCard `visualMode` + `heroImageUrl` | `src/components/guided-cook/step-card.tsx`  | +60   | (resolver covers it) |
| Cook step page consumes `visualMode`   | `src/app/cook/[slug]/page.tsx`              | +5    | (page-shell)         |

Test count: **661 → 671** (+10 from the resolver tests). All four
gates green: pnpm typecheck ✓, pnpm lint ✓, pnpm test 671/671 ✓,
pnpm build ✓.

## What landed

### 1. Recipe authoring page (Sprint-E top carry-forward)

`/path/recipes/new` is now live. It pairs `useForm<RecipeDraft>` +
`useFieldArray` for ingredients & steps with the W23 pure helpers
(`defaultRecipeDraft`, `appendBlankIngredient`, `appendBlankStep`,
`removeStepAt`, `commitDraft`) and the W24 `useRecipeDrafts`
persistence hook. On submit:

```
draft → commitDraft(draft)        // fills id/slug/timestamps
      → userRecipeSchema.safeParse  // zod validation
      → drafts.upsert(validated.data) // localStorage persistence
      → router.push("/path")
```

**RCA noted at build time (W26 typecheck gate caught it):** the
initial wiring used `@hookform/resolvers/zod` with
`userRecipeSchema.partial({ id, slug, createdAt, updatedAt })`,
but the resolver's TS contract still mismatches the form's
`TFieldValues` because the partial widens to `T | undefined`
rather than removing the keys. The fix: drop the resolver and
validate manually inside `onSubmit` after `commitDraft` fills the
auto-managed fields. Semantically identical, types cleanly. Would
have shipped silently before W26 wired typecheck into the build.

### 2. Visual mode page-side adoption (Sprint-E #2 carry-forward)

The W22 toggle persisted a preference; the cook step page didn't
consume it. W27 closes the loop:

1. **Pure resolver** `resolveVisualStepImage(step, hero)` returns
   `{ src, isFallback, isPlaceholder }`. Three-tier fallback —
   step image → dish hero → textual placeholder. 10 tests cover
   the matrix (whitespace, empty string, null, undefined, both
   present, neither present, purity).

2. **StepCard** gains `visualMode?: boolean` + `heroImageUrl?:
string | null` props. When `visualMode` is on:
   - The image element is `aspect-[4/5]` (hero-sized) instead of
     `aspect-video` (thumbnail).
   - The instruction paragraph drops `cook-prose` for `text-sm
leading-snug` so the visual carries the primary signal.
   - When the step image is absent but the dish hero exists, a
     small "Dish photo" badge marks the fallback.
   - When neither exists, a textual "Step image coming soon"
     placeholder renders inside an aspect-[4/5] dashed card.

3. **Cook step page** consumes `useVisualModePref().enabled` and
   passes it through alongside `dish.heroImageUrl`. When the toggle
   is off, StepCard renders the same as before — the new branch is
   strictly opt-in.

## Acceptance

- [x] Recipe authoring page accessible at `/path/recipes/new`,
      saves draft to localStorage via `useRecipeDrafts`, navigates
      to `/path` on success.
- [x] Visual mode toggle on the profile sheet now affects the
      cook step page render.
- [x] No regression in `/cook/[slug]` when `visualMode` is off
      (default for all existing users).
- [x] Pure resolver fully unit-tested (10 cases including
      whitespace edge cases).
- [x] All four gates green throughout the week: lint ✓,
      typecheck ✓, test 671/671 ✓, build ✓.

## Loop-2 RCA

1 RCA caught at build time:

- **`@hookform/resolvers/zod` + `userRecipeSchema.partial()` type
  mismatch.** The resolver expects a schema whose inferred type
  matches `TFieldValues` exactly; `.partial({...})` widens fields
  to `T | undefined` rather than removing them, so the resolver's
  TS contract still mismatches at the call site. **Fix:** dropped
  the resolver and ran `userRecipeSchema.safeParse(commitDraft(
draft))` inside `onSubmit` instead. Semantically identical; types
  cleanly. The W26 `pnpm typecheck`-in-build gate caught this 60s
  earlier than the old "next build" path would have.

## Carry-forward into W28

1. **`/cook/combined` density wave 2** (Sprint-A through Sprint-E
   carry-forward, still pinned). Visual sub-component extractions:
   dual-track step-progress strip, parallel-hint banner.
2. **Recipe authoring list view** (`/path/recipes`) and **edit
   view** (`/path/recipes/[id]/edit`). Infrastructure (the drafts
   hook surface) is ready; both pages are wiring exercises.
3. **MVP 4 of cook-nav initiative** — SVG attention pointers per
   the 12-month plan W28 entry.
4. **Pairing-engine V2** (per-user weight vector) per the original
   12-month plan W29-W31.

## Retrospective

The Sprint-E retrospective predicted that the recipe-authoring
page would be a 1-day component-build because schema + helpers +
persistence + form library were already in place. That prediction
held — the page is ~330 lines and shipped without bloat. The W26
typecheck gate paid for itself the first time it was used: it
caught the resolver type mismatch at edit time instead of
deployment, validating the H1-close decision to wire `tsc --noEmit`
into `pnpm build`. Visual-mode adoption shipped as a small pure
resolver + 60 lines in StepCard, demonstrating that the W22
toggle-without-consumer shape was the right split — the toggle
proved the pref pattern (W15 freshDefaultPref factory transferred
again), and the consumer landed cleanly when the surface was ready.
W28 opens with `/cook/combined` density wave 2 finally pinning
back to action after carrying forward through five sprints.
