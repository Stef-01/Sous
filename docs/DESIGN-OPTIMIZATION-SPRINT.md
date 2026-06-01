# Design Optimization Sprint — 2026-06-01

**Method:** real **UI/UX Pro Max** corpus (`search.py` / `design_system.py` over the
67-style / 161-palette / 99-UX-guideline CSVs) + live screenshots via the **Claude
Preview** MCP at a 390×844 iPhone viewport, **real returning-user data** (streak 4,
all onboarding modals dismissed). Every finding cites a corpus rule. Executed as
**10 recursive improvement loops** — re-screenshot, fix the single highest-impact
corpus-cited defect, build/lint, commit, repeat.

## Corpus design-system target (recipe / cooking mobile app)

`design_system.py "recipe cooking mobile app"` →

| Token        | Value                                                                    | Sous current                               |
| ------------ | ------------------------------------------------------------------------ | ------------------------------------------ |
| Primary      | `#9A3412` terracotta                                                     | `--nourish-*` greens/warm — aligned family |
| Accent / CTA | `#059669` fresh green                                                    | `--nourish-green` ✓                        |
| Background   | `#FFFBEB` warm cream                                                     | `--nourish-cream` ✓                        |
| Foreground   | `#0F172A` near-black                                                     | `--nourish-dark` ✓                         |
| Type         | Calistoga (display) / Inter (body)                                       | serif display + sans body ✓                |
| Checklist    | no emoji icons, 4.5:1 contrast, focus states, reduced-motion, 44px touch | mostly ✓                                   |

Direction is correct — warm editorial. The work is **composition, density, empty/zero
states, and overlap bugs**, not a re-skin.

## Per-screen audit

### Today — **GOOD** ✓

Header decluttered (`Sous · 🔥4 · greeting + avatar`, no ⋯). Hero fills (letterbox
fixed). Editorial hierarchy reads. Fits one viewport (rule 10 ✓).

- Minor: studio-white dish photos vs faint gray card surface = subtle seam
  (`elevation-consistent`). `MEAL QUEUE` label semantics for a single card.

### Cook Mission — **GOOD** ✓

Cover image fills; Mission→Grab→Cook→Win dots; one dominant green CTA with
subordinate secondary (`primary-action` ✓; `multi-step-progress` ✓).

### Content — **GOOD** ✓

Clean card grid, cover images, clear secondary nav.

- Note: tab + h1 read **"Community"** but CLAUDE.md rule 5/11 mandate label
  **"Content"** — documented-intent drift. **Founder-gated** (IA decision; not
  touched this sprint — flagged here).

### Path — **NEEDS WORK**

- Top stat cluster shows 5 metrics (`🔥4 · 🏆0 · 🎖1/20 · Level · XP`). The
  **trophy renders a bare `0`** → demotivating (`content-priority`, `whitespace-balance`).
- **Achievement toast** is a loud saturated orange that **overlaps the bottom nav**
  (`toast-dismiss`, `fixed-element-offset`, `color-semantic`).
- "Your journey" shows **two bare `0`s** (Dishes made, Cuisines) → reads as failure
  for new users (`empty-states`).

### Pairing / Sides — **WEAKEST** (highest priority)

- **No-image hero is a ~400px empty card** with a tiny centred chef-hat. Image-less
  dishes are common (35/76 meals, 98/205 sides have photos) so this is frequently
  seen. Huge dead zone (`whitespace-balance`, `empty-states`, `image-dimension`).
- **Side-dish names truncate to one line** (`truncate` at `result-stack.tsx:486`) →
  "Kakdi …". Corpus: prefer wrapping (`truncation-strategy`).
- **Sticky "Cook plate" CTA** has no backdrop and the list lacks bottom clearance →
  cards bleed through / hide behind it (`fixed-element-offset`).

### Win — feature-rich (code-audited)

Rating + photo + note + skill progress + nutrient + eco + pod + invite. Watch for
density (`whitespace-balance`); a celebration moment so some richness is fine.

## 10-loop execution backlog (priority order, corpus-cited)

1. **Pairing** — compact, warm gradient no-image hero (kill the 400px dead zone).
2. **Pairing** — side-card names wrap instead of truncate.
3. **Pairing** — sticky CTA fade backdrop + list bottom clearance.
4. **Path** — hide trophy stat at `0`; tighten header cluster.
5. **Path** — re-tone achievement toast to on-brand warm + lift clear of bottom nav.
6. **Path** — graceful zero-states in "Your journey".
7. **Today** — blend hero card surface so studio-white photos sit seamlessly.
   8–10. **Recursive** — re-screenshot after each fix; pick the next highest-impact
   corpus-cited defect (spacing rhythm, motion/press feedback, focus rings, 44px
   touch on touched controls, final full-screen verification sweep).

Each loop: edit source → `pnpm build` + `pnpm lint` pass → `git commit && push` →
re-screenshot to confirm.

## Execution log (all shipped to main, build+lint green)

| Loop | Fix                                                                                                                 | Commit    |
| ---- | ------------------------------------------------------------------------------------------------------------------- | --------- |
| 1    | Pairing: compact warm no-image band (killed ~400px void)                                                            | `954820f` |
| 2    | Pairing: side names wrap instead of truncating                                                                      | `954820f` |
| 3    | Pairing: sticky CTA cream-fade backdrop (no card bleed-through)                                                     | `954820f` |
| 4    | Path: hide trophy stat at zero                                                                                      | `5d3a791` |
| 5    | Path: achievement toast → corpus terracotta + lifted clear of nav                                                   | `5d3a791` |
| 6    | Path: mute still-zero journey stats (recede behind live streak)                                                     | `5d3a791` |
| 7    | Cohesion: unify section eyebrows onto `.sous-label` token                                                           | `f472161` |
| 8    | A11y: lift sub-44 pairing controls + focus rings                                                                    | `f472161` |
| 9    | A11y sweep: 44px touch + focus across Today/Path/Content (shared BookmarkButton ×~40, quick-links ×8, nav, prompts) | `2360b2a` |
| 10   | Pairing: declutter side cards via progressive disclosure                                                            | `7c2bd24` |

**Verified live** (Claude Preview, 390×844, real data): Today, Path, Content, Pairing.
**Code-verified** (build + structure): Cook Mission (already strong), Win (feature-rich),
achievement-toast re-tone (trivial static class swap; 4.2s auto-dismiss closed before
each screenshot landed). `useReducedMotion()` is honored across the animated components.

### Intentionally NOT changed (flagged, not guessed)

- **Today streak pill** (39×25): its background sits on the same element as the chip,
  so a 44px hit area would enlarge the visible chip and unbalance the just-refined
  header. Secondary affordance; primary actions all meet 44px. Left as-is.
- **Content "Community" label** vs CLAUDE.md rule 5/11 ("Content"): an IA/editorial
  decision, not visual polish — surfaced for a founder call, not silently renamed.
- **Hero studio-white photo backgrounds** (#F3F5F4): inherent to the source images;
  rule 7 forbids generating/altering imagery.
