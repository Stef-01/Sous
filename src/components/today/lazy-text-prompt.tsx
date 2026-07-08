"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import type { TextPromptProps } from "./text-prompt";

export function LazyTextPrompt(props: TextPromptProps) {
  const [Component, setComponent] =
    useState<ComponentType<TextPromptProps> | null>(null);

  useEffect(() => {
    let mounted = true;
    void import("./text-prompt").then((module) => {
      if (mounted) setComponent(() => module.TextPrompt);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!Component) return <TextPromptSkeleton />;

  return <Component {...props} />;
}

function TextPromptSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="h-4 w-36 rounded shimmer" />
      <div className="h-[52px] rounded-xl shimmer" />
      <div className="flex gap-2">
        <div className="h-8 w-24 rounded-full shimmer" />
        <div className="h-8 w-16 rounded-full shimmer" />
        <div className="h-8 w-28 rounded-full shimmer" />
      </div>
    </div>
  );
}
