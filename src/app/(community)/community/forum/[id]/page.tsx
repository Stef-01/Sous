"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { MessageCircle, Send } from "lucide-react";
import { getThreadById } from "@/data/content";
import { BackLink } from "@/components/content/back-link";
import { BookmarkButton } from "@/components/content/bookmark-button";
import { ContentDisclaimer } from "@/components/content/content-disclaimer";
import { useForumDrafts } from "@/lib/hooks/use-forum-drafts";
import { SectionKicker } from "@/components/shared/section-kicker";
import { MetaPill } from "@/components/shared/meta-pill";

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

export default function ForumThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const thread = getThreadById(id);
  if (!thread) notFound();

  const { replies: drafts, addReply } = useForumDrafts(thread.id);
  const [draft, setDraft] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const created = addReply(draft);
    if (created) setDraft("");
  };

  const totalReplies = thread.replies.length + drafts.length;
  const noRepliesYet = totalReplies === 0;

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
            {thread.replies.map((reply) => (
              <li
                key={reply.id}
                className="rounded-2xl border border-neutral-100/80 bg-white p-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--nourish-subtext)]">
                  <span className="flex items-center gap-2">
                    <Avatar handle={reply.authorHandle} />
                    <span className="font-semibold text-[var(--nourish-dark)]">
                      {reply.authorHandle}
                    </span>
                  </span>
                  <span className="tabular-nums">
                    {formatRelative(reply.createdAt)}
                  </span>
                </div>
                <p className="mt-2 pl-9 text-[14px] leading-snug text-[var(--nourish-dark)]/85">
                  {reply.body}
                </p>
              </li>
            ))}

            {drafts.map((reply) => (
              <li
                key={reply.id}
                className="rounded-2xl border border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/5 p-3"
              >
                <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--nourish-subtext)]">
                  <span className="flex items-center gap-2">
                    <Avatar handle="@you" />
                    <span className="font-semibold text-[var(--nourish-dark)]">
                      You
                    </span>
                    <MetaPill variant="green" size="xs">
                      Local draft
                    </MetaPill>
                  </span>
                  <span className="tabular-nums">
                    {formatRelative(reply.createdAt)}
                  </span>
                </div>
                <p className="mt-2 pl-9 text-[14px] leading-snug text-[var(--nourish-dark)]/85">
                  {reply.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-20 mx-4 mt-6 flex items-end gap-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-md"
      >
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Reply to this thread…"
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
      <p className="mx-4 mt-1.5 text-[10px] text-[var(--nourish-subtext)]/70">
        Replies stay on this device for now.
      </p>

      <div className="px-4 pt-4">
        <ContentDisclaimer />
      </div>
    </div>
  );
}
