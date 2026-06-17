"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion/tokens";
import {
  cookGlossary,
  glossaryRegexSource,
  lookupTerm,
  type GlossaryEntry,
} from "@/data/cook-glossary";

/**
 * Glossify  -  wraps a string of cook-step instruction text and underlines
 * any term that appears in the curated `cookGlossary`. Tapping or hovering
 * an underlined term reveals a one-line plain-English explanation.
 *
 * Why this exists:
 *   Recipe verbs ("deglaze", "temper", "sweat") are a silent barrier for
 *   anyone who didn't grow up in a cooking-heavy home. The gloss is a
 *   zero-clutter way to teach the language without turning the step into
 *   a textbook  -  the extra detail only appears on demand.
 *
 * Rendering note: returns a fragment of inline <span>s so it can safely be
 * dropped inside a <p> or any flow-content container.
 */

export function Glossify({
  children,
  className,
}: {
  children: string;
  className?: string;
}): ReactNode {
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const parts: ReactNode[] = [];
  const re = new RegExp(glossaryRegexSource, "giu");
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = re.exec(children)) !== null) {
    if (match.index > lastIdx) {
      parts.push(
        <span key={`t-${i}`}>{children.slice(lastIdx, match.index)}</span>,
      );
    }
    const entry = lookupTerm(match[0]);
    if (entry) {
      parts.push(<GlossTerm key={`g-${i}`} entry={entry} raw={match[0]} />);
    } else {
      // Safety net: if the regex matched but the table lookup missed, keep
      // the original text rather than dropping it.
      parts.push(<span key={`t-${i}`}>{match[0]}</span>);
    }
    lastIdx = match.index + match[0].length;
    i++;
  }
  if (lastIdx < children.length) {
    parts.push(<span key="t-end">{children.slice(lastIdx)}</span>);
  }

  if (className) {
    return <span className={className}>{parts}</span>;
  }
  return <>{parts}</>;
}

function GlossTerm({ entry, raw }: { entry: GlossaryEntry; raw: string }) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  return (
    <span
      className="relative inline cursor-help"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
      tabIndex={0}
      role="button"
      aria-expanded={open}
      aria-label={`Show meaning of ${entry.term}`}
    >
      <span className="border-b border-dotted border-[var(--nourish-green)]/70 text-[var(--nourish-dark)]">
        {raw}
      </span>
      <AnimatePresence>
        {open && (
          <motion.span
            role="note"
            initial={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 4, filter: "blur(2px)" }
            }
            animate={
              reducedMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 2, filter: "blur(1px)" }
            }
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 0.18, ease: EASE.out }
            }
            className="absolute left-1/2 top-full z-30 mt-2 block w-[min(80vw,280px)] -translate-x-1/2 rounded-xl bg-white px-3 py-2 text-[13px] font-normal leading-relaxed text-[var(--nourish-dark)] shadow-[var(--shadow-raised)]"
          >
            <span className="mb-0.5 block text-[12px] font-semibold uppercase tracking-wide text-[var(--nourish-green)]">
              {entry.term}
            </span>
            {entry.meaning}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/** Small helper exposed for tests and tooling. */
export function countGlossaryTerms(): number {
  return cookGlossary.length;
}
