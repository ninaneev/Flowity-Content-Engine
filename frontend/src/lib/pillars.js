/**
 * Content pillars and the posting rotation.
 * Keys are stored in posts.pillar (backend VALID_PILLARS): never rename them.
 */
import { addDays, format, getDay, startOfDay } from "date-fns";
import { parseApiDate } from "./postDates.js";

export const PILLARS = {
  workflow: {
    key: "workflow",
    label: "Workflow",
    description: "Exact process, numbered steps, usually with a diagram.",
    goal: "Save + follow",
    color: "#22D3EE",
  },
  proof: {
    key: "proof",
    label: "Proof",
    description: "Real reading, result or numbers that show the method works.",
    goal: "Want Flowity",
    color: "#A3E635",
  },
  build: {
    key: "build",
    label: "Build in public",
    description: "What was built, bugs, numbers.",
    goal: "Follow",
    color: "#FB923C",
  },
  pov: {
    key: "pov",
    label: "Point of view",
    description: "Strong take on growth, signals, outreach.",
    goal: "Comments",
    color: "#F472B6",
  },
  story: {
    key: "story",
    label: "Story",
    description: "Founder story and lesson.",
    goal: "Trust",
    color: "#FCD34D",
  },
};

/** Rotation order; the plan walks it and wraps around. */
export const PILLAR_ROTATION = ["workflow", "proof", "build", "pov", "story"];

/** Posting days as date-fns getDay() numbers (0 = Sunday). Mon–Fri. */
export const POSTING_DAYS = [1, 2, 3, 4, 5];

export const dayKey = (date) => format(date, "yyyy-MM-dd");

function postTime(post) {
  return parseApiDate(post.scheduled_at || post.published_at);
}

/**
 * Plans the expected pillar for every posting day up to `until`.
 *
 * - Starts after the pillar of the most recent published post (from the day after it),
 *   or at the first rotation pillar on the first posting day >= today when nothing is published.
 * - A day with posts: each post's expected pillar is rotation[cursor]; a post whose pillar differs is
 *   "off-structure"; the cursor then moves to the pillar after the one actually posted.
 *   A post without a pillar just takes one slot.
 * - A past posting day with no post (skipped) does not advance the cursor.
 * - A future posting day with no post gets a suggested pillar and advances the cursor.
 * - Non-posting days are only walked when they have posts (so a weekend post still counts).
 *
 * Returns { days: { "yyyy-MM-dd": { pillar, suggested } }, posts: { [id]: { expected, offStructure } } }.
 */
export function planPillars({
  posts = [],
  today = new Date(),
  until,
  rotation = PILLAR_ROTATION,
  postingDays = POSTING_DAYS,
}) {
  const days = {};
  const postPlan = {};
  const hoje = startOfDay(today);
  const fim = startOfDay(until || today);

  const anchor = posts
    .filter((p) => p.status === "published" && rotation.includes(p.pillar) && postTime(p))
    .sort((a, b) => postTime(b) - postTime(a))[0];

  let cursor = 0;
  let start = hoje;
  if (anchor) {
    cursor = (rotation.indexOf(anchor.pillar) + 1) % rotation.length;
    start = addDays(startOfDay(postTime(anchor)), 1);
  }

  const byDay = {};
  posts
    .filter((p) => p.scheduled_at && (!anchor || p.id !== anchor.id))
    .sort((a, b) => parseApiDate(a.scheduled_at) - parseApiDate(b.scheduled_at))
    .forEach((p) => {
      const key = dayKey(parseApiDate(p.scheduled_at));
      (byDay[key] ||= []).push(p);
    });

  for (let d = start, guard = 0; d <= fim && guard < 1000; d = addDays(d, 1), guard += 1) {
    const key = dayKey(d);
    const doDia = byDay[key] || [];
    const isPostingDay = postingDays.includes(getDay(d));

    if (doDia.length > 0) {
      days[key] = { pillar: rotation[cursor], suggested: false };
      for (const post of doDia) {
        const expected = rotation[cursor];
        postPlan[post.id] = {
          expected,
          offStructure: Boolean(post.pillar) && post.pillar !== expected,
        };
        const idx = rotation.indexOf(post.pillar);
        cursor = idx >= 0 ? (idx + 1) % rotation.length : (cursor + 1) % rotation.length;
      }
    } else if (isPostingDay && d >= hoje) {
      days[key] = { pillar: rotation[cursor], suggested: true };
      cursor = (cursor + 1) % rotation.length;
    }
    // past posting day with no post: skipped, cursor stays
  }

  return { days, posts: postPlan };
}
