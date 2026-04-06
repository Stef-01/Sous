"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Meal } from "@/types";
import { searchMeals } from "@/lib/fuzzySearch";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SearchDropdownProps {
  query: string;
  onSelect: (mealName: string) => void;
  visible: boolean;
  verifiedOnly?: boolean;
}

export default function SearchDropdown({
  query,
  onSelect,
  visible,
  verifiedOnly = false,
}: SearchDropdownProps) {
  const [results, setResults] = useState<Meal[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const prefersReduced = useReducedMotion();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  /* eslint-disable react-hooks/set-state-in-effect -- debounced search results from external fuzzy search */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setHighlightIndex(-1);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const matches = searchMeals(query, 4, verifiedOnly);
      setResults(matches);
      setHighlightIndex(-1);
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, verifiedOnly]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!visible || results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === "Enter" && highlightIndex >= 0) {
        e.preventDefault();
        onSelect(results[highlightIndex].name);
      } else if (e.key === "Escape") {
        setResults([]);
        setHighlightIndex(-1);
      }
    },
    [visible, results, highlightIndex, onSelect],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const showDropdown = visible && results.length > 0;

  return (
    <AnimatePresence>
      {showDropdown && (
        <motion.div
          className="absolute left-0 right-0 top-full mt-1 z-50"
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
          animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          <ul
            ref={listRef}
            className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden"
            role="listbox"
            aria-label="Search suggestions"
          >
            {results.map((meal, i) => (
              <li
                key={meal.id}
                role="option"
                aria-selected={i === highlightIndex}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  i === highlightIndex
                    ? "bg-nourish-green/5"
                    : "hover:bg-gray-50"
                } ${i < results.length - 1 ? "border-b border-gray-100" : ""}`}
                onMouseEnter={() => setHighlightIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent blur before click
                  onSelect(meal.name);
                }}
              >
                <span className="font-serif text-sm text-nourish-dark">
                  {meal.name}
                </span>
                <span className="ml-auto px-2 py-0.5 text-[11px] font-medium bg-nourish-gold/15 text-nourish-dark rounded-full">
                  {meal.cuisine}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
