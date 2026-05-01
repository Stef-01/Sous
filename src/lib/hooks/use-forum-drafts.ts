"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sous-forum-drafts-v1";

export interface ForumDraftReply {
  id: string;
  threadId: string;
  body: string;
  createdAt: string;
}

function load(): ForumDraftReply[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ForumDraftReply[]) : [];
  } catch {
    return [];
  }
}

function persist(replies: ForumDraftReply[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(replies));
  } catch {
    // ignore
  }
}

/**
 * useForumDrafts — local-only mock-write replies. There is no server.
 * Replies persist across reloads on the same browser, which is enough
 * to demonstrate the interaction without claiming real publication.
 */
export function useForumDrafts(threadId: string) {
  const [replies, setReplies] = useState<ForumDraftReply[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate on mount
    setReplies(load().filter((r) => r.threadId === threadId));
  }, [threadId]);

  const addReply = useCallback(
    (body: string): ForumDraftReply | null => {
      const trimmed = body.trim();
      if (trimmed.length === 0) return null;
      const all = load();
      const reply: ForumDraftReply = {
        id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        threadId,
        body: trimmed,
        createdAt: new Date().toISOString(),
      };
      const next = [...all, reply];
      persist(next);
      setReplies(next.filter((r) => r.threadId === threadId));
      return reply;
    },
    [threadId],
  );

  return { replies, addReply };
}
