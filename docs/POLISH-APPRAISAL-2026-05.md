# Critical polish + minimalism appraisal — 2026-05-01

> Stefan's prompt: "critically appraise and identify how to make the
> app more polished overall with thorough analysis and execution of
> improved visual design and minimalist principles."
>
> This is a brutal-honest read of the current app, not a victory lap.
> The Stage-3 cycle moved 21/22 surfaces to ≥3.5 on the IDEO rubric,
> but "shipped to ≥3.5" is not the same as "feels like an app
> someone designed on purpose." The two are different bars and the
> second one is what Stefan keeps asking for.

## The honest top-level read

The app **functions** well — every surface renders, every action has
an outcome, the test coverage holds. What it lacks in places is the
texture of being **designed**. Symptoms (each surface has at least one):

1. **Density without rhythm.** Surfaces that pack a lot of
   information (Today, Path, Content For-You) don't establish a
   clear visual hierarchy between primary content, supporting
   metadata, and decorative chrome. Everything competes for the same
   visual weight, so the eye has nowhere to land first.

2. **Inconsistent micro-decisions.** Border radius (rounded-xl vs
   rounded-2xl vs rounded-3xl) varies between cards on the same
   surface. Padding (p-3 vs p-4 vs p-5) varies similarly. Each one
   was a defensible decision in isolation; together they read as
   incoherent.

3. **Copy that whispers when it should speak (and vice versa).**
   Microcopy ranges from genuinely warm ("the pantry remembers, so
   you don't have to") to placeholder-flat ("List is empty.") to
   over-clever ("Wonder, then measure the wonder."). The voice
   doesn't have a single register.

4. **Overlays that don't earn their pixels.** Several toast / hint /
   pill components surface info that would be served just as well
   inline. Each was added for a specific moment but stays on screen
   even when irrelevant.

5. **Animation as compensation, not punctuation.** Some motion
   exists to make a thin surface feel polished (path home reveal
   stagger). Other motion is load-bearing UX (cook timer, swipe
   feedback). They use the same vocabulary, which makes the
   load-bearing motion feel less load-bearing.

## Surface-by-surface reading

### `/today` (the home surface)

**Polish ceiling cap:** the visible card stack lives in roughly the
top 60% of the viewport, then the "Friends" strip + reset-to-top hint

- pull-to-refresh affordance fill the rest. With Parent Mode on, the
  PM hint chips also stack here. The overall density is at the polish
  ceiling — one more thing added would tip it over.

**Specific moves:**

- The "Friends" social strip below the card stack is genuinely cool
  but reads as second-tier next to the swipe deck. Consider a
  collapse-on-scroll pattern where Friends tucks under after the
  user has swiped past 3-4 cards.
- The hidden-card peek (rotation 1.5° / -1°) is good. The shadow
  contrast between top card and stack-2 could be stronger to make
  the depth feel more physical.
- The mascot tap-target (top-right) is currently a bare button. A
  subtle 1px ring on hover would make the tap affordance more
  legible.
- The "What are you craving?" search input is the second visual
  anchor. Its placeholder font weight could match the card title
  weight to read as a peer call-to-action.

**Score delta target:** Polish 3.75 → 4.0; Minimalism 3 → 4.

### `/cook/[slug]` (the single Guided Cook flow)

This surface is the strongest in the app and has been since W4. The
step card, mistake chip, hack chip, and timer all share one visual
register. **No interventions needed.**

### `/cook/combined` (the dual-flow Guided Cook)

The known density problem. 1,122 lines of page code. The dual-track
stepper visually competes with itself — left and right tracks both
demand attention because there's no single primary track. The fix
is structural (re-rhythm the tracks so one is clearly primary at
any moment); deferred to dedicated Stage-4 W3 session per
`STAGE-3-RETROSPECTIVE.md`.

### Win screen (in cook flow)

Strong. Sparkle burst, level-up toast, journal prompt all read as
intentional. **No interventions.**

### `/path` (skill tree home)

**Density issue:** PathHero + JourneyMontage + JourneySummary +
NextUnlockCard + WeeklyGoalCard + AchievementsLauncher +
CuisineConstellation + ConfidenceDial + PreferenceStrip +
CooksSharedLine + TasteBlendPrompt + SkillTree + 4 quick-link tiles
all on one page. That's 13 sections. Half of them probably justify
their existence; the other half are accumulation.

**Specific moves:**

- Audit each path-home section for "would the user notice if this
  was gone?" Likely candidates for collapsing into a single "your
  rhythm" block: PreferenceStrip + CooksSharedLine + TasteBlendPrompt.
- ConfidenceDial vs JourneySummary — both communicate "how far
  you've come" with different metaphors. Pick one.
- The 4 quick-link tiles at bottom are good but the tile labels
  ("Scrapbook", "Pantry", "Shopping list", "Favorites") are
  inconsistent with each other in length. Either standardise to
  one-word ("Memories", "Pantry", "List", "Favorites") or accept
  the inconsistency as natural.

**Score delta target:** Intentionality 4 → 4 (already there);
Minimalism 3 → 4 (the big lift).

### `/path/scrapbook`, `/path/pantry`, `/path/shopping-list`, `/path/favorites`

Pantry + shopping-list + favorites all use the new EmptyStateCTA
shared component now and are clean. Scrapbook is still doing its
own card treatment with a distinct gradient bg — could adopt the
section-kicker pattern more consistently.

### `/community` (Content tab home)

The hero carousel + Reels rail + Articles grid + Research column +
Experts row + Forum list pattern reads well at first glance. With
the new For-You pagination cap and the active-tag banner, the
firehose problem is largely solved. **The remaining issue:**

- The "Articles & blogs" / "Research spotlight" / etc section
  kicker copy includes a small italic right-aligned tagline ("Long
  reads", "Plain-language briefs"). These are decorative — they tell
  the user nothing they can't infer from the section title. Drop
  them; the kicker alone is enough.
- The category filter strip has a "For You" pill that's the default.
  The visual treatment of the active pill could be stronger — right
  now it's a subtle green tint; a filled pill with white text would
  give the page a clearer current-state indicator.

### Article detail / Research detail / Expert detail

All three got source-attribution + typography polish in Sprint 3.
The article body now uses the excerpt-as-lede + first-paragraph
emphasis pattern. Solid. **One residual:** the `Cite` block in
research-detail and the `Sourced from` aside in article-detail use
slightly different visual treatments (research uses a card variant,
article uses tinted variant). They're now both green-bordered but
the internal padding/spacing differs by 4px. Pick one.

### `/community/forum/[id]`

Sprint 1 redesign was solid. **One residual:** the OP card and the
reply cards both use white bg + neutral border, just at different
sizes. The OP could use a subtly heavier shadow (shadow-md vs
shadow-sm on replies) to reinforce the hierarchy.

### `/community/reels` (immersive feed)

V3 "Up next" hint just landed. The hint reads well. **One residual:**
the reel poster image opacity is hardcoded to 0.9 (line 104 of
reel-card.tsx). At 0.9 the colour reads as washed; consider 0.95 or
1.0 with a darker bottom gradient to compensate for legibility.

### `/games` hub + 4 game pages

Stage 4 W2 unified the headers. The "NEW" pill + "Tap to try"
treatment landed cleanly. **One residual:** the four game cards use
gradient backgrounds (purple, amber, red, emerald) that don't share
a color story. They're cheerful but not coherent.

### `/sides`

The power-user fallback. Functional, lean. Polish lift would mean
giving it a quick search affordance — but that's feature work, not
polish.

## The 3 highest-leverage polish fixes (ship today)

The audit above surfaces ~25 observations. Here are the 3 with the
best leverage for the time:

1. **Drop decorative section taglines on Content home.** "Long reads",
   "Plain-language briefs" — these earn nothing. The section title
   ("Articles & blogs") already says it. Removing them tightens the
   visual rhythm immediately.

2. **Stronger active-pill state in CategoryFilterStrip.** Currently
   subtle green tint; bumping to filled pill with white text gives
   the user a much clearer "you are here" signal at no cost.

3. **Trim the path-home accumulation.** Move PreferenceStrip +
   CooksSharedLine + TasteBlendPrompt into a single collapsed
   "Your rhythm" disclosure that opens on tap. Removes 3 always-on
   sections from the scroll without losing the underlying functionality.

The rest go in the Stage-4 backlog.

## What this appraisal explicitly is NOT recommending

- A new design system / component library. The shared components
  shipped in Stage 4 W1 are sufficient for now.
- A typography or color overhaul. The current ramp works; the
  inconsistencies are micro-decisions, not system-level gaps.
- New animations. The motion presets in `src/lib/utils/motion.ts`
  cover what's needed.
- A re-architecture of any single page. The 1,122-line cook-combined
  page is the only one that genuinely needs refactoring, and that's
  already on the Stage-4 backlog.

The polish work is incremental, not revolutionary. The app already
has good bones. What it needs is patience and editorial judgement.
