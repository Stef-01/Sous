# Component state coverage — Track E4

> Every interactive component is a **set of states**, not a picture. Treat each
> as: **idle · hover · pressed · loading · disabled · empty · error · success**.
> This is the audit checklist + the shared tactile standard. Fill gaps as the
> top components are touched; keep the standard below intact.

## Shared tactile standard (established E4 — `09cba66`…`<this>`)

- **Press = `TAP_SCALE` (0.98)** for buttons + cards; `TAP_SCALE_SM` (0.94) for
  small chips/icon buttons (a bigger delta reads as responsive on a small
  target). Source: `src/lib/motion/tokens.ts`. Press, never pop. The primitives
  (`Pressable`, `TapFeedback`, `ChipFeedback`) route through these tokens.
- **Tooltips / disclosure popovers lift + blur in** (fade + rise + 2px blur
  clearing), never pop — see `glossify.tsx`; reuse `premiumEntrance` or the
  `--entrance-premium` utility, reduced-motion gated.
- **Focal entrances** route through `premiumEntrance` / `--entrance-premium`
  (E3); lists stay fade+rise (no blur — GPU cost).
- **Disabled** = `opacity-50 cursor-not-allowed` + no tap scale + no-op handler
  (`Pressable` now does this by default).
- All of the above collapse to instant under `prefers-reduced-motion`.

## Coverage matrix

Legend: ✅ handled · ◐ partial · — not applicable · ✗ gap to fill

| Component                         | idle | hover | pressed |      loading      |  disabled   |                    empty                    | error |   success   |
| --------------------------------- | :--: | :---: | :-----: | :---------------: | :---------: | :-----------------------------------------: | :---: | :---------: |
| `Pressable`                       |  ✅  |  ✅   |   ✅    |         ✗         |     ✅      |                      —                      |   —   |      —      |
| `TapFeedback` (primary/secondary) |  ✅  |  ✅   |   ✅    |         ✗         |      ◐      |                      —                      |   —   |      —      |
| `ChipFeedback`                    |  ✅  |  ✅   |   ✅    |         —         |      ◐      |                      —                      |   —   | ✅ (active) |
| Craving search bar                |  ✅  |  ✅   |   ✅    | ✅ (loading view) |      —      |                      —                      |   ◐   |      —      |
| Meal deck / swipe queue           |  ✅  |  ✅   |   ✅    |        ✅         |      —      | ✅ (QueueComplete / "browsed today's deck") |   —   |  ✅ (cook)  |
| Diary serving stepper             |  ✅  |  ✅   |   ✅    |         —         | ◐ (min 0.5) |                      —                      |   —   |      —      |
| `PantryAddSearch`                 |  ✅  |  ✅   |   ✅    |         —         | ✅ (added)  |        ✅ (no results → custom add)         |   —   |     ✅      |
| `PlanAddSheet`                    |  ✅  |  ✅   |   ✅    |         —         |      —      |               ✅ (custom add)               |   —   |     ✅      |
| Nutrition cards (cal/macros)      |  ✅  |   —   |    —    |         ◐         |      —      |             ✅ (0 / empty day)              |   —   |      —      |
| Toast                             |  ✅  |   —   |    —    |         —         |      —      |                      —                      |  ✅   |     ✅      |
| Win screen                        |  ✅  |  ✅   |   ✅    |         —         |      —      |                      —                      |   —   |     ✅      |
| Skeleton loaders (`shimmer`)      |  —   |   —   |    —    |        ✅         |      —      |                      —                      |   —   |      —      |

## Open gaps (next E4 passes)

- **Loading states** are the weakest column: `Pressable` / `TapFeedback` have no
  built-in spinner/disabled-while-pending state — submit buttons hand-roll it.
  Add an optional `loading` prop to the primitives (spinner + auto-disable).
- **Error states** beyond toast are ad-hoc (e.g. craving parse failure). Define
  a shared inline error treatment.
- The matrix above is the components touched/verified through E4; extend it to
  the remaining Path + Content interactive components as those screens get the
  E2 sweep.
