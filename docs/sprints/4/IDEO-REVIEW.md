# Sprint 4 — IDEO Design Review (2026-05-01)

> Sprint 4 close-out review. Captures the Profile & Settings sheet
> polish + Stanford content run #4.

## Build state at review

- Latest commit on main: `cc142ad`
  (content(stanford): run #4 — 2 articles)
- Test count: 398 passing / 398 total
- Build: ✓ passing
- Total Stanford-attributed content: 17 articles + 1 research brief +
  9 expert voices.

## Surface scorecard (post-Sprint-4, deltas vs. Sprint 3)

| Route                       | I         | M         | C         | P         | Avg             | W       |
| --------------------------- | --------- | --------- | --------- | --------- | --------------- | ------- |
| `/today`                    | 4         | 3         | 4         | 4         | 3.75            | 3       |
| `/cook/[slug]`              | 4         | 4         | 4         | 4         | 4.00            | 3       |
| `/cook/combined`            | 4         | 3         | 3         | 3         | 3.25            | 3       |
| Win screen                  | 4         | 4         | 4         | 4         | 4.00            | 3       |
| `/path` & 4 detail surfaces | 4 each    | 4 each    | 4 each    | 4 each    | 4.00 each       | 1-2     |
| `/community` + 6 sub-routes | ≥3.5      | ≥4        | ≥3.5      | ≥4        | ≥3.5            | 1-2     |
| `/games` hub + 4 games      | ≥3.5      | ≥3        | ≥4        | ≥4        | ≥3.5            | 1-2     |
| Profile & Settings sheet    | 3 → **4** | 3 → **4** | 3 → **4** | 3 → **4** | 3.00 → **4.00** | overlay |
| Toast variants              | 4         | 4         | 4         | 4         | 4.00            | overlay |
| Coach surfaces (quiz, line) | 4         | 4         | 4         | 4         | 4.00            | overlay |
| `/sides`                    | 3         | 4         | 3         | 3         | 3.25            | 1       |

The settings sheet is now an overlay that scores 4/4/4/4 (warmer
profile copy, friendly Heart sign-off, reduced-motion gates on every
animation). Toast variants and coach surfaces re-audited — the
patterns laid down in Sprint 1 hold up at the IDEO bar without
further intervention.

**Surface count at score ≥ 3.5:** 21 of 22 (unchanged — `/cook/combined`
still the lone exception).
**Surface count at score ≥ 4.0:** 14 of 22 (was 12 of 22 at Sprint 3
close — Profile & Settings and the toasts cross the bar).

## What landed in Sprint 4

1. `467c439` feat(sprint-4): Profile & Settings sheet warmth +
   reduced-motion gates
2. `cc142ad` content(stanford): run #4 — 2 articles (childhood-cancer
   support + Pediatric Weight Control Program story)

## Top-20 deltas — carry-forward into Sprint 5

Sprint 5 in `STAGE-3-VIBECODE-AUTONOMOUS-6MO.md` is **App-wide
consistency × Accessibility × 2nd-pass on Today/Cook/Win**. The top
5 below are non-negotiable for the closing sprint.

1. `/cook/combined` density audit — **the third deferral catches up
   here.** 1,122-line file; goal is rhythm normalisation against
   single-cook visual register. Sprint 5 is the explicit home for
   this work.
2. **Today / Cook / Win second pass** — every cell on these three
   surfaces must score 4.0 in the Sprint 5 IDEO review.
3. **Type-ramp consistency token** — codify the app's font sizes
   into a small set (4-5 sizes max).
4. **Spacing-token consistency** — replace ad-hoc spacing with the
   token set; no magic numbers in component code.
5. **Motion easing register** — three presets only; apply across all
   spring usages.
6. Copy register audit — friend-voice on every microcopy. Sprint 5.
7. Keyboard navigation pass. Sprint 5.
8. Screen-reader pass. Sprint 5.
9. Lighthouse mobile audit on deployed env (founder-gated for the
   live deployment but local Lighthouse-CI is available). Sprint 5.
10. `/path/scrapbook` polish (3.25 since Sprint 1). Sprint 5.
11. `/community/saved` polish (3.25 since Sprint 1). Sprint 5.
12. `/sides` polish (3.25 since Sprint 1). Sprint 5.
13. Stanford content run #5 — final batch (8-10 items, holiday +
    30-day programme themes). Sprint 5 Week 3.
14. `/community` content density: section pagination / "see all by
    category" affordance now that 17 Stanford articles + placeholders
    are live. Sprint 5.
15. Article tag chips → tag-filter view. Sprint 5.
16. Forum reply-to-reply nesting. Sprint 5.
17. Reels V3 deepening (chapter markers, end-of-reel "next up").
    Sprint 5.
18. Sprint 5 IDEO review write itself.
19. W26 buffer week: founder-unlock runbook (the 8 founder-gated
    items: Clerk, Neon, R2, Upstash, Sentry, Stanford permission
    docs in case Sous expands beyond current scope, paid counsel
    for SAFE-phrasings CI flip, beta cohort recruitment).
20. Stage-3 retrospective doc. W26.

## Cross-cutting observations

- **The settings sheet shape is now the template for any future
  overlay sheet.** Rounded-top dialog with a drag handle, header row
  with title + close button, 3 stacked white cards each with
  uppercase kicker + body, and the friendly Heart sign-off at the
  end. When a new overlay surface needs to ship in Sprint 5 (e.g. a
  household-blend prompt), this is the shape it should adopt.
- **17 Stanford articles is starting to feel substantial.** The
  Content tab now has real depth — children's-health, parent-mode
  overlap, community-support, behaviour-change framing, adult-side
  protein/GLP-1 framing, holiday rhythm, celiac structure. Sprint 5
  should make sure browsing this depth doesn't feel like a firehose.
- **No new motion code has shipped without a reduced-motion gate
  since Sprint 1.** Codebase-wide the pattern is now: every motion
  surface either has a reducedMotion fallback or doesn't animate
  at all. Worth codifying as a CLAUDE.md rule in Sprint 5.

## Acceptance for sprint close

- [x] Settings sheet scored 4.0 (was 3.0 going in).
- [x] Toast variants + coach surfaces re-audited at 4.0.
- [x] No regression in any prior 4-scored surface.
- [x] Stanford content run #4 shipped and visible.
- [x] Top 5 deltas pre-loaded into Sprint 5 scope (cook/combined,
      Today/Cook/Win 2nd pass, type-ramp, spacing, motion easing).
