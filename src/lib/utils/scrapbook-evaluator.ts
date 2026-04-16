/**
 * Deterministic "meal evaluator" placeholder scores for scrapbook cards.
 * When the real evaluator ships, swap this for stored rubric results on each session.
 */
export function stableEvaluatorScores(
  sessionId: string,
  rating?: number,
): { plating: number; technique: number } {
  let h = 2166136261;
  for (let i = 0; i < sessionId.length; i++) {
    h ^= sessionId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const base = typeof rating === "number" && rating > 0 ? rating : 3;
  const plating = Math.min(5, Math.max(1, Math.round(base + (h % 3) - 1)));
  const technique = Math.min(
    5,
    Math.max(1, Math.round(base + ((h >> 3) % 3) - 1)),
  );
  return { plating, technique };
}
