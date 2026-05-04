/**
 * Editorial clinician credit + publication queue (Y4 W29).
 *
 * Pure helpers for the Sprint H editorial pipeline. The Y3
 * Content tab already ships placeholder items (isPlaceholder:
 * true). This module gates the lifecycle to swap in real
 * clinician-verified content:
 *
 *   - ClinicianCredit shape (name, affiliation, ORCID, role).
 *   - PublicationQueueEntry status enum + transition validator.
 *   - validateEditorialCompleteness — pure check that an entry
 *     has every required field before it can be flagged as
 *     publishable (sourceUrl, sourceTitle, permissionEvidence,
 *     credits[]).
 *
 * Real-mode wire-up: the editorial workstream pastes verified
 * content + the clinician CV/ORCID into the queue; the
 * Content tab page renders only entries whose status is
 * "published" + who pass the completeness gate.
 *
 * Pure / dependency-free.
 */

export interface ClinicianCredit {
  /** Stable id for the credit row. */
  id: string;
  /** Full name as cited (e.g. "Dr. Maya Lin, MD, PhD"). */
  name: string;
  /** Institution / affiliation as cited. */
  affiliation: string;
  /** ORCID identifier (16-digit, dash-separated). */
  orcid?: string;
  /** Role in the article. */
  role: "author" | "reviewer" | "advisor" | "translator" | "video-presenter";
  /** Display order in the byline strip. */
  bylineOrder: number;
}

export type PublicationStatus =
  | "draft"
  | "in-review"
  | "ready-to-publish"
  | "published"
  | "withdrawn";

export interface PublicationQueueEntry {
  id: string;
  /** Slug → matches the Content tab item id. */
  contentSlug: string;
  status: PublicationStatus;
  /** ISO timestamp of last status change. */
  statusChangedAt: string;
  /** Author / reviewer / etc. credits. */
  credits: ReadonlyArray<ClinicianCredit>;
  /** Stanford-domain or other authorised source URL. */
  sourceUrl?: string;
  /** Human-readable source title. */
  sourceTitle?: string;
  /** Path to the permission evidence (signed letter, etc.). */
  permissionEvidence?: string;
  /** Optional editor note. */
  editorNote?: string;
}

/** Pure: ORCID format validator (4-block 16-digit dash-
 *  separated). Last digit may be "X". */
export function isValidOrcid(orcid: string): boolean {
  return /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(orcid);
}

export interface CompletenessReport {
  ready: boolean;
  missingFields: ReadonlyArray<string>;
}

/** Pure: every required field for a publishable entry. */
export function validateEditorialCompleteness(
  entry: PublicationQueueEntry,
): CompletenessReport {
  const missing: string[] = [];
  if (!entry.sourceUrl || entry.sourceUrl.length === 0)
    missing.push("sourceUrl");
  if (!entry.sourceTitle || entry.sourceTitle.length === 0)
    missing.push("sourceTitle");
  if (!entry.permissionEvidence || entry.permissionEvidence.length === 0)
    missing.push("permissionEvidence");
  if (entry.credits.length === 0) missing.push("credits");
  // Each credit needs a name + affiliation.
  for (const credit of entry.credits) {
    if (!credit.name) missing.push(`credit ${credit.id}: name`);
    if (!credit.affiliation) missing.push(`credit ${credit.id}: affiliation`);
    if (credit.orcid && !isValidOrcid(credit.orcid))
      missing.push(`credit ${credit.id}: invalid ORCID`);
  }
  return { ready: missing.length === 0, missingFields: missing };
}

/** Pure: transition validator. Returns the new status when
 *  allowed; returns the prior status with a reason when not. */
export function transitionPublicationStatus(input: {
  entry: PublicationQueueEntry;
  to: PublicationStatus;
}): { ok: true; status: PublicationStatus } | { ok: false; reason: string } {
  const { entry, to } = input;
  // Allow lateral / forward movement; block backwards from
  // published / withdrawn.
  const order: PublicationStatus[] = [
    "draft",
    "in-review",
    "ready-to-publish",
    "published",
    "withdrawn",
  ];
  const fromIdx = order.indexOf(entry.status);
  const toIdx = order.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) {
    return { ok: false, reason: "Unknown status." };
  }
  // Withdrawn is terminal.
  if (entry.status === "withdrawn") {
    return { ok: false, reason: "Withdrawn entries cannot transition." };
  }
  // Ready→published gate: completeness must pass.
  if (entry.status === "ready-to-publish" && to === "published") {
    const completeness = validateEditorialCompleteness(entry);
    if (!completeness.ready) {
      return {
        ok: false,
        reason: `Cannot publish: missing ${completeness.missingFields.join(", ")}.`,
      };
    }
  }
  // Block direct draft→published (must pass review).
  if (entry.status === "draft" && to === "published") {
    return {
      ok: false,
      reason: "Draft must pass through in-review and ready-to-publish first.",
    };
  }
  return { ok: true, status: to };
}
