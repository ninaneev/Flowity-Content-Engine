import { describe, expect, it } from "vitest";
import {
  atTimeOnDay,
  fromLocalInput,
  isMissed,
  moveToDay,
  parseApiDate,
  sortByScheduled,
  toLocalInput,
} from "./postDates.js";

// Fixtures built in local time so the tests pass in any TZ.
const local = (y, m, d, h = 11, min = 0) => new Date(y, m - 1, d, h, min).toISOString();

describe("parseApiDate / local input round trip", () => {
  it("treats values without offset as UTC", () => {
    expect(parseApiDate("2026-10-28T14:00:00").toISOString()).toBe("2026-10-28T14:00:00.000Z");
    expect(parseApiDate("2026-10-28T14:00:00Z").toISOString()).toBe("2026-10-28T14:00:00.000Z");
    expect(parseApiDate(null)).toBeNull();
  });

  it("shows local time in the input and sends UTC back", () => {
    const iso = local(2026, 11, 2, 11, 0);
    expect(toLocalInput(iso)).toBe("2026-11-02T11:00");
    expect(fromLocalInput("2026-11-02T11:00")).toBe(iso);
    expect(fromLocalInput("")).toBeNull();
    expect(toLocalInput(null)).toBe("");
  });

  it("atTimeOnDay and moveToDay keep the local time", () => {
    expect(atTimeOnDay(new Date(2026, 10, 4), "11:00")).toBe(local(2026, 11, 4, 11, 0));
    expect(moveToDay(local(2026, 11, 2, 9, 30), new Date(2026, 10, 6))).toBe(local(2026, 11, 6, 9, 30));
  });
});

describe("isMissed", () => {
  const now = new Date(2026, 9, 28, 12, 0);

  it("flags a past date that never went out", () => {
    for (const status of ["idea", "draft", "revised", "scheduled", "failed"]) {
      expect(isMissed({ status, scheduled_at: local(2026, 10, 27) }, now)).toBe(true);
    }
  });

  it("does not flag published/publishing, future or undated posts", () => {
    expect(isMissed({ status: "published", scheduled_at: local(2026, 10, 27) }, now)).toBe(false);
    expect(isMissed({ status: "publishing", scheduled_at: local(2026, 10, 27) }, now)).toBe(false);
    expect(isMissed({ status: "draft", scheduled_at: local(2026, 10, 29) }, now)).toBe(false);
    expect(isMissed({ status: "draft", scheduled_at: null }, now)).toBe(false);
  });
});

describe("sortByScheduled", () => {
  it("dated ascending, undated last, then newest created", () => {
    const posts = [
      { id: 1, scheduled_at: null, created_at: "2026-10-01T10:00:00Z" },
      { id: 2, scheduled_at: local(2026, 11, 5), created_at: "2026-10-01T10:00:00Z" },
      { id: 3, scheduled_at: null, created_at: "2026-10-20T10:00:00Z" },
      { id: 4, scheduled_at: local(2026, 11, 2), created_at: "2026-10-01T10:00:00Z" },
      { id: 5, scheduled_at: local(2026, 11, 2), created_at: "2026-10-10T10:00:00Z" },
    ];
    expect(sortByScheduled(posts).map((p) => p.id)).toEqual([5, 4, 2, 3, 1]);
  });

  it("reorders when a date changes and does not mutate the input", () => {
    const posts = [
      { id: 1, scheduled_at: local(2026, 11, 2) },
      { id: 2, scheduled_at: local(2026, 11, 3) },
    ];
    const moved = posts.map((p) => (p.id === 1 ? { ...p, scheduled_at: local(2026, 11, 9) } : p));
    expect(sortByScheduled(moved).map((p) => p.id)).toEqual([2, 1]);
    expect(posts[0].scheduled_at).toBe(local(2026, 11, 2));
  });
});
