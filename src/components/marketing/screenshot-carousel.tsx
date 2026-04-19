"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { easeOutExpo, viewportOnce } from "./startup-landing-variants";

/**
 * ScreenshotCarousel  -  horizontal-scroll row of captioned "product moments".
 *
 * We don't have a fleet of polished app screenshots, and rendering real app
 * UI inside every tile would turn the page into a component graveyard. So:
 * each slide is a real food photo (from /food_images) + a dish-name caption
 * + a one-line product moment. The row communicates rhythm and texture,
 * not exact screen layouts  -  the AppPreviewSection above already does that.
 */

interface Slide {
  src: string;
  alt: string;
  dish: string;
  moment: string;
  tone: "warm" | "cool" | "bright";
}

const SLIDES: Slide[] = [
  {
    src: "/food_images/pizza_margherita.png",
    alt: "Pizza margherita, blistered edges",
    dish: "Margherita, tonight",
    moment: "A craving becomes the short list in about four seconds.",
    tone: "warm",
  },
  {
    src: "/food_images/pasta_carbonara.png",
    alt: "Carbonara with black pepper",
    dish: "Carbonara, rerun",
    moment: "Repeat the last hit without opening a recipe.",
    tone: "bright",
  },
  {
    src: "/food_images/butter_chicken.png",
    alt: "Butter chicken in a copper pan",
    dish: "Butter chicken, wound down",
    moment: "The Path remembers the sauce family, not just the dish.",
    tone: "warm",
  },
  {
    src: "/food_images/pad_thai.png",
    alt: "Pad thai with lime",
    dish: "Pad thai, fast night",
    moment: "Under-20-minute filter is one tap, then forgotten.",
    tone: "bright",
  },
  {
    src: "/food_images/chicken_tikka_masala.png",
    alt: "Chicken tikka masala",
    dish: "Tikka masala, second time",
    moment: "The coach gets quieter each time you cook the same thing.",
    tone: "cool",
  },
  {
    src: "/food_images/bibimbap.png",
    alt: "Bibimbap bowl with egg yolk",
    dish: "Bibimbap, Sunday",
    moment: "Bowls find their own slot without a planner.",
    tone: "warm",
  },
];

export function ScreenshotCarousel() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-slide]");
    const step = (card?.offsetWidth ?? 280) + 20;
    el.scrollBy({
      left: dir * step,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <section
      aria-label="A week of cooks"
      className="scroll-mt-[80px] px-0 py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1160px] px-6 md:px-10">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-[42ch]">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#9aa0a6]">
              A week of cooks
            </p>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.7, ease: easeOutExpo }}
              className="mt-4 font-serif text-[32px] leading-[1.08] tracking-tight text-[#0d0d0d] md:text-[44px]"
            >
              Real dinners,
              <span className="italic text-[#2d5a3d]"> not stock photos</span>.
            </motion.h2>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <CarouselButton label="Scroll left" onClick={() => scrollBy(-1)}>
              <ChevronLeft size={16} strokeWidth={1.8} />
            </CarouselButton>
            <CarouselButton label="Scroll right" onClick={() => scrollBy(1)}>
              <ChevronRight size={16} strokeWidth={1.8} />
            </CarouselButton>
          </div>
        </div>
      </div>

      {/* Scroller extends to the viewport edge for a magazine-style bleed. */}
      <div
        ref={scrollerRef}
        className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-6 pb-4 md:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          className="shrink-0 md:w-[calc((100vw-1160px)/2-40px)]"
          aria-hidden
        />
        {SLIDES.map((slide, i) => (
          <motion.article
            key={slide.src}
            data-slide
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{
              duration: 0.7,
              ease: easeOutExpo,
              delay: Math.min(i * 0.05, 0.25),
            }}
            className="group relative flex w-[78vw] max-w-[320px] shrink-0 snap-start flex-col overflow-hidden rounded-[20px] border border-[#eceef2] bg-white shadow-[0_12px_28px_-18px_rgba(13,13,13,0.25)]"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="(min-width: 768px) 320px, 78vw"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
              />
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-0 ${toneOverlay(slide.tone)}`}
              />
            </div>
            <div className="px-5 pb-5 pt-4">
              <p className="font-serif text-[20px] leading-tight text-[#0d0d0d]">
                {slide.dish}
              </p>
              <p className="mt-2 text-[13px] leading-[1.6] text-[#4b5563]">
                {slide.moment}
              </p>
            </div>
          </motion.article>
        ))}
        <div
          className="w-6 shrink-0 md:w-[calc((100vw-1160px)/2-40px)]"
          aria-hidden
        />
      </div>
    </section>
  );
}

function toneOverlay(tone: Slide["tone"]) {
  if (tone === "warm")
    return "bg-gradient-to-t from-black/10 via-transparent to-transparent";
  if (tone === "cool")
    return "bg-gradient-to-t from-black/12 via-transparent to-transparent";
  return "bg-gradient-to-t from-black/8 via-transparent to-transparent";
}

function CarouselButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e4e6eb] bg-white text-[#1a1a1a] transition-all hover:border-[#2d5a3d]/40 hover:text-[#2d5a3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d5a3d] focus-visible:ring-offset-2"
    >
      {children}
    </button>
  );
}
