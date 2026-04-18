"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Camera, Upload, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CameraInputProps {
  onCapture: (imageBase64: string) => void;
  onClose: () => void;
  isProcessing: boolean;
}

/**
 * Camera Input — captures a photo of the user's main dish.
 * Falls back to file upload on devices without camera access.
 */
export function CameraInput({
  onCapture,
  onClose,
  isProcessing,
}: CameraInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showTypingFallback, setShowTypingFallback] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- reset + start timer in response to isProcessing flip */
  useEffect(() => {
    if (!isProcessing) {
      setShowTypingFallback(false);
      return;
    }
    const id = window.setTimeout(() => setShowTypingFallback(true), 6000);
    return () => clearTimeout(id);
  }, [isProcessing]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate type and size
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be under 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPreview(base64);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    if (preview) {
      // Strip data URL prefix, keep just base64
      const base64 = preview.split(",")[1] ?? preview;
      onCapture(base64);
    }
  }, [preview, onCapture]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: "none" }}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--nourish-dark)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-white/80 hover:text-white"
          type="button"
          aria-label="Close camera"
        >
          <X size={24} />
        </button>
        <span className="text-sm font-medium text-white/80">
          Point at your food
        </span>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Preview area */}
      <div className="flex flex-1 items-center justify-center px-6">
        {preview ? (
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL from FileReader, not compatible with next/image */}
            <img
              src={preview}
              alt="Captured food"
              className="w-full rounded-2xl object-contain"
            />
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 rounded-2xl">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {showTypingFallback && (
                  <button
                    onClick={onClose}
                    type="button"
                    className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[var(--nourish-dark)] hover:bg-white transition-colors"
                  >
                    <Keyboard size={12} />
                    Didn&apos;t work — try typing instead
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-white/30">
              <Camera size={36} className="text-white/50" />
            </div>
            <p className="text-sm text-white/60 max-w-xs">
              Take a photo or upload an image of your main dish
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 px-6 pb-8 pt-4">
        {!preview ? (
          <>
            {/* Upload from file */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1 rounded-xl px-4 py-3 text-white/70 hover:text-white transition-colors"
              type="button"
            >
              <Upload size={24} />
              <span className="text-xs">Upload</span>
            </button>
            {/* Shutter button (opens file picker as camera) */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg hover:scale-105 transition-transform"
              type="button"
            >
              <div className="h-14 w-14 rounded-full border-2 border-neutral-300" />
            </button>
            <div className="w-16" /> {/* Spacer */}
          </>
        ) : (
          <>
            {/* Retake */}
            <button
              onClick={() => setPreview(null)}
              disabled={isProcessing}
              className="rounded-xl px-6 py-3 text-sm font-medium text-white/70 hover:text-white disabled:opacity-50 transition-colors"
              type="button"
            >
              Retake
            </button>

            {/* Confirm */}
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className={cn(
                "rounded-xl px-8 py-3 text-sm font-semibold",
                "bg-[var(--nourish-green)] text-white hover:bg-[var(--nourish-dark-green)]",
                "disabled:opacity-50 transition-all duration-200",
              )}
              type="button"
            >
              {isProcessing ? "Identifying..." : "Looks right — Pair"}
            </button>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </motion.div>
  );
}
