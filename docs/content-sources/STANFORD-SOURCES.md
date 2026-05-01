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

**Themes covered:** family meals, school lunches, picky eating,
seasonal eating (Halloween + holidays), celiac and special diets,
pediatric gut health.

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
