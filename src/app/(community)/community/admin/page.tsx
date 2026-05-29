"use client";

/**
 * /community/admin — Nourish-verification approval queue.
 *
 * W48 from `docs/RECIPE-ECOSYSTEM-V2.md`. V1 vibecode:
 * Stefan-only (localStorage `sous-is-admin` flag). The page
 * shows community-tagged recipes with read-only previews +
 * Verify / Reject actions. Each action calls the W48 pure
 * helpers (applyApproval / applyRejection) and persists via
 * the W24 useRecipeDrafts hook.
 *
 * Non-admins land on a polite "this page is for admins"
 * placeholder so the route exists in the smoke spec without
 * leaking the admin surface.
 */

import { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check, ShieldCheck, X } from "lucide-react";
import { useRecipeDrafts } from "@/lib/recipe-authoring/use-recipe-drafts";
import {
  applyApproval,
  applyRejection,
  pendingCommunityRecipes,
} from "@/lib/recipe-authoring/admin-approval";
import { useIsAdmin } from "@/lib/hooks/use-is-admin";
import { toast } from "@/lib/hooks/use-toast";
import { SectionKicker } from "@/components/shared/section-kicker";

export default function AdminPage() {
  const reducedMotion = useReducedMotion();
  const { isAdmin, mounted: adminMounted } = useIsAdmin();
  const { drafts, mounted: draftsMounted, upsert } = useRecipeDrafts();

  const queue = useMemo(() => pendingCommunityRecipes(drafts), [drafts]);

  const handleApprove = (id: string) => {
    const recipe = drafts.find((r) => r.id === id);
    if (!recipe) return;
    upsert(
      applyApproval(recipe, {
        now: new Date().toISOString(),
        adminId: "stefan",
      }),
    );
    toast.push({
      variant: "success",
      title: `Verified "${recipe.title}"`,
      body: "Recipe is now Nourish ✓.",
      dedupKey: `verify-${recipe.id}`,
    });
  };

  const handleReject = (id: string) => {
    const recipe = drafts.find((r) => r.id === id);
    if (!recipe) return;
    upsert(
      applyRejection(recipe, {
        now: new Date().toISOString(),
        adminId: "stefan",
      }),
    );
    toast.push({
      variant: "info",
      title: `Returned "${recipe.title}" to author`,
      body: "Marked as private; the author can revise + resubmit.",
      dedupKey: `reject-${recipe.id}`,
    });
  };

  return (
    <motion.div
      className="min-h-full bg-[var(--nourish-cream)] pb-24"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
    >
      <header className="app-header px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link
            href="/community"
            aria-label="Back to Content"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[var(--nourish-dark)] transition hover:bg-neutral-50"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-serif text-lg font-semibold text-[var(--nourish-dark)]">
            Admin queue
          </h1>
          {adminMounted && isAdmin && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--nourish-green)]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--nourish-green)]">
              <ShieldCheck size={11} aria-hidden /> Admin
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
        {!adminMounted || !draftsMounted ? (
          <div className="h-24 animate-pulse rounded-2xl bg-white/70" />
        ) : !isAdmin ? (
          <NotAdminState />
        ) : queue.length === 0 ? (
          <EmptyQueueState />
        ) : (
          <ul className="space-y-3">
            {queue.map((recipe) => (
              <li
                key={recipe.id}
                className="rounded-2xl border border-neutral-100/80 bg-white p-4 shadow-sm"
              >
                <SectionKicker as="p" size="10px">
                  {recipe.cuisineFamily}
                  {recipe.authorDisplayName
                    ? ` · by ${recipe.authorDisplayName}`
                    : ""}
                </SectionKicker>
                <h2 className="mt-1 font-serif text-base font-semibold text-[var(--nourish-dark)]">
                  {recipe.title}
                </h2>
                <p className="mt-1 line-clamp-3 text-sm text-[var(--nourish-subtext)]">
                  {recipe.description}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.06em] text-[var(--nourish-subtext)]/70">
                  {recipe.ingredients.length} ingredients ·{" "}
                  {recipe.steps.length} steps · serves {recipe.serves}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(recipe.id)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--nourish-green)] py-2 text-xs font-semibold text-white transition hover:bg-[var(--nourish-dark-green)]"
                  >
                    <Check size={12} aria-hidden /> Verify
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(recipe.id)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium text-[var(--nourish-subtext)] transition hover:border-rose-300 hover:text-rose-500"
                  >
                    <X size={12} aria-hidden /> Reject
                  </button>
                  <Link
                    href={`/path/recipes/${recipe.id}/edit`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-medium text-[var(--nourish-subtext)] transition hover:border-neutral-300 hover:text-[var(--nourish-dark)]"
                  >
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </motion.div>
  );
}

function NotAdminState() {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/40 p-6 text-center">
      <ShieldCheck
        size={28}
        className="mx-auto text-[var(--nourish-subtext)]/60"
        aria-hidden
      />
      <p className="mt-2 text-sm font-semibold text-[var(--nourish-dark)]">
        Admins only
      </p>
      <p className="mt-1 text-xs text-[var(--nourish-subtext)]">
        This page reviews community-submitted recipes for Nourish verification.
      </p>
    </div>
  );
}

function EmptyQueueState() {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/40 p-6 text-center">
      <Check
        size={24}
        className="mx-auto text-[var(--nourish-green)]"
        aria-hidden
      />
      <p className="mt-2 text-sm font-semibold text-[var(--nourish-dark)]">
        Queue empty
      </p>
      <p className="mt-1 text-xs text-[var(--nourish-subtext)]">
        Nothing pending review.
      </p>
    </div>
  );
}
