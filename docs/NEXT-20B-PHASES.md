# NEXT 20 PHASES — Sprint B: Intuition, Nuance, Visual Fixes

Purpose: a second 20-phase sprint that tightens the Today home page, makes
filters clickable in a truly minimalist way, gives craving input real semantic
nuance, bulks up the landing page with real app shots, and fixes the visual
bugs in the Path screen (overlapping hover tooltip, stray scrollbar, header
spacing).

Non-negotiables (same as every Sous sprint):

- No cluttered settings panels, no dropdowns with 20 options.
- Every screen must still pass the "one-screen, one-action" test.
- No invented dishes or images.
- Everything committed to `main`.

---

## Theme A — Today home page decluttering (P1–P4)

The Today home is carrying too many auxiliary chips (Tonight commitment, Cook
for two, Repeat cook, "Too tired? Make something in 15 minutes", FallbackActions
tile row). A middle-aged or senior first-time user opens the app and sees five
invitations where there should be one. The craving bar and the swipe card are
the app. Everything else is a side pocket.

- **Phase 1 — More-options drawer**: Move `TonightChip`, `CookForTwoChip`, and
  `RepeatCookChip` into a single bottom-sheet drawer ("More options") that
  opens from a small 20 pt "•••" link below the quest card. Home page still
  shows the chips _only when they are actively engaged_ (e.g. a commitment
  already exists for tonight) — otherwise the drawer is the entry point.
- **Phase 2 — Retire "Make something in 15 minutes" + FallbackActions from the
  primary surface**: the quick-win shortcut now lives inside the new cook-time
  dropdown (see Phase 6) and "Rescue fridge / Play game" move inside the More
  drawer as secondary shortcuts. One primary CTA on Today: the craving bar.
- **Phase 3 — Second-fold social feed**: Promote `FriendsStrip` into a real
  horizontal-scroll row with meal photos (Instagram-shelf style, 160 × 200
  tiles, snap). "What your cooking friends made this week."
- **Phase 4 — Seed friends feed**: Add a small, honest, clearly-labelled mock
  dataset of 8 friends + a real meal slug each. Use the existing food images
  in `public/food_images/` — never invent.

## Theme B — Clickable minimalist filters on the Quest Card (P5–P8)

The top-right "Under 20 min" chip is a single binary toggle — wasted real
estate. Turn it into two clickable pills that open tiny dropdowns. No settings
page, no filter panel.

- **Phase 5 — `FilterPill` + `FilterDropdown` primitives**: Reusable
  components in `src/components/shared/`. Pill = label + current value + small
  chevron. Dropdown = at most 6 short options, native-feeling, dismisses on
  outside tap.
- **Phase 6 — Cook-time dropdown**: Options: `Any time`, `≤15 min`, `≤20 min`,
  `≤30 min`, `≤45 min`, `≤60 min`. Replaces the existing binary toggle.
- **Phase 7 — Cuisine dropdown**: Options derived from the cuisines actually
  present in the dish index. "Any cuisine" is the default.
- **Phase 8 — Wire into `buildQuestDishes` + sessionStorage**: Both filters
  persist for the current tab session only (no permanent settings). Filters
  compose (AND).

## Theme C — Nuanced craving matching (P9–P12)

Today's craving parser is keyword-based. "Chicken alfredo pasta" matches
anything with "chicken" in the name. We need the parser to understand
sauce families, technique families, and protein families so that "chicken
alfredo" finds chicken carbonara, creamy chicken pasta, and only _then_ butter
chicken as a distant cousin.

- **Phase 9 — Dish taxonomy augmentation**: A pure mapper in
  `src/lib/engine/dish-taxonomy.ts` that enriches each dish with structured
  tags: `protein`, `sauce`, `technique`, `flavor`, `cuisine`, `form`,
  `dairyLevel`. Derived from existing fields + a small, explicit
  synonym/heuristic lookup. No data duplication — derived on demand and
  memoised.
- **Phase 10 — `findClosestDishes(text, index, k)`**: Token-overlap ranking
  with synonym expansion. Examples of synonym classes: `{chicken, poultry,
hen}`, `{alfredo, white-sauce, cream-sauce, bechamel, carbonara}`, `{tikka,
makhani, butter, tandoori}`, `{pasta, noodle, spaghetti, fettuccine}`.
  Score = weighted sum of matches on each tag axis; ties broken by cuisine
  affinity then alphabetic for determinism.
- **Phase 11 — Wire into search flow**: When the craving popout parses a
  craving, also surface a "Closest to what you're craving" rail above the
  AI-parsed suggestion, with 3 dishes and a one-line reason ("White-sauce
  chicken pasta, same vibe").
- **Phase 12 — Tests**: `dish-taxonomy.test.ts` and `find-closest-dishes.test.ts`
  with the examples in this plan as golden cases.

## Theme D — Landing page: real app screenshots (P13–P15)

The current landing page is text-heavy and abstract. Users who land from
Twitter need to see what the product actually looks like before they commit to
scrolling. Model: healthifyme.com/in — phone mockups beside every claim.

- **Phase 13 — `AppPreviewSection`**: Hero-adjacent phone mockups showing
  three real screens (Today, Path, Win). Uses existing screenshots captured
  at iPhone SE viewport in `docs/screenshots/`.
- **Phase 14 — `FeatureShowcaseRow`**: Horizontal-scroll carousel of app
  screens with one-line captions ("One craving, three sides", "A real syllabus
  in the Path tab", "Send any cook to a friend"). Feels like a marketing strip,
  not a feature dump.
- **Phase 15 — Trust strip polish**: Subtle "No account needed to try · No
  upsell loops · No recipe ads" band, tucked below the app preview. Clean,
  non-blocky, readable.

## Theme E — Path screen visual rectifications (P16–P18)

From the current screenshot the Path page has three defects:

1. `TrainingHoverPanel` (desktop hover preview) is rendering behind or through
   the neighbouring orb ("Mother Sauces"), creating a modal-on-modal effect
   with clipped text ("2 easy wins techniques …sh ideas. Tap for details").
2. A vertical browser scrollbar is visible — the page scroll container should
   be `scrollbar-hide` on mobile-frame embeds.
3. The top header slightly overlaps the time/status bar and the "Your Path" +
   "(?)" glyph + level badge cluster sit too tight.

- **Phase 16 — Training hover fix**: Disable the hover panel entirely on
  pointer-coarse devices (mobile, touch frames). On desktop, add a safe offset
  so it cannot collide with the node immediately to its right. Raise z-index
  properly over the skill-grid stacking context.
- **Phase 17 — Path scroll container**: Add `scrollbar-hide` on the Path
  scroll wrapper; add `pt-[env(safe-area-inset-top)]` safe-area to the Path
  header; add a 4 pt gap between the level pill and the streak/trophy cluster.
- **Phase 18 — Badges FAB**: The floating Badges button overlaps content on
  short viewports. Give it `z-30`, add a soft safe-area bottom offset, and
  ensure it never lands under the tab bar.

## Theme F — Verification + commit (P19–P20)

- **Phase 19 — Lint, tests, build**: `pnpm lint`, `pnpm test`, `pnpm build`
  must all be green. Fix any regressions introduced by earlier phases.
- **Phase 20 — Ship + docs**: Commit all work to `main`. Update `ROADMAP.md`
  with a new "STAGE 0.6" section, and update `STRATEGY.md` decision log with
  the three key decisions in this sprint (hidden "More options" drawer vs.
  permanent chips, minimalist dropdowns vs. filter panel, synonym-expansion
  craving matching vs. embeddings).

---

Deferred (intentionally out of scope for this sprint, documented here so they
are not lost):

- A real embedding-based dish matcher running client-side (waiting for a
  lightweight model + bundle-size justification).
- Friend auth + real social graph — seed data is honest for now.
- Screenshot regeneration for Path defect fixes (requires live browser).
