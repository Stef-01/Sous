"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import type { ForumThread } from "@/types/content";

interface Props {
  threads: ForumThread[];
  limit?: number;
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

/**
 * ForumThreadList — compact recent-activity list. Shows top N threads
 * with title, top tag chip, reply count, and last-active relative time.
 */
export function ForumThreadList({ threads, limit = 3 }: Props) {
  const visible = threads.slice(0, limit);
  if (visible.length === 0) return null;
  return (
    <section aria-label="Forum threads" className="space-y-2">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--nourish-subtext)]">
          Forum talk
        </h2>
        <span className="text-[10px] text-[var(--nourish-subtext)]/70">
          Tap to read
        </span>
      </div>

      {/* W19b bonus: forum threads now use a subtle inset shadow + a
          green pill reply count so they read as conversation, not as
          another article card. Inspired by BBC Good Food's
          differentiation of community vs editorial content. */}
      <ul className="space-y-2">
        {visible.map((thread) => (
          <li key={thread.id}>
            <Link
              href={`/community/forum/${thread.id}`}
              className="group flex items-start gap-3 rounded-2xl bg-[var(--nourish-cream)] p-3 ring-1 ring-inset ring-[var(--nourish-green)]/15 transition-shadow hover:ring-[var(--nourish-green)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--nourish-green)]/12 text-[var(--nourish-green)]">
                <MessageSquare size={16} />
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="line-clamp-2 text-sm font-semibold leading-tight text-[var(--nourish-dark)]">
                  {thread.title}
                </p>
                <p className="line-clamp-1 text-[12px] leading-snug text-[var(--nourish-subtext)]">
                  {thread.body}
                </p>
                <p className="flex items-center gap-2 pt-0.5 text-[10px] text-[var(--nourish-subtext)]">
                  <span className="rounded-full bg-white px-2 py-0.5 font-semibold uppercase tracking-[0.08em] ring-1 ring-inset ring-[var(--nourish-border)]">
                    #{thread.topTag}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--nourish-green)]/12 px-2 py-0.5 font-semibold text-[var(--nourish-green)]">
                    {thread.replies.length}{" "}
                    {thread.replies.length === 1 ? "reply" : "replies"}
                  </span>
                  <span>· {formatRelative(thread.lastActiveAt)}</span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
