import React from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { PILLARS } from "../../lib/pillars.js";
import { isMissed, parseApiDate } from "../../lib/postDates.js";

const FOCO =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-flowity-cyan";

/** Small colored pillar label. `suggested` renders it dimmer, for empty calendar days. */
export function PillarTag({ pillar, suggested = false, className = "" }) {
  const config = PILLARS[pillar];
  if (!config) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium leading-none ${suggested ? "opacity-70" : ""} ${className}`}
      style={{ color: config.color }}
      title={`${config.label}: ${config.description} Goal: ${config.goal}.`}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: config.color }} aria-hidden="true" />
      {suggested ? `Suggested: ${config.label}` : config.label}
    </span>
  );
}

/** One-click "remove date" button (PATCH scheduled_at null happens in the page). */
export function RemoveDateButton({ post, onRemoveDate, size = 10 }) {
  if (!onRemoveDate) return null;
  return (
    <button
      type="button"
      draggable="false"
      onClick={(e) => {
        e.stopPropagation();
        onRemoveDate(post);
      }}
      className={`shrink-0 rounded p-0.5 text-text-muted hover:text-red-300 hover:bg-red-500/10 ${FOCO}`}
      aria-label={`Remove date from post ${post.id}`}
      title="Remove date"
    >
      <X size={size} aria-hidden="true" />
    </button>
  );
}

export function MissedFlag() {
  return (
    <span className="inline-flex items-center rounded bg-red-500/20 border border-red-500/50 px-1 text-[10px] font-semibold leading-tight text-red-300">
      Missed date
    </span>
  );
}

export function OffStructureFlag({ expected }) {
  const label = PILLARS[expected]?.label;
  return (
    <span
      className="inline-flex items-center rounded border border-amber-400/50 bg-amber-400/10 px-1 text-[10px] font-medium leading-tight text-amber-300"
      title={label ? `The rotation expected ${label} on this day.` : undefined}
    >
      Off-structure
    </span>
  );
}

/** Date chip with the ✕ (and the "Missed date" flag next to it when the date passed). */
export function PostDateChip({ post, onRemoveDate, now = new Date() }) {
  const d = parseApiDate(post.scheduled_at);
  if (!d) return null;
  const missed = isMissed(post, now);
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {missed && <MissedFlag />}
      <span
        className={`inline-flex items-center gap-0.5 rounded border pl-1.5 pr-0.5 py-0.5 text-[11px] leading-none ${
          missed ? "border-red-500/50 text-red-300" : "border-border text-text-muted"
        }`}
      >
        {format(d, "MMM d · HH:mm")}
        <RemoveDateButton post={post} onRemoveDate={onRemoveDate} />
      </span>
    </span>
  );
}
