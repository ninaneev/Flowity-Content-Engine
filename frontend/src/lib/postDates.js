/**
 * Post date helpers shared by the calendar, the pipeline and PostModal.
 *
 * scheduled_at is stored in UTC (timestamptz). The screens work in the browser's local time
 * (São Paulo: 11:00 BRT is stored as 14:00Z), so every value read from the API goes through
 * parseApiDate and every value sent goes out as an ISO string with Z.
 */
import { format } from "date-fns";

export const DEFAULT_POST_TIME = "11:00";

const TEM_FUSO = /(Z|[+-]\d{2}:?\d{2})$/i;

/** API date string -> Date. A value without offset is UTC (that is how it is stored). */
export function parseApiDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const texto = String(value);
  const d = new Date(TEM_FUSO.test(texto) ? texto : `${texto}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** API date -> value for <input type="datetime-local"> in local time ("yyyy-MM-ddTHH:mm"). */
export function toLocalInput(value) {
  const d = parseApiDate(value);
  return d ? format(d, "yyyy-MM-dd'T'HH:mm") : "";
}

/** <input type="datetime-local"> value (local time) -> ISO UTC string, or null when empty. */
export function fromLocalInput(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** A day plus "HH:mm" in local time -> ISO UTC string. */
export function atTimeOnDay(day, time = DEFAULT_POST_TIME) {
  const [h, m] = String(time || DEFAULT_POST_TIME).split(":").map(Number);
  const d = new Date(day);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
}

/** Moves a dated post to another day, keeping its local time. */
export function moveToDay(value, day) {
  const original = parseApiDate(value);
  const time = original ? format(original, "HH:mm") : DEFAULT_POST_TIME;
  return atTimeOnDay(day, time);
}

const NAO_PERDE = new Set(["published", "publishing"]);

/** Date in the past and the post never went out. */
export function isMissed(post, now = new Date()) {
  const d = parseApiDate(post?.scheduled_at);
  return Boolean(d) && d < now && !NAO_PERDE.has(post.status);
}

function createdMs(post) {
  return parseApiDate(post.created_at)?.getTime() ?? 0;
}

/** Pipeline column order: dated first by scheduled_at ascending, undated last, then newest created. */
export function sortByScheduled(posts) {
  return [...posts].sort((a, b) => {
    const da = parseApiDate(a.scheduled_at);
    const db = parseApiDate(b.scheduled_at);
    if (da && db && da.getTime() !== db.getTime()) return da - db;
    if (da && !db) return -1;
    if (!da && db) return 1;
    return createdMs(b) - createdMs(a);
  });
}
