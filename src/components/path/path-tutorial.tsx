"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Map,
  ChefHat,
  Sparkles,
  Award,
  Target,
  ImageIcon,
  PartyPopper,
  X,
} from "lucide-react";

const STORAGE_KEY = "sous-path-tutorial-v1";

const STEPS = [
  {
    title: "Welcome to your culinary campus",
    body: "Path is your staged progression from confident home cook toward line-ready technique. Think culinary school stations  -  just sized for real life between work weeks.",
    icon: Map,
  },
  {
    title: "How you level up here",
    body: "Every completed cook feeds XP and unlocks stations on the tree. You are not grinding badges for their own sake  -  you are collecting repeatable skills you can call on at dinner time.",
    icon: ChefHat,
  },
  {
    title: "Your journey strip",
    body: "The cards under the header are your term-at-a-glance: streak heat, what unlocks next, and a weekly kitchen sprint. Glance, tap, and get back to cooking.",
    icon: Sparkles,
  },
  {
    title: "The skill tree is your syllabus",
    body: "Each orb is a module. Hover on desktop for a one-line preview; tap any unlocked node for the full sheet  -  what you’ll actually do at home, then practice dishes and progress.",
    icon: Target,
  },
  {
    title: "Cuisine mastery grid",
    body: "Below the vertical tree, parallel tracks open like concentrations  -  pick a cuisine spine and prove repetition until it feels automatic.",
    icon: ChefHat,
  },
  {
    title: "Badges live in one tap",
    body: "Tap the floating Badges pill anytime. Achievements stay out of your way until you want the dopamine  -  the tree stays the hero.",
    icon: Award,
  },
  {
    title: "Scrapbook = memory + evaluator",
    body: "Scrapbook is where finished plates live. Over time it doubles as a plating and technique journal  -  same archive, dual use  -  so you can see how your eye and hand improve cook to cook.",
    icon: ImageIcon,
  },
  {
    title: "You are on the right trail",
    body: "Keep cooking from Today, return here when you want direction, and let the tree surprise you with what you have already earned. About two minutes well spent  -  now go make something delicious.",
    icon: PartyPopper,
  },
];

interface PathTutorialProps {
  open: boolean;
  onComplete: () => void;
}

export function PathTutorial({ open, onComplete }: PathTutorialProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      setStep(0);
    }, 0);
    return () => clearTimeout(id);
  }, [open]);

  const finish = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "done");
    } catch {
      // ignore
    }
    onComplete();
  }, [onComplete]);

  const next = useCallback(() => {
    if (step >= STEPS.length - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  }, [step, finish]);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, skip]);

  if (!open) return null;

  const current = STEPS[step]!;
  const Icon = current.icon;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-label="Close tutorial"
            onClick={skip}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="path-tutorial-title"
            className="relative z-10 m-3 w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-b from-[#1a2e26] to-[#0f1714] text-white shadow-2xl sm:m-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <div className="absolute right-2 top-2">
              <button
                type="button"
                onClick={skip}
                className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Skip tutorial"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-1 w-full bg-white/10">
              <motion.div
                className="h-full bg-[var(--nourish-gold)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.25 }}
              />
            </div>

            <div className="px-5 pb-5 pt-8 sm:px-6 sm:pb-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Icon
                  className="h-6 w-6 text-[var(--nourish-gold)]"
                  strokeWidth={1.75}
                />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
                Path orientation · Step {step + 1} of {STEPS.length}
              </p>
              <h2
                id="path-tutorial-title"
                className="mt-2 font-serif text-xl font-semibold leading-snug sm:text-2xl"
              >
                {current.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                {current.body}
              </p>
              {step === 0 && (
                <p className="mt-2 text-xs text-white/55">
                  Eight short beats - about two minutes - then you are back to
                  the kitchen.
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={skip}
                  className="text-xs font-semibold text-white/60 underline-offset-4 hover:text-white hover:underline"
                >
                  Skip intro
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#123129] shadow-lg transition hover:bg-white/95"
                >
                  {step >= STEPS.length - 1 ? "Enter Path" : "Next"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
