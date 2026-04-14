# PhD Research AI System — Complete Setup Guide

> This guide gives you a PhD-grade research system using Claude Code + Obsidian + semantic search. It's built on Andrej Karpathy's wiki-brain pattern, a 6-lens research methodology, and compounding knowledge architecture. Copy this entire file into Claude and it becomes your research assistant's operating manual.

---

## What This System Does

Instead of 50 open tabs and scattered notes, this system:

1. **Builds a persistent wiki** that grows smarter with every paper, meeting, and idea you feed it
2. **Forces 6-lens analysis** on every research question (technical, economic, historical, geopolitical, contrarian, first-principles)
3. **Semantically searches** your entire knowledge base (papers, notes, concepts) by meaning, not just keywords
4. **Tracks your research** with structured source evaluation, contradiction documentation, and synthesis protocols
5. **Compounds over time** — your 10th research question starts with everything you learned from the first 9

---

## Step 1: Install the Tools

### 1a. Obsidian (Free)

Download from https://obsidian.md/ — this is your visual knowledge graph viewer.

### 1b. Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
```

### 1c. QMD Semantic Search (Free, Local)

```bash
npm install -g @tobilu/qmd
```

QMD runs entirely on your machine with local embedding models — no API keys, no cloud, no cost.

### 1d. Optional: Claude Code Plugins

```bash
# Karpathy coding principles (improves Claude's research quality)
claude plugin install andrej-karpathy-skills@karpathy-skills

# Superpowers (structured workflow: discover → define → develop → deliver)
claude plugin install superpowers@claude-plugins-official
```

---

## Step 2: Create Your Research Vault

Create this folder structure anywhere on your computer:

```
research-brain/
├── CLAUDE.md              ← Schema (paste Section 4 of this guide here)
├── index.md               ← Auto-maintained catalog of everything
├── log.md                 ← Chronological record of all operations
├── Memory.md              ← Who you are, your research focus, your preferences
│
├── raw/                   ← Immutable source material
│   ├── sources/           ← Papers, articles, transcripts (never modified after saving)
│   └── assets/            ← PDFs, images, data files
│
├── wiki/                  ← Claude-maintained knowledge pages
│   ├── entities/          ← People, labs, institutions, tools
│   ├── concepts/          ← Ideas, theories, frameworks, methods
│   ├── projects/          ← Your thesis chapters, experiments, papers
│   ├── sources/           ← Summaries of each ingested paper/article
│   └── daily/             ← Daily research logs, meeting notes
│
└── research-skill-graph/  ← 6-lens research system (paste Section 5 here)
    ├── index.md           ← Research command center
    ├── research-log.md    ← Track all research projects
    ├── methodology/
    │   ├── research-frameworks.md
    │   ├── source-evaluation.md
    │   ├── synthesis-rules.md
    │   └── contradiction-protocol.md
    ├── lenses/
    │   ├── technical.md
    │   ├── economic.md
    │   ├── historical.md
    │   ├── geopolitical.md
    │   ├── contrarian.md
    │   └── first-principles.md
    ├── projects/          ← One subfolder per research question
    ├── sources/
    │   └── source-template.md
    └── knowledge/
        ├── concepts.md    ← Accumulates across all research
        └── data-points.md ← Hard numbers with source attribution
```

---

## Step 3: Set Up QMD Semantic Search

```bash
cd /path/to/research-brain
qmd collection add . --name research --mask "**/*.md"
qmd update
qmd embed
```

This indexes all your markdown files with local embedding models. First run downloads a ~300MB model (one-time). After that:

```bash
qmd search "VR embodiment cognitive load"     # Keyword search (fast)
qmd vsearch "how does presence affect learning"  # Semantic search (finds conceptual matches)
qmd update && qmd embed                       # Re-index after adding new files
```

---

## Step 4: CLAUDE.md — Your Research Brain's Operating System

Paste this into `research-brain/CLAUDE.md`:

```markdown
# Research Brain — Schema & Operating Manual

## What This Is

A Karpathy-style LLM wiki for PhD research. Instead of re-deriving answers from raw papers every time, this system builds and maintains a persistent wiki — a structured, interlinked collection of markdown files that grows richer with every paper ingested and every question answered.

## Three-Layer Architecture

- **raw/** — immutable source material. Papers, articles, transcripts. Claude reads but NEVER modifies.
- **wiki/** — Claude-maintained pages. Summaries, entity pages, concept pages, project pages. Claude owns this layer.
- **CLAUDE.md** (this file) — schema and conventions.

## Operations

### INGEST (when you add a new paper/source to raw/)

1. Read the source completely
2. Create a source summary page in wiki/sources/ with: title, authors, key findings, methodology, limitations
3. Create or update entity pages for every researcher/lab/tool mentioned
4. Create or update concept pages for every theory/method/framework discussed
5. Update index.md with new pages
6. Append to log.md
7. Note contradictions with existing wiki pages

### QUERY (when you ask a question)

1. Use `qmd search` first to find relevant wiki pages
2. Read those pages
3. Synthesize an answer with [[wiki link]] citations
4. If the answer is valuable, offer to save it as a new wiki page

### LINT (periodic health check)

1. Find orphan pages, contradictions, stale claims
2. Find concepts mentioned but lacking their own page
3. Suggest new sources to look for

## Page Format

## Every wiki page uses YAML frontmatter:

title: Page Title
type: entity | concept | project | source | daily
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [tag1, tag2]
related: [[Other Page]]

---

## Rules

1. Never modify raw/ — immutable source of truth
2. Always update index.md and log.md after changes
3. Use Obsidian [[wiki links]] for internal cross-references
4. Prefer updating existing pages over creating duplicates
5. Don't hallucinate sources — if the wiki doesn't know, say so
6. Think before coding, simplicity first, surgical changes, goal-driven execution
```

---

## Step 5: The 6-Lens Research System

This is the core research methodology. Create these files in `research-skill-graph/`:

### research-skill-graph/index.md

```markdown
# Research Skill Graph — Command Center

## Mission

Deep research system that takes ONE question and produces multi-angle analysis no single search could match.

## Research Question: [PASTE YOUR QUESTION HERE]

## Scope: [What's in, what's out]

## Output Goal: [What decision does this research inform?]

## The Six Lenses

| Lens                 | Core Question                              | Voice               |
| -------------------- | ------------------------------------------ | ------------------- |
| [[technical]]        | What does the data actually show?          | Clinical, numerical |
| [[economic]]         | Who pays, who profits, who's incentivized? | Follow the money    |
| [[historical]]       | When has this happened before?             | Patterns, precedent |
| [[geopolitical]]     | Who has power and who loses it?            | Strategic           |
| [[contrarian]]       | What's wrong with the consensus?           | Devil's advocate    |
| [[first-principles]] | What's true at the base level?             | Reductive           |

## Execution

1. Read [[research-frameworks]] to pick the right approach
2. Read [[source-evaluation]] to know what counts as evidence
3. For EACH lens: research through that angle, record findings, note contradictions
4. Read [[contradiction-protocol]] to handle disagreements
5. Read [[synthesis-rules]] to combine everything
6. Produce: executive-summary, deep-dive, key-players, open-questions

CRITICAL: Each lens must RETHINK the question. The technical and contrarian lenses should feel like different researchers who disagree.
```

### research-skill-graph/methodology/source-evaluation.md

```markdown
# Source Evaluation — 5-Tier Trust System

## Tier 1: Primary Data (highest trust)

- Raw datasets, peer-reviewed studies with visible methodology
- Clinical trial registries, government records
- USE FOR: hard claims, base assumptions

## Tier 2: Expert Analysis

- Domain-specific research institution reports
- Books by recognized authorities
- Long-form investigative journalism with cited sources
- USE FOR: interpretation, causal claims

## Tier 3: Informed Commentary

- Expert blog posts and newsletters
- Quality podcasts with domain experts
- Think tank reports (check funding)
- USE FOR: angles you hadn't considered

## Tier 4: General Media

- Major news outlets, Wikipedia
- USE FOR: initial orientation only, always verify upstream

## Tier 5: Social/Anecdotal (lowest trust)

- Twitter threads, Reddit, personal anecdotes
- USE FOR: signal detection only

## Red Flags (downgrade by 1 tier)

- No cited sources or methodology
- Author has financial incentive in the conclusion
- Cherry-picked time frames or geographies
- Conflates correlation with causation

## For every key claim, ask:

1. What tier is this source?
2. Can I find the same claim in Tier 1 or 2?
3. Who funded this research?
4. What would the author lose if they were wrong?
```

### research-skill-graph/methodology/synthesis-rules.md

```markdown
# Synthesis Rules

## Step 1: Lens Summary

One paragraph per lens: main finding, confidence (high/medium/low), what surprised you.

## Step 2: Agreement Map

- 4+ lenses agree → high confidence
- 3 lenses agree → moderate confidence, state caveats
- 1-2 lenses only → hypothesis, flag as uncertain

## Step 3: Tension Map

Where lenses DISAGREE — this IS the insight. Don't pick a winner. Document both.
Ask: "under what conditions is each lens correct?"

## Step 4: Second-Order Insights

Combine lenses: "Technical says X, but economic reveals Y, which means the first-principles argument about Z might be dominant."

## Step 5: Confidence Calibration

For each finding: CLAIM, EVIDENCE, CONFIDENCE, WHAT WOULD CHANGE MY MIND.

## Anti-Patterns

- Confirmation bias
- Narrative fallacy (clean story from messy data)
- Recency bias
- Authority bias
```

### research-skill-graph/methodology/contradiction-protocol.md

```markdown
# Contradiction Protocol

## When Two Sources Disagree

1. Same thing? (different geographies, time periods, definitions?)
2. Same data? (same dataset, different interpretation?)
3. Different scope? (global vs country-specific — both might be right)
4. Different incentives? (check funding, affiliations)

## Document, Don't Resolve

"Source A argues [X] based on [data]. Source B argues [Y] based on [data]. The disagreement stems from [root cause]. Under conditions [C1], A is right. Under [C2], B is right."

## If Unresolvable

This IS a finding. "We don't know whether X or Y" is valuable intelligence. Add to open-questions.
```

### research-skill-graph/lenses/technical.md

```markdown
# Lens: Technical

Strip away opinions. What do the numbers actually say?

## Core Questions

1. What does the DATA show? (not what people say about the data)
2. What are the measurable inputs and outputs?
3. What mechanisms drive the phenomenon?
4. What are the hard constraints (physical, biological, mathematical)?
5. What metrics matter most and how are they measured?
6. Where is the data incomplete or poorly measured?

## How to Research

- Start with Tier 1 sources ONLY: raw datasets, peer-reviewed studies
- Quantify everything: replace "declining" with "declined by X% between Y and Z"
- Find the base rates: what's "normal"? what's the historical range?

## Output Format

For each finding: METRIC, VALUE, SOURCE (with date), TREND, CAVEAT.

## Voice

Clinical. Precise. No emotional language. Let the numbers speak.
```

_(Create the other 5 lenses with the same structure but different core questions — see the VR-specific examples below)_

### VR Research-Specific Lens Questions

**Economic lens for VR research:**

- What's the total investment in VR education research vs other EdTech?
- Which VR hardware companies fund which studies? (potential bias)
- What's the cost-per-student of VR vs traditional training?
- Who profits from VR adoption in education? Follow the hardware sales.

**Historical lens for VR research:**

- What happened with previous "revolutionary" education technologies? (TV, CBT, MOOCs)
- What's the adoption curve pattern? When did each technology peak in hype vs reality?
- What VR education studies from 2015-2020 have been replicated? Which failed?

**Contrarian lens for VR research:**

- What if VR presence doesn't improve learning — what if it just improves engagement metrics?
- Who benefits from the "VR improves learning" narrative? (hardware companies, funded labs)
- What are the strongest arguments AGAINST VR in education that nobody's publishing?

---

## Step 6: Memory.md — Who You Are

Create `research-brain/Memory.md`:

```markdown
# Memory — [Your Name]

## Research Focus

[Your thesis topic, e.g., "VR embodiment and its effects on spatial cognition in medical education"]

## Supervisor

[Name, institution, their research angle]

## Key Questions

1. [Your main research question]
2. [Secondary question]
3. [Tertiary question]

## Methodology

[Qualitative? Quantitative? Mixed methods? RCT? What tools?]

## Where I Am

[Year of PhD, what's done, what's next]

## Key Papers

[The 5-10 papers that define your field — Claude will reference these constantly]

## My Biases (honest)

[What are you predisposed to believe? What would be hard for you to accept?]
```

---

## Step 7: Daily Workflow

### Ingest a Paper

1. Save the PDF to `raw/assets/` and a markdown summary to `raw/sources/`
2. Tell Claude: "Ingest this paper into my research wiki"
3. Claude reads it, creates wiki pages, updates cross-references
4. Your knowledge base just grew

### Ask a Research Question

1. Tell Claude: "Research: [your question] using the 6-lens system"
2. Claude reads the research-skill-graph index, picks a framework, runs all 6 lenses
3. You get: executive summary, deep dive, key players, open questions
4. Cross-lens insights show where the real research gaps are

### Weekly Maintenance

```bash
qmd update && qmd embed  # Re-index everything
```

Tell Claude: "Run a LINT check on my research wiki" — finds contradictions, orphans, gaps.

---

## Key Repos and Resources

| Tool                              | What it does                                                    | Link                                                              |
| --------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Karpathy LLM Wiki**             | The original concept for persistent LLM wikis                   | https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f |
| **Obsidian**                      | Visual knowledge graph viewer                                   | https://obsidian.md/                                              |
| **QMD**                           | Local semantic search for markdown (no API key needed)          | https://github.com/tobilu/qmd                                     |
| **Obsidian Mind**                 | Engineer's vault template with slash commands and subagents     | https://github.com/breferrari/obsidian-mind                       |
| **Karpathy LLM Wiki (Astro-Han)** | Claude Code skill for wiki operations                           | https://github.com/Astro-Han/karpathy-llm-wiki                    |
| **Wiki Skills (kfchou)**          | 5 modular Claude Code skills for wiki                           | https://github.com/kfchou/wiki-skills                             |
| **LLM Wiki CLI**                  | Full CLI tool with multi-provider search                        | https://github.com/hellohejinyu/llm-wiki                          |
| **Karpathy Skills**               | Coding principles that improve Claude's output quality          | https://github.com/forrestchang/andrej-karpathy-skills            |
| **Superpowers**                   | Structured dev workflow (discover → define → develop → deliver) | https://github.com/obra/superpowers                               |
| **Compound Engineering**          | 80/20 planning-to-execution workflow                            | https://github.com/EveryInc/compound-engineering-plugin           |
| **Obsidian Web Clipper**          | One-click save any web article to your vault                    | Built into Obsidian                                               |

---

## The Compound Effect

After 5 research projects:

- `knowledge/concepts.md` has 50+ defined concepts
- `knowledge/data-points.md` has 200+ verified statistics
- Your 6th project starts with ALL of that context
- Open questions from one project become the starting point of the next

After 20 papers ingested:

- Entity pages know every researcher in your field and their positions
- Concept pages map the theoretical landscape
- Contradiction protocol has documented where the field actually disagrees
- QMD can answer "who has published on X" by searching your wiki semantically

This is not a tool. It's a research department that gets smarter every week.
