# Karpathy Wiki Method — Stefan-Brain Refactor Plan

> **6-Lens RSG critical appraisal + phased refactor plan.**
> Written 2026-07-11. Crux source: Karpathy's LLM-wiki method (gist `442a6bf555914893e9891c11519de94f`).
> Vault ground truth as of this writing: **1,077 wiki pages**, 14-task scheduled fleet (v5),
> index.md frozen at 843/1,019 rows, log.md deprecated, MAP.md body last refreshed 2026-04-14,
> hot.md actively heartbeated, ~10.1 links/page.

---

## 1. Executive Summary

Stefan-Brain is not a broken Karpathy wiki — it is a Karpathy wiki that **out-scaled the manual
parts of the method** and never replaced them with compiled equivalents. The three layers exist.
The three operations are defined. What drifted is everything Karpathy assumed a diligent human-in-the-loop
LLM would keep doing by hand at 50 pages that no one (human or LLM) can keep doing by hand at 1,077:
the catalog, the cross-links, the lint cadence, the filing-back of answers, the pruning.

**The organizing principle of this refactor:**

> **Every invariant of the wiki must be either compiled by a script or enforced by lint. Nothing
> load-bearing may depend on per-session LLM discipline.**

The index.md freeze (2026-07-04) already discovered this principle for one artifact — it diagnosed
that a hand-maintained catalog drifts silently — but it applied the wrong fix (abandon the invariant)
instead of the right one (compile it). This plan generalizes the right fix across the whole system.

### What changes

| Area                  | Change                                                                                                                                                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Catalog**           | Resurrect the index as a **compiled artifact**: `scripts/build-catalog.py` generates `wiki/_meta/catalog.md` from frontmatter nightly (daily-ingest step). Zero hand maintenance, zero drift possible. Root `index.md` stays frozen as history.                                 |
| **Chronological log** | `wiki/_log/` stays canonical. A compiled rolling view (`wiki/_meta/chronicle.md`, last 90 days, one line per entry) restores the "single chronological read" that root log.md provided. Root `log.md` stays frozen.                                                             |
| **Schema**            | CLAUDE.md (~700 lines) splits: a lean **wiki schema** (~250 lines: laws, layout, frontmatter, templates, 3 operations, tagging) stays in CLAUDE.md; the fleet/pipeline/tooling operations manual moves to `wiki/sources/ops/operations-manual.md`, one pointer line remains.    |
| **LINT**              | Becomes 80% deterministic script (`scripts/wiki-lint.py`: broken links, orphans, frontmatter, staleness, stub age, density) + 20% LLM judgment (contradiction spot-check on a rotating domain slice). Runs weekly inside eval-harness; report artifact lands in `wiki/_inbox/`. |
| **INGEST**            | Cross-link step becomes verifiable: lint flags any content page with zero inbound links created in the last 7 days → escalated to morning-brief. Pipelines get one added SKILL.md line each.                                                                                    |
| **QUERY**             | "Optionally save" becomes a default-save rule with concrete trigger criteria. Filed answers become the synthesis layer's raw material.                                                                                                                                          |
| **Compression**       | 8 domain synthesis pages created (the missing compilation layer); ~20 stubs triaged flesh/merge/delete; near-duplicate pages consolidated.                                                                                                                                      |
| **Hygiene**           | Broken links fixed, frontmatter backfilled, stale statuses re-triaged, repo-root junk removed (botched-git-command files `et --hard d5289b4`, `ter --force`, tmp files, loose Untitled canvases).                                                                               |

### What stays (see §6 for the full list)

The scheduled fleet, preflight/postflight runtime, mutex-serialized `wiki/_log/`, hot.md, the
Airtable canonicalization and Collaborator-protection laws, the frozen legacy files, the combined
domain-dir/frontmatter project convention, autonomy tiers, and the raw/ immutability rule. These
are places where Stefan-Brain is **ahead of** vanilla Karpathy, not behind it.

### What the system looks like after

A vault where: any page is findable three ways (grep, compiled catalog, graph); every page has valid
frontmatter and ≥1 inbound link or an explicit exemption; a weekly lint produces a scored health
report that morning-brief surfaces; each major domain has one synthesis page that compresses dozens
of sources into a current, cited picture; and the schema an LLM must load to operate the wiki is
~250 lines instead of ~700. Maintenance cost per week: near zero human time, ~1 scheduled-task
window of LLM time, a few seconds of script time.

---

## 2. Six-Lens Analysis

### 2.1 First-Principles

**Strip to axioms: what is this wiki FOR?**

A wiki exists to make future retrieval cheaper than re-derivation. That is the entire economic
justification for the Karpathy method over RAG. From that, three axioms:

1. **Findability** — a fact that cannot be surfaced at question time has zero value regardless of
   how carefully it was ingested.
2. **Trustworthiness** — a surfaced fact that might be stale or contradicted has _negative_ value,
   because it must be re-verified (which is re-derivation, the thing the wiki was built to avoid).
3. **Compression** — the wiki's value density is (answer quality at question time) ÷ (context tokens
   consumed to assemble it). A synthesis page is a _cached computation_; every question it answers
   without a 15-file grep-and-read tour is pure savings.

**The non-obvious insight: the primary consumer of Stefan-Brain is not Stefan in Obsidian — it is
Claude sessions grepping the filesystem.** Stefan reads MAP.md and hot.md occasionally; Claude reads
the vault dozens of times daily across 14 scheduled tasks and interactive sessions. This inverts
several standard wiki priorities:

- **Grep-ability outranks graph aesthetics.** A page whose title, frontmatter, and first paragraph
  contain the terms a future question will use is worth more than a beautifully interlinked page
  with a clever title. The Airtable-canonical-naming law is actually a findability law in disguise —
  one canonical spelling means one grep hits everything.
- **Link density is not a vanity metric — it is context-assembly cost.** When Claude lands on
  `cgm-trial.md`, the `related:` field and inline wikilinks ARE the retrieval plan for the next
  3 reads. 10.1 links/page average is not "low" in the abstract; it is low _specifically on hub
  pages_, where each missing link means another grep round-trip.
- **Dataview blocks are dead weight for the primary consumer.** MAP.md contains dataview queries
  that render only inside Obsidian; to Claude they are opaque code blocks that answer nothing.
  Anything load-bearing expressed as a dataview query is invisible to 90%+ of the wiki's actual
  read traffic (see Geopolitical lens).

Applying axiom 3 ruthlessly: the vault has 1,077 pages and ~200 of them (sources/) are
per-source records, 237 are people, 225 research. What it does NOT have is the top of the
compression pyramid — pages that answer "what is everything we know about X" in one read. The
sources exist; the compiled layer above them is missing. That is the single highest-value gap in
the whole system, and it is Phase 4.

### 2.2 Historical

**What happens to knowledge systems that grow without pruning?**

Every generation of knowledge system dies the same death: the maintenance cost of its _invariants_
grows linearly with content while the maintenance budget stays flat. Corporate wikis rot when "keep
your team page current" depends on individual discipline. Zettelkasten practitioners abandon their
slip-boxes when linking discipline lapses for a month and the backlog becomes psychologically
unpayable. Wikipedia is the exception that proves the rule — it survived by converting nearly every
invariant into bots + watchlists + lint categories (dead-link bots, orphan categories, citation-needed
tags). Wikipedia is not maintained by discipline; it is maintained by _machinery that makes drift
visible_.

**What the index.md/log.md freeze actually taught us — the non-obvious reading:**

The conventional reading of the 2026-07-04 freeze is "manual catalogs don't scale, so we stopped."
That reading is half right and the half that's wrong matters. The failure sequence was:

1. A useful invariant was declared ("every page appears in index.md").
2. The invariant was assigned to **per-session LLM discipline** (CLAUDE.md said "update index on
   every ingest").
3. Discipline held at small scale, then decayed silently — 834/1,019 coverage with no alarm,
   because nothing _checked_ the invariant. (Same story for log.md: two unserialized writers →
   interleave corruption, discovered late.)
4. The response was to **abandon the invariant** ("completeness lives in search").

Step 4 was the second failure. The invariant was never the problem — a complete content catalog is
genuinely valuable (Karpathy is right that it is), and its loss is felt: MAP.md's body went 89 days
stale, hot.md carries only recency, and there is now no single surface listing what exists. The
problem was step 2. The correct fix was to make the catalog a **build artifact**: generated from
frontmatter by a script, it is _definitionally_ complete every time it runs, and it can never drift
because no one maintains it.

The same historical lesson, stated as the plan's law: **when an invariant fails under manual
maintenance, compile it or lint it — never abandon it, and never re-assign it to discipline with
sterner words in CLAUDE.md.** (The vault already re-learned this once more with log.md: the working
replacement, `wiki/_log/` via postflight + hook, succeeded precisely because it is hook-enforced
and mutex-serialized — machinery, not discipline. That success is the existence proof.)

Secondary lesson from the June 2026 "audit blackout" (a month of missing logs/commits reconstructed
after the fact): staleness is invisible until something forces a look. Lint on a timer is the
forcing function. Karpathy flags drift as the #1 failure mode and lint as non-optional; the vault's
own history independently confirms it.

### 2.3 Contrarian

**Where does the Karpathy method NOT fit Stefan-Brain — and where is Stefan-Brain already better?**

The consensus framing of this task is "Stefan-Brain drifted from Karpathy; restore compliance."
Steelman the opposite: several "drifts" are correct adaptations to a system Karpathy's gist never
contemplated — a 14-task autonomous fleet writing to the vault around the clock.

**Where Stefan-Brain is ahead of vanilla Karpathy:**

1. **Automated multi-source ingestion.** Karpathy's INGEST is a human pasting a source into a chat.
   Stefan-Brain ingests Granola, Omi, Airtable, Gmail, and git _on timers_ with capability guards
   and state tracking. This is the method's logical conclusion, not a deviation.
2. **Hook-enforced logging.** The session-stop hook + postflight mutex is _stronger_ than Karpathy's
   append-only log.md — it survived exactly the concurrency scenario that corrupted the manual file.
3. **External canonical authorities.** Airtable-first naming and Collaborator-table protection give
   the wiki something Karpathy's design lacks entirely: an anti-entropy mechanism for entity
   identity. Phonetic forks (Mehak/Mehek) are a real drift mode Karpathy never addresses.
4. **Autonomy tiers (AUTO/DRAFT/ASK).** Karpathy assumes a single trusted operator. A fleet needs
   graduated permissions; the vault has them.
5. **hot.md.** A freshest-context cache with a heartbeat has no Karpathy equivalent and is arguably
   the most-read page in the vault. Recency-weighted retrieval is a genuine innovation.

**Where Karpathy prescriptions should be deliberately rejected or narrowed:**

1. **"Orphan = defect" is false for system directories.** `_alerts/`, `_inbox/`, `_log/`,
   `_commitments/`, `_dismissed/` are _operational queues and audit trails_, not knowledge. Their
   pages are addressed by pipelines via path + date, never via the graph. Wiring 41 log files and
   13 alert files into the content graph would add thousands of worthless links and poison every
   density metric. **Correct move: an explicit lint exemption list for `_`-prefixed dirs, not
   remediation.** Orphan-lint applies to _content_ dirs only.
2. **"Every page needs 15–20 links" is wrong for leaf records.** A person page for someone met once
   at a hackathon is a perfectly good sparse node — 2 links (event + domain hub) is _correct_. Density
   targets belong on hubs and synthesis pages, where they measure real navigational value. A single
   vault-wide average is the wrong metric; use per-class targets (§7).
3. **Karpathy's compression rule cuts against some existing pages, not for more pages.** "Pages that
   mirror small greppable files are negative value." The vault contains machine-generated page
   families (per-asset Canva pages, some per-grant stubs, dashboard mirrors) whose content is a
   projection of an Airtable/JSON source that Claude can grep directly. The refactor should be
   willing to _delete or collapse_ pages, and Phase 4 includes that — a contrarian act in a culture
   whose instinct is "boil the ocean = add more."
4. **Resurrecting root index.md/log.md literally would be cargo-cult compliance.** The Karpathy gist
   names the files; the _function_ is what matters (current catalog; chronological record). The
   functions get compiled artifacts in `wiki/_meta/`; the frozen roots stay frozen. Honoring the
   letter over the function would re-create the exact failure the freeze responded to.

**The non-obvious insight:** the refactor's biggest risk is not under-correction but
_over-correction toward vanilla Karpathy_ — un-freezing manual files, force-linking system dirs,
and chasing a vault-wide density number would all make the system worse while making the audit
numbers prettier. Compliance targets must be defined per page class, and three of the twelve audit
findings (frozen index/log as stated, system-dir orphans, raw density average) are partially
_misdiagnoses_ that this plan re-scopes rather than "fixes."

### 2.4 Technical

**What does implementation actually require? What are the real constraints?**

**Constraint inventory:**

- **14 scheduled tasks, one shared runtime.** Any change to INGEST behavior must land in each
  pipeline's `SKILL.md` (authoritative copies under `~/.claude/scheduled-tasks/` on Stefan's
  machine, DR mirrors in `scripts/runtime/scheduled-tasks/`). The DR mirrors are editable from this
  repo; the authoritative copies sync from Stefan's side. Changes are therefore **two-step**: edit
  DR + registry here (AUTO), Stefan's machine picks up via the established sync (or one manual copy).
- **Write path is direct file I/O.** obsidian-vault MCP is _not guaranteed in scheduled sandboxes_
  (hot.md states this explicitly) — so every enforcement mechanism must work with plain files +
  scripts. This is good news: scripts are the most portable, testable layer available.
- **Python exists in the toolchain** (`add_frontmatter.py`, `rebuild_index.py`, `stranded-projects.py`
  already in repo root / scripts/). New lint/catalog scripts follow the same pattern. They must run
  on Windows (Stefan's machine) and Linux (Cowork sandboxes): pure-stdlib Python, forward-slash
  paths via `pathlib`, UTF-8 explicit.
- **Mutex discipline.** Anything that writes during a scheduled window must go through postflight's
  commit path or tolerate concurrent writers. Compiled artifacts (`catalog.md`, `chronicle.md`)
  are regenerated whole-file by one owner task (daily-ingest), which sidesteps interleaving.
- **Obsidian compatibility.** Wikilinks resolve by filename irrespective of path — so _filename
  uniqueness across the vault_ is a hard constraint the link-fixer must respect (two `index.md`-style
  collisions would break resolution). Frontmatter must stay YAML-parseable or Obsidian's metadata
  cache degrades silently.
- **Scale is trivial for scripts.** 1,077 markdown files ≈ a few MB. A full-vault link graph builds
  in <1s. There is no performance excuse for not linting on every run.

**The non-obvious insight: ~80% of Karpathy LINT is deterministic and should never touch an LLM.**
Broken links, orphans, frontmatter validity, staleness ages, stub ages, density stats, filename
collisions, tag-rule violations — all are exact computations. The current design (eval-harness does
"vault health" as LLM judgment) spends the expensive, variable-quality resource on work a 300-line
script does perfectly and for free. Inverting this — script computes, LLM only adjudicates
contradictions and proposes fixes on the script's findings — makes weekly lint effectively free,
which is the precondition for Karpathy's "run it on a timer, it is not optional" actually sticking.
The same inversion powers INGEST enforcement: the pipeline doesn't need to _promise_ cross-links;
the lint script _detects_ recent pages with zero inbound links, and the promise becomes checkable.

**Implementation kernel (everything else in §5 hangs off these):**

```
scripts/wiki_graph.py      # shared: parse vault → {page → frontmatter, outlinks, inlinks}
scripts/wiki-lint.py       # checks L1–L8 (§5, Phase 3) → wiki/_inbox/lint-YYYY-MM-DD.md + exit code
scripts/build-catalog.py   # frontmatter → wiki/_meta/catalog.md (grouped by type/domain, one line/page)
scripts/build-chronicle.py # wiki/_log/*.md → wiki/_meta/chronicle.md (rolling 90-day view)
```

All four are pure-read except their single output file; all are idempotent; all runnable standalone
or from a scheduled task. Estimated total: ~600 lines of Python. This is the whole technical core —
the rest of the refactor is content work (link fixes, synthesis pages) and schema editing.

### 2.5 Economic

**ROI of each refactor; maintenance cost of current vs. refactored system.**

**Current-state carrying costs (what drift costs today):**

- Every broken wikilink is a failed retrieval → a grep fallback → extra tokens + latency, dozens of
  times per week across the fleet. ~20 broken links on _core_ concepts ([[nourish]], [[Omi]]) sit on
  the highest-traffic paths.
- No catalog means broad questions ("what do we have on X?") cost a multi-round grep tour every
  time — re-derivation, the exact cost the wiki exists to eliminate.
- Stale `active` pages carry axiom-2 negative value: each read of an 87-day-stale "active" concept
  either propagates stale facts or triggers re-verification.
- Un-filed QUERY answers are the largest silent loss: every substantial synthesis Claude performs
  and discards is a cached computation thrown away, then re-purchased at full price next time. At
  fleet scale this is the difference between linear and compounding returns — literally the thesis
  of the whole system.

**ROI ranking (value ÷ effort):**

| Rank | Refactor                               | Effort                       | Return profile                                                                                                                              |
| ---- | -------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Lint script + weekly wiring            | ~1 session                   | _Perpetual_ drift detection; makes every other invariant enforceable. Buy this first — it is the machine that protects all other purchases. |
| 2    | Broken-link fix + frontmatter backfill | ~1 session (script-assisted) | Immediate retrieval-quality gain on hot paths; one-time cost, permanent (lint prevents recurrence).                                         |
| 3    | Compiled catalog + chronicle           | ~1 session                   | Restores O(1) "what exists" answers at zero recurring cost. Replaces an O(n)-discipline invariant with O(0).                                |
| 4    | Domain synthesis pages (8)             | ~2–3 sessions                | Highest per-read savings in the vault; each page converts a 10–15-file assembly into 1 read. Compounds as QUERY filings extend them.        |
| 5    | QUERY default-save rule                | ~0.5 session                 | Converts already-paid-for computation into assets. Near-zero marginal cost, pure compounding.                                               |
| 6    | CLAUDE.md split                        | ~0.5 session                 | Saves ~450 lines × every session's context load, forever; reduces instruction-dilution risk in every future prompt.                         |
| 7    | Stub/duplicate triage                  | ~1–2 sessions                | Moderate; mostly axiom-2 (trust) and axiom-3 (compression) hygiene.                                                                         |
| 8    | Stale-status re-triage                 | ~0.5 session                 | Cheap; converts false "active" signals into honest archived/complete states.                                                                |

**The non-obvious insight: the QUERY→file-back rule is the only item on this list that changes the
system's _growth function_ rather than its current level.** Everything else pays down debt or cuts
carrying cost — worthwhile, bounded wins. Filing answers back makes the wiki's quality a function of
its _usage_: every question asked makes the next question cheaper. Karpathy's "explorations compound"
line is the economic heart of the method, and it is the single prescription Stefan-Brain most
completely ignores today ("optionally save" ≈ never). If only one behavioral change survives this
refactor, it should be that one.

Also worth stating as economics: the _maintenance_ cost of the refactored system is designed to be
~zero human time. Scripts regenerate artifacts; lint reports flow into an inbox morning-brief already
reads; the only recurring human touch is Stefan occasionally adjudicating a contradiction flag or a
proposed page deletion (Tier-3 items). A refactor that added recurring human chores would fail
within a month — the vault's own history proves it.

### 2.6 Geopolitical

**External forces: Obsidian ecosystem, Claude Code evolution, MCP landscape, community practice.**

- **Obsidian dependency should be treated as a rendering layer, not a storage or logic layer.**
  The vault's durable substrate is plain Markdown + YAML + wikilinks — portable to any future tool.
  But Dataview blocks (used in MAP.md and grant indexes) and `.base`/`.canvas` files are
  Obsidian-plugin-specific: invisible to Claude, unreadable outside Obsidian, and Dataview itself is
  a community plugin whose long-term maintenance isn't guaranteed (Obsidian's native "Bases" feature
  is explicitly positioned to succeed it). **Rule going forward: anything load-bearing must exist as
  literal Markdown; dataview may _duplicate_ it for Stefan's in-app convenience, never _replace_ it.**
  The compiled catalog satisfies this for navigation.
- **Claude Code is evolving toward exactly this plan's architecture.** Skills, hooks, scheduled
  tasks, and memory tooling all reward vaults whose invariants live in scripts and hooks rather than
  prose instructions. The session-stop hook already demonstrated the pattern. Betting on
  "machinery over CLAUDE.md exhortation" aligns the vault with where the platform is going — and
  shrinking CLAUDE.md matters more as context competition from skills/tool-schemas grows.
- **MCP landscape: treat every MCP as an optional enhancer, never a dependency.** The obsidian-vault
  MCP is already correctly demoted to "optional read enhancer" because it isn't guaranteed in
  scheduled sandboxes. The same posture should be explicit for any future semantic-search revival
  (QMD's retirement is the cautionary tale: a search layer that leaves the stack must not take
  findability with it — which is exactly why grep-ability and the compiled catalog are the
  resilience layer).
- **Community practice is converging on "agentic search over indexes"** — the argument that
  Claude's own multi-step grep makes catalogs obsolete. Half-true, and worth taking seriously as
  the strongest external challenge to Phase 2: agentic search _does_ devalue exhaustive row-per-page
  indexes for known-item lookup. But it does not devalue (a) _awareness_ surfaces — you cannot grep
  for what you don't know exists — or (b) _synthesis_ pages, which no search over fragments can
  replace. The plan's response is proportionate: the catalog is a zero-cost build artifact (so its
  devaluation risk costs nothing), while the synthesis layer — which search cannot commoditize —
  gets the real investment.

**The non-obvious insight: portability is the vault's actual moat.** Stefan's stack has already
churned twice (QMD removed, 27→14 task fleet rebuild). Tools around the vault will keep churning;
the vault outlives them only if every load-bearing structure is dumb Markdown that any future
agent can parse with 20 lines of code. Every refactor decision in this plan was checked against
"does this survive Obsidian disappearing? Claude Code changing? every MCP being unavailable?" —
compiled-markdown artifacts, stdlib scripts, and hook-enforced logs all pass; dataview-based
navigation and MCP-dependent enforcement all fail. That test should be adopted permanently.

---

## 3. Gap Analysis

Karpathy prescription → current state → delta → disposition. (Dispositions: **ADOPT** = implement as
prescribed; **ADAPT** = implement the function, different mechanism; **REJECT** = deliberate
non-compliance, reasoned in §2.3.)

| #   | Karpathy prescription                                                            | Stefan-Brain current                                                                                | Delta                                                                | Disposition                                                                                                             |
| --- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | index.md: content catalog updated on every ingest                                | Frozen 2026-07-04 at 843/1,019 rows; MAP.md body 89d stale; no complete catalog anywhere            | No current awareness surface                                         | **ADAPT** — compiled `wiki/_meta/catalog.md`, regenerated nightly by daily-ingest; root index.md stays frozen (Phase 2) |
| 2   | log.md: chronological append-only record                                         | Frozen (interleave corruption); `wiki/_log/` daily files are canonical, hook-enforced               | Function exists but fragmented across 41+ files; 13 lack frontmatter | **ADAPT** — keep `wiki/_log/` canonical; compiled `chronicle.md` rolling view; frontmatter backfill (Phases 1–2)        |
| 3   | INGEST touches 10–15 pages per source, cross-references everything               | Pipelines create pages; ≥1-inbound-link rule defined but unenforced; orphaned content pages exist   | Promise without verification                                         | **ADOPT** — lint detects recent zero-inlink content pages; escalation to morning-brief (Phase 3)                        |
| 4   | QUERY files good answers back as pages                                           | §7 says "optionally save"; rarely happens                                                           | The compounding loop is severed                                      | **ADOPT** — default-save rule with trigger criteria (Phase 3)                                                           |
| 5   | LINT on a timer: contradictions, staleness, orphans, missing pages, broken links | eval-harness does fleet audit + coarse vault health; no link/orphan/contradiction machinery         | Lint is defined (§8) but not mechanized                              | **ADOPT** — `wiki-lint.py` weekly inside eval-harness + LLM contradiction slice (Phase 3)                               |
| 6   | Zero broken links                                                                | 20+ broken, incl. [[nourish]], [[Omi]], [[CLOVE]] on hot paths                                      | Direct retrieval failures                                            | **ADOPT** — fix + lint-prevent (Phase 1)                                                                                |
| 7   | No orphans                                                                       | System dirs fully orphaned; some content pages orphaned                                             | Mixed: content orphans are defects; system-dir orphans are correct   | **ADAPT** — fix content orphans; explicit lint exemption for `_` dirs (Phases 1, 3)                                     |
| 8   | Prune/update stale pages                                                         | 20+ pages `active` at 87+ days untouched; 20+ stubs >30d                                            | Honest-status violation (axiom 2)                                    | **ADOPT** — re-triage statuses; stub flesh/merge/delete (Phases 1, 4)                                                   |
| 9   | Compression: 100 docs → ~dozen pages; anti-mirror rule                           | 1,077 pages, no synthesis layer; some page families mirror greppable sources                        | Pyramid has a base and no apex                                       | **ADOPT** — 8 domain synthesis pages; consolidate mirror-pages (Phase 4)                                                |
| 10  | Schema = lean structural contract                                                | CLAUDE.md ~700 lines, ⅔ operations manual                                                           | Schema diluted; expensive to load                                    | **ADAPT** — split; laws stay, ops manual moves to wiki (Phase 2)                                                        |
| 11  | Connections grow quadratically; AI maintains them                                | 10.1 links/page flat average; hubs under-linked                                                     | Wrong metric, real gap                                               | **ADAPT** — per-class density targets; hub enrichment via synthesis pages (Phases 3–4)                                  |
| 12  | Uniform page hygiene (frontmatter, naming)                                       | 13+ pages missing frontmatter; repo-root junk files (`et --hard d5289b4`, `ter --force`, tmp files) | Hygiene debt                                                         | **ADOPT** — backfill + cleanup + lint-prevent (Phase 1)                                                                 |

---

## 4. Refactor Plan (Phased)

Conventions: every phase ends with lint green (or documented exceptions), a `wiki/_log/` entry, and
a commit to master. Effort units are focused work sessions. Phases 1→2→3 are strictly ordered
(lint machinery from P3's script is actually built in P1 because P1 needs it to find its own work —
see P1.0); Phase 4 can interleave after Phase 2.

### Phase 1 — Foundation Repairs _(effort: 2–3 sessions · dependency: none)_

**P1.0 — Build the graph kernel first.** Write `scripts/wiki_graph.py` + first-cut
`scripts/wiki-lint.py` (checks L1–L4 below). _Rationale: the repair list ("20+ broken links") comes
from a point-in-time audit; the script makes the list exact, current, and re-checkable, and every
later phase reuses it._

**P1.1 — Broken links.** Run link check. For each broken `[[target]]`: (a) case/alias variant of an
existing page → correct the link or add `aliases:` frontmatter; (b) genuinely missing core concept
([[nourish]] must resolve — likely a path/name mismatch with the project page; [[Omi]], [[CLOVE]],
[[pharmacogenomics]], [[RMC-Dining]]) → create a real page _only if_ content exists to fill it,
else redirect-stub with `type: redirect` pointing at the nearest real page; (c) dead reference →
unlink with a note. **Acceptance: `wiki-lint.py` reports 0 broken links in content dirs.**

**P1.2 — Frontmatter backfill.** Script-assisted: add minimal valid frontmatter (title/type/
tags/created/updated/status) to the 13 log files and any `_alerts`/`_inbox` pages lacking it.
Machine dirs get `type: log|register` and `source/` tag per the tagging system. **Acceptance:
100% frontmatter parse rate vault-wide.**

**P1.3 — Orphan triage (content dirs only).** For each orphaned page in people/concepts/research/
entrepreneurship/nourish/education/sources/events/decisions/questions/tinker: add an inbound link
from its natural hub (domain MOC, project page, or the new catalog once built), or mark
`status: archived` if it is dead weight. System dirs (`_*`) recorded in the lint exemption list —
**not** linked. **Acceptance: content-dir orphan count < 2% and every remaining orphan carries an
explicit `lint-exempt: orphan` frontmatter key or archived status.**

**P1.4 — Stale-status re-triage.** For the 20+ `active` pages ≥87d untouched: re-read each; mark
`complete`/`archived` where the work genuinely ended (most of the April food-concept cohort);
refresh `updated:` + content where still live; leave truly-active-but-slow items with a
`review-by:` frontmatter date. _This is honesty repair, not content writing — fleshing out happens
in Phase 4._ **Acceptance: 0 pages both `status: active` and >90d stale without a `review-by` date.**

**P1.5 — Repo-root hygiene.** Delete the botched-git-command artifact files (`et --hard d5289b4`,
`ter --force`), `log-append-2026-04-24.tmp`; move loose root scripts (`add_frontmatter.py`,
`fix_wikilinks*.py`, `rebuild_index.py`) into `scripts/`; move stray root notes (`2026-04-15.md`,
`Memory.md`, `TASKS.md` if orphaned) to their proper wiki homes or archive. Untitled `.base`/
`.canvas` files: queue to `wiki/_unresolved/` for Stefan (may be his in-progress Obsidian work —
do not delete unilaterally). **Acceptance: repo root contains only CLAUDE.md, docs/, frozen
index.md/log.md, raw/, scripts/, research-skill-graph/, wiki/, and intentional dotfiles.**

### Phase 2 — Schema Refactor _(effort: 1–2 sessions · depends: P1.0)_

**P2.1 — Compiled catalog.** `scripts/build-catalog.py` → `wiki/_meta/catalog.md`: one line per
page (`[[name]] — first-sentence/desc — type — updated`), grouped by type then domain tag, with a
generated-timestamp header and a "DO NOT HAND-EDIT — regenerated nightly" banner. Wire as a step in
daily-ingest's SKILL.md (DR copy + registry row updated here; one-line change). **Acceptance:
catalog exists, covers 100% of wiki pages, regenerates idempotently; daily-ingest DR SKILL.md
contains the step.**

**P2.2 — Compiled chronicle.** `scripts/build-chronicle.py` → `wiki/_meta/chronicle.md`: rolling
90-day, one line per `wiki/_log/` entry (`date · HH:MM · channel · title · outcome`). Same
daily-ingest wiring. **Acceptance: chronicle renders every log entry from the window; older history
remains in `wiki/_log/` untouched.**

**P2.3 — CLAUDE.md split.** Target ≤300 lines for CLAUDE.md containing: the bulletproof laws
(unchanged — they are Stefan's, not this plan's, to edit), three-layer architecture, directory
conventions, frontmatter spec, page templates (compressed), INGEST/QUERY/LINT operation specs
(amended per Phase 3), tagging system, rules-for-the-LLM. Everything operational — fleet tables,
pipeline architecture, tool-integration notes, skills list, Stefan-context tables — moves to
`wiki/sources/ops/operations-manual.md` (which becomes the hub the registry already partially is),
with one pointer line in CLAUDE.md: _"Fleet, pipelines, and tooling: see
`wiki/_meta/scheduled-tasks-registry.md` (operational truth) and [[operations-manual]]."_
Nothing is deleted — only relocated to where it is loaded on demand instead of every session.
**Acceptance: CLAUDE.md ≤300 lines; a grep for any moved fact finds it in the ops manual; all 8
bulletproof sections byte-preserved.**

**P2.4 — MAP.md slim-down.** MAP body (currently a 600+-line grant-card dump, stale since April)
is refactored: MAP becomes a ~100-line pure navigation surface (domains → hub pages → synthesis
pages → catalog/chronicle/hot links); the 25-item NOURISH grant-card content moves to
`wiki/nourish/nourish-product-menu.md` where it is domain content, linked from MAP. Load-bearing
dataview blocks get literal-Markdown equivalents beside them (per §2.6 rule). **Acceptance: MAP
≤150 lines, every link resolves, refresh date current; grant cards intact at their new home.**

### Phase 3 — Operation Hardening _(effort: 1–2 sessions · depends: P2)_

**P3.1 — Full lint script.** Extend `wiki-lint.py` to the complete check set:

| ID  | Check                                                                                 | Mechanism           |
| --- | ------------------------------------------------------------------------------------- | ------------------- | --------------------------- | ----- |
| L1  | Broken wikilinks                                                                      | graph kernel, exact |
| L2  | Content-dir orphans (exemption-list aware)                                            | graph kernel, exact |
| L3  | Frontmatter validity + required tags (domain/, exactly one source/)                   | YAML parse, exact   |
| L4  | Filename collisions (Obsidian resolution hazard)                                      | exact               |
| L5  | Stale actives (>90d, no review-by) + stub age (>30d)                                  | exact               |
| L6  | Hub density: pages tagged `type: project                                              | index               | reference` with <8 outlinks | exact |
| L7  | Recent-page inlink check: pages created ≤7d with 0 inbound links (INGEST enforcement) | exact               |
| L8  | Catalog/chronicle freshness (>48h → the compile step is broken)                       | exact               |

Output: `wiki/_inbox/lint-YYYY-MM-DD.md` (scored report, per-check counts, file lists) + nonzero
exit on regressions vs. the previous report. **Acceptance: script runs clean on the post-P1 vault;
seeded synthetic defects (one per check) are all caught in a test run.**

**P3.2 — LINT scheduling.** eval-harness (Mon 7am) SKILL.md (DR copy) gains: (1) run
`wiki-lint.py`; (2) LLM pass on the report — propose fixes for mechanical findings (Tier 1 AUTO,
cap 25/run, mirroring entity-reconcile's pattern), queue judgment calls to `wiki/_unresolved/`;
(3) **contradiction spot-check**: each week pick the next domain in a rotation
(nourish → sous → research → people → …), read its hub + synthesis page + 10 most-recently-updated
pages, flag factual conflicts to the report. Morning-brief already sweeps `_inbox/` — lint findings
surface to Stefan automatically with zero new plumbing. CLAUDE.md §8 rewritten to describe this
mechanized reality. **Acceptance: registry row updated; DR SKILL.md updated; one full dry-run
executed from this repo producing a real report.**

**P3.3 — INGEST cross-link enforcement.** CLAUDE.md §6 step 7 gains teeth via L7 (detection) plus
a one-line addition to each ingesting pipeline's DR SKILL.md: _"Before finishing: every page you
created this run must have ≥1 inbound wikilink from a hub; verify, don't assume."_ Enforcement is
the lint, not the sentence — the sentence just moves compliance earlier. **Acceptance: L7 present
in lint; line present in daily-ingest, omi-commitment-capture, grant-discovery-scan,
optimus-weekly-run DR SKILL.mds.**

**P3.4 — QUERY files back by default.** CLAUDE.md §7 step 4 rewritten from "optionally save" to:

> **4. File the answer (default yes).** If the synthesis (a) required reading ≥3 pages or any
> external source, AND (b) answers a question likely to recur or updates a standing picture —
> file it: extend the relevant synthesis/concept page, or create one (with the standard
> cross-links + log entry). Skip filing only for trivial lookups, and note the skip in the
> session log. An unfiled synthesis is a cache miss you chose.

**Acceptance: CLAUDE.md text landed; first two filed-back answers visible in `wiki/_log/` within
two weeks of adoption (tracked as a success metric, §7).**

### Phase 4 — Compression & Synthesis _(effort: 2–3 sessions · depends: P2, interleaves with P3)_

**P4.1 — Domain synthesis pages (the apex layer).** Create 8 pages, `type: research` or
`type: reference`, each following a fixed shape (current picture → key numbers with as-of dates →
open questions → full source-link fan-out), each written by reading the domain's existing pages
(no new research required — this is compilation):

1. `wiki/nourish/cgm-trial-synthesis.md` — everything known: protocol, funding, recruitment state, data promises, downstream consumers (NORA/Sous/Hub M11).
2. `wiki/entrepreneurship/sous/sous-synthesis.md` — product state, moats, stage-3 decisions, metrics, open questions (compresses sous + strategy + backlog + decision pages).
3. `wiki/nourish/nourish-grant-strategy-synthesis.md` — pipeline state, top-scored opportunities, deadline horizon, asset-to-grant map (compresses registry + 12 application pages + MAP cards).
4. `wiki/nourish/nourish-synthesis.md` — org-wide: 5 workstreams, funding, partnerships, people.
5. `wiki/research/research-portfolio-synthesis.md` — Stefan's personal research portfolio (explicitly distinct from NOURISH per the standing rule).
6. `wiki/sources/ops/pipeline-synthesis.md` — the fleet's current architecture + failure history + design laws (compresses the pipeline-appraisal series).
7. `wiki/concepts/operating-principles-synthesis.md` — the PG/Thiel/simplicity principle cluster and how they bind decisions (compresses ~10 concept pages).
8. `wiki/education/stanford-synthesis.md` — Stanford commitments, courses, fellowship state.

Each gets linked from MAP, its domain hub, and the catalog picks it up automatically.
**Acceptance: 8 pages exist, each ≥15 outlinks, each carries `synthesis: true` frontmatter (so
lint L6 can hold them to hub density), each cited-and-dated.**

**P4.2 — Stub triage.** For each of the 20+ stubs: **flesh** (real content exists in sources —
write it), **merge** (content belongs inside an existing page — fold in, convert stub to
`type: redirect`), or **delete-queue** (no content, no links, no recurrence likelihood → list in
`wiki/_unresolved/stub-deletions-YYYY-MM-DD.md` for Stefan's one-pass approval — deletion of
possibly-Stefan-authored pages is Tier 3). **Acceptance: 0 pages with `status: stub` older than
30 days that aren't in the deletion queue.**

**P4.3 — Mirror-page consolidation.** Audit machine-generated page families against the anti-mirror
rule: per-asset Canva pages vs. `canva-asset-index`, dashboard week mirrors, any per-grant stub
whose content is a registry row. Where a family is a pure projection of one greppable source,
collapse to the index page + source pointer. Anything Airtable-derived: read-only analysis, no
Airtable writes (Collaborator law untouched). **Acceptance: documented keep/collapse decision per
family in the plan's decision log; collapsed families leave redirects.**

**P4.4 — Hub enrichment.** Using L6 output, bring under-linked hubs (project pages, MOC-\*.md,
domain indexes) to ≥8 meaningful outlinks each, largely by linking the new synthesis pages and
recent decision/question pages. **Acceptance: L6 clean.**

---

## 5. What NOT to Change

Explicit preservation list — these are working, several are ahead of vanilla Karpathy (§2.3), and
touching them would violate Surgical Changes:

1. **The 8 bulletproof laws in CLAUDE.md** — byte-preserved through the P2.3 split. They are
   Stefan's directives, not schema.
2. **`wiki/_log/` + postflight + session-stop hook** — the one invariant already correctly
   mechanized. The chronicle is a _view_ over it, never a second write path.
3. **The frozen root `index.md` and `log.md`** — stay frozen, stay in place, keep their warning
   banners. They are history and a monument to the lesson in §2.2.
4. **The 14-task fleet, preflight v2.3 / postflight v2.2, autonomy tiers, state tracking** —
   refactor adds steps _inside_ existing tasks; no new tasks, no cadence changes, no runtime edits.
5. **Airtable-first naming + Collaborator Table Protection** — untouched; the link-fixer and
   consolidation passes must route any name questions through `wiki/_unresolved/` as today.
6. **`raw/` immutability** — no cleanup pass inside raw/, ever.
7. **hot.md** and its heartbeat mechanism — complementary to the catalog (recency vs. coverage).
8. **Projects-live-in-domain-dirs convention** — do NOT create `wiki/projects/`; frontmatter
   `type: project` remains how projects are found. (entity-reconcile already chased "wiki/projects
   ghosts" once; don't reintroduce them.)
9. **System dirs' orphan status** — `_alerts/`, `_inbox/`, `_commitments/`, `_dismissed/`,
   `_decisions/`, `_log/` remain outside the content graph by design (lint exemption, §2.3).
10. **Multi-dimensional tagging system** — unchanged; lint L3 now enforces it, which is the only
    change (verification, not redefinition).
11. **The registry as operational source of truth** (`wiki/_meta/scheduled-tasks-registry.md`) —
    P2.3 moves CLAUDE.md's fleet _summary_ out; the registry's role only strengthens.
12. **The 6-lens RSG, knowledge-graph-logger, and commit-to-master protocols** — process laws,
    out of scope.

---

## 6. Implementation Sequencing (AUTO-BUILD vs FOUNDER-GATED, per Sous rule 12)

**Founder-gated dependencies, surfaced up front:** almost none — this refactor was deliberately
scoped to the repo + stdlib. The three genuine gates: (G1) authoritative SKILL.md copies live on
Stefan's machine under `~/.claude/scheduled-tasks/` — DR edits here need one sync/copy on his side
to go live; (G2) deletions of possibly-Stefan-authored pages (stub deletion queue, Untitled
canvas/base files) need his one-pass approval (Tier 3); (G3) contradiction adjudications where two
pages disagree and only Stefan knows the truth. Everything else ships autonomously.

| Step                         | Class                                                     | Notes                                                                                                                                                                                           |
| ---------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1.0–P1.4 scripts + repairs  | **AUTO-BUILD**                                            | Repo + Python stdlib only                                                                                                                                                                       |
| P1.5 root hygiene            | **AUTO-BUILD** except canvas/base files → queue (G2)      |                                                                                                                                                                                                 |
| P2.1–P2.2 compiled artifacts | **AUTO-BUILD**; scripts runnable standalone immediately   | Scheduled wiring: DR SKILL.md edit AUTO, live activation gated on G1 sync — until then, any session/eval-harness run can invoke the scripts directly, so the artifacts stay fresh even pre-sync |
| P2.3–P2.4 schema + MAP       | **AUTO-BUILD**                                            | Pure repo edits                                                                                                                                                                                 |
| P3.1 lint script             | **AUTO-BUILD**                                            |                                                                                                                                                                                                 |
| P3.2 lint scheduling         | DR edit **AUTO-BUILD**; activation G1                     | Dry-run from repo proves it before sync                                                                                                                                                         |
| P3.3–P3.4 operation text     | **AUTO-BUILD** (+ G1 for pipeline copies)                 |                                                                                                                                                                                                 |
| P4.1 synthesis pages         | **AUTO-BUILD**                                            | Compilation of existing vault content                                                                                                                                                           |
| P4.2 stub triage             | Flesh/merge **AUTO-BUILD**; deletions G2                  | Queue format ready for one-pass approval                                                                                                                                                        |
| P4.3 consolidation           | Analysis + collapse **AUTO-BUILD**; ambiguous families G2 |                                                                                                                                                                                                 |
| P4.4 hub enrichment          | **AUTO-BUILD**                                            |                                                                                                                                                                                                 |

**Recommended execution order:** P1.0 → P1.1–P1.5 → P2.1–P2.4 → P3.1–P3.4 → P4.1 → P4.2–P4.4,
with G1 sync requested once, after P3.2's dry-run passes (one founder touch activates all
scheduled wiring simultaneously). Total autonomous effort: ~7–10 sessions. Nothing blocks on
external accounts, services, or users.

---

## 7. Success Metrics

Measured by `wiki-lint.py` (all deterministic except M9–M10); baseline = first post-P1.0 report;
targets at phase completion and held thereafter (lint regression = nonzero exit = eval-harness
escalation to morning-brief).

| #   | Metric                                      | Baseline (audit)                            | Target                                                                            |
| --- | ------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------- |
| M1  | Broken wikilinks (content dirs)             | 20+                                         | **0**                                                                             |
| M2  | Frontmatter parse + required-tag pass rate  | ~98.8% parse; tags unmeasured               | **100% / 100%**                                                                   |
| M3  | Content-dir orphans (exemption-aware)       | unmeasured (system dirs polluted the count) | **<2%**, all exempt-tagged                                                        |
| M4  | Pages `active` >90d stale without review-by | 20+                                         | **0**                                                                             |
| M5  | Stubs >30d not in deletion queue            | 20+                                         | **0**                                                                             |
| M6  | Catalog + chronicle freshness               | n/a (don't exist)                           | **<48h**, always                                                                  |
| M7  | Hub/synthesis pages <8 outlinks (L6)        | unmeasured                                  | **0**                                                                             |
| M8  | CLAUDE.md length                            | ~700 lines                                  | **≤300 lines**, laws byte-identical                                               |
| M9  | QUERY filings (from `wiki/_log/` entries)   | ~0/week                                     | **≥2/week** rolling 4-week average                                                |
| M10 | Contradiction flags adjudicated within 14d  | n/a                                         | **100%** (queue never ages out)                                                   |
| M11 | Synthesis pages live                        | 0                                           | **8**, each <30d stale or carrying review-by                                      |
| M12 | New-page inlink compliance (L7, weekly)     | unenforced                                  | **0 violations** persisting >7d                                                   |
| M13 | Lint cadence                                | ad-hoc                                      | **weekly, zero missed runs** (eval-harness audit already tracks run completeness) |

**The single headline metric is M9.** M1–M8 and M11–M13 restore the wiki to spec; M9 is the one
that proves the _compounding loop_ is closed — the wiki getting smarter because it is being used.
If M9 holds for a quarter, the refactor worked in the sense Karpathy meant; if every other metric
is green and M9 is zero, we built a clean library nobody deposits into, and the appraisal should
be re-run.

---

## Appendix A — Decision Log

| Date       | Decision                                                                       | Rationale                                                                                         |
| ---------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| 2026-07-11 | Do not un-freeze root index.md/log.md; compile replacements in `wiki/_meta/`   | §2.2 — the invariant was right, hand-maintenance was the failure; compiled artifacts cannot drift |
| 2026-07-11 | System dirs stay orphaned; lint exemption instead of remediation               | §2.3 — operational queues are not knowledge; forced links are noise                               |
| 2026-07-11 | Lint = deterministic script + narrow LLM slice, inside eval-harness            | §2.4 — 80% of lint is exact computation; LLM budget reserved for contradiction judgment           |
| 2026-07-11 | QUERY "optionally save" → default-save with criteria                           | §2.5 — the only change that alters the growth function, not just the level                        |
| 2026-07-11 | Load-bearing navigation must be literal Markdown; dataview is duplication-only | §2.6 — Claude (the primary consumer) and portability both require it                              |
| 2026-07-11 | Per-class link-density targets, not vault-wide average                         | §2.3 — sparse leaf nodes are correct; density is a hub metric                                     |
| 2026-07-11 | No new scheduled tasks; all wiring lands inside existing task steps            | §5.4 — fleet just stabilized (v5); cadence surface area stays fixed                               |

## Appendix B — File Manifest (what this plan creates/edits when executed)

**New:** `scripts/wiki_graph.py`, `scripts/wiki-lint.py`, `scripts/build-catalog.py`,
`scripts/build-chronicle.py`, `wiki/_meta/catalog.md` (generated), `wiki/_meta/chronicle.md`
(generated), `wiki/_meta/lint-exemptions.md`, `wiki/sources/ops/operations-manual.md`,
`wiki/nourish/nourish-product-menu.md` (content relocated from MAP), 8 synthesis pages (§P4.1),
`wiki/_unresolved/stub-deletions-*.md` (queue).

**Edited:** `CLAUDE.md` (split per P2.3; §6 step 7, §7 step 4, §8 rewritten), `wiki/MAP.md`
(slim per P2.4), `scripts/runtime/scheduled-tasks/{daily-ingest,eval-harness,omi-commitment-capture,grant-discovery-scan,optimus-weekly-run}/SKILL.md`
(DR copies), `wiki/_meta/scheduled-tasks-registry.md` (step additions noted), ~20 pages (link
fixes), ~35 pages (frontmatter/status), repo root (hygiene).

**Never touched:** `raw/`, frozen `index.md`/`log.md` (banners intact), Airtable, the 8 bulletproof
law texts, preflight/postflight scripts.
