"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import type { RecipeGiftSource } from "@/lib/share/recipe-gift";

export function GiftOpenTracker({
  dishSlug,
  source,
  hasSender,
  starCount,
}: {
  dishSlug: string;
  source: RecipeGiftSource;
  hasSender: boolean;
  starCount: number;
}) {
  useEffect(() => {
    track("recipe_gift_opened", {
      dishSlug,
      source,
      hasSender,
      starCount,
    });
  }, [dishSlug, source, hasSender, starCount]);

  return null;
}
