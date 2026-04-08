"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface SearchPopoutProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Search Popout — bottom-sheet modal containing the search/pairing flow.
 * Triggered by clicking the bird mascot's "I'm craving..." speech bubble.
 * Contains the existing TextPrompt, ResultStack, CameraInput, etc.
 *
 * Note: backdrop and sheet are rendered as separate AnimatePresence children
 * (not inside a Fragment) so exit animations fire correctly for both.
 */
export function SearchPopout({ isOpen, onClose, children }: SearchPopoutProps) {
  return (
    <>
      {/* Backdrop — separate AnimatePresence so it exits independently */}
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

      {/* Bottom sheet — separate AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="search-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50
                       rounded-t-2xl bg-white shadow-2xl
                       max-h-[85vh] overflow-y-auto"
          >
            {/* Handle + close */}
            <div className="sticky top-0 z-10 bg-white rounded-t-2xl px-4 pt-3 pb-2">
              {/* Drag handle */}
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-300" />

              {/* Close button — plain button avoids Framer Motion gesture interference on mobile */}
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

            {/* Search flow content */}
            <div className="mx-auto max-w-md px-4 pb-8 pt-2 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
