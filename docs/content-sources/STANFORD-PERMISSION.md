# Stanford content — permission scope

> Tracks what Sous is permitted to ingest from Stanford-affiliated
> publications, and the boundaries the autonomous agent must respect.

## Permission summary

The Sous team has Stanford permission to surface short, attributed
summaries of content from public-facing Stanford-affiliated sources
inside the Sous Content tab. The agent operates inside the following
guardrails on every fetch:

- **Source must be public.** Only pages reachable without a Stanford
  login. Anything behind a paywall or restricted archive is out of scope.
- **Summary, not reproduction.** No more than 30 verbatim words per
  source, in quotation marks, with citation. The rest of any rendered
  card / article / brief uses original Sous wording.
- **Citation is mandatory.** Every embedded item carries:
  - the source URL,
  - the source publication name (e.g. "Stanford Medicine SCOPE"),
  - the original author byline if present,
  - the date the agent fetched the source.
- **No medical advice rewriting.** If a Stanford source contains
  clinical guidance, Sous summarises the public-information aspect
  but never re-frames it as Sous-issued advice. The card surfaces
  the source link prominently so users can read the original.
- **No image lifting.** Images on Stanford pages are not downloaded
  or re-hosted. Sous uses its own gradient-and-emoji fallback or
  food_images already in the local catalog.

## Scope of fetched content

The autonomous agent fetches under three shapes (defined in
`STAGE-3-VIBECODE-AUTONOMOUS-6MO.md` §"Stanford content run protocol"):

| Shape          | Length budget                      | Verbatim budget         |
| -------------- | ---------------------------------- | ----------------------- |
| article        | 300-500 original words             | ≤30 verbatim per source |
| research-brief | 200 original words                 | ≤30 verbatim per source |
| reel-script    | 60 narration words + 4 frame notes | ≤15 verbatim per source |

## Per-fetch ledger

Every Sprint Week 3 ingest appends to `STANFORD-SOURCES.md`. The
ledger is the audit trail; if a source needs to be removed, the
ledger entry is updated with a `removed: YYYY-MM-DD` field and the
seed file pruned.

## What the agent will NOT do

- Re-frame clinical guidance as Sous's own.
- Combine Stanford content with non-Stanford content in a way that
  could imply Stanford endorsement of the combined item.
- Generate fake bylines, fake research findings, or fake citations.
- Republish Stanford imagery, video, or audio.
- Ingest from non-Stanford sources under a Stanford label.
