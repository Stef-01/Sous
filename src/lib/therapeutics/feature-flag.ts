/**
 * Master activation switch for Culinary Therapeutics — EDUCATIONAL MODE.
 *
 * Deliberately a TINY standalone module with NO evidence-registry import, so
 * the feature never drags the registry (~25KB) into hot client bundles (Today,
 * Sides) when off. The heavy registry is reached only by code that runs when
 * active — the server-side scorer and the lazily-loaded evidence strip.
 *
 * ── What "active" turns on (educational mode only) ──
 * The care-profile capture UI, the dietary EXCLUSION flags (gluten-free etc.,
 * derived flags only — never raw conditions in a URL), and the educational
 * evidence strip. Records stay reviewStatus:"unreviewed" / isEducational:true,
 * so every surface shows "educational, not personalized medical advice" and the
 * claim contract (assertNoMedicalClaim) holds. The therapeutic re-ranking
 * SCORER stays dormant regardless — it needs the CT-3 POST transport AND
 * clinician-verified effect sizes (G1), neither of which this flag fakes.
 *
 * ── The two HUMAN gates this flag does NOT clear (rule 12) ──
 *  G1  Clinical sign-off — a clinician must verify every effect size / GRADE /
 *      claim before marking records "clinician-approved" (drops the Educational
 *      banner + enables personalized scoring). Never set in code.
 *  G5  Legal review of the FTC/FDA claim posture before production go-live.
 *
 * ── Activation policy ──
 *  - NEXT_PUBLIC_THERAPEUTICS_ACTIVE="1" → on  (the founder's prod one-flip, post-G5)
 *  - NEXT_PUBLIC_THERAPEUTICS_ACTIVE="0" → off (kill switch)
 *  - default → on in development/preview (so the feature is live + testable now),
 *    OFF in test (keeps the dormancy golden tests byte-identical) and in
 *    production (gated on G5 until the founder sets the env).
 */
export function therapeuticsActive(): boolean {
  const env = process.env.NEXT_PUBLIC_THERAPEUTICS_ACTIVE;
  if (env === "1") return true;
  if (env === "0") return false;
  return process.env.NODE_ENV === "development";
}
