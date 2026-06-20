"use client";

/**
 * TodayContentCard — a quiet doorway to the Content magazine on the Today page,
 * featuring the lead article. Surfaces "the content that was there before"
 * without leaving Today. One labeled card → /community/article/<slug> (rule 13:
 * a button with a label, not a paragraph). Subordinate to the meal hero.
 */
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";
import { ARTICLES } from "@/data/content";

export function TodayContentCard() {
  const reduce = useReducedMotion();
  const article = ARTICLES[0];
  if (!article) return null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link
        href={`/community/article/${article.slug}`}
        className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[var(--shadow-card)] transition hover:bg-neutral-50 active:scale-[0.99]"
        aria-label={`Read: ${article.title}`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--nourish-green)]/10 text-[var(--nourish-green)]">
          <BookOpen size={17} strokeWidth={1.9} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="sous-label">Read</span>
          <span className="block truncate text-[13.5px] font-semibold text-[var(--nourish-dark)]">
            {article.title}
          </span>
        </span>
        {typeof article.readMinutes === "number" && (
          <span className="shrink-0 text-[11px] tabular-nums text-[var(--nourish-subtext-faint)]">
            {article.readMinutes} min
          </span>
        )}
        <ChevronRight
          size={16}
          className="shrink-0 text-[var(--nourish-subtext-faint)]"
          aria-hidden
        />
      </Link>
    </motion.div>
  );
}
