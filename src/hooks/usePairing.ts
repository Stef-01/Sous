"use client";

import { useState, useCallback } from "react";
import type { Meal, SideDish } from "@/types";
import { selectSides, swapOneSide } from "@/lib/pairingEngine";
import type { SideWithScore } from "@/lib/pairingEngine";
import { trackEvent } from "@/lib/analytics";

export function usePairing() {
  const [usedSideIds, setUsedSideIds] = useState<Set<string>>(new Set());
  const [rankOffset, setRankOffset] = useState(0);

  const reroll = useCallback(
    (meal: Meal, currentSides: SideDish[]): SideWithScore[] => {
      const newExclude = new Set([
        ...usedSideIds,
        ...currentSides.map((s) => s.id),
      ]);

      const { sides: newSides, nextOffset } = selectSides(
        meal,
        3,
        newExclude,
        rankOffset
      );

      setRankOffset(nextOffset);
      setUsedSideIds((prev) => {
        const next = new Set(prev);
        for (const s of newSides) next.add(s.id);
        return next;
      });

      trackEvent("reroll", { meal: meal.name });
      return newSides;
    },
    [usedSideIds, rankOffset]
  );

  const swap = useCallback(
    (
      meal: Meal,
      currentSides: SideDish[],
      indexToSwap: number
    ): SideWithScore[] => {
      const { newSides, swappedSide, nextOffset } = swapOneSide(
        meal,
        currentSides,
        indexToSwap,
        usedSideIds,
        rankOffset
      );

      setRankOffset(nextOffset);

      if (swappedSide) {
        setUsedSideIds((prev) => new Set([...prev, swappedSide.id]));
        trackEvent("swapSide", {
          meal: meal.name,
          swapped: swappedSide.name,
        });
      }

      return newSides;
    },
    [usedSideIds, rankOffset]
  );

  const resetUsed = useCallback(() => {
    setUsedSideIds(new Set());
    setRankOffset(0);
  }, []);

  const isPoolExhausted = useCallback(
    (meal: Meal, currentSides: SideDish[]): boolean => {
      const allSeen = new Set([
        ...usedSideIds,
        ...currentSides.map((s) => s.id),
      ]);
      return meal.sidePool.every((id) => allSeen.has(id));
    },
    [usedSideIds]
  );

  return { reroll, swap, resetUsed, isPoolExhausted, usedSideIds, rankOffset, setRankOffset };
}
