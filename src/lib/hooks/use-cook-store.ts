import { create } from "zustand";

type Phase = "mission" | "grab" | "cook" | "win";
type ChipType = "timer" | "mistake" | "hack" | "fact" | null;

/** A dish entry in a combined cook session. */
export interface CookDishEntry {
  slug: string;
  name: string;
  totalSteps: number;
}

/** A single kitchen timer entry. The store can hold several concurrently so
 *  that a user can run "rice 4 min" and "curry 9 min" in parallel lanes. */
export interface TimerEntry {
  id: string;
  label: string;
  totalSeconds: number;
  remaining: number;
  startedAt: number;
  /** Set once `remaining` hits 0. Kept briefly so the UI can flash "Done!". */
  completedAt: number | null;
}

/** How long a finished timer stays in the array before auto-pruning. */
export const COMPLETED_TIMER_LINGER_MS = 1800;

interface CookStore {
  sessionId: string | null;
  currentPhase: Phase;
  currentStepIndex: number;
  totalSteps: number;
  expandedChip: ChipType;
  timers: TimerEntry[];

  // Combined cook mode
  cookMode: "single" | "combined";
  dishes: CookDishEntry[];
  currentDishIndex: number;

  // actions
  startCombinedSession: (dishes: CookDishEntry[]) => void;
  setPhase: (phase: Phase) => void;
  setTotalSteps: (total: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  nextDish: () => boolean; // returns true if there's another dish, false if all done
  toggleChip: (chip: ChipType) => void;
  /** Add a new timer. Label helps the user identify which dish/step it belongs
   *  to when multiple timers are running. If a timer with the same label is
   *  already active (dedupe), the call is a no-op. */
  startTimer: (seconds: number, label?: string) => void;
  /** Decrement every active timer by one second and prune completed timers
   *  whose linger window has elapsed. */
  tickTimers: () => void;
  /** Stop a specific timer by id, or all timers if no id is given. */
  stopTimer: (id?: string) => void;
  completeSession: () => void;
  reset: () => void;
}

const initialState = {
  sessionId: null as string | null,
  currentPhase: "mission" as Phase,
  currentStepIndex: 0,
  totalSteps: 0,
  expandedChip: null as ChipType,
  timers: [] as TimerEntry[],
  cookMode: "single" as "single" | "combined",
  dishes: [] as CookDishEntry[],
  currentDishIndex: 0,
};

function nextTimerId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useCookStore = create<CookStore>((set, get) => ({
  ...initialState,

  startCombinedSession: (dishes) =>
    set({
      ...initialState,
      cookMode: "combined",
      dishes,
      currentDishIndex: 0,
      totalSteps: dishes[0]?.totalSteps ?? 0,
    }),

  setPhase: (phase) => set({ currentPhase: phase, expandedChip: null }),

  setTotalSteps: (total) => set({ totalSteps: total }),

  nextStep: () => {
    const { currentStepIndex, totalSteps } = get();
    if (currentStepIndex < totalSteps - 1) {
      set({ currentStepIndex: currentStepIndex + 1, expandedChip: null });
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1, expandedChip: null });
    }
  },

  nextDish: () => {
    const { currentDishIndex, dishes } = get();
    if (currentDishIndex < dishes.length - 1) {
      const nextIdx = currentDishIndex + 1;
      set({
        currentDishIndex: nextIdx,
        currentStepIndex: 0,
        totalSteps: dishes[nextIdx].totalSteps,
        expandedChip: null,
        // Dish boundaries are a natural reset  -  any stragglers from the
        // previous dish should not bleed into the next.
        timers: [],
      });
      return true;
    }
    return false;
  },

  toggleChip: (chip) =>
    set((state) => ({
      expandedChip: state.expandedChip === chip ? null : chip,
    })),

  startTimer: (seconds, label) => {
    if (seconds <= 0) return;
    const resolvedLabel = (label ?? "Timer").trim() || "Timer";
    const { timers } = get();
    // Dedupe by label  -  accidental double-taps on the same timer chip
    // should not spawn two pills. Completed timers (remaining === 0) don't
    // block a fresh start.
    const alreadyActive = timers.some(
      (t) => t.label === resolvedLabel && t.remaining > 0,
    );
    if (alreadyActive) return;
    const entry: TimerEntry = {
      id: nextTimerId(),
      label: resolvedLabel,
      totalSeconds: seconds,
      remaining: seconds,
      startedAt: Date.now(),
      completedAt: null,
    };
    set({ timers: [...timers, entry] });
  },

  tickTimers: () =>
    set((state) => {
      if (state.timers.length === 0) return state;
      const now = Date.now();
      const next: TimerEntry[] = [];
      for (const t of state.timers) {
        // Prune finished timers whose linger window has elapsed.
        if (
          t.completedAt !== null &&
          now - t.completedAt >= COMPLETED_TIMER_LINGER_MS
        ) {
          continue;
        }
        if (t.completedAt !== null) {
          next.push(t); // still in flash window
          continue;
        }
        if (t.remaining <= 1) {
          next.push({ ...t, remaining: 0, completedAt: now });
        } else {
          next.push({ ...t, remaining: t.remaining - 1 });
        }
      }
      return { timers: next };
    }),

  stopTimer: (id) =>
    set((state) => {
      if (id === undefined) return { timers: [] };
      return { timers: state.timers.filter((t) => t.id !== id) };
    }),

  completeSession: () => set({ currentPhase: "win" }),

  reset: () => set(initialState),
}));
