/**
 * Pure helpers for the W48 Nourish-verification approval flow.
 *
 * Stefan-only V1 (localStorage admin flag). Production swaps
 * to a server-side moderation queue when auth lands (Y2 W1).
 *
 * Pure / dependency-free — testable without rendering React.
 */

import type { UserRecipe } from "@/types/user-recipe";

export interface ApprovalStamp {
  /** ISO timestamp the action was taken. */
  now: string;
  /** Stable id of the admin who took the action. "system" for
   *  seed-implicit Nourish-verified entries; "stefan" or similar
   *  for human admins. */
  adminId: string;
}

/** Promote a community recipe to Nourish-verified. Preserves
 *  every other field; stamps `nourishApprovedAt` and
 *  `nourishApprovedBy`. Pure / idempotent. */
export function applyApproval(
  recipe: UserRecipe,
  stamp: ApprovalStamp,
): UserRecipe {
  return {
    ...recipe,
    source: "nourish-verified",
    nourishApprovedAt: stamp.now,
    nourishApprovedBy: stamp.adminId,
    updatedAt: stamp.now,
  };
}

/** Reject a community recipe — reverts source to "user" so the
 *  recipe stays private to the author. Clears any prior approval
 *  stamps. Pure / idempotent. */
export function applyRejection(
  recipe: UserRecipe,
  stamp: ApprovalStamp,
): UserRecipe {
  return {
    ...recipe,
    source: "user",
    nourishApprovedAt: null,
    nourishApprovedBy: null,
    updatedAt: stamp.now,
  };
}

/** Filter a recipe list to only those awaiting admin review. */
export function pendingCommunityRecipes(
  recipes: ReadonlyArray<UserRecipe>,
): UserRecipe[] {
  return recipes.filter((r) => r.source === "community");
}

/** Submit a user's own recipe for community verification. The
 *  recipe goes from "user" → "community"; the admin approval
 *  flow can then promote to "nourish-verified" or send it back. */
export function submitForCommunityReview(
  recipe: UserRecipe,
  stamp: { now: string; authorDisplayName: string },
): UserRecipe {
  return {
    ...recipe,
    source: "community",
    authorDisplayName: stamp.authorDisplayName,
    nourishApprovedAt: null,
    nourishApprovedBy: null,
    updatedAt: stamp.now,
  };
}
