import { create } from "zustand";

type Phase = "mission" | "grab" | "cook" | "win";
type ChipType = "timer" | "mistake" | "hack" | "fact" | null;

/** A dish entry in a combined cook session. */
export interface CookDishEntry {
  slug: string;
  name: string;
  totalSteps: number;
}

interface CookStore {
  sessionId: string | null;
  currentPhase: Phase;
  currentStepIndex: number;
  totalSteps: number;
  expandedChip: ChipType;
  timerActive: boolean;
  timerRemaining: number;

  // Combined cook mode
  cookMode: "single" | "combined";
  dishes: CookDishEntry[];
  currentDishIndex: number;

  // actions
  startSession: (sessionId: string, totalSteps: number) => void;
  startCombinedSession: (dishes: CookDishEntry[]) => void;
  setPhase: (phase: Phase) => void;
  setTotalSteps: (total: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  nextDish: () => boolean; // returns true if there's another dish, false if all done
  toggleChip: (chip: ChipType) => void;
  startTimer: (seconds: number) => void;
  tickTimer: () => void;
  stopTimer: () => void;
  completeSession: () => void;
  reset: () => void;
}

const initialState = {
  sessionId: null as string | null,
  currentPhase: "mission" as Phase,
  currentStepIndex: 0,
  totalSteps: 0,
  expandedChip: null as ChipType,
  timerActive: false,
  timerRemaining: 0,
  cookMode: "single" as "single" | "combined",
  dishes: [] as CookDishEntry[],
  currentDishIndex: 0,
};

export const useCookStore = create<CookStore>((set, get) => ({
  ...initialState,

  startSession: (sessionId, totalSteps) =>
    set({ ...initialState, sessionId, totalSteps, cookMode: "single" }),

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
      });
      return true;
    }
    return false;
  },

  toggleChip: (chip) =>
    set((state) => ({
      expandedChip: state.expandedChip === chip ? null : chip,
    })),

  startTimer: (seconds) => set({ timerActive: true, timerRemaining: seconds }),

  tickTimer: () =>
    set((state) => {
      if (state.timerRemaining <= 1) {
        return { timerActive: false, timerRemaining: 0 };
      }
      return { timerRemaining: state.timerRemaining - 1 };
    }),

  stopTimer: () => set({ timerActive: false, timerRemaining: 0 }),

  completeSession: () => set({ currentPhase: "win" }),

  reset: () => set(initialState),
}));
