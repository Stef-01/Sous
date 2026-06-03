"use client";

/**
 * TherapeuticEvidence — the food-first evidence strips shown on the results
 * surface for a user's active conditions (Culinary Therapeutics CT-4 wiring).
 *
 * Reads the LOCAL CareProfile (no transport — privacy-safe). DORMANT until
 * founder gate G1: returns `null` while `therapeuticsActive()` is false, so the
 * results UI is byte-identical today.
 *
 * The EvidenceProvenanceStrip (and the ~25KB evidence registry it pulls in) is
 * lazily imported, so while dormant the registry never lands in the Today
 * bundle — only loaded once the feature is switched on.
 */

import dynamic from "next/dynamic";
import { useCareProfile } from "@/lib/hooks/use-care-profile";
import { therapeuticsActive } from "@/lib/therapeutics/feature-flag";

const EvidenceProvenanceStrip = dynamic(
  () =>
    import("@/components/shared/evidence-provenance-strip").then(
      (m) => m.EvidenceProvenanceStrip,
    ),
  { ssr: false },
);

export function TherapeuticEvidence({ className }: { className?: string }) {
  const { profile } = useCareProfile();

  if (!therapeuticsActive() || profile.conditions.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {profile.conditions.map((id) => (
          <EvidenceProvenanceStrip key={id} conditionId={id} />
        ))}
      </div>
    </div>
  );
}
