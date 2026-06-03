/**
 * Master activation switch for Culinary Therapeutics (founder gate G1).
 *
 * Returns false until clinician + legal review clear. Deliberately a TINY
 * standalone module with NO evidence-registry import, so the dormant feature
 * never drags the registry (~25KB) into hot client bundles (Today, Sides).
 * The heavy registry is reached only by code that runs when active — the
 * server-side scorer and the lazily-loaded evidence strip.
 *
 * G1 activation = flip this to true (and flip the registry records'
 * reviewStatus to "clinician-approved" so the cards drop the "Educational"
 * banner).
 */
export function therapeuticsActive(): boolean {
  return false;
}
