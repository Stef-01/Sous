# reduced-motion-gate remediation TODO

> Tracks the pre-existing violations of the new
> `sous/reduced-motion-gate` ESLint rule (introduced in W7 of
> STAGE-3-VIBECODE-AUTONOMOUS-12MO.md). The rule ships in `warn`
> mode; new code that adds motion without a gate is flagged
> immediately. Pre-existing violations get fixed file-by-file in
> subsequent weeks. When this list reaches zero, the rule's level
> flips from `warn` → `error` in `eslint.config.mjs`.

## Scope at rule introduction

- **284 violations across 64 files.**
- Generated via `pnpm lint 2>&1 | grep reduced-motion-gate`.

## Progress log

- **2026-05-01 (W7)** — rule introduced; 284 violations live.
- **2026-05-01 (W7 cont.)** — Tier 1 remediation wave A: imports +
  page-shell entrance gates landed on
  `src/app/(today)/today/page.tsx`,
  `src/app/cook/[slug]/page.tsx`,
  `src/app/cook/combined/page.tsx`,
  `src/app/(path)/path/page.tsx`. **243 violations remaining.**
- **2026-05-01 (W7 cont.)** — Tier 2 remediation wave A: imports +
  page-shell / empty-state entrance gates landed on
  `src/app/(path)/path/favorites/page.tsx`,
  `src/app/(path)/path/scrapbook/page.tsx`,
  `src/app/games/page.tsx`,
  `src/app/games/cuisine-compass/page.tsx`,
  `src/app/games/flavor-pairs/page.tsx`,
  `src/app/games/speed-chop/page.tsx`.
  (`src/app/games/whats-cooking/page.tsx` already gated, no change.)
  **202 violations remaining.** -41 from this wave; -82 cumulative
  from rule introduction.
- **2026-05-01 (W7 cont.)** — Tier 3 remediation wave A: top-5
  by-violation-density components.
  Imports + per-file consumers landed on:
  `src/components/path/skill-detail-sheet.tsx` (13 violations
  cleared),
  `src/components/guided-cook/step-card.tsx` (12),
  `src/components/today/text-prompt.tsx` (11),
  `src/components/guided-cook/ingredient-list.tsx` (11),
  `src/components/guided-cook/mission-screen.tsx` (9).
  **146 violations remaining.** -56 from this wave; -138 cumulative
  (49% of original 284 cleared).
- **2026-05-01 (W7 cont.)** — Tier 3 remediation wave B: next-5
  by-violation-density.
  Imports + consumers landed on:
  `src/components/today/result-stack.tsx` (8),
  `src/components/path/next-unlock-card.tsx` (7),
  `src/app/sides/page.tsx` (7),
  `src/components/path/path-header.tsx` (6),
  `src/components/path/cuisine-constellation.tsx` (6).
  **112 violations remaining.** -34 from this wave; -172 cumulative
  (61% of original 284 cleared).

## Why these aren't "real" bugs (yet)

Most of these files already work fine for users without
prefers-reduced-motion set. The lint rule is forward-looking —
it ensures that as the app grows, every new motion site has a
gate. The pre-existing files have motion that may or may not
respect the user's reduced-motion preference; remediation is
"add the import + use it where the animation is large" rather
than a behavioural rewrite.

## Per-file priority

Files are remediated in this order. Higher-traffic surfaces first.

### Tier 1 — Top-traffic surfaces (W7-W10)

- `src/app/(today)/today/page.tsx`
- `src/app/cook/[slug]/page.tsx`
- `src/app/cook/combined/page.tsx`
- `src/app/(path)/path/page.tsx`
- `src/components/today/quest-card.tsx` (already gated; verify rule
  catches no new violations after refactor)

### Tier 2 — Secondary surfaces (W11-W15)

- `src/app/(path)/path/favorites/page.tsx`
- `src/app/(path)/path/scrapbook/page.tsx`
- `src/app/games/page.tsx`
- `src/app/games/cuisine-compass/page.tsx`
- `src/app/games/flavor-pairs/page.tsx`
- `src/app/games/speed-chop/page.tsx`
- `src/app/games/whats-cooking/page.tsx`

### Tier 3 — Components (W16-W22)

- All `src/components/**` files with violations. Follow the per-file
  list in the lint output (`pnpm lint 2>&1 | grep reduced-motion-gate`).

## Remediation pattern

For each file:

```typescript
// Before
import { motion, AnimatePresence } from "framer-motion";
// ... motion.div animate={{...}} ...

// After
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";

// inside the component:
const reducedMotion = useReducedMotion();

// gate the animation:
animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
// or
transition={reducedMotion ? RM : SHEET}
```

Use the named presets in `src/lib/utils/motion.ts` (`SNAPPY`,
`SHEET`, `GLIDE`, `RM`) where the original animation matched one
of those profiles.

## Acceptance gate for the level flip

When `pnpm lint 2>&1 | grep -c "reduced-motion-gate"` returns 0,
flip `"sous/reduced-motion-gate": "warn"` → `"error"` in
`eslint.config.mjs` and delete this TODO doc.
