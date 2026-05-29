# Quick-Wins Punchlist — Non-Functional Buttons + Low-Hanging UI Fixes

> **Authored:** 2026-05-01
> **Status:** Active. Slotted into the 6-month timeline at W11 polish slot + W18 polish slot per [`STAGE-1-2-6MO-TIMELINE.md`](./STAGE-1-2-6MO-TIMELINE.md).
> **Karpathy guard:** Be honest about scope. The exploration agent's headline finding was that **the app is unusually well-wired** — there is no big basket of stub buttons to harvest. The list below is short on purpose.

---

## 1. What we found

A grep + read pass across `src/` for stub buttons (no-onClick, "coming soon" toasts, console.log handlers, perma-disabled buttons, deferred tRPC endpoints) returned a much cleaner picture than expected. Most surfaces are real. The genuine stubs are either **intentional minimalist placeholders** (Instacart hint shipped this way deliberately) or **Stage-2 infra defers** (auth sign-in, real video, etc.) that we cannot wire without the corresponding Stage-2 work.

So this punch list is short — 4 items, all in the S/M effort range — and we are explicit about declining to invent extra ones.

---

## 2. The 4 items

| #   | Where                                                                                                                              | What                                                                                                                                        | Effort                | Slot                                                                                                                                                                                                        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | [src/components/guided-cook/instacart-hint.tsx](../src/components/guided-cook/instacart-hint.tsx)                                  | Static "Instacart · ~20 min · soon" line. Intentionally non-tappable in V1 per Stefan's minimalism directive (small logo + ETA, not a CTA). | XS to flip if we want | When a real Instacart deal lands (post Stage-2). Not a Stage-1+2 item.                                                                                                                                      |
| 2   | [src/app/cook/[slug]/page.tsx:357](../src/app/cook/[slug]/page.tsx) + [/cook/combined/page.tsx](../src/app/cook/combined/page.tsx) | "Steps coming soon" empty state when a dish lacks guided-cook data.                                                                         | S                     | **W18 polish slot.** Filter at the QuestCard pool level so dishes without steps never surface, OR add a "Steps pending" badge so the user sets expectations before tapping. Either move kills the dead-end. |
| 3   | [src/components/content/reel-action-rail.tsx](../src/components/content/reel-action-rail.tsx) Share button                         | Calls `navigator.share()` only — silent fail when the Web Share API is unavailable (desktop Safari, older Firefox).                         | S                     | **W11 polish slot.** Add a copy-to-clipboard fallback + toast when `navigator.share` is undefined. ~15 lines.                                                                                               |
| 4   | [src/components/shared/profile-settings-sheet.tsx](../src/components/shared/profile-settings-sheet.tsx) Profile section            | Text-only placeholder pending Stage-2 W13 Clerk auth.                                                                                       | L (blocked)           | Already scheduled (W13). No earlier action.                                                                                                                                                                 |

---

## 3. What we deliberately did NOT add

The exploration agent suggested converting the Instacart hint into a tappable button. We are **declining** that because the user explicitly asked for the minimalist "logo + time" pattern with no CTA. Re-opening that decision would be a regression.

We also are NOT padding this list with cosmetic tweaks. That work belongs in [`POLISH-CHECKLIST.md`](./POLISH-CHECKLIST.md) and runs every week as the standing tax.

---

## 4. Where it lands

- **Item 3 (share fallback)** ships in the W11 polish slot — already inside the current week's polish budget; ~15 lines, no new tests needed.
- **Item 2 (steps-coming-soon dead-end)** ships in the W18 polish slot, alongside the broader perf pass — fits naturally because the QuestCard pool filter touches the recommendation pipeline.
- **Items 1 & 4** are not Stage-1+2 work; tracked here for visibility only.
