/**
 * W29 — match a free-text (or voice-dictated) phrase to catalogue dishes for
 * quick-logging. Deliberately a simple, dependency-free fuzzy match (exact >
 * substring > token overlap) so it works offline with no AI key; the Claude
 * craving-parser can refine it later for multi-item phrases.
 */

import { meals, sides } from "@/data";

export interface DishMatch {
  id: string;
  name: string;
}

const ALL: DishMatch[] = [
  ...meals.map((m) => ({ id: m.id, name: m.name })),
  ...sides.map((s) => ({ id: s.id, name: s.name })),
];

export function matchDishesByText(query: string, limit = 5): DishMatch[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const tokens = q.split(/\s+/).filter((t) => t.length > 1);
  const scored = ALL.map((d) => {
    const name = d.name.toLowerCase();
    let score = 0;
    if (name === q) score += 100;
    else if (name.includes(q)) score += 50;
    for (const t of tokens) if (name.includes(t)) score += 10;
    return { d, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.d.name.length - b.d.name.length);
  return scored.slice(0, limit).map((x) => x.d);
}
