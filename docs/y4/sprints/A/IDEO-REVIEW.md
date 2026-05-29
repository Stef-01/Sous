# Y4 Sprint A (W1-W4) — LLM cost-monitoring substrate

> **Plan ref:** `docs/YEAR-4-VIBECODE-PLAN.md` Sprint A
> **Date closed:** 2026-05-31
> **Bi-weekly IDEOs:** #1 (W1+W2) + #2 (W3+W4) absorbed.

## Build state at review

- Latest commit on main: `36ffbec` (W3 dashboard surface).
- Test count: **2337** (was 2299 at Y3 close — **+38 this sprint**).
- Four-gate green: lint ok, typecheck ok, test ok (2337/2337), build ok.

## What landed in Sprint A

| Week | Output                                                                                                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| W1   | LLM cost telemetry aggregator pure helper (`src/lib/telemetry/llm-spend.ts`) — LlmCallEntry shape, aggregateSpend, estimateMonthlyBurn, formatMicroUsd, dayKey. 18 tests.                  |
| W2   | localStorage layer (`llm-spend-storage.ts`) + `useLlmSpend` React hook. Zod schema, parseStoredLlmSpend with W15 RCA pattern, appendLlmCall + 1000-entry cap, buildLlmCallEntry. 14 tests. |
| W3   | `/path/llm-spend` dashboard surface + `LlmSpendCard` component + `summariseLlmSpendForDashboard` pure helper. 6 tests on the summary helper.                                               |
| W4   | Sprint A close + retro (this doc).                                                                                                                                                         |

## Founder-key contract

The Anthropic API key is the gate. Setting `ANTHROPIC_API_KEY` in env lights up real-mode in the existing five LLM-backed substrates (voice-conversation, voice-to-draft, pod-agentic-pick, viral-search + viral-extraction, pantry-vision) and each call records a telemetry entry via `recordLlmCall(...)`. The dashboard reads + renders the rolling aggregate. No code change needed at flip time — the Y2-Y3 substrates are already wired with the env-var read.

## Cross-cutting wins

1. **Substrate-first held into Y4.** Every Y3 substrate that landed as "stub mode V1, real-mode flips with one config edit" continues working. The W1 aggregator + W2 hook + W3 dashboard form a complete monitoring loop without ever touching the actual Anthropic call sites.
2. **W15 RCA pattern compounds.** The localStorage parser uses the same freshDefault-factory + schema-version + partial-recovery pattern as Y2 W19 useRhythm + Y3 W23 useMealPlanWeek. New surfaces inherit the protection automatically.
3. **No useMemo trap.** W2 dropped a tempting useMemo on the aggregate calc. Per-render compute is cheap with the 1000-entry cap, and dropping useMemo avoided the React-Compiler exhaustive-deps warning that the W37 motion + W42 skeleton + W43 error primitives all also avoided.

## RCA tally

0 RCAs on main this sprint.

The Y2+Y3+Y4 streak now extends to **~99 weeks**.

Mid-sprint catches that never reached main:

- W2: useMemo deps with `options.now ?? new Date()` non-deterministic fallback would have flagged exhaustive-deps. Resolved by dropping useMemo entirely.
- W3: `vitest.config.ts` only includes `*.test.ts` not `*.test.tsx`. Initial card-render test file was removed; logic was lifted to a pure summary helper testable in vanilla `.test.ts`.

## Acceptance for Sprint-A close

- [x] Aggregator pure helper shipped (W1).
- [x] localStorage + hook shipped (W2).
- [x] Dashboard surface shipped (W3).
- [x] Sprint A close doc filed (W4, this doc).
- [x] All four gates green throughout.
- [x] Bi-weekly IDEOs #1 + #2 absorbed.

## Carry-forward into Sprint B

- Sprint B (W5-W8) ships **Stripe + charity bake-sale receipt
  substrate**. The pattern is the same: Zod schema for Stripe
  charge IDs + amounts → localStorage-backed event log → daily
  charity-raised aggregator → `/path/charity` dashboard. Real-
  mode wire-up flips on `STRIPE_SECRET_KEY` + verified
  nonprofit list.
- The W3 dashboard pattern (mounted-flag skeleton + summary
  helper + per-section card) is the canonical layout the next
  three internal-monitoring surfaces (charity, push delivery,
  trainer drift) will inherit.

## Retrospective

Sprint A's headline: 0 RCAs. The substrate-first muscle from Y3
worked unchanged in Y4 — three weeks of sequenced helper / hook
/ surface work landed without a single mid-sprint pivot. The
audit-by-construction pattern from Y3 K transferred too: the
W3 card composes the W1+W2 outputs, so testing the summary
helper covers the path the renderer takes.
