"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ComponentType, RefObject } from "react";

export function LazySavedRecipesStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const load = useCallback(() => {
    return import("./saved-recipes-strip").then((module) =>
      setComponent(() => module.SavedRecipesStrip),
    );
  }, []);

  useLoadWhenNear(ref, load);

  return (
    <div ref={ref} className={Component ? undefined : "min-h-px"}>
      {Component ? <Component /> : null}
    </div>
  );
}

function useLoadWhenNear(
  ref: RefObject<HTMLElement | null>,
  load: () => Promise<void>,
) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) return;
    const node = ref.current;
    if (!node) return;

    const start = () => {
      setStarted(true);
      void load();
    };

    if (!("IntersectionObserver" in window)) {
      const id = setTimeout(start, 0);
      return () => clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        start();
      },
      { rootMargin: "480px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [load, ref, started]);
}
