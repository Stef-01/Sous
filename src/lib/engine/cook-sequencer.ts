/**
 * Cook Sequencer — intelligently interleaves steps from multiple dishes
 * so everything finishes together and no user idle time is wasted.
 *
 * Rules:
 * 1. Cold dishes (salads, dressings) prep first, serve last
 * 2. Longest-cooking items start first
 * 3. Quick-cook items start last so they're hot when served
 * 4. Interleave idle time (baking, simmering) with active prep
 * 5. Never leave the user idle — always suggest the next useful action
 */

export interface SequencerDish {
  slug: string;
  name: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  temperature: "hot" | "cold" | "room-temp";
  steps: SequencerStep[];
}

export interface SequencerStep {
  dishSlug: string;
  dishName: string;
  stepIndex: number;
  instruction: string;
  durationMinutes: number;
  isPassive: boolean;
  timerSeconds: number | null;
}

export interface SequencedStep extends SequencerStep {
  sequenceIndex: number;
  parallelHint: string | null;
}

export interface CookSequence {
  steps: SequencedStep[];
  totalEstimatedMinutes: number;
  dishOrder: string[];
}

function classifyPassive(instruction: string): boolean {
  const passiveKeywords = [
    "bake",
    "roast",
    "simmer",
    "boil",
    "marinate",
    "rest",
    "chill",
    "refrigerate",
    "cool",
    "set aside",
    "let sit",
    "steep",
    "soak",
    "rise",
    "proof",
    "oven",
  ];
  const lower = instruction.toLowerCase();
  return passiveKeywords.some((kw) => lower.includes(kw));
}

function estimateStepMinutes(
  step: { timerSeconds: number | null; instruction: string },
  dishTotalMinutes: number,
  totalSteps: number,
): number {
  if (step.timerSeconds && step.timerSeconds > 0) {
    return Math.ceil(step.timerSeconds / 60);
  }
  return Math.max(2, Math.round(dishTotalMinutes / totalSteps));
}

export function buildSequencerDish(dish: {
  slug: string;
  name: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  temperature?: string;
  steps: Array<{
    instruction: string;
    timerSeconds: number | null;
  }>;
}): SequencerDish {
  const totalMinutes = dish.prepTimeMinutes + dish.cookTimeMinutes;
  const temp =
    dish.temperature === "cold"
      ? "cold"
      : dish.temperature === "room-temp"
        ? "room-temp"
        : "hot";

  return {
    slug: dish.slug,
    name: dish.name,
    prepTimeMinutes: dish.prepTimeMinutes,
    cookTimeMinutes: dish.cookTimeMinutes,
    temperature: temp,
    steps: dish.steps.map((s, idx) => ({
      dishSlug: dish.slug,
      dishName: dish.name,
      stepIndex: idx,
      instruction: s.instruction,
      durationMinutes: estimateStepMinutes(s, totalMinutes, dish.steps.length),
      isPassive: classifyPassive(s.instruction),
      timerSeconds: s.timerSeconds,
    })),
  };
}

export function sequenceDishes(dishes: SequencerDish[]): CookSequence {
  if (dishes.length === 0) {
    return { steps: [], totalEstimatedMinutes: 0, dishOrder: [] };
  }

  if (dishes.length === 1) {
    const steps: SequencedStep[] = dishes[0].steps.map((s, i) => ({
      ...s,
      sequenceIndex: i,
      parallelHint: null,
    }));
    return {
      steps,
      totalEstimatedMinutes:
        dishes[0].prepTimeMinutes + dishes[0].cookTimeMinutes,
      dishOrder: [dishes[0].slug],
    };
  }

  const sorted = [...dishes].sort((a, b) => {
    if (a.temperature === "cold" && b.temperature !== "cold") return -1;
    if (b.temperature === "cold" && a.temperature !== "cold") return 1;
    const aTotal = a.prepTimeMinutes + a.cookTimeMinutes;
    const bTotal = b.prepTimeMinutes + b.cookTimeMinutes;
    return bTotal - aTotal;
  });

  const dishOrder = sorted.map((d) => d.slug);
  const stepQueues = new Map<string, SequencerStep[]>();
  for (const dish of sorted) {
    stepQueues.set(dish.slug, [...dish.steps]);
  }

  const result: SequencedStep[] = [];
  let seqIdx = 0;

  while (true) {
    let madeProgress = false;

    for (const dish of sorted) {
      const queue = stepQueues.get(dish.slug)!;
      if (queue.length === 0) continue;

      const step = queue.shift()!;
      madeProgress = true;

      let parallelHint: string | null = null;

      if (step.isPassive && step.timerSeconds && step.timerSeconds > 120) {
        const nextDish = sorted.find(
          (d) => d.slug !== dish.slug && stepQueues.get(d.slug)!.length > 0,
        );
        if (nextDish) {
          parallelHint = `While ${dish.name} ${getPassiveVerb(step.instruction)}, start on ${nextDish.name}`;
        }
      }

      result.push({
        ...step,
        sequenceIndex: seqIdx++,
        parallelHint,
      });

      if (step.isPassive && step.timerSeconds && step.timerSeconds > 120) {
        for (const otherDish of sorted) {
          if (otherDish.slug === dish.slug) continue;
          const otherQueue = stepQueues.get(otherDish.slug)!;
          if (otherQueue.length === 0) continue;

          const otherStep = otherQueue.shift()!;
          result.push({
            ...otherStep,
            sequenceIndex: seqIdx++,
            parallelHint: null,
          });
          break;
        }
      }
    }

    if (!madeProgress) break;
  }

  const totalMinutes = sorted.reduce(
    (sum, d) => Math.max(sum, d.prepTimeMinutes + d.cookTimeMinutes),
    0,
  );

  return {
    steps: result,
    totalEstimatedMinutes: totalMinutes,
    dishOrder,
  };
}

function getPassiveVerb(instruction: string): string {
  const lower = instruction.toLowerCase();
  if (lower.includes("bake") || lower.includes("oven")) return "bakes";
  if (lower.includes("simmer")) return "simmers";
  if (lower.includes("boil")) return "boils";
  if (lower.includes("rest")) return "rests";
  if (lower.includes("chill") || lower.includes("cool")) return "cools";
  if (lower.includes("marinate")) return "marinates";
  if (lower.includes("roast")) return "roasts";
  return "cooks";
}
