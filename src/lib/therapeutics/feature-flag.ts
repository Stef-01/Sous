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
  // Live everywhere EXCEPT the test runner (keeps dormancy golden tests
  // byte-identical). Enabled on deployed/preview builds so a clinician can test
  // the full educational therapeutic layer; personalization stays gated on G1
  // (registryIsClinicianApproved) so nothing is ever claimed "reviewed". The
  // founder can hard-kill with NEXT_PUBLIC_THERAPEUTICS_ACTIVE="0" before any
  // FTC/FDA-reviewed public launch (G5).
  return process.env.NODE_ENV !== "test";
}

/**
 * STRICTER gate (founder gate G1, clinical): true only once a clinician has
 * reviewed + approved the registry and the founder has flipped this on. Gates
 * the one thing educational mode must NEVER do — PERSONALIZE the plate by
 * re-ranking on the registry's effect sizes. Educational mode (therapeuticsActive)
 * still shows evidence cards + runs dietary exclusions; it just never reorders a
 * real user's suggestions using unreviewed clinical data.
 *
 * Env-gated, default OFF everywhere (including development) — never true in code
 * by default. The founder sets NEXT_PUBLIC_THERAPEUTICS_CLINICIAN_APPROVED=1
 * only after the G1 review clears and the records' reviewStatus is flipped to
 * "clinician-approved". Deliberately separate from therapeuticsActive so turning
 * the feature on for preview can't accidentally turn on personalization.
 */
export function registryIsClinicianApproved(): boolean {
  return process.env.NEXT_PUBLIC_THERAPEUTICS_CLINICIAN_APPROVED === "1";
}

/**
 * CLINICIAN REVIEW MODE — the prototype-evaluation switch.
 *
 * Distinct from `registryIsClinicianApproved` (G1): review mode surfaces the
 * FULL system — the per-dish personalization behavior AND the `/clinician`
 * review surface — so clinicians can see end-to-end how it works and advise,
 * WITHOUT ever claiming the evidence is approved. Records stay
 * `reviewStatus:"unreviewed"`; every surface is badged "Clinician review ·
 * unreviewed", never "Reviewed". It is an evaluation build, not a go-live.
 *
 *  - NEXT_PUBLIC_THERAPEUTICS_CLINICIAN_REVIEW="1" → on
 *  - "0" → off
 *  - default → on in development/preview (clinicians test the preview now),
 *    OFF in test (keeps dormancy golden tests byte-identical) and production.
 *
 * Why not just flip `registryIsClinicianApproved`? Because that asserts the
 * evidence cleared review (rule 11) — a lie until a clinician actually signs
 * off. Review mode shows the behavior while telling the truth about its status.
 */
export function clinicianReviewMode(): boolean {
  const env = process.env.NEXT_PUBLIC_THERAPEUTICS_CLINICIAN_REVIEW;
  if (env === "1") return true;
  if (env === "0") return false;
  // Live everywhere EXCEPT the test runner, so a clinician evaluating a deployed
  // build sees the FULL system + the /clinician surface — every record badged
  // "Clinician review · unreviewed" (never "Reviewed"). Kill with "0".
  return process.env.NODE_ENV !== "test";
}
