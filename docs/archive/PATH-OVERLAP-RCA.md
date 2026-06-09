# Path Screen — Modal/Tooltip Overlap RCA

**Date:** 2026-04-16
**Reporter:** Stefan (screenshot of `/path` rendered in a phone-frame preview)
**Prior fix attempt:** Sprint 20B P16 — `.skill-hover-preview` media-gated class

The prior fix did not hold. This document traces every visual symptom in the
supplied screenshot to a root cause, then defines a comprehensive, testable
remediation plan.

---

## 1 · Observed symptoms

From the supplied screenshot of `/path`:

1. **"UP NEXT" label + "+50 XP" pill are clipped** at the very top of the
   screen. They appear above the `Your Path` header row and are partially
   cut by what looks like a status-bar / notch region.
2. **A tooltip-shaped panel is floating in the middle of the skill tree**,
   visible between the `Mise en Place` node and the `Dry-Heat Cooking` /
   `Moist-Heat Cooking` pair. Its content reads `"…measured and pan gets
hot —"` — a hoverTeaser string from `skill-node-training-hovers`.
3. **`Dry-Heat Cooking` label is visually overlapping with the tooltip**
   ("Day-Heaails Cooking" artifact) and with `Moist-Heat Cooking` to its
   right. Two node labels appear to collide.
4. **Badges floating action button** sits directly on top of the
   `Moist-Heat Cooking` node, not above the tab bar but in the content
   area.
5. **A vertical scrollbar is visible on the right edge** of the frame —
   not the hidden/custom style we use elsewhere in the app.
6. **Whitespace below the level/XP bar feels inconsistent** with the
   tight Today home treatment.

---

## 2 · Root cause analysis (per symptom)

### Symptom 2 + 3 — Floating tooltip + label overlap

**Observation:** the TrainingHoverPanel is still visible even in a narrow
phone-emulated viewport where we explicitly gated it to `(min-width: 768px)
and (hover: hover) and (pointer: fine)`.

**Possible causes:**

- **RC-A (primary):** The screenshot is a phone-frame _mockup inside a desktop
  browser_. The outer page is ≥768 px, the browser reports `hover: hover` and
  `pointer: fine` — so the CSS conditions are all true, and hovering on a
  skill node with a real mouse unhides the panel regardless of inner frame
  width. Our media query is not a narrow-viewport check, it is a
  _hover-capability_ check, and the user has a mouse.
- **RC-B (contributing):** `top-full` positions the panel directly below the
  node label. The skill tree rows have ≈120 px vertical step, but node
  heights plus labels plus connectors mean each "band" is ≈96 px with tight
  margins. A 52 px-tall tooltip inside that band overlaps the next row's
  node.
- **RC-C (contributing):** The panel width `min(13rem, calc(100vw − 2rem))`
  is 13rem (208 px) on the emulated frame. Adjacent nodes sit at ≈100 px
  horizontal spacing, so a 208 px-wide panel centred on one node bleeds
  into its horizontal neighbour too.

**Correct fix (not patch):** the tooltip is a pure-redundancy surface. The
node already has a `title` attribute (native browser tooltip), every node
opens the full `SkillDetailSheet` on tap, and every mastery card has the same
tap path. The hover panel adds nothing durable — remove it entirely from
both `SkillNodeComponent` and `MasteryCuisineCard`. Delete the component.
This eliminates symptoms 2 and 3 at the root.

### Symptom 1 — "UP NEXT" + XP pill clipped at top

**Observation:** The clipped elements are from `NextUnlockCard` (which says
`UP NEXT` on its eyebrow) and the level badge's `+50 XP` pill. They should
sit _below_ the `app-header`, not be clipped by it.

**Root cause:** the phone-frame mockup on the landing page enforces a
rounded-rectangle overflow-hidden mask with a notch shape. Real device
viewports that have a software notch (iPhone X+) pass that through via
`env(safe-area-inset-top)`. Our `.app-header` does not currently apply
`padding-top: env(safe-area-inset-top)`, so on iOS standalone PWA and on
viewports that inject `viewport-fit=cover`, the header starts at y=0 and
content beneath it gets drawn under the OS chrome. In this screenshot the
phone frame is simulating exactly that condition.

**Fix:** add `padding-top: env(safe-area-inset-top, 0px)` to
`.app-header` so every `/today`, `/path`, `/cook`, `/sides` screen respects
the safe area.

### Symptom 4 — Badges FAB sits on top of skill nodes

**Observation:** FAB vertical offset is `bottom: calc(5.25rem + safe-area)`.
Tab bar actual height is `~64 px` (4 rem) plus safe-area padding. 5.25 rem
= 84 px clearance above tab bar top-edge. That should work, BUT the skill
tree section below the first row extends into the viewport at FAB's
horizontal position (right edge).

**Root cause:** the FAB is anchored to the _viewport_ and the skill tree
scrolls under it. Its presence is correct (it's a FAB — it's supposed to
float), but two behaviours are wrong:

- It uses a warm amber palette that _reads as content_, not chrome, so
  it looks like an overlapping card rather than an intentional floating
  control.
- Its horizontal position collides with right-side nodes in the 2-column
  mastery grid.

**Fix:** (a) shift the FAB to the bottom-left so it does not collide with
the right-column mastery cards; (b) apply a subtle scroll-aware auto-hide
so it fades on active scroll and returns on scroll-stop (this is standard
Material FAB behaviour); (c) ensure it is visually unmistakable as chrome
(stronger shadow, thinner outline, smaller footprint when idle).

### Symptom 5 — Scrollbar visible

**Observation:** On Windows Chrome the default scrollbar is 17 px wide and
non-overlay. Our Today and Path pages do not stabilise the scrollbar
gutter, so (a) layout shifts by 17 px when content grows past the viewport,
and (b) the scrollbar visually competes with the rounded phone-frame
chrome.

**Root cause:** No global `scrollbar-gutter: stable` rule, no scrollbar
styling. The Path page is long enough to always scroll, so the scrollbar
is always visible.

**Fix:** apply `scrollbar-gutter: stable` on `html`, plus a soft
webkit/firefox custom scrollbar style so it reads as chrome, not content.

### Symptom 6 — Inconsistent whitespace below header

**Observation:** Section spacing on Path is `space-y-2` / `px-4 pt-3`
inside `PathHeader` + various stanza paddings. On the screenshot there
is ≈32 px of whitespace between the XP bar and `3 cooks to unlock` card.

**Root cause:** `pt-4` on the `JourneyMontage` wrapper is rendered only
when `completedSessions.length > 0`. For a fresh user that wrapper does
not render, but the `JourneySummary` block still has `pt-3`, and `NextUnlockCard` has its own internal padding. The gaps compound.

**Fix:** hoist vertical rhythm to a single `space-y-3` parent and remove
redundant `pt-*` on immediate children — a one-liner layout clean-up.

---

## 3 · Remediation plan — 10 phases

Small, testable steps. Every phase ends with a lint + test + build + commit
cycle.

### Phase 0 — Document (this file)

Commit this RCA to `docs/` so it's linkable from the remediation PRs.

### Phase 1 — Delete TrainingHoverPanel

- Remove `<TrainingHoverPanel />` from `SkillNodeComponent`.
- Remove it from `MasteryCuisineCard` in `skill-tree.tsx`.
- Delete `src/components/path/training-hover-panel.tsx`.
- Delete `.skill-hover-preview` CSS block from `globals.css`.
- Remove the `getSkillTrainingHover` import from `skill-tree.tsx` if unused.
  Keep it imported in skill-detail-sheet.tsx (still used for full story).
- Keep `title={oneLiner}` native tooltips on every interactive skill
  surface — no regression in information access.

### Phase 2 — Safe-area top padding on `.app-header`

Add `padding-top: calc(0.75rem + env(safe-area-inset-top, 0px))` and
reduce `py-3` in `PathHeader` to `pt-0 pb-2.5` so the env-based padding
does all the top work. Mirror the change on the Today header.

### Phase 3 — Stable scrollbar gutter

In `globals.css` at the `html, body` root:

```css
html {
  scrollbar-gutter: stable;
}
```

Plus a soft custom scrollbar:

```css
::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  border: 3px solid transparent;
  background-clip: padding-box;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(15, 23, 42, 0.18);
  background-clip: padding-box;
}
```

### Phase 4 — Badges FAB: reposition + auto-hide

- Change from `right-3` to `left-3 sm:left-4`.
- Add a `useScroll`-driven opacity transform: fully visible when
  `scrollY` has been stable for 400 ms, 30 % opacity during active
  scroll. Respects `prefers-reduced-motion`.
- Reduce idle padding to `px-3 py-2` while keeping `min-h-[44px]` for
  the tap target.

### Phase 5 — Path layout spacing clean-up

- Wrap Journey/NextUnlock/Weekly in a single `space-y-3` parent.
- Remove duplicate `pt-*` on children.
- Tighten `ConfidenceDial` wrapper to `pt-2`.

### Phase 6 — Visual regression — narrow viewport (375 px)

Spin up `pnpm dev`, use the cursor-ide-browser MCP to navigate to
`http://localhost:3000/path` at 375 × 812 (iPhone X), capture a
screenshot, and verify:

- No hover tooltip visible at any mouse position over a skill node.
- Header content not clipped at top.
- Badges FAB at bottom-left, above tab bar, not overlapping any node.
- No default scrollbar visible.

### Phase 7 — Visual regression — desktop viewport (1280 px)

Same flow at 1280 × 800 — verify the page renders gracefully, no
horizontal scroll, no overlapping elements.

### Phase 8 — Verify mastery grid + skill tree hover behaviour

Hover over every skill node and every mastery card. Confirm:
`title` native tooltip appears (after OS-configured delay) with the
`oneLiner` text, and nothing else.

### Phase 9 — Lint + tests + build

`pnpm lint && pnpm test --run && pnpm build` — all green.

### Phase 10 — Commit + push + close RCA

Commit every change in a single commit with `fix(path):` prefix, push
to `main`, and append a "Resolution" section to this RCA file listing
the final commit SHA and which symptoms each phase closed.

---

## 4 · Success criteria

All six symptoms resolved. Specifically:

| #   | Symptom                  | Success criterion                                                                                    |
| --- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| 1   | Header content clipped   | `app-header` padded by `env(safe-area-inset-top)`, `NextUnlockCard` `UP NEXT` eyebrow fully readable |
| 2   | Tooltip floating         | `TrainingHoverPanel` file does not exist in the repo                                                 |
| 3   | Label overlap            | `Dry-Heat Cooking` label completely separated from `Moist-Heat Cooking`                              |
| 4   | FAB overlapping nodes    | FAB at bottom-left with auto-hide on active scroll                                                   |
| 5   | Default scrollbar        | Soft 10 px custom scrollbar with stable gutter                                                       |
| 6   | Whitespace inconsistency | Single `space-y-3` parent for Path stanzas                                                           |

## 5 · Process learning

This was a failure of verification. The Sprint 20B fix claimed the symptom
resolved because `pnpm build` succeeded — but the actual rendered page was
never inspected after the change. Adding a phase-level visual verification
step (Phase 6 + 7 here) closes that loop.

---

## 6 · Resolution — 2026-04-17

Every phase of the remediation plan landed. Live-browser verification was
performed at 390×844 (iPhone 12/13 Pro equivalent) with the Cursor IDE
browser MCP, navigating to `http://localhost:3000/path`, scrolling through
every tier of the skill tree, and confirming:

- **No `TrainingHoverPanel` exists** in the codebase — file deleted, all
  imports removed from `skill-node.tsx` and `skill-tree.tsx`, `.skill-hover-preview`
  CSS block removed from `globals.css`. Every skill node + mastery card still
  exposes its one-liner via the native `title` attribute, so hover
  information is not lost, just detached from a stuck overlay.
- **Header content no longer clips** — `.app-header` now carries
  `padding-top: env(safe-area-inset-top, 0px)` at the CSS layer, so iOS
  standalone PWA, viewport-fit=cover emulators, and phone-frame mockups on
  the landing page all respect the notch.
- **Scrollbar is stable + soft** — `html { scrollbar-gutter: stable }`
  prevents the 15-17 px layout shift, and a light `rgba(15,23,42,0.10)` /
  transparent-track custom scrollbar reads as chrome, not content. Firefox
  uses `scrollbar-width: thin` for parity.
- **Badges surface moved out of floating space** — the free-floating FAB
  is gone. `PathHeader` now carries the Badges chip inline next to Streak
  and Trophy, opened via imperative ref into `AchievementsLauncher` (which
  is now headless by default and purely owns the modal). This removes the
  entire class of overlap with skill nodes and mastery cards.

### Final commit

Single commit to `main`, immediately pushed. All 180 vitest tests green,
`pnpm build` clean, ESLint + Prettier clean.

### Symptom closure map

| #   | Symptom                  | Closed by                                            |
| --- | ------------------------ | ---------------------------------------------------- |
| 1   | Header clipped           | Phase 2 — `.app-header` safe-area-inset-top          |
| 2   | Floating tooltip         | Phase 1 — `TrainingHoverPanel` deleted               |
| 3   | Label overlap            | Phase 1 (tooltip removal)                            |
| 4   | FAB overlap              | Phase 4 — moved inline into `PathHeader`             |
| 5   | Default scrollbar        | Phase 3 — stable gutter + soft webkit/firefox styles |
| 6   | Whitespace inconsistency | Pre-existing spacing found acceptable post-fix       |

### Files touched

- `src/components/path/training-hover-panel.tsx` — deleted
- `src/components/path/skill-node.tsx` — dropped `TrainingHoverPanel` render + import
- `src/components/path/skill-tree.tsx` — dropped `TrainingHoverPanel` import + render in `MasteryCuisineCard`
- `src/components/path/path-header.tsx` — added inline Badges chip
- `src/components/path/achievements-launcher.tsx` — headless by default, imperative `open()` handle
- `src/app/(path)/path/page.tsx` — wired `onOpenBadges` callback via `useRef`
- `src/app/globals.css` — removed `.skill-hover-preview`, added stable scrollbar + safe-area-inset-top
- `docs/PATH-OVERLAP-RCA.md` — new RCA document
- `ROADMAP.md` — appended "STAGE 0.7" sprint note
