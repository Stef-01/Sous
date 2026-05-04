"use client";

import { use, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { Heart, MessageCircle, Reply, Send, X } from "lucide-react";
import { getThreadById } from "@/data/content";
import { BackLink } from "@/components/content/back-link";
import { BookmarkButton } from "@/components/content/bookmark-button";
import { ContentDisclaimer } from "@/components/content/content-disclaimer";
import { useForumDrafts } from "@/lib/hooks/use-forum-drafts";
import { useForumThanks } from "@/lib/hooks/use-forum-thanks";
import { SectionKicker } from "@/components/shared/section-kicker";
import { MetaPill } from "@/components/shared/meta-pill";
import type { ForumReply } from "@/types/content";
import type { ForumDraftReply } from "@/lib/hooks/use-forum-drafts";
import { cn } from "@/lib/utils/cn";

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

/** Two-character monogram from a handle like "@stef.k" → "ST". */
function monogramFor(handle: string): string {
  const cleaned = handle.replace(/^@/, "").replace(/[._-]/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Stable HSL avatar tint derived from the handle. */
function tintFor(handle: string): string {
  let hash = 0;
  for (let i = 0; i < handle.length; i += 1) {
    hash = (hash * 31 + handle.charCodeAt(i)) % 360;
  }
  return `hsl(${hash}, 38%, 86%)`;
}

function Avatar({ handle, size = 28 }: { handle: string; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-[var(--nourish-dark)]"
      style={{
        width: size,
        height: size,
        background: tintFor(handle),
        fontSize: size >= 36 ? 12 : 10,
        letterSpacing: "0.04em",
      }}
    >
      {monogramFor(handle)}
    </span>
  );
}

/** Unified reply shape after merging seeded thread.replies with
 *  user-authored drafts. The `isDraft` discriminator drives the
 *  green-tinted treatment + the "You / Local draft" pill. */
interface UnifiedReply {
  id: string;
  authorHandle: string;
  body: string;
  createdAt: string;
  inReplyToId?: string;
  isDraft: boolean;
}

function unifyReplies(
  threadReplies: ForumReply[],
  drafts: ForumDraftReply[],
): UnifiedReply[] {
  const seeded: UnifiedReply[] = threadReplies.map((r) => ({
    id: r.id,
    authorHandle: r.authorHandle,
    body: r.body,
    createdAt: r.createdAt,
    inReplyToId: r.inReplyToId,
    isDraft: false,
  }));
  const draftReplies: UnifiedReply[] = drafts.map((d) => ({
    id: d.id,
    authorHandle: "@you",
    body: d.body,
    createdAt: d.createdAt,
    inReplyToId: d.inReplyToId,
    isDraft: true,
  }));
  return [...seeded, ...draftReplies].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

/** Group replies into top-level + their direct children (W8 nesting:
 *  one level deep only — children-of-children attach to the same
 *  parent visually so the thread can't grow indented forever). */
export function groupReplies(replies: UnifiedReply[]): {
  top: UnifiedReply;
  children: UnifiedReply[];
}[] {
  const byId = new Map(replies.map((r) => [r.id, r]));
  const topLevel: UnifiedReply[] = [];
  const childrenOf = new Map<string, UnifiedReply[]>();

  for (const r of replies) {
    if (!r.inReplyToId || !byId.has(r.inReplyToId)) {
      topLevel.push(r);
      continue;
    }
    // Walk up at most one step. If parent is itself a reply-to,
    // attach to the GRANDparent (the topmost non-nested reply) so
    // depth stays at 1.
    let parentId = r.inReplyToId;
    const parent = byId.get(parentId)!;
    if (parent.inReplyToId && byId.has(parent.inReplyToId)) {
      parentId = parent.inReplyToId;
    }
    const list = childrenOf.get(parentId) ?? [];
    list.push(r);
    childrenOf.set(parentId, list);
  }

  return topLevel.map((top) => ({
    top,
    children: childrenOf.get(top.id) ?? [],
  }));
}

export default function ForumThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const thread = getThreadById(id);
  if (!thread) notFound();

  const { replies: drafts, addReply } = useForumDrafts(thread.id);
  const { isThanked, toggleThanks, thanksCount } = useForumThanks();
  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<UnifiedReply | null>(null);

  const unified = useMemo(
    () => unifyReplies(thread.replies, drafts),
    [thread.replies, drafts],
  );
  const groups = useMemo(() => groupReplies(unified), [unified]);
  const totalReplies = unified.length;
  const noRepliesYet = totalReplies === 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const created = addReply(draft, replyingTo?.id);
    if (created) {
      setDraft("");
      setReplyingTo(null);
    }
  };

  const startReplyTo = (target: UnifiedReply) => {
    setReplyingTo(target);
    // Tiny delay-free focus jump: scroll the composer into view.
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        document
          .getElementById("forum-composer")
          ?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    }
  };

  return (
    <div className="min-h-full bg-[var(--nourish-cream)] pb-32">
      <div className="px-4 pt-5">
        <BackLink />
      </div>

      {/* OP card. Card-treatment makes the hierarchy obvious so replies
          read as responses rather than peers. */}
      <article className="mx-4 mt-3 space-y-3 rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-[var(--nourish-green)]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-green)]">
            Original post · #{thread.topTag}
          </span>
          <BookmarkButton kind="forum" id={thread.id} label={thread.title} />
        </div>

        <h1 className="font-serif text-[22px] leading-tight text-[var(--nourish-dark)]">
          {thread.title}
        </h1>

        <div className="flex items-center gap-2 text-[11px] text-[var(--nourish-subtext)]">
          <Avatar handle={thread.authorHandle} size={28} />
          <span className="font-semibold text-[var(--nourish-dark)]">
            {thread.authorHandle}
          </span>
          <span aria-hidden>·</span>
          <span>{formatRelative(thread.createdAt)}</span>
        </div>

        <p className="text-[14px] leading-relaxed text-[var(--nourish-dark)]/85">
          {thread.body}
        </p>
      </article>

      <section className="mt-7 space-y-3 px-4">
        <div className="flex items-baseline justify-between">
          <SectionKicker>Replies</SectionKicker>
          <span className="tabular-nums text-[11px] text-[var(--nourish-subtext)]">
            {totalReplies}
          </span>
        </div>

        {noRepliesYet ? (
          <div
            className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-neutral-200 bg-white/60 px-4 py-7 text-center"
            role="status"
          >
            <MessageCircle
              size={22}
              className="text-[var(--nourish-subtext)]/70"
              aria-hidden
            />
            <p className="text-[13px] text-[var(--nourish-subtext)]">
              No replies yet — be the first.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {groups.map(({ top, children }) => (
              <li key={top.id}>
                <ReplyCard
                  reply={top}
                  isThanked={isThanked(top.id)}
                  thanksCount={thanksCount(top.id)}
                  onThanks={() => toggleThanks(top.id)}
                  onReply={() => startReplyTo(top)}
                />
                {children.length > 0 && (
                  <ul className="ml-9 mt-2 space-y-2 border-l border-neutral-200 pl-3">
                    {children.map((child) => (
                      <li key={child.id}>
                        <ReplyCard
                          reply={child}
                          isThanked={isThanked(child.id)}
                          thanksCount={thanksCount(child.id)}
                          onThanks={() => toggleThanks(child.id)}
                          onReply={() => startReplyTo(top)}
                          nested
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div id="forum-composer" className="mx-4 mt-6">
        {replyingTo && (
          <div className="mb-1.5 flex items-center justify-between gap-2 rounded-t-2xl bg-[var(--nourish-green)]/8 px-3 py-1.5 text-[11px] text-[var(--nourish-dark)]">
            <span className="flex items-center gap-1.5">
              <Reply
                size={11}
                className="text-[var(--nourish-green)]"
                aria-hidden
              />
              <span>
                Replying to{" "}
                <span className="font-semibold">{replyingTo.authorHandle}</span>
              </span>
            </span>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)]"
              aria-label="Cancel reply target"
            >
              Cancel <X size={10} aria-hidden />
            </button>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="sticky bottom-20 flex items-end gap-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-md"
        >
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={
              replyingTo
                ? `Reply to ${replyingTo.authorHandle}…`
                : "Reply to this thread…"
            }
            rows={2}
            className="flex-1 resize-none rounded-xl bg-transparent px-2 py-1.5 text-[13px] text-[var(--nourish-dark)] placeholder:text-[var(--nourish-subtext)]/70 focus:outline-none"
            aria-label="Reply"
          />
          <button
            type="submit"
            disabled={draft.trim().length === 0}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--nourish-green)] text-white transition-transform active:scale-95 disabled:opacity-40 disabled:active:scale-100"
            aria-label="Post reply"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
      <p className="mx-4 mt-1.5 text-[10px] text-[var(--nourish-subtext)]/70">
        Replies stay on this device for now.
      </p>

      <div className="px-4 pt-4">
        <ContentDisclaimer />
      </div>
    </div>
  );
}

function ReplyCard({
  reply,
  isThanked,
  thanksCount,
  onThanks,
  onReply,
  nested = false,
}: {
  reply: UnifiedReply;
  isThanked: boolean;
  thanksCount: number;
  onThanks: () => void;
  onReply: () => void;
  nested?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-3",
        reply.isDraft
          ? "border border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/5"
          : "border border-neutral-100/80 bg-white shadow-sm",
        nested && "rounded-xl",
      )}
    >
      <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--nourish-subtext)]">
        <span className="flex items-center gap-2">
          <Avatar handle={reply.authorHandle} size={nested ? 22 : 28} />
          <span className="font-semibold text-[var(--nourish-dark)]">
            {reply.isDraft ? "You" : reply.authorHandle}
          </span>
          {reply.isDraft && (
            <MetaPill variant="green" size="xs">
              Local draft
            </MetaPill>
          )}
        </span>
        <span className="tabular-nums">{formatRelative(reply.createdAt)}</span>
      </div>
      <p
        className={cn(
          "mt-2 text-[14px] leading-snug text-[var(--nourish-dark)]/85",
          nested ? "pl-7" : "pl-9",
        )}
      >
        {reply.body}
      </p>
      <div
        className={cn(
          "mt-2 flex items-center gap-3 text-[11px]",
          nested ? "pl-7" : "pl-9",
        )}
      >
        <button
          type="button"
          onClick={onThanks}
          aria-pressed={isThanked}
          aria-label={isThanked ? "Remove thanks" : "Thank this reply"}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 transition-colors",
            isThanked
              ? "bg-rose-50 text-rose-500"
              : "text-[var(--nourish-subtext)] hover:bg-neutral-50 hover:text-[var(--nourish-dark)]",
          )}
        >
          <Heart
            size={12}
            fill={isThanked ? "currentColor" : "none"}
            aria-hidden
          />
          {thanksCount > 0 ? (
            <span className="tabular-nums font-semibold">{thanksCount}</span>
          ) : (
            <span>Thanks</span>
          )}
        </button>
        <button
          type="button"
          onClick={onReply}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[var(--nourish-subtext)] transition-colors hover:bg-neutral-50 hover:text-[var(--nourish-dark)]"
          aria-label={`Reply to ${reply.authorHandle}`}
        >
          <Reply size={12} aria-hidden />
          <span>Reply</span>
        </button>
      </div>
    </div>
  );
}
