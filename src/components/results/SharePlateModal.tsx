"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { springs } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSharePlate } from "@/hooks/useSharePlate";
import type { Meal, SideDish } from "@/types";

interface SharePlateModalProps {
  open: boolean;
  onClose: () => void;
  meal: Meal | null;
  sides: SideDish[];
}

export default function SharePlateModal({
  open,
  onClose,
  meal,
  sides,
}: SharePlateModalProps) {
  const prefersReduced = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const {
    generateImage,
    downloadImage,
    copyToClipboard,
    shareImage,
    isGenerating,
  } = useSharePlate();
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setImageDataUrl(null);
      setCopiedFeedback(false);
    }
  }, [open]);

  const handleGenerate = async () => {
    const dataUrl = await generateImage(plateRef);
    if (dataUrl) setImageDataUrl(dataUrl);
    return dataUrl;
  };

  const handleDownload = async () => {
    const dataUrl = imageDataUrl || (await handleGenerate());
    if (dataUrl && meal) {
      downloadImage(dataUrl, `sous-${meal.name.toLowerCase().replace(/\s+/g, "-")}.png`);
    }
  };

  const handleCopy = async () => {
    const dataUrl = imageDataUrl || (await handleGenerate());
    if (dataUrl) {
      const success = await copyToClipboard(dataUrl);
      if (success) {
        setCopiedFeedback(true);
        setTimeout(() => setCopiedFeedback(false), 2000);
      }
    }
  };

  const handleShare = async () => {
    const dataUrl = imageDataUrl || (await handleGenerate());
    if (dataUrl && meal) {
      const success = await shareImage(dataUrl, meal.name);
      if (success && !navigator.share) {
        // Fallback was copy — show feedback
        setCopiedFeedback(true);
        setTimeout(() => setCopiedFeedback(false), 2000);
      }
    }
  };

  return (
    <AnimatePresence>
      {open && meal && (
        <div
          className="fixed inset-0 z-[100]"
          role="dialog"
          aria-modal="true"
          aria-label={`Share ${meal.name} plate`}
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ perspective: 800 }}
          >
            <motion.div
              ref={dialogRef}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative"
              initial={
                prefersReduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: 60, scale: 0.9, rotateX: 8 }
              }
              animate={
                prefersReduced
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, scale: 1, rotateX: 0 }
              }
              exit={
                prefersReduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: 40, scale: 0.95 }
              }
              transition={prefersReduced ? { duration: 0.2 } : springs.modal}
            >
              {/* Close button */}
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 text-nourish-subtext hover:text-nourish-dark transition-colors text-xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold rounded p-1"
                aria-label="Close share plate"
                whileHover={prefersReduced ? {} : { scale: 1.1, rotate: 90 }}
                whileTap={prefersReduced ? {} : { scale: 0.85 }}
                transition={springs.snappy}
              >
                ✕
              </motion.button>

              <h2 className="text-lg font-serif text-nourish-dark text-center mb-1">
                Share Your Plate
              </h2>
              <p className="text-xs text-nourish-subtext text-center mb-5">
                Download or share your meal pairing
              </p>

              {/* Bento box plate composition — captured by html-to-image */}
              <div
                ref={plateRef}
                className="w-full max-w-[300px] mx-auto mb-5 rounded-xl overflow-hidden"
                style={{ backgroundColor: "#FFFFFF" }}
              >
                {/* Bento grid: hero on top, 3 sides in a row below */}
                <div className="p-4">
                  {/* Hero meal — large, centered */}
                  <div className="flex flex-col items-center mb-3">
                    <div className="relative w-28 h-28">
                      <Image
                        src={meal.heroImageUrl}
                        alt={meal.name}
                        fill
                        className="object-contain"
                        sizes="112px"
                      />
                    </div>
                    <span className="text-xs font-serif text-nourish-dark mt-1.5 text-center">
                      {meal.name}
                    </span>
                  </div>

                  {/* Thin divider */}
                  <div className="w-12 h-px bg-gray-200 mx-auto mb-3" />

                  {/* Side dishes — bento row of 3 */}
                  <div className="grid grid-cols-3 gap-2">
                    {sides.slice(0, 3).map((side) => (
                      <div
                        key={side.id}
                        className="flex flex-col items-center rounded-lg bg-gray-50/80 p-2"
                      >
                        <div className="relative w-14 h-14">
                          <Image
                            src={side.imageUrl}
                            alt={side.name}
                            fill
                            className="object-contain"
                            sizes="56px"
                          />
                        </div>
                        <span className="text-[8px] text-nourish-subtext mt-1 text-center leading-tight line-clamp-2">
                          {side.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Sous branding */}
                  <div className="text-center mt-3">
                    <span className="text-[9px] font-serif tracking-[0.2em] text-nourish-subtext/30 uppercase">
                      sous
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-3">
                {/* Download */}
                <motion.button
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-nourish-button rounded-full hover:bg-nourish-button-hover transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold focus-visible:ring-offset-2"
                  whileHover={prefersReduced ? {} : { scale: 1.05, y: -2 }}
                  whileTap={prefersReduced ? {} : { scale: 0.95 }}
                  transition={springs.snappy}
                  aria-label="Download plate image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download
                </motion.button>

                {/* Copy */}
                <motion.button
                  onClick={handleCopy}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-nourish-dark bg-transparent border border-gray-200 rounded-full hover:border-nourish-button hover:text-nourish-button transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold focus-visible:ring-offset-2"
                  whileHover={prefersReduced ? {} : { scale: 1.03, y: -1 }}
                  whileTap={prefersReduced ? {} : { scale: 0.95 }}
                  transition={springs.snappy}
                  aria-label={copiedFeedback ? "Copied!" : "Copy plate image"}
                >
                  <AnimatePresence mode="wait">
                    {copiedFeedback ? (
                      <motion.span
                        key="check"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Copied!
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Share (native) */}
                <motion.button
                  onClick={handleShare}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-nourish-dark bg-transparent border border-gray-200 rounded-full hover:border-nourish-button hover:text-nourish-button transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold focus-visible:ring-offset-2"
                  whileHover={prefersReduced ? {} : { scale: 1.03, y: -1 }}
                  whileTap={prefersReduced ? {} : { scale: 0.95 }}
                  transition={springs.snappy}
                  aria-label="Share plate image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  Share
                </motion.button>
              </div>

              {/* Loading indicator */}
              {isGenerating && (
                <p className="text-xs text-nourish-subtext text-center mt-3 animate-pulse">
                  Generating image...
                </p>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
