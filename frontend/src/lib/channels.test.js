import { describe, expect, it } from "vitest";
import { filterPosts, postText } from "./channels.js";

const posts = [
  { id: 1, channel: "linkedin", status: "scheduled", pillar: "proof" },
  { id: 2, channel: "linkedin_company", status: "to_approve", pillar: "company_trust" },
  { id: 3, channel: "x", status: "publishing", pillar: null },
];
const ids = (f) => filterPosts(posts, f).map((p) => p.id);

describe("filterPosts", () => {
  it("no filter shows everything", () => {
    expect(ids({})).toEqual([1, 2, 3]);
  });
  it("combines channel, status and pillar", () => {
    expect(ids({ channels: ["linkedin_company"] })).toEqual([2]);
    expect(ids({ statuses: ["scheduled"] })).toEqual([1, 3]); // publishing counts as scheduled
    expect(ids({ pillars: ["none"] })).toEqual([3]);
    expect(ids({ channels: ["linkedin", "x"], statuses: ["scheduled"], pillars: ["proof"] })).toEqual([1]);
  });
});

describe("postText", () => {
  it("joins hook, body and CTA with blank lines", () => {
    expect(postText({ hook: "Hook", body: " Body ", cta: "" })).toBe("Hook\n\nBody");
  });
});
