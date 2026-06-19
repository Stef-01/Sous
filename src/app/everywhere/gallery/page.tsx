"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ChevronRight, UtensilsCrossed } from "lucide-react";
import mealsData from "@/data/meals.json";
import { gallerySequence } from "@/lib/engine/gallery-sequence";

interface MealRecord {
  id: string;
  name: string;
  cuisine: string;
  heroImageUrl?: string | null;
}
const BY_ID = new Map(
  (mealsData as unknown as MealRecord[]).map((m) => [m.id, m]),
);

function dateSeed(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/**
 * /everywhere/gallery — a full-bleed rotating craving gallery (the desktop-
 * pinnable / cast-able surface from the desire thesis). Cross-fades through
 * `gallerySequence(local clock)`; each frame taps into its guided cook. Under
 * reduced motion it does NOT auto-advance — the user taps Next.
 */
export default function GalleryPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  const seq = useMemo(() => {
    const d = new Date();
    return gallerySequence({
      hour: d.getHours(),
      month: d.getMonth(),
      seed: dateSeed(d),
    });
  }, []);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (reducedMotion || seq.length <= 1) return;
    const t = window.setInterval(
      () => setIdx((i) => (i + 1) % seq.length),
      4500,
    );
    return () => window.clearInterval(t);
  }, [reducedMotion, seq.length]);

  const meal = BY_ID.get(seq[idx]);
  if (!meal) return null;

  const advance = () => setIdx((i) => (i + 1) % seq.length);

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-black">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.button
          key={meal.id}
          type="button"
          onClick={() => router.push(`/cook/${meal.id}`)}
          aria-label={`Cook ${meal.name}`}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.8 }}
          className="absolute inset-0 flex flex-col justify-end text-left"
        >
          {meal.heroImageUrl ? (
            <Image
              src={meal.heroImageUrl}
              alt={meal.name}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--nourish-green) 0%, var(--nourish-light-green) 45%, #a8d8b9 100%)",
              }}
            >
              <UtensilsCrossed
                size={56}
                className="text-white/80"
                strokeWidth={1.2}
              />
            </div>
          )}
          {/* Caption scrim */}
          <div className="relative bg-gradient-to-t from-black/85 via-black/35 to-transparent px-6 pb-28 pt-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
              Tonight you&rsquo;re making
            </p>
            <p className="mt-1 font-serif text-3xl leading-tight text-white">
              {meal.name}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm">
              Tap to cook
              <ChevronRight size={14} />
            </span>
          </div>
        </motion.button>
      </AnimatePresence>

      {/* Back */}
      <button
        type="button"
        onClick={() => router.push("/everywhere")}
        aria-label="Back"
        className="absolute left-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Progress dots + manual advance (the only way forward under reduced
          motion). */}
      <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-3 px-6">
        <div className="flex flex-1 flex-wrap items-center gap-1">
          {seq.slice(0, 12).map((s, i) => (
            <span
              key={s}
              aria-hidden
              className={
                i === idx
                  ? "h-1.5 w-4 rounded-full bg-white"
                  : "h-1.5 w-1.5 rounded-full bg-white/40"
              }
            />
          ))}
        </div>
        <button
          type="button"
          onClick={advance}
          aria-label="Next dish"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
