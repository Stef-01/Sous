/**
 * dish-progress — pure helpers for the W29 dual-track
 * step-progress strip (`/cook/combined` density wave 2,
 * second piece per the W28 carry-forward).
 *
 * Inputs are array indices straight from the cook store
 * (`currentDishIndex`, `currentStepIndex`); outputs are
 * displayable progress fractions (0..1) per dish.
 *
 * Pure / dependency-free so unit tests cover the matrix
 * without rendering React.
 */

export interface DishProgressInput {
  /** Display name shown in the strip label. */
  name: string;
  /** Total cook steps for this dish (excluding non-cook phases). */
  totalSteps: number;
}

export interface DishProgressEntry {
  name: string;
  totalSteps: number;
  /** 0..N — number of completed cook steps. */
  completedSteps: number;
  /** 0..1 — clamped progress fraction. */
  progress: number;
  /** Whether this is the dish currently being cooked. */
  isActive: boolean;
}

/**
 * Compute per-dish progress given the linear cook order.
 * Convention: dishes complete in `dishes[0]`, `dishes[1]`, …
 * order. A dish that comes BEFORE the active one is fully done;
 * a dish that comes AFTER is at zero; the active dish reflects
 * the current step index.
 */
export function buildDishProgress(
  dishes: ReadonlyArray<DishProgressInput>,
  activeDishIndex: number,
  activeStepIndex: number,
): DishProgressEntry[] {
  return dishes.map((d, idx) => {
    let completedSteps: number;
    if (idx < activeDishIndex) {
      completedSteps = d.totalSteps;
    } else if (idx > activeDishIndex) {
      completedSteps = 0;
    } else {
      // Active dish: clamp to [0, totalSteps].
      completedSteps = Math.max(0, Math.min(activeStepIndex, d.totalSteps));
    }
    const progress = d.totalSteps > 0 ? completedSteps / d.totalSteps : 0;
    return {
      name: d.name,
      totalSteps: d.totalSteps,
      completedSteps,
      progress,
      isActive: idx === activeDishIndex,
    };
  });
}
