# RCA — combined-shapers helper-type narrowing broke `tsc`

> Per `docs/STAGE-3-VIBECODE-AUTONOMOUS-12MO.md` template, every
> RCA-worthy moment gets a Five-Whys doc with a regression test
> shipping in the same commit as the fix.

## Symptom

`pnpm build` failed during the W11 wave-A refactor at
`src/app/cook/combined/page.tsx:587:15`:

```
Type error: Type 'string | null | undefined' is not assignable to type 'string'.
```

The failing call site:

```tsx
<CombinedMissionScreen
  mainDishDescription={mainDish.description}
  ...
/>
```

`pnpm test` and `pnpm lint` were both green at the time — only
`tsc` (run inside `next build`) caught it.

## Reproduction

1. Check out `1ca42e4` (Sprint B close, before W11 wave A).
2. Apply the wave-A refactor — extract `buildOrderedDishes` into
   `src/lib/cook/combined-shapers.ts` with a generic
   `CombinedDishLike<TStep, TIngredient>` interface where
   `dish.description?: string | null`.
3. Switch `page.tsx`'s inline `useMemo` to call the helper.
4. `pnpm build` → fails on the prop assignment above.

## Five Whys

1. **Why did the build fail?** Because `mainDish.description` is
   typed `string | null | undefined` after the refactor, but
   `<CombinedMissionScreen>` expects `mainDishDescription: string`.
2. **Why did `mainDish.description` widen to nullable+optional?**
   `mainDish` is computed as
   `data?.main?.dish ?? orderedDishes[0]?.dish ?? null`. Before the
   refactor, the union was `data.main.dish | data.main.dish | null`
   — both branches came from the same tRPC-typed source, where
   `description: string`. After the refactor, the
   `orderedDishes[0]?.dish` branch flowed through
   `CombinedDishLike<TStep, TIngredient>`, which had
   `description?: string | null`. The union widened to
   `string | string | null | undefined` → `string | null | undefined`.
3. **Why was the helper type wider than the actual data shape?**
   The helper was written defensively — generic enough to accept
   any caller that has a "dish-with-ingredients-and-steps" shape.
   Defensive widening is a reasonable habit, BUT it must not regress
   the type-narrowness the original code relied on at call sites
   that never go through the wider path.
4. **Why didn't the test suite catch this?** The combined-shapers
   tests pass synthetic dishes with `description: ""` — the test
   types match the wider helper signature, not the narrower call-
   site signature. Vitest's type-check is independent of
   `next build`'s `tsc` pass.
5. **Why didn't `pnpm lint` catch this?** ESLint with
   `@typescript-eslint` doesn't run a full `tsc --strict` on
   command — the rules are syntactic. Type errors only surface
   under `tsc` or `next build`.

## Root cause

A pure-helper extraction that widened a return type from `string`
to `string | null | undefined`, propagated to a call site whose
prop required the narrower type. The build-only-check pipeline
(no `pnpm typecheck` step in the per-tool-run pre-commit list)
masked the regression until `pnpm build` ran.

## Fix

Two-line correction at the offending call site:

```diff
-  mainDishDescription={mainDish.description}
-  mainDishHeroImage={mainDish.heroImageUrl}
+  mainDishDescription={mainDish.description ?? ""}
+  mainDishHeroImage={mainDish.heroImageUrl ?? null}
```

Defensive nullish-coalesce at the prop boundary — keeps the helper
type wide (which is correct for its other call sites) while
preserving the prop's narrow contract.

## Test that pins the fix

The combined-shapers test suite already pins the helper's behaviour
on `description`/`heroImageUrl` being optional. The follow-on guard
is at the **call site**, not the helper — see Loop 3 below for the
tighter typing pass that prevents this class of regression.

The most direct prevention: a `pnpm typecheck` step that runs
`tsc --noEmit` independently of `next build`. Queued for W12 close
as a CI guard.

## Pattern surfaced

Pure-helper extractions can widen types asymmetrically across
union arms. **Rule:** when a helper's return type is consumed in
a union with an originally-narrower source, the call site must
either (a) prefer the narrower source explicitly, or (b)
defensively coalesce at the prop boundary.

This RCA also surfaces a CI gap: `pnpm lint` + `pnpm test` is not
sufficient to catch type regressions. A `pnpm typecheck` script
should be added and called by every per-week stress-test loop.
Action item filed in `docs/weeks/W12/PLAN.md` carry-forward.
