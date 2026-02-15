"use client";

import { useState, useCallback, type RefObject } from "react";
import { toPng } from "html-to-image";

export function useSharePlate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = useCallback(
    async (ref: RefObject<HTMLDivElement | null>): Promise<string | null> => {
      if (!ref.current) return null;
      setIsGenerating(true);
      setError(null);
      try {
        const dataUrl = await toPng(ref.current, {
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: "#FFFFFF",
        });
        return dataUrl;
      } catch (err) {
        setError("Failed to generate image");
        console.error("Share plate image generation failed:", err);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const downloadImage = useCallback(
    (dataUrl: string, filename = "nourish-plate.png") => {
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    },
    []
  );

  const copyToClipboard = useCallback(
    async (dataUrl: string): Promise<boolean> => {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        return true;
      } catch (err) {
        console.error("Clipboard write failed:", err);
        setError("Failed to copy to clipboard");
        return false;
      }
    },
    []
  );

  const shareImage = useCallback(
    async (dataUrl: string, mealName: string): Promise<boolean> => {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `nourish-${mealName.toLowerCase().replace(/\s+/g, "-")}.png`, {
          type: "image/png",
        });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: `My ${mealName} Plate`,
            text: `Check out my meal pairing from NOURISH!`,
            files: [file],
          });
          return true;
        }

        // Fallback: copy to clipboard
        return await copyToClipboard(dataUrl);
      } catch (err) {
        // User cancelled share is not an error
        if (err instanceof Error && err.name === "AbortError") return false;
        console.error("Share failed:", err);
        return await copyToClipboard(dataUrl);
      }
    },
    [copyToClipboard]
  );

  return {
    generateImage,
    downloadImage,
    copyToClipboard,
    shareImage,
    isGenerating,
    error,
  };
}
