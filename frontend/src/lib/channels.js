/**
 * Where a post goes. Keys are stored in posts.channel (backend VALID_CHANNELS): never rename them.
 * `auto`: Make publishes it on the approved day. Manual channels get "Copy text" / "Mark published".
 * `pillars`: which pillar set the editor offers for this channel.
 */
export const CHANNELS = {
  linkedin: {
    key: "linkedin",
    label: "LinkedIn · Nina",
    short: "Nina",
    color: "#9C83F7",
    auto: true,
    pillars: "personal",
  },
  linkedin_company: {
    key: "linkedin_company",
    label: "LinkedIn · Flowity page",
    short: "Flowity",
    color: "#1CD8DE",
    auto: true,
    pillars: "company",
  },
  x: { key: "x", label: "X", short: "X", color: "#E5E7EB", auto: false, pillars: "personal" },
  newsletter: {
    key: "newsletter",
    label: "LinkedIn newsletter",
    short: "Newsletter",
    color: "#F472B6",
    auto: false,
    pillars: "any",
  },
  article: {
    key: "article",
    label: "flowity.ai article",
    short: "Article",
    color: "#A3E635",
    auto: false,
    pillars: "any",
  },
  blog: {
    key: "blog",
    label: "ninaneev.github.io",
    short: "Blog",
    color: "#FCD34D",
    auto: false,
    pillars: "any",
  },
};

export const CHANNEL_ORDER = ["linkedin", "linkedin_company", "x", "newsletter", "article", "blog"];

export function channelOf(post) {
  return CHANNELS[post?.channel] || CHANNELS.linkedin;
}

/** Text ready to paste on a manual channel: hook, body and CTA separated by a blank line. */
export function postText(post) {
  return [post?.hook, post?.body, post?.cta]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join("\n\n");
}

/** Keeps only the posts that match the chosen filters; empty filter = everything. */
export function filterPosts(posts, { channels = [], statuses = [], pillars = [] } = {}) {
  return posts.filter(
    (p) =>
      (channels.length === 0 || channels.includes(p.channel)) &&
      (statuses.length === 0 || statuses.includes(p.status === "publishing" ? "scheduled" : p.status)) &&
      (pillars.length === 0 || pillars.includes(p.pillar || "none")),
  );
}
