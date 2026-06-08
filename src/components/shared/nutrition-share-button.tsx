"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import {
  buildNutritionShareSVG,
  type ShareCardInput,
} from "@/lib/nutrition/share-card";
import type { PerServingNutrition } from "@/types/nutrition";

/** Rasterise the pure SVG to a 2×-DPI PNG data URL (client-only). */
async function svgToPng(
  svg: string,
  w: number,
  h: number,
): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const scale = 2;
        const canvas = document.createElement("canvas");
        canvas.width = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(null);
          return;
        }
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    } catch {
      resolve(null);
    }
  });
}

/**
 * NutritionShareButton (W45) — saves the dish's nutrition as an image card. The
 * download fires ONLY on the user's tap (per the action rules), carries the same
 * estimate framing as the UI, and contains no PII.
 */
export function NutritionShareButton({
  title,
  nutrition,
}: {
  title: string;
  nutrition: PerServingNutrition;
}) {
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    setBusy(true);
    try {
      const input: ShareCardInput = {
        title,
        calories: Math.round(nutrition.calories ?? 0),
        protein_g: Math.round(nutrition.protein_g ?? 0),
        carbs_g: Math.round(nutrition.totalCarbs_g ?? 0),
        fat_g: Math.round(nutrition.totalFat_g ?? 0),
        fiber_g: Math.round(nutrition.fiber_g ?? 0),
      };
      const png = await svgToPng(buildNutritionShareSVG(input), 600, 600);
      if (!png) return;
      const a = document.createElement("a");
      a.href = png;
      a.download = `sous-${title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-nutrition.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-full bg-neutral-50 px-3 py-1.5 text-[11px] font-medium text-[var(--nourish-subtext)] transition-colors hover:bg-neutral-100 disabled:opacity-50"
    >
      <Download size={12} aria-hidden />
      {busy ? "Saving…" : "Save nutrition card"}
    </button>
  );
}
