"use client";

import { type ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface SearchPopoutProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Search Popout  -  bottom-sheet modal containing the search/pairing flow.
 *
 * IMPORTANT: position:sticky is broken inside CSS transform elements (Framer Motion
 * uses translateY for the slide animation). Instead, we use a flex-col layout with
 * a non-scrolling header and an independently scrollable content area so the X button
 * is always visible regardless of scroll position.
 */
export function SearchPopout({ isOpen, onClose, children }: SearchPopoutProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Bottom sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="search-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label="Search for a dish"
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-white shadow-2xl max-h-[85vh]"
          >
            {/* Fixed header  -  NEVER scrolls (avoids sticky+transform bug) */}
            <div className="flex-shrink-0 bg-white rounded-t-2xl px-4 pt-3 pb-2">
              {/* Drag handle */}
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-300" />

              {/* Title + close */}
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-[var(--nourish-dark)]">
                  What are you craving?
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2.5 text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] transition-colors active:scale-90"
                  type="button"
                  aria-label="Close search"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable content area  -  pb-24 ensures CTA clears the tab bar */}
            <div className="flex-1 overflow-y-auto min-h-0 scroll-contain">
              <div className="mx-auto max-w-md px-4 pt-2 pb-24 space-y-4">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
