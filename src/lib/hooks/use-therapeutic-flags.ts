"use client";

/**
 * useTherapeuticDietaryFlags — the dietary flags a user's care profile requires
 * (Culinary Therapeutics CT-3/CT-4 activation wiring).
 *
 * Returns the DERIVED dietary flags only (e.g. "gluten-free"), never the raw
 * conditions — so when these thread through the `pairing.suggest` GET query they
 * never place sensitive condition data in a URL (privacy rule). They are the
 * same class as the existing `householdDietaryFlags`.
 *
 * DORMANT until founder gate G1: returns `[]` while
 * `registryIsClinicianApproved()` is false, so the pairing request stays
 * byte-identical. At G1 it begins requiring the care exclusions.
 */

import { useMemo } from "react";
import { useCareProfile } from "./use-care-profile";
import { requiredFlagsForCare } from "@/lib/engine/therapeutic-exclusions";
import { registryIsClinicianApproved } from "@/data/therapeutics";

export function useTherapeuticDietaryFlags(): string[] {
  const { profile } = useCareProfile();
  return useMemo(() => {
    if (!registryIsClinicianApproved()) return [];
    return requiredFlagsForCare(profile);
  }, [profile]);
}
