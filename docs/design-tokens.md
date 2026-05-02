# Sous design tokens (Stage-3 codification)

> Captures the patterns that emerged across Sprints 1-4 of the Stage-3
> cycle and codifies them so Stage 4 (or the next autonomous build
> session) doesn't have to re-derive them.
>
> These are not Tailwind config tokens yet — they live as
> documentation now and become real `tailwind.config` extensions in
> Stage 4. Keeping them in markdown means Stage 4 can decide whether
> to encode them as CSS custom properties, Tailwind theme entries,
> or both, without unwinding a half-decision today.

## Section kicker

Used above section headers across Path home, Content tab home,
skill-tree milestones, settings sheet sections, forum reply count,
expert "From X" header, source attribution kicker.

```
text-[10px or 11px]
font-bold uppercase
tracking-[0.12em] to tracking-[0.16em]
text-[var(--nourish-subtext)] (default)
text-[var(--nourish-green)] (when the kicker carries celebratory
                              or attribution weight)
```

Sprint 4 promoted this to the most-used micro-pattern in the app.
Stage 4 should expose it as `<SectionKicker variant="default | green">`
or as a Tailwind utility class.

## Empty-state CTA card

Used on `/path/pantry`, `/path/shopping-list`, `/path/favorites`,
`/community/saved` (next), and the `/community/forum/[id]` empty-
replies state.

```
container: rounded-2xl border border-dashed border-neutral-200
           bg-white/60 px-5 py-7-to-8 text-center
icon:     16-24px lucide icon centered, text-[var(--nourish-subtext)]
copy:     text-sm font-medium (primary line)
          text-xs text-[var(--nourish-subtext)] mt-1
          (helper line, max-width ~260px)
CTA pill: rounded-full bg-[var(--nourish-green)] px-4 py-2
          text-xs font-semibold text-white
          transition-transform active:scale-[0.97]
          (route to /today; copy: "Find something to cook")
```

Stage 4 should extract `<EmptyStateCTA icon="..." primary="..."
helper="..." cta={{label, href}}>` once a fourth use case appears.

## Source attribution aside

Used on `/community/article/[slug]` and `/community/research/[slug]`
when the item carries a real `sourceUrl` (i.e. Stanford-attributed
content, `isPlaceholder: false`).

```
container: rounded-2xl border border-[var(--nourish-green)]/25
           bg-[var(--nourish-green)]/5 (article) or bg-white (research)
           p-4 text-[12px]
kicker:    text-[10px] font-bold uppercase tracking-[0.16em]
           text-[var(--nourish-green)]
           — copy: "Sourced from"
title:     font-semibold text-[var(--nourish-dark)]
           — the sourceTitle field from the seed
button:    rounded-full px-3 py-1.5 text-[11px] font-semibold
           text-[var(--nourish-green)] ring-1 ring-[var(--nourish-green)]/20
           — opens sourceUrl in new tab with rel="noopener noreferrer"
disclaim:  text-[10px] text-[var(--nourish-subtext)]
           — "Summary captured {date} · Sous paraphrase, not a
             reproduction."
```

Stage 4 should extract `<SourceAttribution item={article|brief}>` so
the legal posture (paraphrase disclaimer, fair-use scope) is enforced
by the component contract rather than per-page memory.

## Quiet metadata pill

Used in `/games` (best score), `/path/pantry` (auto-applied hint),
`/path/shopping-list` (bought-progress), the forum reply count, the
"NEW" badge on never-played games, and the expert article-count pill.

```
container: inline-flex items-center gap-1.5
           rounded-full
           bg-white or bg-neutral-50
           px-2.5-to-3 py-1-to-1.5
           text-[10px] or text-[11px]
           [ring-1 ring-neutral-200] (when on a non-card surface)
content:   tabular-nums for any number
           font-semibold for the load-bearing word
           text-[var(--nourish-subtext)] for the rest
```

Stage 4 should extract `<MetaPill>` and consider tinted variants
(green for celebratory, amber for streak, gray for default).

## Game header identity

Used on all 4 game pages + the games hub.

```
sticky top-0 z-40 border-b border-neutral-100 bg-white/95
backdrop-blur-sm px-4 py-3
flex items-center justify-between gap-2

left:    back button (ArrowLeft, 11x11 minimum hit target)
center:  font-serif text-[14-15px] font-semibold
         (icon + game title)
         + text-[10px] uppercase tracking-[0.14-0.16em] sub-line
right:   tabular-nums score / metric

below header (optional):
         5-dot or N-dot round-progress strip
         filled / current / empty states using
         bg-[var(--nourish-green)] / .../60 / bg-neutral-200
```

Stage 4 should extract `<GameHeader title={...} subtitle={...}
icon={...} score={...} progress={...} />` so any new game inherits
the rhythm.

## Reduced-motion gate

Established codebase-wide pattern. Every motion surface includes:

```typescript
import { useReducedMotion } from "framer-motion";
const reducedMotion = useReducedMotion();

// then either:
initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
// or:
transition={reducedMotion ? { duration: 0.15 } : { type: "spring", ... }}
// or:
layout={!reducedMotion}
```

Stage 4 should consider a CLAUDE.md rule: any new framer-motion
component must include a reducedMotion gate or the lint catches it.

## Motion easing register (proposed for Sprint 5 codification)

The app currently uses spring transitions with three implicit
profiles. Stage 4 should formalise these as named exports from
`src/lib/utils/motion.ts`:

```
SNAPPY: { type: "spring", stiffness: 400, damping: 30 }
        — UI affordances (button taps, toggle indicators)
SHEET:  { type: "spring", stiffness: 320, damping: 28 }
        — overlay sheets, page transitions
GLIDE:  { type: "spring", stiffness: 260, damping: 25 }
        — card stack, scrapbook entries, longer slides
```

Reduced-motion fallback for all three:

```
RM:     { duration: 0.12-0.18 }
```

## Type ramp (proposed for Sprint 5 codification)

Currently the app uses ad-hoc font-size pairings. Stage 4 should
normalise into 5-6 sizes:

```
DISPLAY:    text-2xl font-serif    — page H1 (article, research)
HEADLINE:   text-lg font-serif     — page H1 (path, settings, lists)
TITLE:      text-base font-semibold — card titles
BODY:       text-[15px] leading-[1.7] — article body
META:       text-xs                  — metadata, helper copy
KICKER:     text-[10-11px] font-bold uppercase tracking — section kickers
```

## Spacing tokens (proposed for Sprint 5 codification)

Currently the app uses ad-hoc spacing. Stage 4 should normalise into
the Tailwind 4 scale (1 unit = 4px):

```
TIGHT:   gap-2 / px-2 / py-2     — pills, micro-actions
COMFY:   gap-3 / px-3 / py-2.5   — card content, inline actions
ROOMY:   gap-4 / px-4 / py-3     — cards, headers
GENEROUS: gap-5 / px-5 / py-4    — article body, sheet sections
PAGE:    px-4-to-5 / py-6        — page-level padding
```

## Notes for Stage 4

- The patterns above are descriptive of what shipped, not prescriptive
  for what must ship next. Stage 4 should test them against new
  surfaces and revise.
- Codifying these as Tailwind utilities or CSS custom properties is a
  separate decision from documenting them; do that codification once
  Stage 4 has a stable set of new surfaces to validate against.
- The reduced-motion gate pattern should become a lint rule
  (eslint-plugin-react-hooks or a custom rule) so it's not memory-
  enforced.
