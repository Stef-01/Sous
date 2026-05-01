/**
 * Content tab — domain types.
 *
 * Stage 3 (lean vibe-coded). Every seeded item carries `isPlaceholder: true`
 * so we never confuse prototype editorial copy with real, clinician-verified
 * content. Replacing this layer with a real CMS is a Stage-2 workstream.
 */

export type ContentCategory =
  | "reels"
  | "articles"
  | "research"
  | "experts"
  | "forum";

export interface BaseContentItem {
  id: string;
  category: ContentCategory;
  title: string;
  createdAt: string;
  isPlaceholder: true;
}

export interface Article extends BaseContentItem {
  category: "articles";
  slug: string;
  kicker: string;
  excerpt: string;
  coverImageUrl: string;
  body: string[];
  authorId: string;
  readMinutes: number;
  tags: string[];
  featured?: boolean;
}

export interface Reel extends BaseContentItem {
  category: "reels";
  posterImageUrl: string;
  caption: string;
  creatorHandle: string;
  creatorName: string;
  durationSeconds: number;
  likes: number;
  technique?: string;
  dishSlug?: string;
}

export interface ResearchBrief extends BaseContentItem {
  category: "research";
  slug: string;
  labName: string;
  paperTitle: string;
  takeaway: string;
  body: string[];
  whyItMatters: string;
  coverImageUrl: string;
}

export interface ExpertVoice extends BaseContentItem {
  category: "experts";
  slug: string;
  name: string;
  credential: string;
  affiliation: string;
  bio: string;
  avatarUrl: string;
  articleIds: string[];
}

export interface ForumReply {
  id: string;
  authorHandle: string;
  body: string;
  createdAt: string;
}

export interface ForumThread extends BaseContentItem {
  category: "forum";
  authorHandle: string;
  body: string;
  replies: ForumReply[];
  topTag: string;
  lastActiveAt: string;
}

export type ContentItem =
  | Article
  | Reel
  | ResearchBrief
  | ExpertVoice
  | ForumThread;

export type SaveableContent = Article | Reel | ResearchBrief | ForumThread;

export type SaveableKind = SaveableContent["category"];

/** Stable bookmark key — kind:id so collisions across categories are impossible. */
export function bookmarkKey(kind: SaveableKind, id: string): string {
  return `${kind}:${id}`;
}
