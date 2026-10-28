import { describe, expect, it } from "vitest";
import { PILLARS, PILLAR_ROTATION, planPillars } from "./pillars.js";

const at = (m, d, h = 11) => new Date(2026, m - 1, d, h, 0).toISOString();
// Wed 28 Oct 2026
const TODAY = new Date(2026, 9, 28, 9, 0);

describe("pillar config", () => {
  it("has the five stable keys in rotation order, each with label and color", () => {
    expect(PILLAR_ROTATION).toEqual(["workflow", "proof", "build", "pov", "story"]);
    for (const k of PILLAR_ROTATION) {
      expect(PILLARS[k].label).toBeTruthy();
      expect(PILLARS[k].color).toMatch(/^#[0-9A-F]{6}$/i);
    }
    expect(new Set(PILLAR_ROTATION.map((k) => PILLARS[k].color)).size).toBe(5);
  });
});

describe("planPillars", () => {
  it("with nothing published starts at workflow on the first posting day >= today", () => {
    const { days } = planPillars({ posts: [], today: TODAY, until: new Date(2026, 10, 4) });
    expect(days).toEqual({
      "2026-10-28": { pillar: "workflow", suggested: true },
      "2026-10-29": { pillar: "proof", suggested: true },
      "2026-10-30": { pillar: "build", suggested: true },
      // weekend skipped
      "2026-11-02": { pillar: "pov", suggested: true },
      "2026-11-03": { pillar: "story", suggested: true },
      "2026-11-04": { pillar: "workflow", suggested: true },
    });
  });

  it("continues after the most recent published pillar", () => {
    const posts = [
      { id: 1, status: "published", pillar: "workflow", scheduled_at: at(10, 22) },
      { id: 2, status: "published", pillar: "proof", scheduled_at: at(10, 26) },
    ];
    const { days } = planPillars({ posts, today: TODAY, until: new Date(2026, 9, 30) });
    // Tue 27 had no post and is past: skipped, cursor stays at build
    expect(days["2026-10-27"]).toBeUndefined();
    expect(days["2026-10-28"]).toEqual({ pillar: "build", suggested: true });
    expect(days["2026-10-29"]).toEqual({ pillar: "pov", suggested: true });
    expect(days["2026-10-30"]).toEqual({ pillar: "story", suggested: true });
  });

  it("flags off-structure posts and adapts the rotation to what was posted", () => {
    const posts = [
      { id: 1, status: "published", pillar: "workflow", scheduled_at: at(10, 26) },
      // expected proof on Wed 28, but a pov was planned
      { id: 2, status: "draft", pillar: "pov", scheduled_at: at(10, 28) },
      // Thu 29: expected story (after pov), it is story
      { id: 3, status: "draft", pillar: "story", scheduled_at: at(10, 29) },
    ];
    const plan = planPillars({ posts, today: TODAY, until: new Date(2026, 9, 30) });
    expect(plan.posts[2]).toEqual({ expected: "proof", offStructure: true });
    expect(plan.posts[3]).toEqual({ expected: "story", offStructure: false });
    expect(plan.days["2026-10-28"]).toEqual({ pillar: "proof", suggested: false });
    expect(plan.days["2026-10-30"]).toEqual({ pillar: "workflow", suggested: true });
  });

  it("a past day with a post counts, a skipped past day does not", () => {
    const posts = [
      { id: 1, status: "published", pillar: "workflow", scheduled_at: at(10, 22) }, // Thu
      { id: 2, status: "draft", pillar: "proof", scheduled_at: at(10, 26) }, // Mon, missed but counts
    ];
    const plan = planPillars({ posts, today: TODAY, until: new Date(2026, 9, 28) });
    expect(plan.posts[2]).toEqual({ expected: "proof", offStructure: false });
    expect(plan.days["2026-10-23"]).toBeUndefined(); // Fri skipped
    expect(plan.days["2026-10-27"]).toBeUndefined(); // Tue skipped
    expect(plan.days["2026-10-28"]).toEqual({ pillar: "build", suggested: true });
  });

  it("a post without pillar takes one slot and is never off-structure", () => {
    const posts = [{ id: 7, status: "draft", pillar: null, scheduled_at: at(10, 28) }];
    const plan = planPillars({ posts, today: TODAY, until: new Date(2026, 9, 29) });
    expect(plan.posts[7]).toEqual({ expected: "workflow", offStructure: false });
    expect(plan.days["2026-10-29"]).toEqual({ pillar: "proof", suggested: true });
  });

  it("uses the latest published post as anchor, ignoring drafts", () => {
    const posts = [
      { id: 1, status: "published", pillar: "build", scheduled_at: at(10, 20) },
      { id: 2, status: "published", pillar: "story", scheduled_at: at(10, 27) },
      { id: 3, status: "draft", pillar: "pov", scheduled_at: at(10, 15) },
    ];
    const { days } = planPillars({ posts, today: TODAY, until: new Date(2026, 9, 28) });
    expect(days["2026-10-28"]).toEqual({ pillar: "workflow", suggested: true });
  });

  it("respects custom posting days", () => {
    const { days } = planPillars({
      posts: [],
      today: TODAY,
      until: new Date(2026, 10, 3),
      postingDays: [2, 4], // Tue, Thu
    });
    expect(Object.keys(days)).toEqual(["2026-10-29", "2026-11-03"]);
  });
});
