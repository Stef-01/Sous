/**
 * Forum threads — sample community discussion seed for the Content tab.
 *
 * All authors and bodies are fictional placeholder content. Reply boxes
 * on the thread page are local-only (mock-write) — there is no server.
 * Replacing this seed with a real forum (moderation, reporting, server
 * persistence) is a Stage-2 workstream.
 */

import type { ForumThread } from "@/types/content";

export const FORUM_THREADS: ForumThread[] = [
  {
    id: "forum-rice-gummy",
    category: "forum",
    isPlaceholder: true,
    title: "Why is my rice always gummy?",
    authorHandle: "@firsttimerice",
    body: "I rinse it. I measure the water 1:1.5. I let it rest 10 minutes off heat. And it's still wet on the bottom and dry on top. Help.",
    topTag: "rice",
    replies: [
      {
        id: "reply-1",
        authorHandle: "@chefdailybites",
        body: "Two things almost always: too much water for the rice you're using, and lifting the lid during cooking. Try 1:1.25 for jasmine, never lift the lid.",
        createdAt: "2026-04-30T11:00:00.000Z",
      },
      {
        id: "reply-2",
        authorHandle: "@ricelaboratory",
        body: "Also — what kind of rice? Basmati and jasmine want very different ratios. And rinse until the water is properly clear, not just less cloudy.",
        createdAt: "2026-04-30T13:30:00.000Z",
      },
      {
        id: "reply-3",
        authorHandle: "@firsttimerice",
        body: "It's basmati. I had no idea the ratio was different. Trying 1:1.5 → 1:1.25 tonight.",
        createdAt: "2026-04-30T15:10:00.000Z",
      },
    ],
    lastActiveAt: "2026-04-30T15:10:00.000Z",
    createdAt: "2026-04-30T10:00:00.000Z",
  },
  {
    id: "forum-tadka-burning",
    category: "forum",
    isPlaceholder: true,
    title: "My tadka burns every single time",
    authorHandle: "@learninghomecook",
    body: "I've burned mustard seeds, then curry leaves, then chiles. The whole pan smells like tar. What temperature am I supposed to be at?",
    topTag: "indian",
    replies: [
      {
        id: "reply-1",
        authorHandle: "@dailydaal",
        body: "Medium-low. Not medium. Mustard seeds will pop in a minute or so — when they do, the asafoetida and curry leaves go in immediately, and the heat comes off. The pan stays hot for a long time.",
        createdAt: "2026-04-29T18:00:00.000Z",
      },
      {
        id: "reply-2",
        authorHandle: "@cookwithpriya",
        body: "Plus: have everything chopped and within arm's reach before the pan even gets hot. Tadka is a 60-second move, but you only get to do it once.",
        createdAt: "2026-04-29T19:00:00.000Z",
      },
    ],
    lastActiveAt: "2026-04-29T19:00:00.000Z",
    createdAt: "2026-04-29T17:30:00.000Z",
  },
  {
    id: "forum-meal-prep-burnout",
    category: "forum",
    isPlaceholder: true,
    title: "I burned out on meal prep — anyone else?",
    authorHandle: "@thursdaypanic",
    body: "I did the Sunday-prep-five-containers thing for six months and I just can't anymore. Everything tastes like it was made in 2007. Anyone found something more sustainable?",
    topTag: "habits",
    replies: [
      {
        id: "reply-1",
        authorHandle: "@plantkitchen",
        body: "Switched to 'component prep' last year. I batch one starch, one protein, and one sauce on Sunday — but assembly happens fresh at dinner. Way better.",
        createdAt: "2026-04-28T20:00:00.000Z",
      },
      {
        id: "reply-2",
        authorHandle: "@nonnasrules",
        body: "+1. I never cook Sunday for the whole week. I cook Sunday for Monday and Tuesday lunch. That's it. The rest is fresh-ish.",
        createdAt: "2026-04-28T21:30:00.000Z",
      },
      {
        id: "reply-3",
        authorHandle: "@quickbroth",
        body: "Component prep is the answer. A pot of beans + a pot of rice + a roasted tray of veg gets you four very different dinners.",
        createdAt: "2026-04-29T08:15:00.000Z",
      },
    ],
    lastActiveAt: "2026-04-29T08:15:00.000Z",
    createdAt: "2026-04-28T19:00:00.000Z",
  },
  {
    id: "forum-pantry-list",
    category: "forum",
    isPlaceholder: true,
    title: "What's the actual must-have pantry list?",
    authorHandle: "@newkitchen",
    body: "Just moved out on my own. Every list online tells me to buy 80 things. What do I actually need to start cooking decent food this week?",
    topTag: "pantry",
    replies: [
      {
        id: "reply-1",
        authorHandle: "@chefdailybites",
        body: "Olive oil, kosher salt, black pepper, garlic, onions, lemons, soy sauce, vinegar, eggs, rice, beans (canned + dry), pasta, canned tomatoes, mustard, honey. That's the actual base. Everything else is optional for a while.",
        createdAt: "2026-04-27T10:00:00.000Z",
      },
      {
        id: "reply-2",
        authorHandle: "@cookwithpriya",
        body: "Add cumin, turmeric, paprika, red pepper flakes, oregano. Five spices, twelve cuisines. Spice rack is leverage.",
        createdAt: "2026-04-27T11:00:00.000Z",
      },
    ],
    lastActiveAt: "2026-04-27T11:00:00.000Z",
    createdAt: "2026-04-27T09:00:00.000Z",
  },
  {
    id: "forum-knife-dull",
    category: "forum",
    isPlaceholder: true,
    title: "Cheap knives — sharpen or replace?",
    authorHandle: "@dullblades",
    body: "I've got two $20 chef knives that are getting dull. Worth taking them to a sharpener, or should I just buy something better?",
    topTag: "tools",
    replies: [
      {
        id: "reply-1",
        authorHandle: "@knifeworkdaily",
        body: "Sharpen. A $20 knife sharpened is way better than a $200 knife dull. Buy a $15 pull-through if you don't want to whetstone, and use it weekly.",
        createdAt: "2026-04-26T14:00:00.000Z",
      },
    ],
    lastActiveAt: "2026-04-26T14:00:00.000Z",
    createdAt: "2026-04-26T13:00:00.000Z",
  },
];

export function getThreadById(id: string): ForumThread | undefined {
  return FORUM_THREADS.find((t) => t.id === id);
}
