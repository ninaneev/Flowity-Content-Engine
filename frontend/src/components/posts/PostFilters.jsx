import React, { useEffect, useState } from "react";
import { CHANNELS, CHANNEL_ORDER } from "../../lib/channels.js";
import { ALL_PILLARS, PILLARS } from "../../lib/pillars.js";

const FOCO =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flowity-cyan";

export const FILTER_STATUSES = [
  { key: "to_approve", label: "To approve" },
  { key: "scheduled", label: "Scheduled" },
  { key: "published", label: "Published" },
  { key: "failed", label: "Failed" },
  { key: "draft", label: "Draft" },
  { key: "revised", label: "Revised" },
  { key: "idea", label: "Idea" },
];

const EMPTY = { channels: [], statuses: [], pillars: [] };

/** Filters remembered per page in this browser (a convenience only; the page works without it). */
export function useSavedFilters(storageKey) {
  const [filters, setFilters] = useState(() => {
    try {
      return { ...EMPTY, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
    } catch {
      return EMPTY;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(filters));
    } catch {
      /* private window: filters just are not remembered */
    }
  }, [storageKey, filters]);
  return [filters, setFilters];
}

function Chip({ active, color, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${FOCO} ${
        active ? "border-flowity-purple bg-flowity-purple/15 text-text-primary" : "border-border text-text-muted hover:text-text-primary"
      }`}
    >
      {color && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />}
      {children}
    </button>
  );
}

function Group({ label, children }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mr-1">{label}</span>
      {children}
    </div>
  );
}

/** Channel / status / pillar chips. Nothing selected in a group = show all of it. */
export default function PostFilters({ filters, onChange, counts = {} }) {
  const toggle = (group, key) => {
    const list = filters[group];
    onChange({ ...filters, [group]: list.includes(key) ? list.filter((k) => k !== key) : [...list, key] });
  };
  const any = filters.channels.length + filters.statuses.length + filters.pillars.length > 0;

  return (
    <div className="card bg-bg-surface/70 space-y-2 mb-4">
      <Group label="Channel">
        <Chip active={filters.channels.length === 0} onClick={() => onChange({ ...filters, channels: [] })}>
          All
        </Chip>
        {CHANNEL_ORDER.map((key) => (
          <Chip key={key} active={filters.channels.includes(key)} color={CHANNELS[key].color} onClick={() => toggle("channels", key)}>
            {CHANNELS[key].label}
            {counts[key] ? <span className="text-text-muted">{counts[key]}</span> : null}
          </Chip>
        ))}
      </Group>
      <Group label="Status">
        {FILTER_STATUSES.map(({ key, label }) => (
          <Chip key={key} active={filters.statuses.includes(key)} onClick={() => toggle("statuses", key)}>
            {label}
          </Chip>
        ))}
      </Group>
      <Group label="Pillar">
        {ALL_PILLARS.map((key) => (
          <Chip key={key} active={filters.pillars.includes(key)} color={PILLARS[key].color} onClick={() => toggle("pillars", key)}>
            {PILLARS[key].label}
          </Chip>
        ))}
        <Chip active={filters.pillars.includes("none")} onClick={() => toggle("pillars", "none")}>
          No pillar
        </Chip>
        {any && (
          <button type="button" onClick={() => onChange(EMPTY)} className={`ml-auto text-xs text-flowity-cyan hover:underline ${FOCO}`}>
            Clear filters
          </button>
        )}
      </Group>
    </div>
  );
}
