/**
 * Content tab — single import surface.
 *
 * Re-exports all seed data and lookup helpers so callers say:
 *   import { ARTICLES, REELS, RESEARCH_BRIEFS, EXPERT_VOICES, FORUM_THREADS } from "@/data/content";
 */

export {
  ARTICLES,
  getArticleById,
  getArticleBySlug,
  getFeaturedArticles,
} from "./articles";
export { REELS, getReelById } from "./reels";
export { RESEARCH_BRIEFS, getResearchBriefBySlug } from "./research";
export { EXPERT_VOICES, getExpertById, getExpertBySlug } from "./experts";
export { FORUM_THREADS, getThreadById } from "./forum";
