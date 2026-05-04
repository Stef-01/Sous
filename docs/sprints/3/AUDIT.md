# Sprint 3 — Week 1 Surface Audit (2026-05-01)

> Sprint 3 of the Stage-3 cycle. **Surfaces in scope:** Content tab
> end-to-end (`/community`, article detail, expert detail, research
> detail, forum thread, reels feed, saved). Sprint 3 carries forward
> the Top-5 deltas from `docs/sprints/2/IDEO-REVIEW.md`.

## Carry-forward from Sprint 2 IDEO review (mandatory)

1. **`/cook/combined`** density audit — **re-deferred to Sprint 5**
   (same regression-risk rationale; Sprint 5 has the test-coverage
   budget for it).
2. **`/community/article/[slug]`** typography rhythm — **in scope**.
3. **`/community/expert/[slug]`** deepening — **in scope**.
4. **`/community/research/[slug]`** citation prominence — **in scope**.
5. **`/community/reels`** V3 (chapter markers, tap-to-pause, end-of-
   reel "Next up") — **in scope; partial pass given verification
   gates** (Reels V3 features that change behaviour need preview-
   based verification; copy/visual polish lands in Sprint 3, deeper
   behaviour changes deferred to a dedicated Reels-focused session).

Plus Sprint 2 IDEO carry-forward items 6, 7, 8:

6. `/community/forum/[id]` reply-thread V2 — Sprint 3 partial pass.
7. `/community/saved` non-empty state polish — Sprint 3.
8. `/community` home content density audit — section pagination /
   "see all" affordance. Sprint 3.

## Surfaces audited (pre-Wave-A baseline, post-Sprint-2)

| Route                        | I   | M   | C   | P   | Avg  | Top deficiency (≤1 line)                                                      |
| ---------------------------- | --- | --- | --- | --- | ---- | ----------------------------------------------------------------------------- |
| `/community`                 | 4   | 4   | 4   | 4   | 4.00 | Content firehose forming as Stanford count grows; consider section pagination |
| `/community/article/[slug]`  | 3   | 4   | 3   | 4   | 3.50 | Body typography rhythm; line-height + paragraph spacing could be deliberate   |
| `/community/expert/[slug]`   | 3   | 4   | 3   | 4   | 3.50 | Profile is thin; needs "From this expert" chip strip + last-active line       |
| `/community/forum/[id]`      | 4   | 3   | 3   | 4   | 3.50 | OP card landed in Sprint 1; reply pile could nest reply-to-reply              |
| `/community/reels`           | 4   | 4   | 4   | 4   | 4.00 | V3 deepening (chapter markers etc.) — partial pass per gate above             |
| `/community/research/[slug]` | 3   | 4   | 3   | 4   | 3.50 | Citation block could be more prominent; paper-title styling                   |
| `/community/saved`           | 3   | 4   | 3   | 3   | 3.25 | Non-empty state could mirror Content home rhythm                              |

No bolded ≤2 cells. Sprint 3 starts with no sprint-blockers, only
deepening targets.

## Polish wave A (Sprint 3, Week 2 — top 60% in scope)

- **W2.1** `/community/article/[slug]` typography rhythm: explicit
  line-height + paragraph spacing + first-paragraph treatment.
- **W2.2** `/community/expert/[slug]` deepening: "From this expert"
  chip strip + article count + most-recent activity.
- **W2.3** `/community/research/[slug]` citation prominence: paper-
  title styling, takeaway-block lift, sourced-from aside polish.

## Polish wave B (Sprint 3, Week 3 — remaining 40% + Stanford run #3)

- **W3.1** Forum reply-thread V2 partial: OP-author highlight on
  replies they wrote.
- **W3.2** Saved non-empty state mirror Content home section rhythm.
- **W3.3** Stanford content run #3 — 6-8 items targeting expert Q&A
  - research themes.

## Notes

- Build state at audit start: pnpm lint ✓, pnpm test 398/398 ✓,
  pnpm build ✓, all 21 of 22 surfaces ≥ 3.5 (only /cook/combined sub-
  threshold and intentionally deferred).
