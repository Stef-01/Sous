"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { springs } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import SearchDropdown from "./SearchDropdown";
import SparkleEffect from "@/components/ui/SparkleEffect";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (searchQuery?: string) => void;
  disabled?: boolean;
  onSave?: () => void;
  isSaved?: boolean;
  verifiedOnly?: boolean;
  onEvaluate?: () => void;
  currentMealName?: string;
  isEvaluating?: boolean;
  appraisalSentence?: string;
  appraisalTone?: "balanced" | "strong" | "needs-work";
}

export default function SearchInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  onSave,
  isSaved = false,
  verifiedOnly = false,
  onEvaluate,
  currentMealName,
  isEvaluating = false,
  appraisalSentence,
  appraisalTone,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const prefersReduced = useReducedMotion();

  // Determine if the query has been modified from current results
  const queryMatchesMeal =
    currentMealName &&
    value.trim().toLowerCase() === currentMealName.toLowerCase();

  // Show evaluate button when results exist and query hasn't changed
  const showEvaluate = onEvaluate && queryMatchesMeal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      inputRef.current?.focus();
      return;
    }
    onSubmit(value.trim());
  };

  const handleDropdownSelect = (mealName: string) => {
    onChange(mealName);
    setIsFocused(false);
    inputRef.current?.blur();
    onSubmit(mealName);
  };

  // Appraisal tone → subtle color mapping (muted, clinical)
  const appraisalColor =
    appraisalTone === "balanced"
      ? "text-nourish-green"
      : appraisalTone === "needs-work"
        ? "text-amber-600/80"
        : "text-stone-500";

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`w-full mx-auto relative max-w-xl lg:max-w-2xl ${isEvaluating ? "pointer-events-none" : ""}`}
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 15 }}
      animate={
        prefersReduced
          ? { opacity: isEvaluating ? 0 : 1 }
          : { opacity: isEvaluating ? 0 : 1, y: isEvaluating ? -20 : 0 }
      }
      transition={prefersReduced ? { duration: 0.2 } : { ...springs.gentle, delay: 0.15 }}
    >
      <motion.div
        className={`flex items-center gap-2 rounded-full px-2 py-1.5 transition-all duration-500 ${isEvaluating
          ? "bg-transparent border border-transparent shadow-none"
          : "bg-white border border-stone-200 shadow-sm focus-within:border-nourish-button focus-within:ring-1 focus-within:ring-nourish-button/20"
          }`}
        animate={
          prefersReduced
            ? {}
            : { scale: isFocused && !isEvaluating ? 1.015 : 1 }
        }
        transition={springs.snappy}
      >
        <div className="flex-1 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Pizza Margherita..."
            disabled={disabled}
            className="flex-1 px-4 py-2.5 bg-transparent text-nourish-dark placeholder-nourish-subtext/50 text-base outline-none disabled:opacity-50"
            aria-label="Enter a meal name"
            role="combobox"
            aria-expanded={isFocused}
            aria-autocomplete="list"
            aria-controls="search-dropdown"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Share button — hidden during evaluate mode */}
          <AnimatePresence>
            {onSave && !isEvaluating && (
              <motion.div
                key="share-button-wrapper"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.5 }}
              >
                <SparkleEffect count={8}>
                  <button
                    type="button"
                    onClick={onSave}
                    className="p-2.5 rounded-full border border-stone-200 bg-white text-nourish-subtext hover:border-nourish-button hover:text-nourish-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nourish-gold focus-visible:ring-offset-1"
                    aria-label="Share this plate"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </button>
                </SparkleEffect>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main action button — morphs between "Pair my meal" and "Hide Plate" */}
          <SparkleEffect count={12}>
            <motion.button
              type={showEvaluate ? "button" : "submit"}
              onClick={showEvaluate ? onEvaluate : undefined}
              disabled={showEvaluate ? disabled : disabled || !value.trim()}
              className={`px-6 py-2.5 text-white text-sm font-medium rounded-full transition-all duration-300 ease-out disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 whitespace-nowrap ${showEvaluate
                ? "bg-nourish-evaluate hover:bg-nourish-evaluate-hover focus-visible:ring-nourish-evaluate"
                : "bg-nourish-button hover:bg-nourish-button-hover focus-visible:ring-nourish-gold"
                }`}
              whileHover={prefersReduced ? {} : { scale: 1.03 }}
              whileTap={prefersReduced ? {} : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.5 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {showEvaluate ? (
                  <motion.span
                    key={isEvaluating ? "hide-plate-text" : "evaluate-text"}
                    initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="block"
                  >
                    {isEvaluating ? "Hide Plate" : "Evaluate"}
                  </motion.span>
                ) : (
                  <motion.span
                    key="submit-text"
                    initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="block"
                  >
                    Pair my meal
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </SparkleEffect>
        </div>
      </motion.div>
      {!isEvaluating && (
        <SearchDropdown
          query={value}
          onSelect={handleDropdownSelect}
          visible={isFocused && !disabled}
          verifiedOnly={verifiedOnly}
        />
      )}
    </motion.form>
  );
}
