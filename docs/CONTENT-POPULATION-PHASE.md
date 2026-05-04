# Content Population Phase — Real Stanford-Sourced Editorial

> **Authored:** 2026-05-01
> **Status:** Active planning. Replaces the `(sample)` placeholder authors / affiliations seeded in Stage 3 with real, attributed Stanford-sourced material.
> **Authority:** The team has explicit Stanford permission to use linked Stanford-domain content (text excerpts, images) within Sous's Content tab.
> **Reads from:** [`STAGE-3-LEAN-CONTENT.md`](./STAGE-3-LEAN-CONTENT.md), [`STAGE-1-2-6MO-TIMELINE.md`](./STAGE-1-2-6MO-TIMELINE.md), [`PARENT-MODE-RESEARCH.md`](./PARENT-MODE-RESEARCH.md) §4 (legal guard).
> **Karpathy guard:** Even with permission, every Stanford quote, photograph, and study summary needs a recorded source URL + attribution string saved alongside the asset. Prefer linking out for long-form; embed only what improves Sous's UX.

---

## 1. The shift

Stage 3 shipped the Content tab with `isPlaceholder: true` items + fictional author names + the `(sample)` affiliation suffix. The Stanford permission lets us **graduate** that content surface from placeholder to real, attributed, clinician-credible — without changing any component shape. Same `Article`, `ResearchBrief`, `ExpertVoice`, `Reel`, `ForumThread` types; new data values + new attribution fields.

Two integrity guarantees the swap MUST preserve:

1. **No medical claims** — every line still has to pass the SAFE/UNSAFE phrasing cheatsheet (PARENT-MODE-RESEARCH §4.4).
2. **Source provenance is mandatory** — every replaced item carries `sourceUrl`, `sourceTitle`, `sourceFetchedAt`, and `permissionEvidence` (the file path inside `docs/` capturing the granted-permission screenshot or email).

---

## 2. Stanford-domain sources to draw from

(Confirmed-permitted at the editorial-team level. List is the candidate pool; each item still goes through the §4 review checklist before it lands.)

- **Stanford Lifestyle Medicine** — `lifestyle.stanford.edu`. Plain-language nutrition + behaviour pieces.
- **Stanford Center for Health Education** — `med.stanford.edu/sche`. Patient-facing explainer videos (use frames as Reels posters; link out for full video).
- **Stanford Prevention Research Center (SPRC)** — `prevention.stanford.edu`. Research summaries.
- **Stanford School of Medicine — Nutrition** — `med.stanford.edu/profiles?...affiliations_administrative=43012`. Faculty profiles (Expert Voices).
- **Stanford Children's Health (Lucile Packard)** — `stanfordchildrens.org`. Pediatric nutrition guidance.
- **The Dish on Science (Stanford School of Medicine)** — `thedishonscience.stanford.edu`. Already cited in PARENT-MODE-RESEARCH §2.1 for capsaicin sensitivity.
- **Stanford Magazine — Food & Health features** — `stanfordmag.org`. Long-form profile pieces.

---

## 3. Asset workflow (per item)

Each piece of content goes through the same 7-step workflow. Owner: editorial lead. Engineering automates step 4–6 with a script.

1. **Pick** — identify the source piece on a Stanford domain. Verify it falls within the granted permission scope.
2. **Excerpt** — pull text we'll quote (≤ 300 words for an Article, ≤ 80 words for a Reel caption, ≤ 200 words for a Research brief takeaway). Longer reads link out.
3. **Save the source PDF/HTML snapshot** to `docs/content-sources/<slug>/page.pdf` so we have a frozen record even if Stanford updates the page.
4. **Save images** — mirror the source images locally to `/public/content/<slug>/<filename>.{jpg|webp}`. **Never hotlink.** Compress to ≤ 300 KB each (mozjpeg, q=82).
5. **Record provenance** — `permissionEvidence: "docs/content-sources/<slug>/permission-2026-XX.png"` pointing to the saved permission screenshot/email.
6. **Run the SAFE-phrasing linter** (W23 deliverable) over the excerpt + any added editorial gloss. Fail = revise.
7. **Replace the seed item** in `src/data/content/{articles,reels,research,experts,forum}.ts` — same id (so bookmarks survive), `isPlaceholder: false`, real `name` / `affiliation` / `coverImageUrl` / `sourceUrl` / `permissionEvidence`.

---

## 4. Schema additions (additive only)

To preserve Stage 3 component shapes, we extend the content types in [`src/types/content.ts`](../src/types/content.ts) with optional fields. Existing placeholder items keep working:

```ts
interface BaseContentItem {
  // ...existing fields
  /** Stanford-domain (or other authorised) origin URL. Required when
   *  isPlaceholder is false. */
  sourceUrl?: string;
  /** Human-readable source title (appears next to the byline). */
  sourceTitle?: string;
  /** ISO timestamp of when we last refreshed the saved snapshot. */
  sourceFetchedAt?: string;
  /** Path inside docs/ proving the team had permission. */
  permissionEvidence?: string;
}
```

Components render a small "Source: Stanford Lifestyle Medicine" line under the byline whenever `sourceTitle` is set; the line links to `sourceUrl` (target=\_blank, rel=noopener noreferrer).

---

## 5. Where it lands in the 6-month timeline

Population is sprinkled across four windows so no single week is overloaded with editorial work.

| Window                                         | Items added                                                                                                             | Notes                                                                                                        |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **W3 — Foundation polish slot**                | 2 articles + 2 reels (Stanford Lifestyle Medicine flagship pieces)                                                      | Smallest first wave — proves the workflow + schema additions before scaling.                                 |
| **W11 — Parent Mode UX polish slot**           | 2 research briefs + 1 expert voice (parent-relevant: pediatric nutrition pieces from Stanford Children's Health / SPRC) | Coincides with the kid-swap chip ship, so parents have at-tab content the moment PM lands.                   |
| **W17 — Production hardening polish slot**     | 4 articles + 4 reels + 2 research briefs (broader nutrition + cooking)                                                  | Larger wave once R2 image hosting is live (W15) so the saved Stanford images serve from CDN.                 |
| **W19 — Phase D content wave (existing slot)** | 4 articles + 2 research briefs + 1 expert voice (closes out the parent-content track + fills general-track gaps)        | The existing Phase D Week 19 slot — extended to absorb the Stanford workstream rather than carrying its own. |
| **W22a — Beta + nav-sweep + Stanford freshen** | refresh `sourceFetchedAt` on every item + re-snapshot any pages Stanford has updated                                    | Last sweep before legal review (W23).                                                                        |

Cumulative target by end of Phase D: **12 articles, 8 reels, 5 research briefs, 4 expert voices** all `isPlaceholder: false` with full source attribution. Anything we can't authentically attribute by W23 stays on the placeholder track and is hidden from production unless explicitly toggled on by a feature flag.

---

## 6. The image-saving script (W3 deliverable)

A small `scripts/content/save-stanford-image.ts` takes a source URL + slug, downloads the image, runs it through `sharp` (resize + mozjpeg q=82), writes to `/public/content/<slug>/<filename>.webp`, and prints the markdown snippet to paste into the data file.

Usage:

```bash
pnpm tsx scripts/content/save-stanford-image.ts \
  --src "https://lifestyle.stanford.edu/path/to/image.jpg" \
  --slug "carbs-are-not-the-enemy" \
  --filename "hero"
```

Produces `/public/content/carbs-are-not-the-enemy/hero.webp` and prints:

```ts
coverImageUrl: "/content/carbs-are-not-the-enemy/hero.webp",
sourceUrl: "https://lifestyle.stanford.edu/path/to/image.jpg",
sourceTitle: "Stanford Lifestyle Medicine",
sourceFetchedAt: "2026-05-18T00:00:00.000Z",
permissionEvidence: "docs/content-sources/carbs-are-not-the-enemy/permission.png",
```

The script lives in `scripts/` (NOT `src/`) so it never ships in the client bundle.

---

## 7. Acceptance criteria (per replaced item)

- [ ] `isPlaceholder: false`
- [ ] All five new attribution fields present and non-empty
- [ ] Local image referenced — no hotlinks
- [ ] Permission-evidence file actually exists at the documented path
- [ ] SAFE-phrasing linter (W23) passes
- [ ] Component renders a visible "Source: Stanford …" line under the byline
- [ ] Bookmark, like, and view-count state from the placeholder version are preserved (same `id`)

---

## 8. What this phase does NOT do

- **Does not commission new Stanford content.** We only mirror existing public-facing pieces.
- **Does not replace `forum.ts`.** Forum threads stay synthesised — they're conversational, not editorial.
- **Does not introduce a CMS.** Real CMS migration is a Stage 3+ workstream; until then, the data files in `src/data/content/` remain the source of truth and a real human pull-request for each replacement.
- **Does not display Stanford branding** as endorsement of Sous. The "Source: Stanford …" attribution is provenance, not a partnership signal.
