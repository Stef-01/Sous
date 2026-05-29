/**
 * Cuisine Compass share grid (Wordle-style emoji grid).
 *
 * Renders a 5-row × 4-column emoji grid that visually summarises
 * a single puzzle attempt without leaking the dish identity. The
 * grid is derived from the great-circle distance between the
 * guess and answer pins; each cell represents a 1/20th segment
 * of the path:
 *
 *   🟩  cell within 100km of the path = "on track"
 *   🟨  within 500km                  = "close-ish"
 *   ⬜  beyond 500km                  = "off"
 *
 * For correct answers (≤100km total), all 20 cells are 🟩. For
 * far guesses, more cells are ⬜. The grid never reveals the
 * direction or location — only relative accuracy.
 *
 * Pure / dependency-free.
 */

const ROWS = 5;
const COLS = 4;
const CELLS = ROWS * COLS; // 20
const CLOSE_KM = 100;
const NEARBY_KM = 500;

export interface ShareGridInput {
  /** Day index (1-based — what's shown in the puzzle header). */
  dayNumber: number;
  /** Final score in [0, 5000]. */
  score: number;
  /** Star count 0-5 from `starsForScore`. */
  stars: 0 | 1 | 2 | 3 | 4 | 5;
  /** Distance in km between guess + answer (NaN allowed = no-show). */
  distanceKm: number;
  /** Public deep-link to the day's puzzle (e.g. soustogether.app/c/437). */
  shareUrl: string;
}

/** Pure: emoji-grid generator. Uses distance-band buckets so the
 *  output is deterministic for a given (distance, attempt) pair. */
export function buildShareGrid(input: ShareGridInput): string {
  const stars = "★".repeat(input.stars) + "☆".repeat(5 - input.stars);
  const distance = Number.isFinite(input.distanceKm)
    ? input.distanceKm
    : Number.POSITIVE_INFINITY;

  // Decide how many cells are 🟩 / 🟨 / ⬜ based on the total distance.
  // The rule is intentionally simple + deterministic so the same
  // distance always produces the same grid.
  let greenCells = 0;
  let yellowCells = 0;
  if (distance <= CLOSE_KM) {
    greenCells = CELLS; // perfect / near-perfect
  } else if (distance <= NEARBY_KM) {
    greenCells = Math.round(CELLS * (1 - (distance - CLOSE_KM) / 1000));
    yellowCells = CELLS - greenCells;
  } else if (distance <= 2000) {
    yellowCells = Math.max(
      0,
      Math.round(CELLS * (1 - (distance - NEARBY_KM) / 2500)),
    );
  } else if (distance <= 8000) {
    yellowCells = Math.max(0, Math.round(CELLS * 0.2 * (1 - distance / 12000)));
  }
  greenCells = Math.max(0, Math.min(CELLS, greenCells));
  yellowCells = Math.max(0, Math.min(CELLS - greenCells, yellowCells));
  const whiteCells = CELLS - greenCells - yellowCells;

  // Distribute green → yellow → white across the rows in order so
  // the grid reads "started strong, drifted off" — a more
  // visually-readable pattern than random shuffling.
  const cells: string[] = [];
  for (let i = 0; i < greenCells; i++) cells.push("🟩");
  for (let i = 0; i < yellowCells; i++) cells.push("🟨");
  for (let i = 0; i < whiteCells; i++) cells.push("⬜");

  const rows: string[] = [];
  for (let r = 0; r < ROWS; r++) {
    rows.push(cells.slice(r * COLS, (r + 1) * COLS).join(""));
  }

  const header = `Sous Compass · Day ${input.dayNumber}`;
  const scoreLine = `${input.score} / 5000  ${stars}`;
  return [
    header,
    scoreLine,
    "",
    rows.join("\n"),
    "─────────",
    input.shareUrl,
  ].join("\n");
}
