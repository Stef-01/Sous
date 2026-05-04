"use client";

/**
 * useHouseholdDietary — convenience hook bundling the W32
 * household members + W35 tonight-table selection + W35
 * aggregator into a single value the pairing engine call sites
 * consume.
 *
 * W37 sugar — keeps the three /today / /sides / result-stack
 * pairing call sites from each importing the same three hooks
 * + aggregator. The aggregate is memoised once at this layer
 * so downstream consumers don't re-run it per render.
 */

import { useMemo } from "react";
import { useHouseholdMembers } from "./use-household-members";
import { useTonightTable } from "./use-tonight-table";
import { aggregateTable } from "@/lib/household/table-aggregate";

export function useHouseholdDietary() {
  const { members } = useHouseholdMembers();
  const { selectedIds } = useTonightTable();
  const aggregate = useMemo(
    () => aggregateTable(members, selectedIds),
    [members, selectedIds],
  );
  return {
    /** Empty when no household members are selected. The pairing
     *  query treats an empty array as "no constraint" — passing
     *  undefined or an empty array both skip the filter. */
    dietaryFlags: aggregate.dietaryFlags,
    aggregate,
  };
}
