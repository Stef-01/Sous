# Stage 3 — Retrospective (2026-05-01)

> Closing reflection on the Stage-3 vibecode-autonomous cycle. Written
> at the end of the autonomous build burst that took the app from
> "16 of 22 surfaces ≥ 3.5" to "21 of 22 surfaces ≥ 3.5, 14 of 22 ≥
> 4.0, 18 Stanford-attributed articles + 1 research brief + 9
> verified expert voices."
>
> Audience: Stage-4 me + Stefan when he reads back through what
> happened.

## What worked

**The 5-week sprint shape with a closing IDEO review per sprint.**
Forcing the agent to write a 22-route scorecard at the start and end
of every sprint kept it from drifting into theatrical polish on
already-good surfaces. The carry-forward block was load-bearing — it
made deferring something explicit (and re-defer-able), rather than
forgetting.

**Token codification at the close of each sprint.** Even before the
formal `docs/design-tokens.md` write-up in Sprint 5, the IDEO reviews
were noticing recurring patterns ("section kicker rhythm", "find
something to cook empty-state CTA", "source-attribution aside").
Naming these patterns in prose meant later sprints could re-use them
without re-deriving — which compounded across sprints.

**Source-attribution as a first-class design pattern.** The
`<aside>` block on article and research detail pages — "Sourced from
{publication} / Read the original / Sous paraphrase, not a
reproduction" — turned out to be the single change that made the
Content tab stop feeling like a placeholder. Stanford content
shipping with this aside now feels like a credible content surface,
not an LLM-generated content farm.

**Reduced-motion gates as the codebase-wide default.** Once Sprint 1
established the gate pattern, every subsequent motion landing
included it. By Sprint 4, the codebase-wide rule was "no new
framer-motion code without a `useReducedMotion` gate" and it held
without a single exception.

**Stanford content runs in parallel with surface polish.** Each
sprint shipped both a polish landing and a content fetch run. This
kept the Content tab from stagnating while every other surface got
attention, and meant the Stanford-content depth visible at the end of
Stage 3 (18 articles + 1 brief + 9 experts) was real, not a single-
sprint dump.

## What didn't work

**The Tailwind JIT + markdown gotcha.** A `text-[var(--nourish-subtext|green)]`
notation in the Sprint 2 IDEO doc got extracted by Tailwind as a
real arbitrary-value class candidate, then failed to compile because
`|` is invalid inside CSS values — broke the dev server. Took ~10
minutes to track down (production build was fine, only dev choked).
Stage 4: any `text-[…]` notation in IDEO docs must split the bracket
across two valid class names instead of combining with `|`.

**Over-aggressive Stanford content target (48).** The plan budgeted
48 Stanford items by W26 across 5 runs. We landed 28. The gap reflects
real upstream constraints: the Stanford Children's Health Healthy
Eating category holds ~26 articles total and we ingested most of them;
the Stanford Medicine Insights archive isn't easily browsable via
WebFetch (the listing page is an SPA). The shortfall isn't a
diligence failure — it's a source-discovery one. Stage 4 needs to
expand the source pool before it can credibly target more volume.

**Repeated deferral of `/cook/combined`.** The 1,122-line dual-flow
cook page got carried forward Sprint 1 → 2 → 3 → 4 → 5 with the same
"too risky to refactor in autonomous burst" rationale every time.
The Sprint 5 audit explicitly punted it to Stage 4. This is honest —
density refactors on the heaviest page in the app deserve dedicated
test scaffolding — but it does mean the deferral pattern can become
a way to permanently avoid hard work. Stage 4 W1 should explicitly
budget the test scaffolding so the third deferral becomes the last.

**Auto-commit hook + CLAUDE.md staging weirdness.** The `.claude/hooks/auto-commit.sh`
hook at session-end conflicts in a non-obvious way with explicit
staging — there were several rounds where `git add CLAUDE.md`
silently produced an empty staged diff, and the canonical 172-line
CLAUDE.md kept failing to land on origin/main. Workaround:
`git update-index --cacheinfo 100644,<hash>,CLAUDE.md` forced the
index to reflect the file. Stage 4 should investigate the hook
chain before relying on this pattern again.

**Dev server HMR cache after dynamic-import edits.** Editing
components that are dynamically imported (e.g. `more-options-sheet.tsx`)
sometimes leaves the dev server in a stale state where the page is
permanently 500 even after `Try Again` and full restart. Only `rm -r .next`

- fresh start clears it. Stage 4 should consider whether the
  dynamic-import pattern is worth the dev-server fragility.

## What's surprising in retrospect

**The settings sheet is now the template for any future overlay.**
Sprint 4's lift on the Profile & Settings sheet — rounded-top
dialog, drag handle, three stacked white cards each with uppercase
kicker, friendly Heart sign-off at the end — turned out to be the
shape that any future overlay (household-blend prompt, reels detail,
gift composer) should adopt. Naming this pattern in
`docs/design-tokens.md` made it explicit.

**The forum thread page (a tiny seed surface) consumed
disproportionate Sprint 1 attention.** It was the only ≤2 cell in
the audit and required a structural redesign (OP card, avatar
treatment, empty state, composer polish) to clear. The lift was
worth it — it was the surface the Sprint 1 carry-forward most
demanded — but the time-to-polish was 3x what the surface's
weight (1) suggested. Stage 4 should weight surface-specific
attention by the gap-from-bar, not just the surface weight.

**Stanford's Healthy Eating category covers more parent ground than
I expected.** 18 articles in, the category covers picky eating,
school lunches, holiday rhythm, celiac, gut health, weight programs,
moderation tactics, Halloween, childhood cancer support, and the
adult-side protein/GLP-1 framing — almost the full surface area of
the parent-mode use cases. Stage 4 doesn't urgently need new
sources to cover the existing personas; it needs to cover
adjacent personas (single adults cooking for one, college students,
older adults living alone).

## Stage 4 backlog (queued from Stage 3)

**Autonomous, can ship without founder action:**

1. `/cook/combined` density refactor with dedicated test scaffolding.
2. Today / Cook / Win 2nd-pass IDEO sweep.
3. Encode `docs/design-tokens.md` patterns as Tailwind utilities +
   shared components (`SectionKicker`, `EmptyStateCTA`,
   `SourceAttribution`, `MetaPill`, `GameHeader`).
4. Add a custom ESLint rule that flags `motion.*` usage missing a
   `useReducedMotion` gate.
5. Keyboard navigation pass (manual, with a real keyboard).
6. Screen-reader pass (with VoiceOver / NVDA).
7. Lighthouse CI in pre-commit (local mode).
8. Reels V3 deepening: chapter markers, end-of-reel "next up", tap
   pause UX polish.
9. `/community` content density: section pagination + "see all by
   category" affordance now that 18+ Stanford articles + placeholders
   are live.
10. Forum reply-to-reply nesting + reaction stub.
11. Article tag chips → tag-filter view.
12. Stanford source pool expansion: SCOPE direct article URLs,
    Stanford Lifestyle Medicine pages, healtheducation.stanford.edu.
13. Persona expansion content runs: single adults, students, older
    adults living alone.

**Founder-gated, see `docs/FOUNDER-UNLOCK-RUNBOOK.md`:**

14. Neon Postgres unlock + write-through wiring on hooks.
15. Cloudflare R2 unlock + image migration.
16. Upstash Redis unlock + rate-limit wiring.
17. Clerk auth enforcement.
18. Sentry init + Vercel Analytics enable.
19. Stanford permission expansion (if scope grows).
20. Beta cohort 1 + 2 recruitment.
21. Food-advertising counsel sign-off → SAFE-phrasings linter to
    `--fail` mode in CI.

## Numbers

- Sprints: 5 + buffer week 26 (effectively packed into one autonomous
  burst).
- Surfaces ≥ 3.5: 16 → **21 of 22** (was the count at Stage-3 start
  before the burst).
- Surfaces ≥ 4.0: 5 → **14 of 22**.
- Stanford-attributed content: 0 → **18 articles + 1 research brief +
  9 expert voices.**
- Sprint commits to main: 11 commits across 5 sprints.
- IDEO reviews written: 4 (Sprint 1-4) + this retro counts as Sprint
  5's close-out alongside `IDEO-REVIEW.md`.
- Tests: 398/398 throughout, never broke green.

## Closing note

The autonomous-vibecode-with-IDEO-review-every-5-weeks cadence works.
The combination of (a) recursive carry-forward forcing genuine
progress on identified deficiencies, (b) parallel Stanford content
runs to keep depth growing alongside polish, and (c) per-sprint token
codification to make patterns reusable instead of re-derivable, ships
something that feels intentional from the user's seat.

The remaining gap to "the most polished and best possible app" is
mostly the founder-gated infrastructure unlocks (auth, persistence,
observability) and a small set of autonomous items the burst
deliberately deferred (`/cook/combined`, accessibility passes, token
encoding). The path from here to that state is the runbook plus
Stage 4's autonomous backlog above.
