/**
 * What a post still needs before Make can publish it (or what went wrong when it tried).
 * Shared by the pipeline cards, the calendar and PostModal: a red dot marks every place
 * listed here. No React, so it can be tested on its own.
 *
 * Each issue: { id, field, message }. `field` says where to look in the editor:
 * "status", "date", "images" or "text".
 */
import { isMissed, parseApiDate } from "./postDates.js";

const STUCK_AFTER_MS = 10 * 60 * 1000;

export function postIssues(post, now = new Date()) {
  if (!post) return [];
  const issues = [];
  const add = (id, field, message) => issues.push({ id, field, message });
  const queued = post.status === "scheduled";

  if (post.status === "failed") {
    add("failed", "status", "Make could not publish this post. Fix what is marked below (or the LinkedIn connection in Make), then give it a new date.");
  }
  const updated = parseApiDate(post.updated_at);
  if (post.status === "publishing" && updated && now - updated > STUCK_AFTER_MS) {
    add("stuck", "status", "Stuck in Publishing for more than 10 minutes. Check the run in Make, then give it a new date.");
  }
  if (queued && !post.scheduled_at) {
    add("no-date", "date", "Scheduled without a date. Pick a date or move it back to Revised.");
  }
  if (queued && isMissed(post, now)) {
    add("missed", "date", "The date passed and the post did not go out. Pick a new date.");
  }
  if (post.images_without_alt > 0) {
    add("alt", "images", `${post.images_without_alt} image(s) without alt text. Add it in Post images.`);
  }
  if (post.channel === "linkedin" && (queued || post.status === "failed")) {
    if (post.images_not_in_bucket > 0) {
      add("bucket", "images", "The image is only on this computer, so Make cannot download it. Upload it again.");
    }
    if (post.image_count > 1) {
      add("too-many", "images", `Make posts one image per post and this one has ${post.image_count}. Remove the extra ones or it will be skipped.`);
    }
  }
  if (queued && !String(post.hook || "").trim() && !String(post.body || "").trim()) {
    add("no-text", "text", "The post has no text.");
  }
  return issues;
}

export function issuesFor(issues, field) {
  return issues.filter((issue) => issue.field === field);
}
