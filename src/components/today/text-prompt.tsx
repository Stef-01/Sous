"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Camera } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TextPromptProps {
  onSubmit: (text: string) => void;
  onCameraClick: () => void;
  isLoading: boolean;
  suggestions?: string[];
}

export function TextPrompt({
  onSubmit,
  onCameraClick,
  isLoading,
  suggestions = ["Roast chicken", "Butter chicken", "Fish tacos", "Pad thai"],
}: TextPromptProps) {
  const [text, setText] = useState("");

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (trimmed && !isLoading) {
      onSubmit(trimmed);
    }
  }, [text, isLoading, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[var(--nourish-subtext)]">
        What&apos;s on your plate?
      </label>

      <div className="relative">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Roast chicken, gyros, pizza..."
          disabled={isLoading}
          className={cn(
            "w-full rounded-xl border border-neutral-200 bg-[var(--nourish-input-bg)] px-4 py-3.5 pr-24 text-base",
            "placeholder:text-[var(--nourish-subtext)]/60",
            "focus:outline-none focus:ring-2 focus:ring-[var(--nourish-green)]/30 focus:border-[var(--nourish-green)]",
            "disabled:opacity-50",
            "transition-all duration-200",
          )}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <button
            onClick={onCameraClick}
            className="rounded-lg p-2 text-[var(--nourish-subtext)] hover:bg-neutral-200/60 transition-colors"
            aria-label="Take a photo"
            type="button"
          >
            <Camera size={18} />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            className={cn(
              "rounded-lg p-2 transition-all duration-200",
              text.trim() && !isLoading
                ? "bg-[var(--nourish-green)] text-white hover:bg-[var(--nourish-dark-green)]"
                : "text-[var(--nourish-subtext)]/40 cursor-not-allowed",
            )}
            aria-label="Search"
            type="button"
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Suggestion chips */}
      {!text && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setText(suggestion);
                onSubmit(suggestion);
              }}
              className={cn(
                "rounded-full border border-neutral-200 px-3 py-1.5 text-sm",
                "text-[var(--nourish-subtext)] hover:border-[var(--nourish-green)] hover:text-[var(--nourish-green)]",
                "transition-colors duration-150",
              )}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
