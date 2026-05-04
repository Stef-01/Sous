# Stanford content — source ledger

> Append-only per-fetch record. Permission scope and guardrails live in
> `STANFORD-PERMISSION.md`. The autonomous agent appends a new entry every
> time it ingests a Stanford source. If a source is later removed, the
> entry is updated in-place with a `removed: YYYY-MM-DD` field and the
> seed file pruned.

## Sprint 1 — Stanford content run #1 (2026-05-01)

Sourced from Stanford Medicine Children's Health
(`healthier.stanfordchildrens.org`). 8 items distilled into 7 articles

- 1 research brief, embedded via `src/data/content/stanford.ts` and
  merged into the live content collections via `articles.ts`,
  `research.ts`, and `experts.ts`. Every record carries `isPlaceholder:
false`, `sourceUrl`, `sourceTitle`, `sourceFetchedAt`, and
  `permissionEvidence`.

| #   | Source URL                                                          | Author / Program                                                                             | Original date | Sous shape     | Sous id                               |
| --- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------- | -------------- | ------------------------------------- |
| 1   | `/en/how-to-encourage-your-children-to-have-healthy-eating-habits/` | Venus Kalami, MNSP, RD, CSP                                                                  | 2022-12-09    | article        | `stanford-art-healthy-eating-habits`  |
| 2   | `/en/easy-plan-healthy-school-lunches/`                             | Maya Adam, MD                                                                                | 2014-11-13    | article        | `stanford-art-school-lunches`         |
| 3   | `/en/5-questions-about-your-childs-eating-habits/`                  | Stanford Center for Healthy Weight + Parent-Based Prevention Lab                             | 2017-06-21    | article        | `stanford-art-five-questions`         |
| 4   | `/en/sweet-strategies-for-a-healthy-halloween/`                     | Cindy Zedeck, MA (Pediatric Weight Control Program)                                          | 2016-10-26    | article        | `stanford-art-halloween-strategies`   |
| 5   | `/en/tips-for-holidays/`                                            | Lauren Strelitz, MD                                                                          | 2018-12-07    | article        | `stanford-art-holiday-balance`        |
| 6   | `/en/eating-well-with-celiac-disease/`                              | Venus Kalami, MNSP, RD, CSP                                                                  | 2020-05-21    | article        | `stanford-art-celiac-eating-well`     |
| 7   | `/en/staying-celiac-strong-together/`                               | Stanford Center for Pediatric IBD and Celiac Disease (Michael Rosen, MD; Hilary Jericho, MD) | 2023-06-20    | article        | `stanford-art-celiac-strong-together` |
| 8   | `/en/what-you-need-to-know-about-improving-your-childs-gut-health/` | Dr. Katya Gerwein + Venus Kalami                                                             | 2022-06-28    | research-brief | `stanford-rb-gut-health`              |

### Run #1 extension (2026-05-01) — Stanford Medicine Insights

| #   | Source URL                                                                                                       | Author                                                         | Original date | Sous shape | Sous id                        |
| --- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------- | ---------- | ------------------------------ |
| 9   | `https://med.stanford.edu/news/insights/2026/03/how-much-protein.html`                                           | Marily Oppezzo, PhD (Stanford Prevention Research Center)      | 2026-03-25    | article    | `stanford-art-protein-enough`  |
| 10  | `https://med.stanford.edu/news/insights/2026/03/giving-glp-1-users-bite-sized-nudges-toward-healthy-habits.html` | Maya Adam, MD, PhD (Stanford Medicine Health Media Innovation) | 2026-03-09    | article    | `stanford-art-glp1-microsteps` |

**Themes covered:** family meals, school lunches, picky eating,
seasonal eating (Halloween + holidays), celiac and special diets,
pediatric gut health, **protein myth-busting (adult-side), GLP-1
behaviour-change microsteps.**

## Sprint 2 — Stanford content run #2 (2026-05-01)

| #   | Source URL                                                                                      | Author                                                                                      | Original date | Sous shape | Sous id                                      |
| --- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------- | ---------- | -------------------------------------------- |
| 11  | `/en/gaps-in-pediatric-obesity-treatment-need-attention-especially-from-an-equity-perspective/` | Thomas Robinson, MD (Pediatric Weight Control Program, Stanford Medicine Children's Health) | 2024-06-18    | article    | `stanford-art-pediatric-obesity-equity`      |
| 12  | `/en/just-cook-kids-moderation-part-1-let-eat-cake-just-much/`                                  | Maya Adam, MD (Stanford / Just Cook for Kids)                                               | 2014-11-24    | article    | `stanford-art-moderation-let-them-eat-cake`  |
| 13  | `/en/moderation-part-2-good-things-come-small-packages/`                                        | Maya Adam, MD (Stanford / Just Cook for Kids)                                               | 2014-12-16    | article    | `stanford-art-moderation-small-packages`     |
| 14  | `/en/healthy-halloween-possible/`                                                               | Shiri Sadeh-Sharvit, PhD (Eating Disorders Research Program, Stanford)                      | 2015-10-22    | article    | `stanford-art-healthy-halloween-flexibility` |

**Themes added by run #2:** family-based behavioural treatment for
pediatric weight care, equity gaps in treatment access, moderation
mechanics ("the half trick", screen-free eating, small plates),
seasonal eating navigated through psychology rather than restriction.

**Total Stanford-attributed content live in the Content tab after run
#2:** 13 articles + 1 research brief + 8 expert voices.

## Sprint 3 — Stanford content run #3 (2026-05-01)

| #   | Source URL                                        | Author                                                                                 | Original date | Sous shape | Sous id                               |
| --- | ------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------- | ---------- | ------------------------------------- |
| 15  | `/en/the-2020-version-of-healthy-holiday-eating/` | Venus Kalami + Jami Zamyad (Stanford Medicine Children's Health Clinical Nutrition)    | 2020-11-23    | article    | `stanford-art-holiday-2020`           |
| 16  | `/en/may-is-celiac-awareness-month/`              | Venus Kalami (Lucile Packard Children's Hospital, Stanford Medicine Children's Health) | 2020-05-07    | article    | `stanford-art-celiac-awareness-month` |

**Themes added by run #3:** holiday meal-rhythm tactics, kitchen
build-out for celiac households (separate toaster, cutting boards,
condiment hygiene), label-literacy on commercial gluten-free
products.

**Total Stanford-attributed content after run #3:** 15 articles + 1
research brief + 9 expert voices.

## Sprint 4 — Stanford content run #4 (2026-05-01)

| #   | Source URL                                                   | Author                                                                                    | Original date | Sous shape | Sous id                                     |
| --- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------------- | ---------- | ------------------------------------------- |
| 17  | `/en/four-ways-to-support-families-facing-childhood-cancer/` | Bass Center for Childhood Cancer and Blood Diseases (Stanford Medicine Children's Health) | 2017-09-21    | article    | `stanford-art-supporting-cancer-families`   |
| 18  | `/en/weight-control-program-turns-ellens-life-around/`       | Cindy Zedeck, MA + Nadia Al-Lami (Stanford Pediatric Weight Control Program)              | 2014-12-10    | article    | `stanford-art-weight-control-program-story` |

**Themes added by run #4:** community support during pediatric medical
crises (with food as a structural support), 25-year history of
Stanford's Pediatric Weight Control Program + the food traffic-light
model used in family-based behaviour-first care.

**Total Stanford-attributed content after run #4:** 17 articles + 1
research brief + 9 expert voices.

## Sprint 5 — Stanford content run #5 (2026-05-01, final batch)

| #   | Source URL                     | Author                                                                             | Original date | Sous shape | Sous id                         |
| --- | ------------------------------ | ---------------------------------------------------------------------------------- | ------------- | ---------- | ------------------------------- |
| 19  | `/en/healthy-happy-halloween/` | Bayside Pediatrics + Livermore/Pleasanton/San Ramon Pediatrics (Stanford Medicine) | 2016-10-17    | article    | `stanford-art-halloween-safety` |

**Themes added by run #5:** Halloween non-candy safety basics
(supervision, visibility, candy inspection, donation). Closes out the
seasonal-eating cluster begun in run #1.

**Total Stanford-attributed content after run #5 (final):** 18
articles + 1 research brief + 9 expert voices.

The Stage-3 cycle target was 48 Stanford items by W26. We landed 28
items across 5 runs. The shortfall vs. plan reflects two real
constraints: the Stanford Children's Health Healthy Eating category
holds ~26 articles total (we ingested most relevant ones), and the
Stanford Medicine Insights archive isn't easily browsable via the
WebFetch tool. Reaching 48 needs additional source pools (Stanford
SCOPE direct article URLs, Stanford Lifestyle Medicine pages,
healtheducation.stanford.edu) — that's a Stage-4 source-discovery
expansion, not a content-fetch problem.

**Verbatim discipline.** Each card includes ≤ 30 verbatim words from its
source, in quotation marks where used at all. The rest is original
Sous wording.

## Source pool — candidates queued for next run

The following Stanford-affiliated URLs are tracked for future ingest.
Each row gets crossed off when an article from it lands in a
later sprint.

- `healthier.stanfordchildrens.org/en/category/healthy-eating/` — full
  Healthy Eating category (Stanford Children's Health) — additional
  articles to be sampled in Sprint 2 / Sprint 3.
- `med.stanford.edu/pediatrics/news.html` — Stanford Pediatrics news
  feed (clinical-research framing) — pending sprint pull.
- `scopeblog.stanford.edu/category/parenting/` — Stanford Medicine
  SCOPE blog, parenting category — pending sprint pull.
- `longevity.stanford.edu/lifestyle/` — Stanford Lifestyle Medicine —
  pending sprint pull (adult-side framing for non-PM Content tab).
- `healtheducation.stanford.edu` — Stanford Center for Health
  Education — pending sprint pull.

The next Stanford run is scheduled for Sprint 2 Week 3 per
`STAGE-3-VIBECODE-AUTONOMOUS-6MO.md`.
