"use client";

import { type ReactNode } from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";

interface SearchPopoutProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Search Popout — bottom-sheet for the craving search flow.
 *
 * RCA fix (2026-05-04): the prior hand-rolled framer-motion sheet
 * left the iOS keyboard covering the input + had a z-index race
 * with the bottom tab bar. Replaced with `vaul` (Emil Kowalski's
 * Radix-based drawer), which wraps the Visual Viewport API for
 * keyboard awareness, repositions inputs above the keyboard
 * (`repositionInputs={true}`), and renders at the right
 * stacking level (z-[60] — the project convention for sheets).
 *
 * The container handles scroll for us; the children are placed
 * in a max-height-bounded `<Drawer.Content>` that grows up to
 * 90dvh (dynamic viewport — collapses cleanly when the keyboard
 * is visible).
 */
export function SearchPopout({ isOpen, onClose, children }: SearchPopoutProps) {
  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      repositionInputs
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[59] bg-black/30 backdrop-blur-[2px]" />
        <Drawer.Content
          aria-label="Search for a dish"
          className="fixed inset-x-0 bottom-0 z-[60] mx-auto flex h-auto max-h-[90dvh] max-w-md flex-col rounded-t-2xl bg-white shadow-2xl outline-none"
        >
          {/* Drag handle + title — sticky header so the close
              button is always reachable. */}
          <div className="flex-shrink-0 rounded-t-2xl bg-white px-4 pt-3 pb-2">
            <div
              aria-hidden
              className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-300"
            />
            <div className="flex items-center justify-between">
              <Drawer.Title className="font-serif text-lg font-bold text-[var(--nourish-dark)]">
                What are you craving?
              </Drawer.Title>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="rounded-lg p-2.5 text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)] active:scale-90 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <Drawer.Description className="sr-only">
              Type or pick a craving suggestion to find a recipe.
            </Drawer.Description>
          </div>

          {/* Scrollable content area. pb-8 + safe-area inset
              clears the iOS home indicator without overpadding
              when the keyboard is visible. */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div
              className="mx-auto max-w-md px-4 pt-2 space-y-4"
              style={{
                paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
              }}
            >
              {children}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
