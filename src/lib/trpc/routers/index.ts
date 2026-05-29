import { router } from "@/lib/trpc/server";
import { pairingRouter } from "./pairing";
import { recognitionRouter } from "./recognition";
import { cookRouter } from "./cook";
import { aiRouter } from "./ai";
import { recipeAutogenRouter } from "./recipe-autogen";

export const appRouter = router({
  pairing: pairingRouter,
  recognition: recognitionRouter,
  cook: cookRouter,
  ai: aiRouter,
  recipeAutogen: recipeAutogenRouter,
});

export type AppRouter = typeof appRouter;
