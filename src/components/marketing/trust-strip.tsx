"use client";

import { motion, useReducedMotion } from "framer-motion";
import { easeOutExpo, viewportOnce } from "./startup-landing-variants";

/**
 * TrustStrip  -  the quiet "ground truth" row near the bottom of the landing.
 *
 * Visual vocabulary: a single horizontal rule of dotted separators between
 * four tiny, typographic claims. No badges, no stars, no logos  -  the
 * medium is the claim. A single italicized Stanford line continues to
 * carry the health credibility, sitting above the strip.
 */
export function TrustStrip() {
  const reducedMotion = useReducedMotion();
  return (
    <section className="px-6 py-24 md:px-10 md:py-28">
      <div className="mx-auto max-w-[880px] text-center">
        <motion.p
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{
            duration: reducedMotion ? 0 : 0.7,
            ease: easeOutExpo,
          }}
          className="font-serif text-[22px] leading-[1.5] text-[#4b5563] md:text-[26px]"
        >
          Nutrition notes are reviewed with{" "}
          <span className="text-[#0d0d0d]">Stanford Medicine-affiliated</span>{" "}
          clinicians, not influencer guesswork, layered in from the start.
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.08, delayChildren: 0.15 },
            },
          }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[12px] uppercase tracking-[0.18em] text-[#6b6b6b]"
        >
          <TrustItem>No logins to try it</TrustItem>
          <TrustDot />
          <TrustItem>No ads, ever</TrustItem>
          <TrustDot />
          <TrustItem>
            Your cooks stay <span className="text-[#1a1a1a]">on-device</span>
          </TrustItem>
          <TrustDot />
          <TrustItem>Under 10s to a first pairing</TrustItem>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.4 }}
          className="mt-10 text-[12px] italic leading-[1.7] text-[#9aa0a6]"
        >
          The demo runs as-is. Email and friends sync arrive when you ask for
          them, not a moment sooner.
        </motion.p>
      </div>
    </section>
  );
}

function TrustItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: easeOutExpo },
        },
      }}
      className="inline-flex items-center whitespace-nowrap"
    >
      {children}
    </motion.span>
  );
}

function TrustDot() {
  return (
    <span
      aria-hidden
      className="inline-block h-1 w-1 rounded-full bg-[#c9ccd1]"
    />
  );
}
