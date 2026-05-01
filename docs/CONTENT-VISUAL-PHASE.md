# Content Visual Comparison & V2 Redesign Phase

> **Authored:** 2026-05-01
> **Status:** Planned. Slots into [`STAGE-1-2-6MO-TIMELINE.md`](./STAGE-1-2-6MO-TIMELINE.md) at **W19 (Phase D editorial wave)** and a new **W19b dedicated visual-redesign week** carved out of the Phase D buffer.
> **Reads from:** [`STAGE-3-LEAN-CONTENT.md`](./STAGE-3-LEAN-CONTENT.md), [`REELS-V2-PLAN.md`](./REELS-V2-PLAN.md), [`POLISH-CHECKLIST.md`](./POLISH-CHECKLIST.md), [`CONTENT-POPULATION-PHASE.md`](./CONTENT-POPULATION-PHASE.md).
> **Karpathy guard:** A redesign without an explicit comparator turns into taste-driven thrashing. Every change in this phase must trace to a specific competitor screenshot showing how a peer surface solves the same problem better.

---

## 1. Why this phase exists

Stage 3 shipped the Content tab as a working magazine surface (filter strip + featured hero carousel + reels rail + 2-col article grid + research stack + experts + forum + saved). It is **functionally complete** but visually it is an MVP. The bar Stefan asked for is **best-in-class** — the same bar TikTok set for Reels (delivered in W22b) but applied to the rest of the Content surface.

The cheapest way to skip taste arguments: do the audit screenshot-by-screenshot against the apps that already nailed each pattern, identify the concrete deltas, and execute them as a single visual-redesign week.

---

## 2. The competitor set

Eight apps, chosen because each owns one or more patterns Sous's Content surface already mirrors:

| App                             | What it owns                                                                                             | What we steal                                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Flo (Secrets / Insights)**    | Magazine-style health-content surface; medical-credibility framing; soft pastel UX                       | Hero card layering; expert-authored byline treatment; research-card iconography                 |
| **TikTok (For You)**            | Vertical infinite reels (already shipped via Reels V2)                                                   | Already covered in W22b; carry forward only the typographic system to non-reel Content surfaces |
| **Instagram Reels**             | Action-rail micro-interactions; double-tap heart                                                         | Action-rail spacing + count-style                                                               |
| **Apple News (Today)**          | Editorial card hierarchy; bold serif headlines on white; long-form readability                           | Article reading view typography (line-height, measure, pull-quote treatment)                    |
| **Headspace (Today / Library)** | Soft warm illustration system; cohort-specific sub-tabs; "minutes-to-read" / "minutes-to-listen" framing | Read-time chip placement; section-header rhythm                                                 |
| **Yummly (Discover)**           | Allergen + diet filter chip strip; lightweight rating ("Yums")                                           | Filter strip's tap-pill state + the category re-order on filter                                 |
| **BBC Good Food (Family)**      | Curated collection cards; trusted-source attribution chip                                                | "Source: Stanford …" attribution treatment from Content-Population-Phase                        |
| **NYT Cooking (Recipes)**       | Photographic restraint; serif headline grids; minimal accent colour                                      | Hero treatment for Featured pieces; the "less colour, more contrast" lesson                     |

We deliberately do **not** ape any single app wholesale. We take one specific lesson from each.

---

## 3. The audit method

Per surface (Content home, Reels feed already shipped, Article detail, Research detail, Expert profile, Forum thread, Saved, in-card components: Hero, ReelsRail, ArticleCard, ResearchBriefCard, ExpertVoicesRow, ForumThreadList):

1. **Capture Sous.** Take a 375 × 667 + 390 × 844 screenshot of the surface in current state. Save to `docs/screenshots/2026-09-content-audit/sous/<surface>.png`.
2. **Capture comparators.** For each peer app's analogous surface, save a single best-in-class reference screenshot to `docs/screenshots/2026-09-content-audit/refs/<peer>-<surface>.png`. Skip mock-ups — only ship references we can actually capture.
3. **Build a side-by-side sheet** — one row per surface, columns = Sous + 2-3 best peers. Saved as `docs/screenshots/2026-09-content-audit/audit-sheet.html` (a single static HTML page).
4. **Tag each row with concrete deltas** — bullet list under each comparison: "Sous uses 3 colours per card vs Apple News 2 — drop the gold accent on the kicker." "Reels rail card aspect is correct vs TikTok rail; spacing is too tight, +4px gap." "Article hero serif is correct, body line-height too cramped vs Apple News 1.55 → bump to 1.6."
5. **Score each delta XS/S/M/L** so we can sequence the redesign week realistically.

The audit-sheet HTML is a build artefact, not a runtime asset — it lives only in `docs/`.

---

## 4. What we expect to find (informed hypotheses)

These are the deltas the team already suspects from informal review of Stage 3. Listing them so the audit either confirms or overturns each — instead of "discovering" them anew under time pressure.

1. **Filter strip pill density** — currently 6 pills can scroll horizontally. Apple News + Headspace use larger touch-target spacing. Bump pill height + horizontal padding 10–15 %.
2. **Featured hero carousel dot-indicator placement** — currently floats below the card; Flo + Instagram pin it to bottom-right of the card itself for a tighter visual unit.
3. **Article cover image aspect** — currently 4:3; Apple News + NYT Cooking use 3:2 for hero, 1:1 for grid. Mixed-aspect feels more editorial.
4. **Section header rhythm** — currently every section uses the same 11pt-bold-uppercase eyebrow + section title. Headspace alternates serif-headline sections with eyebrow-only sections to break monotony.
5. **Research-brief card** — currently a wide single-column with side image. Flo uses a stacked-portrait card with `Microscope` icon as the eyebrow. Stacked feels more academic.
6. **Forum thread list** — currently identical card style to article. BBC Good Food differentiates conversational content with a subtle inset shadow + inline reply count chip.
7. **Reading view typography** — body line-height 1.5 is OK; Apple News uses 1.6 with a slightly wider measure. The "more" expand on captions could absorb the same bump.
8. **Empty/loading states** — currently bare. Headspace's empty states use a single illustration + 1 line of warm copy. Cheap improvement.
9. **Bookmark visual feedback** — single-frame state swap (icon flip). Instagram bounces the icon + a brief expand of the count. Spring physics + haptic.
10. **Author byline (real Stanford content)** — once Content Population Phase swaps in real items, the byline grows: name + credential + affiliation + source link. Currently the byline component is name-only. Needs a 2-line variant.

---

## 5. The W19b redesign week

Sequence the audit-driven deltas into one focused week. **W19b** is carved from the Phase D buffer (the W26 reserve covers slip).

| Day | Deliverable                                                                                                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mon | Capture all surfaces' Sous + peer screenshots. Build the audit HTML sheet.                                                                                  |
| Tue | Tagged delta list. Triage: ship-this-week, schedule-for-W22b animation pass, won't-do.                                                                      |
| Wed | Component-level changes: ArticleCard, ResearchBriefCard, ForumThreadList, byline.                                                                           |
| Thu | Surface-level changes: section header rhythm, hero carousel dot indicator, filter strip density. Reading-view typography pass on article + research detail. |
| Fri | Empty-state illustrations + 375×667 audit + Lighthouse run. Commit + push.                                                                                  |

Acceptance:

- All deltas tagged ship-this-week shipped.
- 375×667 + 390×844 audit clean (no horizontal scroll except named rails; primary CTA above fold on every Content surface).
- Lighthouse Mobile on Content home / article detail / saved page ≥ 90.
- Audit HTML sheet committed; before/after screenshots saved to `docs/screenshots/2026-09-content-audit/before-after/`.
- POLISH-CHECKLIST §1.5 four-pass on every changed surface.

Anything tagged "schedule for W22b animation pass" defers to that week's existing scope.

---

## 6. Where it lands in the timeline

| Window                                                                                                                               | Work        |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| **W19 (existing slot)** — 4 articles + 2 briefs + 1 expert real-attributed Stanford swap.                                            | (unchanged) |
| **W19b (NEW, carved from Phase D buffer)** — Content visual audit + redesign week per §3 + §5 above. Five days.                      | (this doc)  |
| **W22b** — Reels V2 already shipped; pull in any animation deltas from the W19b audit that landed in the "schedule for W22b" bucket. | (extension) |
| **W26 buffer** — covers any W19b slip.                                                                                               | (existing)  |

Cumulative outcome by end of Phase D: Content surface visually comparable to Flo / Apple News / Headspace at the level of cohort-1 beta feedback, with concrete before/after evidence and audit traceability for every change.

---

## 7. What this phase does NOT do

- **Does not redesign navigation.** The three-tab structure stays.
- **Does not introduce new components.** Only revises existing ones.
- **Does not change the Reels V2 chrome.** Reels are sealed post W22b unless a delta is unanimous.
- **Does not redefine the colour palette.** Stays on the existing `--nourish-*` tokens. Discipline lives in _which_ tokens we use, not in adding new ones.
- **Does not touch the Today or Path tabs.** Those have their own (Stage-3-era) visual language and a separate audit if needed.
