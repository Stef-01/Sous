# Stage 3 — Vibecode-Autonomous 6-Month Plan (revised 2026-05-01)

> **Why this plan exists.** Stefan's directive (2026-05-01): "now revise 6 month plan
> for the vibecode autonomous audit and recursive improved version so the most
> polished and best possible app can be developed over course of this time by
> you and then in later stages we can sort out the clerk and auth and all
> other more involved processes." This document supersedes
> `STAGE-1-2-6MO-TIMELINE.md` for execution scheduling. The earlier doc still
> stands as the founder-gated unlock map; this doc is the autonomous build
> queue an agent can execute end-to-end without waiting for credentials.

## Operating principles (load-bearing)

1. **Every line item must be AUTO-BUILD.** If a deliverable needs Clerk,
   Neon, R2, Upstash, Sentry, paid counsel, real users, or third-party
   permission, it is **not** in this plan — it lives in
   `STAGE-1-2-6MO-TIMELINE.md` §0.5 under FOUNDER-GATED and gets unlocked
   in the post-W26 founder-action window. The agent never blocks.
2. **Recursive improvement, not linear feature march.** Each sprint ends in
   a design review whose findings become the next sprint's first-priority
   backlog. We polish, then polish again with sharper eyes. Three
   passes over the same screen is good, not waste.
3. **IDEO-level design review every 5 weeks.** Five sprints × five weeks
   = the rhythm. Each review audits _every screen_ in the app (currently
   22 routes) against four axes: Intentionality, Minimalism, Consistency,
   Polish. The output is a ranked remediation list. Quiz games and
   secondary screens get the same scrutiny as Today.
4. **Stanford content runs are autonomous.** Stanford content lives on
   public stanford.edu / med.stanford.edu / healthier.stanfordchildrens.org
   pages. The agent fetches via `WebFetch`, distills under fair-use
   summary length (≤30 words verbatim per source), and embeds into the
   Content tab seed with full citation. Permission scope is tracked in
   `docs/content-sources/STANFORD-PERMISSION.md`; the autonomous ingest
   stays inside the granted bounds.
5. **Boil the ocean — finish each thing.** The `BULLETPROOF — BOIL THE
OCEAN` rule from `CLAUDE.md` overrides the "ship-and-iterate" instinct.
   Each week ships its deliverables fully done: tests + lint + build
   green, every changed surface verified visually via the preview server,
   and a commit on `main` before the week closes.

## Sprint shape (universal template)

Every sprint follows the same five-week shape. This is the only template
the agent needs to remember.

| Week of sprint | Phase                                    | Output                                                                                                                                                                                                  |
| -------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Week 1**     | **Surface inventory + audit**            | Screenshot every screen in scope; score each on Intentionality / Minimalism / Consistency / Polish; produce a ranked deficiency list as `docs/sprints/N/AUDIT.md`.                                      |
| **Week 2**     | **Polish wave A**                        | Execute the top 60% of the deficiency list. Visual fixes, copy fixes, motion fixes, layout fixes, density fixes. Tests + lint + build green every commit.                                               |
| **Week 3**     | **Polish wave B + Stanford content run** | Execute the remaining 40% of the deficiency list. Run a full Stanford content fetch sprint (8–12 new content items) and embed into the Content tab seed.                                                |
| **Week 4**     | **Feature deepening + recursion**        | Re-screenshot every changed screen and diff against Week 1 baseline; pick up unfinished W22a/W22b polish moves; deepen at least one secondary surface (games, scrapbook, gift) so it feels first-class. |
| **Week 5**     | **IDEO design review + recursion plan**  | Run the IDEO-style review (rubric below). Write `docs/sprints/N/IDEO-REVIEW.md` listing the top 20 deltas. Top 5 items pre-loaded into next sprint's Week 1 audit.                                      |

## The IDEO review rubric

Borrowed from IDEO's Design Critique format (paraphrased): each surface
is scored on a 1-4 scale across four axes. **3 = ship-acceptable. 4 =
intentional, polished, IDEO-portfolio-worthy.** Anything ≤2 must be
remediated before the sprint closes; ≥3 is a candidate for next-sprint
deepening.

- **Intentionality (I).** Does every element on the screen earn its
  pixels? Could the screen be confused for a wireframe, a default
  template, or a half-finished prototype? A 4 means a stranger looking
  at the screen would say "someone designed this on purpose."
- **Minimalism (M).** What can be removed without losing the user's
  ability to act? A 4 means removing one more thing would harm the
  experience; a 2 means the screen is information-dense or has
  decorative noise that doesn't drive action.
- **Consistency (C).** Does the screen use the same type ramp,
  spacing, color tokens, motion language, and copy register as the
  rest of the app? A 4 means a side-by-side with Today / Cook would
  feel like the same product family.
- **Polish (P).** Does the screen feel finished — no broken images,
  no cramped 375×667 wraps, no jarring transitions, no placeholder
  copy? A 4 means even small interactions (taps, drags, dismissals)
  feel deliberate.

The sprint's IDEO review writes a 4-column score table for all 22
screens, with bolded cells for any score ≤2. The Top-20 delta list is
ordered by `(4 - average score) × surface-weight`, where Today /
Cook / Win get weight 3, secondary surfaces (Path home, Content home,
Reels) get weight 2, deep surfaces get weight 1.

## The Stanford content run protocol

Each sprint's Week 3 runs one content fetch. The agent runs the
following loop until 8–12 items are seeded:

1. **Source selection.** Pull 3-5 candidate URLs from the rotating
   Stanford source list in `docs/content-sources/STANFORD-SOURCES.md`
   (the agent maintains this list across sprints; new sources added as
   they're discovered).
2. **Fetch + distill.** `WebFetch` each URL. Distill into one of three
   shapes: `article` (300-500 word original-words summary, ≤30 verbatim
   per source), `research-brief` (200 words, citation block, key
   takeaway), or `reel-script` (60 words narration + 4 frame
   suggestions for later video pipeline).
3. **Schema-conform.** Conform each item to the `ContentItem` schema in
   `src/types/content.ts`; add Stanford byline + source URL + date
   accessed.
4. **Seed.** Append to `src/data/content/stanford-content-seed.ts`. The
   Content tab home reads from this seed via the existing query
   pipeline.
5. **Verify.** Boot preview, navigate to Content tab, screenshot the
   newly added cards, confirm the article-detail page renders cleanly
   at 375×667.
6. **Commit + push.** One commit per source, prefixed `content(stanford):`.

## Sprint themes (W1-W26)

The five sprints rotate the surface focus so every part of the app gets
the IDEO-level scrutiny pass at least once and the highest-traffic
surfaces (Today / Cook / Win) get it twice.

### Sprint 1 — Today × Cook × Win (W1-W5, ~ May 2026)

**Surfaces in scope:** `app/(today)/today/page.tsx`, `app/cook/[slug]`,
`app/cook/combined`, the win screen and post-cook reflection sheet.

**Why first:** these are the three screens that decide whether a user
ever cooks. They get reviewed twice (here and Sprint 5).

**Deliverables:**

- Audit doc with screenshots of all in-scope screens at 375×667.
- ≥30 polish fixes landed.
- Stanford content run #1 (8 items, kid-nutrition + healthy-fat themes).
- IDEO review #1 with Top-20 delta list.

### Sprint 2 — Path × Games × Pantry (W6-W10, ~ June 2026)

**Surfaces in scope:** `app/(path)/path/page.tsx`, scrapbook, favorites,
pantry, shopping-list, all four games (`cuisine-compass`, `flavor-pairs`,
`speed-chop`, `whats-cooking`), the games hub.

**Why this sprint:** Stefan's note specifically called out that the
quiz games can't look like minimal-effort throwaways — these screens
need first-class treatment. This sprint lifts every secondary surface
up to Today's bar.

**Deliverables:**

- Each game screen redesigned to feel like a Duolingo lesson screen,
  not a stub: motion, sound-of-rightness micro-interactions, single
  primary CTA, end-of-game reward sequence.
- Path tab inventory rationalised — no orphan tiles.
- Pantry and shopping-list first-class polish (empty state, full
  state, post-purchase state).
- Stanford content run #2 (8 items, family-meal + behavioural
  themes).
- IDEO review #2.

### Sprint 3 — Content tab end-to-end + Reels (W11-W15, ~ July 2026)

**Surfaces in scope:** `app/(community)/community/page.tsx`, article
detail, expert detail, research detail, forum detail, reels feed, saved.

**Why this sprint:** Content tab now has real Stanford content (from
sprints 1 & 2); time to make every surface around it pass the IDEO
bar and add the second tier of polish to Reels (already V2, going to
V3).

**Deliverables:**

- Article-detail page redesigned for reading rhythm (typography,
  pull-quotes, in-article CTAs back to cook).
- Expert detail page polish (avatar, credential band, write-ups).
- Research-brief detail polish (citation block prominence,
  "what this means for your kitchen" call-out).
- Reels V3: chapter markers within longer reels, tap-to-pause UX,
  bookmark animation, end-of-reel "next up" preview.
- Forum detail surfaces — even if seed data, the visual must feel
  intentional.
- Stanford content run #3 (10 items, expert-Q&A + research themes).
- IDEO review #3.

### Sprint 4 — Parent Mode × Settings × Overlays (W16-W20, ~ Aug 2026)

**Surfaces in scope:** Parent Mode toggle and entire downstream
behaviour (kid-friendly hint, kid-swap chip, spice slider, component
split, kids-ate-it prompt, lunchbox suggest, nutrient spotlight),
profile-settings sheet, all toast variants, all coach surfaces, the
quiz, the more-options sheet, the post-cook reflection.

**Why this sprint:** Parent Mode shipped fast in March-April; it's
ripe for the recursive polish pass. Toasts and overlays are
cross-cutting and rarely get their own focus week.

**Deliverables:**

- Parent Mode end-to-end IDEO review (every PM-on screen).
- Settings sheet redesigned for clarity (current state is
  utilitarian).
- Toast variant audit — all 4 variants lined up at 375×667 with
  consistent corner radius, spacing, motion.
- Coach surfaces consolidated (the quiz, the win-screen line,
  the vibe prompt) so the persona is unified.
- Stanford content run #4 (10 items, parent-mode-relevant themes:
  picky eating, allergen safety, lunchbox patterns).
- IDEO review #4.

### Sprint 5 — App-wide consistency × accessibility × second pass on Today (W21-W25, ~ Sep–Oct 2026)

**Surfaces in scope:** all 22 routes, with deep dive back into Today /
Cook / Win for the second-pass IDEO review.

**Why this sprint:** the closing sprint stitches the app together.
Every type ramp, every spacing token, every motion easing is
audited for consistency across surfaces. Accessibility is comprehensive
(keyboard nav, screen-reader labels, focus rings, contrast). Today /
Cook / Win get their second polish pass — IDEO Review #5 should score
them all 4/4/4/4.

**Deliverables:**

- Type ramp audit + token rationalisation. One source of truth.
- Spacing token audit — no magic numbers in component code.
- Motion easing language audit — every spring uses one of three
  presets.
- Copy register audit — every microcopy string passes the
  "would a friend say this?" sniff test.
- Full keyboard navigation pass (tab order, focus rings, escape
  hatches).
- Screen-reader pass (every interactive element has an aria-label
  or visible text).
- Stanford content run #5 (final batch, 12 items, holiday + 30-day
  programme themes).
- Second pass on Today / Cook / Win — every IDEO score must be 4.
- IDEO review #5 — final ship-ready audit.

### W26 — Buffer + founder-unlock prep

The buffer week. Three things happen:

- Final lint + test + build + visual regression sweep across all 22
  routes.
- The founder-unlock checklist: write `docs/FOUNDER-UNLOCK-RUNBOOK.md`
  enumerating the 8 founder-gated items (Clerk, Neon, R2, Upstash,
  Sentry, Stanford permission docs, paid counsel for SAFE-phrasings
  CI flip, beta cohort recruitment) with the exact env vars, schema
  changes, and CI flips needed for each. Each item should land in 1
  day or less once unblocked.
- A Stage-3-retrospective doc capturing what worked, what didn't,
  and what the agent would do differently in a Stage-4 plan.

## Recursive-improvement guarantee

Each sprint's IDEO review writes its Top-20 delta list. The next sprint's
Week 1 audit doc must explicitly address the top 5 items from the
previous review (cite them by line number). The agent does not get to
re-prioritise away from previous deltas — only deepen.

This is enforced in the audit doc template at
`docs/sprints/_TEMPLATE/AUDIT.md`. The agent fills in:

```
## Carry-forward from Sprint N-1 IDEO review

1. <delta from prior IDEO review> — status: addressed | partial | deferred
2. ...
5. ...

## New deficiencies (this sprint)

...
```

Anything marked "deferred" requires a one-line reason (genuine blocker)
and an automatic re-add into the next sprint's carry-forward.

## Stanford content acquisition list (rotating, agent-maintained)

Initial source pool (the agent expands this each sprint):

- **Stanford Medicine — Pediatrics & Child Nutrition.** med.stanford.edu/pediatrics
- **Stanford Children's Health — Healthier, Happy Lives.** healthier.stanfordchildrens.org
- **Stanford Center for Health Education.** healtheducation.stanford.edu
- **Stanford Lifestyle Medicine.** longevity.stanford.edu/lifestyle
- **Stanford Cantor Arts Center — Food in Culture exhibits** (for cultural
  framing in cuisine pages where relevant).
- **Stanford SCOPE blog.** scopeblog.stanford.edu (broader health
  reporting; useful for adult-side framing).

Each source URL goes into `docs/content-sources/STANFORD-SOURCES.md`
with a one-line note on which Sprint Week 3 ingested it and what
themes it contributed. The agent never re-ingests the same URL
without a date-of-update check.

## Anti-patterns the agent must avoid

- **Polish theater.** Adding spring animations to compensate for an
  unclear hierarchy is theater. Fix the hierarchy first; motion second.
- **Inventing recipes or images.** Rule 7 in `CLAUDE.md` still applies.
  No new dishes, no AI image generation, no fabricated Stanford
  citations. If a content item can't be sourced, drop it.
- **Cross-sprint scope creep.** Sprint 2 does not touch Today unless
  Today is the carry-forward from Sprint 1's IDEO review. Discipline
  is what makes the recursive pass work.
- **Wireframe regression.** A screen that fell out of polish during a
  build week must be re-polished before the sprint closes. The IDEO
  review catches this — the audit can't ship with a 2 on the table.
- **Unused complexity.** No new abstractions for hypothetical future
  reuse. Karpathy principles still apply (CLAUDE.md §Karpathy Coding
  Principles).

## Cadence summary

| Sprint    | Weeks        | Focus                                 | Stanford content count | IDEO review # |
| --------- | ------------ | ------------------------------------- | ---------------------- | ------------- |
| 1         | W1-W5        | Today × Cook × Win                    | 8                      | #1            |
| 2         | W6-W10       | Path × Games × Pantry                 | 8                      | #2            |
| 3         | W11-W15      | Content tab + Reels                   | 10                     | #3            |
| 4         | W16-W20      | Parent Mode + Overlays                | 10                     | #4            |
| 5         | W21-W25      | App-wide + 2nd pass on Today/Cook/Win | 12                     | #5            |
| Buffer    | W26          | Founder-unlock runbook + retro        | –                      | –             |
| **Total** | **26 weeks** | **22 surfaces × multiple passes**     | **48 Stanford items**  | **5 reviews** |

By the end of W26 every screen in the app has been through at least
one IDEO-level review, every Today/Cook/Win surface through two, and
the Content tab has 48 Stanford-sourced items live. Founder-gated
infrastructure (auth, persistence, observability, paid services) is
unlocked in the post-W26 window using the runbook.
