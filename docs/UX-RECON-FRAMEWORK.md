# UX Reconnaissance Framework

> **Filed:** 2026-05-03 (Y2 Sprint C kickoff, retroactive across Y1).
> **Why this exists:** Stefan's review at Y2 W11 flagged that
> several Sous surfaces were functional but visually thin —
> "rudimentary" was the word. This framework makes "study the
> leading apps + clone the pattern" a recurring sprint deliverable
> rather than a one-off. The goal: every sprint ships at least
> one surface upgrade rooted in a documented observation of how
> the best food apps solve the same problem.

## The discipline

For each sprint:

1. **Pick one surface** that's about to ship in the sprint.
2. **Spend 30-60 min observing** how 2-3 leading food apps solve
   the equivalent surface. Capture screenshots locally for
   reference (do NOT commit competitor screenshots — IP-clean
   policy).
3. **Write a short pattern note** describing the pattern in your
   own words. Add it to this doc's "Pattern library" below if
   the pattern is new; otherwise reference the existing entry.
4. **Implement a clean Sous-branded version** — original code,
   original copy, original visual language. The pattern is the
   thing that gets reused, not the pixels.
5. **Close-out checkbox** in the sprint IDEO doc: "Surface X
   upgraded to pattern Y. See UX-RECON-FRAMEWORK.md#pattern-Y."

Cadence: one upgrade per sprint = ~12 upgrades per year. Over
2-3 years that's enough to compound a polished, recognisable
Sous design language without ever shipping a "design refresh"
sprint.

## Source apps studied

Across the food-app category, these are the surfaces I draw from
when documenting patterns. None are reproduced verbatim — the
job is to extract the **principle**, then express it in Sous's
visual vocabulary.

| Category                | Apps observed                                                  | What they do well                                  |
| ----------------------- | -------------------------------------------------------------- | -------------------------------------------------- |
| Editorial recipe browse | Serious Eats, Bon Appétit, NYT Cooking, BBC Good Food, Food52  | Hero card, eyebrow taxonomy, byline trust signals  |
| Meal-plan apps          | HelloFresh, Mealime, Plant Jammer, Eat This Much               | Weekly grid, swap affordance, pantry-driven build  |
| Cook-along              | Tasty, Tastemade, America's Test Kitchen, HelloFresh in-flow   | Stickied progress, hands-free, timer-step coupling |
| Pantry / inventory      | Whisk, Paprika, Mealime, Kitche                                | Add-by-photo, expiry tracking, quick chips         |
| Discovery / search      | Yummly, Spoonacular, BigOven, Pinterest food                   | Filter chips, ingredient-include / exclude         |
| Progression / habit     | Duolingo, Headspace, Strava (non-food), Streaks                | Path metaphor, streak ring, gentle nudges          |
| Editorial / content     | Bon Appétit, Food & Wine, NYT Cooking, Mob, Half Baked Harvest | Tag cloud, hero magazine, byline depth             |

## Pattern library

Each entry: **Name · Where it lives · The principle · Sous mapping**.

### 1. Hero recipe card

**Where:** Recipe browse, Today result-stack, Path favourites.
**Principle:** A recipe card communicates "this is a real dish,
made by a real cook" through a large hero image (16:9 or 4:3),
an eyebrow category label in small caps above the title, a
prominent dish title in display weight, and a compact meta strip
(time / effort / one trust signal). The save-toggle lives in the
top-right corner of the hero, always reachable. The card never
crowds — at most 4 elements above the fold of the card.
**Sous mapping:** `ResultCard` (Y2 W11), recipe cards on
`/path/recipes`, `/path/favorites`, the Cook-again strip.

### 2. Eyebrow categorisation

**Where:** Above titles in recipe cards, hero stories, content
pieces.
**Principle:** A short, all-caps, condensed-weight label above
the title gives instant taxonomy without consuming the title
space. "QUICK DINNERS" / "WEEKNIGHT" / "VEGAN COMFORT". Functions
as both label AND filter affordance — tap-to-narrow is a common
extension.
**Sous mapping:** Cuisine family eyebrow on result cards
("ITALIAN / WEEKNIGHT"), tag cloud chips on Content tab.

### 3. Time-effort-trust meta strip

**Where:** Below recipe-card title, persistent header on recipe
detail.
**Principle:** Three pieces of info, three slots, fixed order:
TIME · EFFORT · TRUST. Time is the hard number ("25 min");
effort is the qualitative bucket ("Easy / Medium / Worth it");
trust is whatever the source can claim ("Tested 4 ways" / "12k
saves" / "Coach pick"). Resist the urge to add nutrition,
servings, rating count, etc. — those live in the expanded view.
**Sous mapping:** Already partially present (Best match / Guided
badges); upgrade to the 3-slot strip on every result card.

### 4. Save heart, top-right, always reachable

**Where:** Hero corner of any recipe surface.
**Principle:** Single circular tap target, top-right of the hero
image, contrasts against the image with a subtle scrim or pill
backdrop. Tap state animates (scale-down + fill) so the action
feels confirmed without a toast.
**Sous mapping:** Add to `ResultCard`, `/path/recipes` cards,
`/community/research` editorial cards (later sprint).

### 5. Servings stepper that scales live

**Where:** Recipe detail header.
**Principle:** A `[-] 4 servings [+]` control above the
ingredients list scales every quantity in place when tapped.
Decimals round sensibly ("2.66 → 2¾") and the user can see the
unit change before committing. Small, but it's the single
biggest "this app actually works for my dinner" moment.
**Sous mapping:** Recipe-authoring detail (Y2 H sprint) +
guided-cook header. Worth retrofitting to existing recipe
surfaces.

### 6. Hero with sticky compact header

**Where:** Long recipe pages, cook flow.
**Principle:** The full hero image lives at the top of the page;
as the user scrolls, a slim version (image thumbnail + title +
save heart) sticks to the top. The compact header re-establishes
context without re-shipping the hero.
**Sous mapping:** Recipe detail page (Y2 W12 candidate), guided
cook step view.

### 7. Step-by-step with locked progress

**Where:** Cook flow.
**Principle:** Each step gets a full screen / card. A horizontal
progress strip at the top shows where you are in the sequence
(dots or a thin bar). The step number is large and unmissable.
Timer-bearing steps surface a single "Start timer" button with
the duration baked in. Hands-free voice nav is a stretch goal
but the visual layout works without it.
**Sous mapping:** Existing guided cook flow uses this; verify
each step has the locked progress strip + the single primary
action.

### 8. Ingredient checklist with strikethrough

**Where:** Cook flow ingredient stage, shopping list.
**Principle:** Tap an ingredient to strike it through. State
persists across reloads (localStorage). The strikethrough is
visual feedback only — no separate "checked" indicator needed.
**Sous mapping:** Guided cook "Grab" stage, `/path/shopping-list`.

### 9. Filter chip row, single-row scroll

**Where:** Above any recipe list, search results.
**Principle:** Horizontally-scrolling row of pill chips at the
top of the list. Each chip is a one-tap filter; tapping a chip
applies the filter and the list updates immediately. Active
chips shift to filled state. No filter modal, no "apply" button.
**Sous mapping:** `/path/recipes` (cuisine + cook-time chips),
`/community` (already has tags but upgrade to chip row).

### 10. "Made it" feedback ring

**Where:** Recipe detail, post-cook screen.
**Principle:** A circular ring around the save heart fills as
the user "makes" the recipe (or rates / favourites it). Three
states: empty (never made), partial (made once), filled
(repeat). The ring becomes the visual proof of competence — a
recipe you've made twice looks different from one you saved.
**Sous mapping:** Path tab cuisine mastery rings already use
this; pattern applies to per-recipe rings on `/path/recipes`.

### 11. Tap-and-hold quick-add

**Where:** Recipe browse cards.
**Principle:** Long-press any recipe card to summon a small
contextual menu: "Add to plan / Add to shopping list / Save".
Avoids cluttering the card with multiple buttons; power-users
get the affordance without tutorial.
**Sous mapping:** Today result-stack cards (defer to later
sprint), `/path/recipes` card grid.

### 12. Empty-state with concrete preview

**Where:** Pantry, shopping list, favourites — anywhere the user
hasn't done the thing yet.
**Principle:** Don't show a generic "Nothing here yet" message.
Show a real, beautiful preview of what the surface looks like
when populated, dimmed or with a gentle "Tap to add your first
ingredient" CTA layered on top. The preview demonstrates value;
the empty message demands work without showing the reward.
**Sous mapping:** `/path/pantry` empty state, `/path/shopping-list`
empty state, friends strip empty state on Today.

## Sprint-by-sprint mapping

This is the load-bearing piece — bakes recon into each remaining
sprint of Y2.

### Year 2 — recon-driven surface upgrades

| Sprint  | Weeks   | Surface focus                        | Pattern reference (above)              | Status                                           |
| ------- | ------- | ------------------------------------ | -------------------------------------- | ------------------------------------------------ |
| C (now) | W11-W14 | Today result-stack                   | #1 Hero card + #3 meta strip + #4 save | **In flight** — W11 ships first wave             |
| D       | W15-W18 | Pantry add-flow                      | #12 Empty state + #11 Quick-add        | Pantry-add follows the recipe-card visual rhythm |
| E       | W19-W22 | Daily rhythm + notification surfaces | #6 Sticky compact header               | Rhythm card mirrors recipe-card hero strip       |
| F       | W23-W26 | Voice MVP + Y2 H1 close              | #7 Step-by-step + #8 Checklist         | Cook flow gets the locked-progress upgrade       |
| G       | W27-W30 | Voice conversational                 | #5 Servings stepper                    | Stepper exposed via voice + tap                  |
| H       | W31-W34 | Recipe authoring                     | #2 Eyebrow + #5 Stepper + #6 Sticky    | New recipe creation flow                         |
| I       | W35-W38 | Pod V2                               | #9 Filter chips + #10 Made-it ring     | Pod gallery + members get the ring               |
| J       | W39-W43 | Agentic search                       | #9 Filter chips + #2 Eyebrow           | Search results page from scratch                 |
| K       | W44-W47 | Cuisine vocabulary                   | #2 Eyebrow + #10 Made-it ring          | Vocabulary card grid                             |
| L       | W48-W51 | Charity bake-sale                    | #1 Hero card + #4 Save                 | Bake-sale recipe cards                           |
| —       | W52     | Year-2 close                         | All — audit                            | Audit + retro                                    |

### Year 1 — retroactive notes

Y1 shipped 51 weeks with no formal recon discipline. The visual
weakness this framework addresses is the cumulative cost. The
following Y1 surfaces are **upgrade candidates** for early-Y2
backfill (called out so a future sprint can pick one up
opportunistically):

- Today QuestCard hero (#1 Hero card, #3 Meta strip)
- Path skill tree (#10 Made-it ring is already used; consistency
  audit needed)
- Coach quiz screen (no specific pattern; visual weight)
- Friends strip (no real card; needs #1 Hero card adapt)
- `/community/research` editorial cards (#1 + #4)

Pick one Y1 backfill per sprint **after** the sprint's primary
recon target is shipped — keeps Y1 cleanup parallel to Y2 work
without blocking the plan.

## Acceptance contract

A sprint passes the recon gate when:

1. The sprint's IDEO doc (`docs/y2/sprints/X/IDEO-REVIEW.md`)
   names which pattern (#1-#12) was the upgrade target.
2. The implementation is original (Sous's own colours, copy,
   spacing, components — no lifted CSS/code from the source).
3. The sprint surface scoreboard shows a real numeric jump on
   the upgraded surface (e.g. result-stack score 4.0 → 4.4)
   with the rubric in the IDEO doc.

If two of the three aren't met, the sprint doesn't close — the
pattern slips to the next sprint. Same hard discipline as the
4-gate green requirement.

## Pattern library will grow

This doc is alive. New patterns observed → new entries here.
Patterns that don't survive a sprint's implementation →
deprecate with a note. Year-3 the doc has 25-30 entries; year-5
it's the canonical Sous design language.
