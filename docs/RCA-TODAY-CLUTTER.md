# RCA — Why the Today screen keeps accreting redundant clutter

> **Filed:** 2026-06-01, after a founder screenshot showed the Today page
> stacking three separate restatements of cooking cadence (header "Day 4 of
> cooking" + "You usually cook Monday mornings" + a "3 cooks this week" card)
> above the meal — when the **streak flame already says all of it**, and the
> meal (the one thing the user opened the app for) was pushed below the fold.

## The symptom

Between the search bar and the meal hero sat **nine conditional chip
components**, and the header carried a greeting. In the screenshotted state,
three of them (welcome line, cook-rhythm line, weekly-rhythm widget) all
re-expressed the same fact — _"you cook regularly"_ — and buried the meal.

The product promise is **"one screen, one action, one win."** The screen had
become one screen, _eleven_ widgets, one buried win.

## Three recursive rounds of "why"

### Round 1 — Why is the same fact shown three+ times?

Each cadence/stat widget was added by a **separate feature increment** (W13,
W24, W35, W36, the eco work…), and **none removed or reconciled with the signal
already on the page.** Delivery was purely additive: every feature shipped a new
visible element; subtraction was never part of "done."
→ **Immediate cause: additive feature delivery. Nothing was ever taken off.**

### Round 2 — Why did each feature add an element without removing one?

Because "complete" was implicitly defined as _"the feature is visible and
works."_ The CLAUDE.md **"boil the ocean / do the whole thing"** ethos — right
for depth and correctness — got mis-applied to _surface area_: completeness was
read as **more on the screen** rather than **more polish on fewer things.** Each
chip was individually defensible ("it provides value"), so it cleared its own
bar and went on.
→ **Deeper cause: completeness was conflated with addition.**

### Round 3 — Why was each chip judged in isolation instead of against the screen?

Because the **unit of evaluation was the element, not the screen.** The question
asked was _"is this chip useful?"_ — to which the answer is almost always yes —
instead of _"does the screen survive this? does it duplicate a signal already
here? is the meal still first?"_ Every chip was a **local optimum**; their sum
was a **global mess.** And the two rules that should have stopped it — the Sous
Test (rule 1) and simplicity-first (rule 6) — existed only as **prose with no
teeth**, so under delivery momentum they were silently skipped.

There's also a quieter incentive underneath: **an added widget is legible proof
of work; restraint is invisible.** "I built the weekly-rhythm widget" reads as
progress; "I left the screen alone because the streak already covers it" does
not. So the bias tilts toward adding, every single time.

→ **Root cause: per-element justification with no enforced screen budget — plus
a bias toward adding because addition is visible and restraint isn't.**

## The fix (so it can't recur)

Removing the three cadence widgets + the eco stat chip and putting the meal hero
first is the _symptom_ fix. The _root_ fix is to change what gets evaluated and
to give the rules teeth:

1. **A hard budget (the principle).** Above the meal hero, Today renders only:
   brand + streak, the search, the meal. **Cadence = the streak, and nothing
   else. Stats never appear on Today — they live on Path.** New contextual chips
   are conditional and live BELOW the meal. Adding a Today element is
   one-in-one-out: to add one, justify what comes off.

2. **A guard with teeth.** `src/app/(today)/today/simplicity-budget.test.ts`
   fails CI if (a) any of the banned cadence/stat widgets returns, or (b) a
   nudge chip is hoisted above the meal hero. The Sous Test now has an
   executable form.

3. **Evaluate the screen, not the element.** The review question is no longer
   "is this useful?" but **"does the screen survive this — is the meal still
   first, and does this duplicate a signal already shown?"** If a signal exists,
   the answer is _strengthen the existing surface, don't add a second one._

## The same lens, applied app-wide

The pattern isn't unique to Today — it's the default failure mode of additive,
chip-by-chip delivery. The standing question for every screen: _what here
restates something already shown, and what can be removed so the primary action
stands alone?_ Stats belong on Path; cadence is the streak; the hero of each
screen (the meal, the recipe, the cook step) gets the top and the air.
