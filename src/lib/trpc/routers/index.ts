import { router } from "@/lib/trpc/server";
import { pairingRouter } from "./pairing";
import { recognitionRouter } from "./recognition";
import { cookRouter } from "./cook";
import { cookSessionRouter } from "./session";
import { savedRouter } from "./saved";
import { recipesRouter } from "./recipes";
import { prefsRouter } from "./prefs";
import { planRouter } from "./plan";
import { podRouter } from "./pod";
import { aiRouter } from "./ai";
import { recipeAutogenRouter } from "./recipe-autogen";
import { diaryRouter } from "./diary";

export const appRouter = router({
  pairing: pairingRouter,
  recognition: recognitionRouter,
  cook: cookRouter,
  cookSession: cookSessionRouter,
  saved: savedRouter,
  recipes: recipesRouter,
  prefs: prefsRouter,
  plan: planRouter,
  pod: podRouter,
  ai: aiRouter,
  recipeAutogen: recipeAutogenRouter,
  diary: diaryRouter,
});

export type AppRouter = typeof appRouter;
