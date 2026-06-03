"use client";

/**
 * TherapeuticEvidence — the food-first evidence strips shown on the results
 * surface for a user's active conditions (Culinary Therapeutics CT-4 wiring).
 *
 * Reads the LOCAL CareProfile (no transport — privacy-safe) and renders one
 * EvidenceProvenanceStrip per condition. DORMANT until founder gate G1: renders
 * `null` while `registryIsClinicianApproved()` is false, so the results UI is
 * byte-identical today. At G1 it surfaces the graded, claim-safe evidence.
 */

import { useCareProfile } from "@/lib/hooks/use-care-profile";
import { registryIsClinicianApproved } from "@/data/therapeutics";
import { EvidenceProvenanceStrip } from "@/components/shared/evidence-provenance-strip";

export function TherapeuticEvidence({ className }: { className?: string }) {
  const { profile } = useCareProfile();

  if (!registryIsClinicianApproved() || profile.conditions.length === 0) {
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
