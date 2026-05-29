# Sprint N — IDEO Design Review

> Final sprint deliverable. Audits every screen in the app (not just
> the in-scope ones) on Intentionality / Minimalism / Consistency /
> Polish. Writes the Top-20 delta list that becomes Sprint N+1's
> carry-forward.

## Review date

YYYY-MM-DD

## Build state at review

- Commit SHA: ...
- Test count: ... (NN passed / NN failed)
- Build: pass / fail
- Lighthouse mobile (Today): ... / 100

## Full surface scorecard (all 22 routes)

| Route                        | I   | M   | C   | P   | Avg | Surface weight |
| ---------------------------- | --- | --- | --- | --- | --- | -------------- |
| `/today`                     | 4   | 4   | 4   | 4   | 4.0 | 3              |
| `/cook/[slug]`               | ... | ... | ... | ... | ... | 3              |
| `/cook/combined`             | ... | ... | ... | ... | ... | 3              |
| Win screen (in cook flow)    | ... | ... | ... | ... | ... | 3              |
| `/path`                      | ... | ... | ... | ... | ... | 2              |
| `/path/favorites`            | ... | ... | ... | ... | ... | 1              |
| `/path/pantry`               | ... | ... | ... | ... | ... | 1              |
| `/path/scrapbook`            | ... | ... | ... | ... | ... | 1              |
| `/path/shopping-list`        | ... | ... | ... | ... | ... | 1              |
| `/community`                 | ... | ... | ... | ... | ... | 2              |
| `/community/article/[slug]`  | ... | ... | ... | ... | ... | 1              |
| `/community/expert/[slug]`   | ... | ... | ... | ... | ... | 1              |
| `/community/forum/[id]`      | ... | ... | ... | ... | ... | 1              |
| `/community/reels`           | ... | ... | ... | ... | ... | 2              |
| `/community/research/[slug]` | ... | ... | ... | ... | ... | 1              |
| `/community/saved`           | ... | ... | ... | ... | ... | 1              |
| `/games`                     | ... | ... | ... | ... | ... | 2              |
| `/games/cuisine-compass`     | ... | ... | ... | ... | ... | 1              |
| `/games/flavor-pairs`        | ... | ... | ... | ... | ... | 1              |
| `/games/speed-chop`          | ... | ... | ... | ... | ... | 1              |
| `/games/whats-cooking`       | ... | ... | ... | ... | ... | 1              |
| `/sides`                     | ... | ... | ... | ... | ... | 1              |

Bold any cell ≤2.

## Top-20 deltas

Ordered by `(4 - avg) × surface-weight`, descending. These become
Sprint N+1's carry-forward; the top 5 are non-negotiable.

1. **<route>** — <observation> — recommended fix — score-delta × weight
2. ...
3. ...

## Cross-cutting observations

Patterns that show up across multiple surfaces — usually the
highest-leverage fixes.

- Type ramp inconsistency between Path home and Content home: ...
- Spacing density on detail pages: ...
- Motion easing register varies: ...

## Acceptance for sprint close

- [ ] Every score ≤2 from the audit's ranked deficiency list addressed.
- [ ] No regression in any screen scored 4 in prior sprints.
- [ ] Stanford content run shipped and visible.
- [ ] Top 5 deltas pre-loaded into next sprint's audit doc.
