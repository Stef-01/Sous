"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  type PanInfo,
} from "framer-motion";
import { Clock, ShoppingBag, X, Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface QuestDish {
  dishName: string;
  slug: string;
  heroImageUrl: string;
  cookTimeMinutes: number;
  cuisineFamily: string;
  description: string;
  tags: string[];
}

// Curated quest dishes — diverse, visually appealing, from the seed database
const QUEST_DISHES: QuestDish[] = [
  {
    dishName: "Tabbouleh",
    slug: "tabbouleh",
    heroImageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
    cookTimeMinutes: 25,
    cuisineFamily: "Mediterranean",
    description: "A vibrant herb salad with bulgur wheat, fresh parsley, mint, and lemon.",
    tags: ["Fresh", "Herby", "Light"],
  },
  {
    dishName: "Gyoza",
    slug: "gyoza",
    heroImageUrl:
      "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&auto=format&fit=crop&q=80",
    cookTimeMinutes: 25,
    cuisineFamily: "Japanese",
    description: "Pan-fried dumplings with a crispy golden bottom and savory pork filling.",
    tags: ["Crispy", "Savory", "Umami"],
  },
  {
    dishName: "Bruschetta",
    slug: "bruschetta",
    heroImageUrl:
      "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&auto=format&fit=crop&q=80",
    cookTimeMinutes: 20,
    cuisineFamily: "Italian",
    description: "Toasted ciabatta with diced tomatoes, basil, garlic, and balsamic glaze.",
    tags: ["Bright", "Classic", "Quick"],
  },
  {
    dishName: "Samosa",
    slug: "samosa",
    heroImageUrl:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
    cookTimeMinutes: 30,
    cuisineFamily: "Indian",
    description: "Crispy pastry triangles stuffed with spiced potatoes, peas, and aromatic herbs.",
    tags: ["Spiced", "Crispy", "Comforting"],
  },
  {
    dishName: "Spring Rolls",
    slug: "spring-rolls",
    heroImageUrl:
      "https://images.unsplash.com/photo-1536304993881-460e32f50f37?w=600&auto=format&fit=crop&q=80",
    cookTimeMinutes: 25,
    cuisineFamily: "Thai",
    description: "Golden crispy rolls filled with vegetables and glass noodles.",
    tags: ["Crispy", "Light", "Fresh"],
  },
];

const SWIPE_THRESHOLD = 80;

/**
 * QuestCard — swipeable Tinder-style card stack.
 * Users swipe right to cook a dish, left to skip to the next.
 * X button in top-right to dismiss, heart + "Start cooking" inside card.
 * No counter — infinite wrapping through recommendations.
 */
export function QuestCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const router = useRouter();

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (direction === "right") {
        // Swipe right = "Cook this" → navigate to guided cook
        const dish = QUEST_DISHES[currentIndex];
        setExitDirection("right");
        setTimeout(() => {
          router.push(`/cook/${dish.slug}`);
        }, 300);
      } else {
        // Swipe left = skip to next
        setExitDirection("left");
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % QUEST_DISHES.length);
          setExitDirection(null);
        }, 250);
      }
    },
    [currentIndex, router]
  );

  const handleStart = useCallback(() => {
    handleSwipe("right");
  }, [handleSwipe]);

  const handleSkip = useCallback(() => {
    handleSwipe("left");
  }, [handleSwipe]);

  const handleSave = useCallback(() => {
    // Save for later — show toast, will be stored in Path scrapbook
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);
  }, []);

  // Show up to 3 stacked cards
  const visibleCards = [];
  for (let i = 0; i < 3; i++) {
    const idx = (currentIndex + i) % QUEST_DISHES.length;
    visibleCards.push({ ...QUEST_DISHES[idx], stackIndex: i });
  }

  return (
    <div className="space-y-1.5">
      {/* Section header — no counter */}
      <div className="px-1">
        <h2 className="text-xs font-semibold text-[var(--nourish-subtext)] uppercase tracking-wide">
          Today&apos;s Quest
        </h2>
      </div>

      {/* Card stack container */}
      <div className="relative" style={{ height: 380 }}>
        <AnimatePresence mode="popLayout">
          {visibleCards
            .slice()
            .reverse()
            .map((dish) => (
              <SwipeCard
                key={`${dish.slug}-${currentIndex}-${dish.stackIndex}`}
                dish={dish}
                stackIndex={dish.stackIndex}
                isTop={dish.stackIndex === 0}
                onSwipe={handleSwipe}
                onStart={handleStart}
                onSkip={handleSkip}
                onSave={handleSave}
                exitDirection={dish.stackIndex === 0 ? exitDirection : null}
              />
            ))}
        </AnimatePresence>

        {/* Saved for later toast */}
        <AnimatePresence>
          {savedToast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[var(--nourish-dark)] px-4 py-2 shadow-lg"
            >
              <span className="text-xs font-medium text-white flex items-center gap-1.5">
                <Heart size={12} className="fill-current" />
                Saved for later
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Individual swipe card with drag interaction and stack positioning.
 * X dismiss button in top-right, heart + Start cooking inside card bottom.
 */
function SwipeCard({
  dish,
  stackIndex,
  isTop,
  onSwipe,
  onStart,
  onSkip,
  onSave,
  exitDirection,
}: {
  dish: QuestDish & { stackIndex: number };
  stackIndex: number;
  isTop: boolean;
  onSwipe: (direction: "left" | "right") => void;
  onStart: () => void;
  onSkip: () => void;
  onSave: () => void;
  exitDirection: "left" | "right" | null;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.8, 1, 0.8, 0.5]);

  // Swipe indicator overlays
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  // Stack positioning: scale down and shift back for deeper cards
  const scale = 1 - stackIndex * 0.04;
  const translateY = stackIndex * 10;

  return (
    <motion.div
      className="absolute inset-x-0 top-0"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        zIndex: 10 - stackIndex,
      }}
      initial={{
        scale: scale - 0.02,
        y: translateY + 8,
        opacity: stackIndex === 0 ? 0 : 1,
      }}
      animate={{
        scale,
        y: translateY,
        opacity: 1,
      }}
      exit={{
        x: exitDirection === "right" ? 300 : exitDirection === "left" ? -300 : 0,
        rotate: exitDirection === "right" ? 20 : exitDirection === "left" ? -20 : 0,
        opacity: 0,
        transition: { duration: 0.25, ease: "easeIn" },
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm",
          isTop && "cursor-grab active:cursor-grabbing shadow-md"
        )}
      >
        {/* Swipe feedback overlays — only on top card */}
        {isTop && (
          <>
            <motion.div
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-[var(--nourish-green)]/8"
              style={{ opacity: likeOpacity }}
            >
              <span className="rounded-xl border-2 border-[var(--nourish-green)] bg-white/80 backdrop-blur-sm px-5 py-2 text-lg font-bold text-[var(--nourish-green)] -rotate-12 tracking-wide shadow-sm">
                COOK!
              </span>
            </motion.div>
            <motion.div
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-red-500/8"
              style={{ opacity: nopeOpacity }}
            >
              <span className="rounded-xl border-2 border-red-400 bg-white/80 backdrop-blur-sm px-5 py-2 text-lg font-bold text-red-500 rotate-12 tracking-wide shadow-sm">
                SKIP
              </span>
            </motion.div>
          </>
        )}

        {/* Hero food image */}
        <div className="relative">
          <img
            src={dish.heroImageUrl}
            alt={dish.dishName}
            className="w-full aspect-[3/2] object-cover"
            draggable={false}
          />
          {/* Bottom gradient for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/15 to-transparent" />
          {/* Cuisine badge — top left */}
          <div className="absolute top-2.5 left-2.5">
            <span className="rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold text-[var(--nourish-dark)] shadow-sm tracking-wide uppercase">
              {dish.cuisineFamily}
            </span>
          </div>
          {/* Skip (X) button — top right */}
          {isTop && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSkip();
              }}
              className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm text-white/90 transition-all hover:bg-black/40 active:scale-90"
              type="button"
              aria-label="Skip dish"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dish info */}
        <div className="px-4 pt-2.5 pb-1.5 space-y-1">
          <h3 className="font-serif text-base font-bold text-[var(--nourish-dark)]">
            {dish.dishName}
          </h3>
          <div className="flex items-center gap-3 text-[11px] text-[var(--nourish-subtext)]">
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-[var(--nourish-green)]" />
              {dish.cookTimeMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <ShoppingBag size={13} className="text-[var(--nourish-green)]" />
              {((dish.cookTimeMinutes % 4) + 3)} of {((dish.cookTimeMinutes % 3) + 6)} ingredients
            </span>
          </div>
          {/* Flavor tags */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {dish.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--nourish-green)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--nourish-green)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action row — heart save + Start cooking */}
        <div className="flex items-center gap-2.5 px-4 pb-3.5 pt-1">
          {/* Save for later — heart button with tooltip */}
          <div className="group relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                "border border-neutral-200/80 bg-neutral-50 text-neutral-400",
                "transition-all duration-200",
                "hover:border-pink-200 hover:text-pink-500 hover:bg-pink-50",
                "active:scale-90"
              )}
              type="button"
              aria-label="Save for later"
            >
              <Heart size={17} />
            </button>
            {/* Hover tooltip */}
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <div className="whitespace-nowrap rounded-md bg-[var(--nourish-dark)] px-2 py-0.5 text-[9px] font-medium text-white shadow-lg">
                Save for later
              </div>
              <div className="mx-auto h-1.5 w-1.5 -mt-0.5 rotate-45 bg-[var(--nourish-dark)]" />
            </div>
          </div>

          {/* Start cooking — primary CTA */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            className={cn(
              "flex-1 rounded-xl py-2.5 text-[13px] font-semibold text-white tracking-wide",
              "bg-[var(--nourish-green)] hover:bg-[var(--nourish-dark-green)]",
              "shadow-sm shadow-[var(--nourish-green)]/20",
              "transition-all duration-200 active:scale-[0.98]"
            )}
            type="button"
          >
            Start cooking
          </button>
        </div>
      </div>
    </motion.div>
  );
}
