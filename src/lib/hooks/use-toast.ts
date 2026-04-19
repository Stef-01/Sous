"use client";

import { useSyncExternalStore } from "react";

/**
 * Unified toast queue.
 *
 * Module-level state so every caller shares one serial queue  -  max one toast
 * visible at a time, next one appears after dismiss or auto-dismiss. Zero
 * prop drilling, survives route transitions.
 */

export type ToastVariant = "achievement" | "level-up" | "success" | "info";

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  body?: string;
  emoji?: string;
  /** ms until auto-dismiss; 0 disables. Defaults to 4200ms. */
  duration?: number;
  /** Optional action button. */
  action?: { label: string; onClick: () => void };
  /** Dedup key  -  if provided, new toasts with the same key replace the queued one. */
  dedupKey?: string;
}

type Listener = () => void;

const listeners = new Set<Listener>();
let queue: Toast[] = [];

function emit() {
  for (const l of listeners) l();
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `t-${Date.now()}-${idCounter}`;
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return queue;
}

function getServerSnapshot(): Toast[] {
  return [];
}

export const toast = {
  push(input: Omit<Toast, "id">): string {
    const id = nextId();
    const next: Toast = { duration: 4200, ...input, id };
    if (next.dedupKey) {
      queue = queue.filter((t) => t.dedupKey !== next.dedupKey);
    }
    queue = [...queue, next];
    emit();
    return id;
  },
  pushMany(inputs: Omit<Toast, "id">[]): void {
    if (inputs.length === 0) return;
    const toAdd: Toast[] = inputs.map((i) => ({
      duration: 4200,
      ...i,
      id: nextId(),
    }));
    const dedupKeys = new Set(
      toAdd.map((t) => t.dedupKey).filter((k): k is string => Boolean(k)),
    );
    if (dedupKeys.size > 0) {
      queue = queue.filter((t) => !t.dedupKey || !dedupKeys.has(t.dedupKey));
    }
    queue = [...queue, ...toAdd];
    emit();
  },
  dismiss(id: string): void {
    const before = queue.length;
    queue = queue.filter((t) => t.id !== id);
    if (queue.length !== before) emit();
  },
  clear(): void {
    if (queue.length === 0) return;
    queue = [];
    emit();
  },
  /** Test-only: read the current queue synchronously. */
  _snapshot(): Toast[] {
    return queue;
  },
};

/** Read the current queue reactively. Returns the ordered queue. */
export function useToastQueue(): Toast[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Read only the head (currently visible toast) reactively. */
export function useActiveToast(): Toast | null {
  const q = useToastQueue();
  return q.length > 0 ? q[0] : null;
}
