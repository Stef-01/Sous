# Sprint 5 — Week 1 Surface Audit (2026-05-01)

> Closing sprint of the Stage-3 cycle. **Surfaces in scope:** every
> route in the app (the second pass on Today/Cook/Win + app-wide
> consistency + accessibility). Sprint 5 is also when the patterns
> codebase-wide get formally documented as design tokens for the
> next stage to build against.

## Carry-forward from Sprint 4 IDEO review (mandatory)

The top 5 are non-negotiable for sprint close:

1. **`/cook/combined`** density audit — third deferral lands here.
2. **Today / Cook / Win 2nd pass** — every cell scores 4.0.
3. **Type-ramp consistency token** — codify font sizes.
4. **Spacing-token consistency** — replace ad-hoc with tokens.
5. **Motion easing register** — three presets only.

Plus carry-forward items 6-10:

6. Copy register audit.
7. Keyboard navigation pass.
8. Screen-reader pass.
9. Lighthouse mobile audit (deployed env gated; local CI available).
10. `/path/scrapbook` polish (3.25 since Sprint 1).
11. `/community/saved` polish (3.25 since Sprint 1).
12. `/sides` polish (3.25 since Sprint 1).
13. Stanford content run #5 — final batch.
14. `/community` content density: section pagination.

## Scope-vs-time triage

The Stage-3 plan budgets 5 weeks for Sprint 5 + W26 buffer. In this
autonomous burst, we land:

- **Token codification** (docs/design-tokens.md) — the highest-leverage
  artefact for Stage 4 to build against.
- **Stanford content run #5** — final batch.
- **W26 founder-unlock runbook** + **Stage-3 retrospective**.
- **Sprint 5 IDEO closing review** — the formal close of the cycle.

Items deferred out of this autonomous burst into a future dedicated
session (the cost / value math doesn't justify them in remaining
context):

- `/cook/combined` density refactor (1,122 lines, needs dedicated
  test scaffolding to be safe).
- Keyboard nav + screen-reader pass (needs full-app traversal with a
  real keyboard or AT — best done in interactive session).
- Lighthouse on a live deployed env (founder-gated).
- Today/Cook/Win 2nd-pass tweaks (those surfaces are already at 3.75
  with no specific deficiency; further changes need a clear
  intentional target).

These move into a "Stage 4 W1" backlog file (queued via the Stage-3
retro doc).

## Polish wave A (token codification + Stanford #5)

- **W2.1** Write `docs/design-tokens.md` with the patterns the audits
  surfaced as codebase-wide.
- **W2.2** Stanford content run #5: 2 final articles.
- **W2.3** Founder-unlock runbook (`docs/FOUNDER-UNLOCK-RUNBOOK.md`).
- **W2.4** Stage-3 retro (`docs/STAGE-3-RETROSPECTIVE.md`).
- **W2.5** Sprint 5 IDEO closing review.

## Notes

Build state at audit start: pnpm lint ✓, pnpm test 398/398 ✓,
pnpm build ✓, all surfaces ≥ 3.5 except `/cook/combined` (3.25) and
the three 3.25 deferrals (`/path/scrapbook`, `/community/saved`,
`/sides`) — all explicitly carried into this sprint or a future one.
