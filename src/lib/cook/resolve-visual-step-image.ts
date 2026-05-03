/**
 * resolveVisualStepImage — pure resolver for the W27 visual-mode
 * page-side adoption (cook-nav initiative MVP 3 follow-on).
 *
 * Visual mode promotes the step image to a large, hero-sized
 * element (Google-Maps "look, don't read"). Most steps don't yet
 * have a per-step image, so the resolver implements a three-tier
 * fallback:
 *
 *   1. step image (highest fidelity)
 *   2. dish hero image (visually-related fallback)
 *   3. nothing → caller renders a text-only "Step image coming
 *      soon" placeholder
 *
 * Pure / dependency-free so unit tests cover the matrix without
 * touching React or the DOM.
 */

export interface ResolvedStepImage {
  /** URL to render, or null when neither source is usable. */
  src: string | null;
  /** When true, the resolved image came from the dish hero, not
   *  a per-step asset. The UI shows a small "dish photo" badge
   *  so the user knows this isn't the literal step. */
  isFallback: boolean;
  /** When both inputs are missing, the caller should render a
   *  textual placeholder ("Step image coming soon"). */
  isPlaceholder: boolean;
}

function isUsableUrl(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function resolveVisualStepImage(
  stepImageUrl: string | null | undefined,
  heroImageUrl: string | null | undefined,
): ResolvedStepImage {
  if (isUsableUrl(stepImageUrl)) {
    return { src: stepImageUrl, isFallback: false, isPlaceholder: false };
  }
  if (isUsableUrl(heroImageUrl)) {
    return { src: heroImageUrl, isFallback: true, isPlaceholder: false };
  }
  return { src: null, isFallback: false, isPlaceholder: true };
}
