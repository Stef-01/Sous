/**
 * Culinary Therapeutics — catalog coverage-gap report (founder gate G2).
 *
 * For each modeled condition, checks how many dishes in the EXISTING catalog
 * (sides.json + meals.json) can realize each scorable (recipe-native /
 * fortified) intervention, by matching the intervention's `recipeSignals`
 * against each dish's name + tags + description.
 *
 * "Unserved lanes" = scorable interventions with zero matching dishes. These
 * are the recipes the founder/editorial workstream must source from real,
 * reputable sources (CLAUDE.md rule 7 — the agent never invents recipes).
 *
 * Run: `pnpm therapeutics:gaps`
 */

import sidesData from "../src/data/sides.json";
import mealsData from "../src/data/meals.json";
import {
  CONDITIONS,
  CONDITION_IDS,
  scorableInterventions,
  educationOnlyInterventions,
  REGISTRY_STATS,
} from "../src/data/therapeutics/index";

interface CatalogDish {
  id: string;
  haystack: string;
}

function buildCatalog(): CatalogDish[] {
  const out: CatalogDish[] = [];
  for (const s of sidesData as Array<Record<string, unknown>>) {
    const tags = Array.isArray(s.tags) ? (s.tags as string[]).join(" ") : "";
    out.push({
      id: String(s.id),
      haystack: `${s.name ?? ""} ${tags} ${s.description ?? ""}`.toLowerCase(),
    });
  }
  for (const m of mealsData as Array<Record<string, unknown>>) {
    out.push({
      id: String(m.id),
      haystack:
        `${m.name ?? ""} ${m.cuisine ?? ""} ${m.description ?? ""}`.toLowerCase(),
    });
  }
  return out;
}

function matchCount(catalog: CatalogDish[], signals: string[]): number {
  if (signals.length === 0) return 0;
  const lower = signals.map((s) => s.toLowerCase());
  let n = 0;
  for (const dish of catalog) {
    if (lower.some((sig) => dish.haystack.includes(sig))) n++;
  }
  return n;
}

function main() {
  const catalog = buildCatalog();
  console.log(
    `\nCulinary Therapeutics — coverage gap report (registry ${REGISTRY_STATS.version})`,
  );
  console.log(
    `Catalog: ${catalog.length} dishes · ${REGISTRY_STATS.conditions} conditions · ${REGISTRY_STATS.interventions} interventions\n`,
  );

  const gaps: string[] = [];
  let servedLanes = 0;
  let totalLanes = 0;

  for (const id of CONDITION_IDS) {
    const info = CONDITIONS[id];
    const scorable = scorableInterventions(id);
    const eduOnly = educationOnlyInterventions(id);
    console.log(`■ ${info.displayName} (${id})`);

    for (const r of scorable) {
      totalLanes++;
      const n = matchCount(catalog, r.recipeSignals);
      if (n > 0) servedLanes++;
      const flag = n === 0 ? "  ✗ UNSERVED" : `  ✓ ${n} dishes`;
      console.log(`    [${r.interventionClass}] ${r.label} →${flag}`);
      if (n === 0) {
        gaps.push(
          `${info.displayName}: "${r.label}" — needs ≥1 sourced recipe with signals [${r.recipeSignals.join(", ") || "—"}]`,
        );
      }
    }
    for (const r of eduOnly) {
      console.log(
        `    [education-only] ${r.label} → (not scored — shown as evidence card)`,
      );
    }
    console.log("");
  }

  const pct = totalLanes ? Math.round((servedLanes / totalLanes) * 100) : 0;
  console.log(
    `Coverage: ${servedLanes}/${totalLanes} scorable lanes served (${pct}%)\n`,
  );

  if (gaps.length) {
    console.log(
      "FOUNDER-GATED (G2) sourcing work-list — recipes to add to the catalog:",
    );
    for (const g of gaps) console.log(`  • ${g}`);
    console.log(
      "\n(The agent never invents recipes — rule 7. Source these from real, reputable sources, add to sides.json/meals.json, then re-run.)\n",
    );
  } else {
    console.log(
      "No unserved lanes — every scorable intervention has catalog coverage.\n",
    );
  }
}

main();
