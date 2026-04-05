import { router } from "@/lib/trpc/server";
import { pairingRouter } from "./pairing";
import { recognitionRouter } from "./recognition";
import { cookRouter } from "./cook";
import { journeyRouter } from "./journey";
import { coachRouter } from "./coach";
import { contentRouter } from "./content";
import { aiRouter } from "./ai";

export const appRouter = router({
  pairing: pairingRouter,
  recognition: recognitionRouter,
  cook: cookRouter,
  journey: journeyRouter,
  coach: coachRouter,
  content: contentRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
