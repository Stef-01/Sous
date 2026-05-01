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
  /**
   * `true` for Stage 3 seed items (sample/placeholder authors and
   * affiliations). Items swapped for real Stanford-attributed content
   * via the Content Population Phase set this to `false` and populate
   * the four sourceXxx + permissionEvidence fields below.
   * Kept literal `true` on the seed items for type safety.
   */
  isPlaceholder: boolean;
  /** Stanford-domain (or other authorised) origin URL when real. */
  sourceUrl?: string;
  /** Human-readable source title rendered next to the byline. */
  sourceTitle?: string;
  /** ISO timestamp of the last refresh of the saved snapshot. */
  sourceFetchedAt?: string;
  /** Path inside docs/ proving the team had permission. */
  permissionEvidence?: string;
  /**
   * Audience tag — drives the Content tab's parent-track ranking when
   * Parent Mode is on (Stage 2 W12). Default 'general'; explicit
   * 'parent' items are promoted to the top of mixed lists for PM users.
   */
  audience?: "parent" | "general";
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
