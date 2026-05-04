"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Search, ChefHat } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { ResultStack, type SideResult } from "@/components/today/result-stack";

export default function SidesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-[var(--nourish-cream)]">
          <header className="app-header px-4 py-3">
            <div className="mx-auto flex max-w-md items-center gap-3">
              <div className="h-9 w-9 rounded-xl shimmer" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-16 rounded shimmer" />
                <div className="h-4 w-32 rounded shimmer" />
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-md px-4 pt-4 space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3"
              >
                <div className="h-14 w-14 shrink-0 rounded-lg shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-24 rounded shimmer" />
                  <div className="h-2.5 w-36 rounded shimmer" />
                </div>
              </div>
            ))}
          </main>
        </div>
      }
    >
      <SidesPageContent />
    </Suspense>
  );
}

function SidesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mainDish = searchParams.get("main") ?? "";
  const mainImg = searchParams.get("img") ?? null;
  const [rerollSeed, setRerollSeed] = useState(0);
  const [preferences, setPreferences] = useState<Record<string, number>>();
  const [effortTolerance, setEffortTolerance] = useState<
    "minimal" | "moderate" | "willing" | undefined
  >();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const prefs = localStorage.getItem("sous-preferences");
        if (prefs) setPreferences(JSON.parse(prefs));
        const effort = localStorage.getItem("sous-effort-tolerance");
        if (
          effort === "minimal" ||
          effort === "moderate" ||
          effort === "willing"
        )
          setEffortTolerance(effort);
      } catch {
        /* empty */
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const pairingQuery = trpc.pairing.suggest.useQuery(
    {
      mainDish,
      inputMode: "text",
      _rerollSeed: rerollSeed || undefined,
      userPreferences: preferences,
      effortTolerance,
    },
    { enabled: !!mainDish },
  );

  const handleReroll = useCallback(() => {
    setRerollSeed(Date.now());
  }, []);

  const handleCookThis = useCallback(
    (side: SideResult) => {
      const mainParam = mainDish ? `?main=${encodeURIComponent(mainDish)}` : "";
      router.push(`/cook/${side.slug}${mainParam}`);
    },
    [router, mainDish],
  );

  const handleCookSelected = useCallback(
    (sides: SideResult[]) => {
      if (sides.length === 0) return;
      if (sides.length === 1) {
        handleCookThis(sides[0]);
        return;
      }
      const queryData = pairingQuery.data;
      const mealSlug =
        queryData && "resolvedMealSlug" in queryData
          ? (queryData.resolvedMealSlug as string | null)
          : null;
      const guidedSides = sides.filter((s) => !!s.hasGuidedCook);
      if (guidedSides.length >= 2) {
        const sideSlugs = guidedSides.map((s) => s.slug).join(",");
        router.push(
          mealSlug
            ? `/cook/combined?main=${encodeURIComponent(mealSlug)}&sides=${encodeURIComponent(sideSlugs)}`
            : `/cook/combined?sides=${encodeURIComponent(sideSlugs)}`,
        );
      } else if (mealSlug && guidedSides.length >= 1) {
        const sideSlugs = guidedSides.map((s) => s.slug).join(",");
        router.push(
          `/cook/combined?main=${encodeURIComponent(mealSlug)}&sides=${encodeURIComponent(sideSlugs)}`,
        );
      } else {
        handleCookThis(guidedSides[0] ?? sides[0]);
      }
    },
    [handleCookThis, pairingQuery.data, router],
  );

  // Navigating during render causes "Cannot update during rendering" warnings;
  // punt to an effect instead. See AUDIT-2026-04-17 P1-7.
  useEffect(() => {
    if (!mainDish) router.replace("/today");
  }, [mainDish, router]);

  if (!mainDish) return null;

  const isLoading = pairingQuery.isLoading || pairingQuery.isFetching;

  return (
    <motion.div
      className="min-h-dvh bg-[var(--nourish-cream)] pb-8"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
    >
      {/* Header with main dish thumbnail */}
      <header className="app-header px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <motion.button
            type="button"
            onClick={() => router.back()}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </motion.button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-serif text-xl font-semibold text-[var(--nourish-dark)]">
              {mainDish}
            </h1>
          </div>
          {mainImg && !imgError ? (
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl">
              <Image
                src={mainImg}
                alt={mainDish}
                fill
                sizes="36px"
                className="object-cover"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--nourish-green)]/10">
              <ChefHat size={18} className="text-[var(--nourish-green)]" />
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-4">
        {/* Loading state */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-4 pt-2"
          >
            <p className="text-center text-sm text-[var(--nourish-subtext)]">
              Finding the best sides for {mainDish}...
            </p>
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3"
                >
                  <div className="h-14 w-14 shrink-0 rounded-lg shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-24 rounded shimmer" />
                    <div className="h-2.5 w-36 rounded shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* No results */}
        {!isLoading &&
          pairingQuery.data?.success &&
          pairingQuery.data.sides.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="rounded-xl border border-neutral-100 bg-white p-6 text-center space-y-3"
            >
              <Search
                size={28}
                className="mx-auto text-[var(--nourish-subtext)]"
              />
              <p className="text-sm font-semibold text-[var(--nourish-dark)]">
                No matching sides found
              </p>
              <p className="text-xs text-[var(--nourish-subtext)]">
                Try going back and picking a different main dish.
              </p>
            </motion.div>
          )}

        {/* Results */}
        {!isLoading &&
          pairingQuery.data?.success &&
          pairingQuery.data.sides.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 25,
                delay: 0.05,
              }}
            >
              <ResultStack
                mainDish={mainDish}
                sides={pairingQuery.data.sides}
                onCookThis={handleCookThis}
                onCookSelected={handleCookSelected}
                onReroll={handleReroll}
                isRerolling={pairingQuery.isFetching}
              />
            </motion.div>
          )}

        {/* Engine returned success: false */}
        {!isLoading && pairingQuery.data && !pairingQuery.data.success && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-center space-y-2"
          >
            <p className="text-sm text-amber-700">
              {pairingQuery.data.error ??
                "Couldn\u2019t find sides for that dish. Try a different one."}
            </p>
            <button
              onClick={() => router.back()}
              className="text-xs font-medium text-[var(--nourish-green)] hover:underline"
              type="button"
            >
              Go back
            </button>
          </motion.div>
        )}

        {/* Error */}
        {pairingQuery.error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-100 bg-red-50 p-4 text-center space-y-2"
          >
            <p className="text-sm text-red-600">
              Something went wrong finding sides. Please try again.
            </p>
            <button
              onClick={handleReroll}
              className="text-xs font-medium text-[var(--nourish-green)] hover:underline"
              type="button"
            >
              Try again
            </button>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}
