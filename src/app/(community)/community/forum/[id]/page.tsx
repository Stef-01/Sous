"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { Send } from "lucide-react";
import { getThreadById } from "@/data/content";
import { BackLink } from "@/components/content/back-link";
import { BookmarkButton } from "@/components/content/bookmark-button";
import { ContentDisclaimer } from "@/components/content/content-disclaimer";
import { useForumDrafts } from "@/lib/hooks/use-forum-drafts";

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
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

  return (
    <div className="min-h-full bg-[var(--nourish-cream)] pb-32">
      <div className="px-4 pt-5">
        <BackLink />
      </div>

      <article className="mt-3 space-y-3 px-4">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
            #{thread.topTag}
          </span>
          <BookmarkButton kind="forum" id={thread.id} label={thread.title} />
        </div>
        <h1 className="font-serif text-xl leading-tight text-[var(--nourish-dark)]">
          {thread.title}
        </h1>
        <p className="text-[11px] text-[var(--nourish-subtext)]">
          {thread.authorHandle} · {formatRelative(thread.createdAt)}
        </p>
        <p className="text-[14px] leading-relaxed text-[var(--nourish-dark)]/85">
          {thread.body}
        </p>
      </article>

      <section className="mt-7 space-y-3 px-4">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
          Replies ({thread.replies.length + drafts.length})
        </h2>

        <ul className="space-y-2">
          {thread.replies.map((reply) => (
            <li
              key={reply.id}
              className="rounded-2xl border border-neutral-100/80 bg-white p-3 shadow-sm"
            >
              <p className="flex items-baseline justify-between text-[11px] text-[var(--nourish-subtext)]">
                <span className="font-semibold text-[var(--nourish-dark)]">
                  {reply.authorHandle}
                </span>
                <span>{formatRelative(reply.createdAt)}</span>
              </p>
              <p className="mt-1.5 text-[14px] leading-snug text-[var(--nourish-dark)]/85">
                {reply.body}
              </p>
            </li>
          ))}

          {drafts.map((reply) => (
            <li
              key={reply.id}
              className="rounded-2xl border border-[var(--nourish-green)]/30 bg-[var(--nourish-green)]/5 p-3"
            >
              <p className="flex items-baseline justify-between text-[11px] text-[var(--nourish-subtext)]">
                <span className="font-semibold text-[var(--nourish-dark)]">
                  You (local draft)
                </span>
                <span>{formatRelative(reply.createdAt)}</span>
              </p>
              <p className="mt-1.5 text-[14px] leading-snug text-[var(--nourish-dark)]/85">
                {reply.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-20 mx-4 mt-6 flex items-end gap-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-md"
      >
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a reply (saved on this device only)…"
          rows={2}
          className="flex-1 resize-none rounded-xl bg-transparent px-2 py-1.5 text-[13px] text-[var(--nourish-dark)] placeholder:text-[var(--nourish-subtext)]/70 focus:outline-none"
          aria-label="Reply"
        />
        <button
          type="submit"
          disabled={draft.trim().length === 0}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--nourish-green)] text-white disabled:opacity-40"
          aria-label="Post reply"
        >
          <Send size={16} />
        </button>
      </form>

      <div className="px-4 pt-4">
        <ContentDisclaimer />
      </div>
    </div>
  );
}
