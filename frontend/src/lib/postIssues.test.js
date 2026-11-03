import { describe, expect, it } from "vitest";
import { issuesFor, postIssues } from "./postIssues.js";

const now = new Date("2026-11-03T12:00:00Z");
const base = {
  status: "scheduled",
  channel: "linkedin",
  hook: "Hook",
  scheduled_at: "2026-11-04T14:00:00Z",
  updated_at: "2026-11-03T11:00:00Z",
  image_count: 1,
  images_without_alt: 0,
  images_not_in_bucket: 0,
};
const ids = (post) => postIssues(post, now).map((i) => i.id);

describe("postIssues", () => {
  it("a ready post has no issues", () => {
    expect(ids(base)).toEqual([]);
  });

  it("flags an image without alt text under images", () => {
    const issues = postIssues({ ...base, images_without_alt: 1 }, now);
    expect(issuesFor(issues, "images").map((i) => i.id)).toEqual(["alt"]);
  });

  it("flags what makes Make skip or fail the post", () => {
    expect(ids({ ...base, status: "failed" })).toContain("failed");
    expect(ids({ ...base, images_not_in_bucket: 1 })).toContain("bucket");
    expect(ids({ ...base, image_count: 2 })).toContain("too-many");
    expect(ids({ ...base, scheduled_at: null })).toContain("no-date");
    expect(ids({ ...base, scheduled_at: "2026-11-02T14:00:00Z" })).toContain("missed");
    expect(ids({ ...base, hook: "", body: "" })).toContain("no-text");
  });

  it("publishing is only a problem after 10 minutes", () => {
    expect(ids({ ...base, status: "publishing", updated_at: "2026-11-03T11:55:00Z" })).toEqual([]);
    expect(ids({ ...base, status: "publishing", updated_at: "2026-11-03T11:30:00Z" })).toContain("stuck");
  });

  it("drafts are not nagged about publishing rules", () => {
    expect(ids({ ...base, status: "draft", image_count: 3, scheduled_at: null })).toEqual([]);
  });
});
