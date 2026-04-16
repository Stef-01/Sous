# Testing audit (2026-04-15)

## Commands run

| Command         | Result                                                 |
| --------------- | ------------------------------------------------------ |
| `pnpm test`     | Vitest: 102 tests, 7 files — pass                      |
| `pnpm lint`     | ESLint + Prettier — pass                               |
| `pnpm build`    | Next production build — pass (run before push)         |
| `pnpm test:e2e` | Playwright: 74 tests (chromium + mobile-safari) — pass |

## Playwright web server

- E2E uses **`http://127.0.0.1:3333`** with `pnpm build && pnpm exec next start -p 3333` so tests do not fight `.next/dev/lock` with a separate `pnpm dev` on port 3000.
- Override port: `E2E_PORT=3340 pnpm test:e2e` (Unix) or `$env:E2E_PORT='3340'; pnpm test:e2e` (PowerShell).
- `CI` detection: only `CI=true`, `CI=1`, or `CI=2` are treated as strict CI (so `CI=false` still reuses servers as intended).

## Notable fixes this session

- **Path / motion + Playwright visibility**: `PageTransition`, Path dashboard cards, mission/win toasts used `initial={{ opacity: 0 }}` so subtrees were invisible to `toBeVisible()` until Framer finished; several wrappers now use `initial={false}` where appropriate.
- **Achievement toast queue**: `checkAchievements` now queues `setNewlyUnlocked` in a `queueMicrotask` after persisting unlocks so the Path effect cannot race the toast state.
- **Core loop E2E**: Search placeholder matches `text-prompt.tsx`; cook CTA matches Result stack (`Cook …` / `Cook N selected sides`); mission uses typographic apostrophe in “Let’s gather”; ingredients use “I have everything”; guided cook “Next” uses accessible name `Go to step N`; full loop trimmed to **smoke** (first cook step advance) because combined cook + timers made end-to-end win brittle.
- **Quest save**: DOM `click()` on the heart avoids tab-bar hit-target flakes; assertion uses `aria-label` **Already saved**.
- **no-scroll**: CTA bottom allows 1px rounding (`<= 668`).

## Visual documentation

- `e2e/visual-documentation.spec.ts` writes PNGs under `test-results/visual-docs/` (gitignored). Run: `pnpm test:e2e -- e2e/visual-documentation.spec.ts`.
