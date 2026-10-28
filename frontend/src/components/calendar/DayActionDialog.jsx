import React, { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { PILLARS } from "../../lib/pillars.js";
import { DEFAULT_POST_TIME } from "../../lib/postDates.js";
import { PillarTag } from "../posts/PostMeta";

const FOCO =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flowity-cyan";
const PODE_USAR = new Set(["idea", "draft", "revised"]);

/**
 * Clique num dia vazio do calendário: escolhe a hora e cria um post novo
 * ou coloca nesse dia um post que ainda não tem data.
 */
export default function DayActionDialog({ day, suggestedPillar, posts = [], onClose, onNewPost, onUseExisting }) {
  const [time, setTime] = useState(DEFAULT_POST_TIME);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const timeRef = useRef(null);

  useEffect(() => {
    timeRef.current?.focus();
    const handleKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .filter((p) => !p.scheduled_at && PODE_USAR.has(p.status))
      .filter((p) => !q || (p.hook || "").toLowerCase().includes(q));
  }, [posts, query]);

  async function pick(post) {
    setBusy(true);
    try {
      await onUseExisting(post, time);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-action-title"
        className="bg-bg-surface border border-border rounded-xl w-full max-w-sm p-4 space-y-3 animate-slide-up"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 id="day-action-title" className="text-sm font-semibold text-text-primary">
              {format(day, "EEEE, MMMM d")}
            </h2>
            {PILLARS[suggestedPillar] && (
              <div className="mt-1">
                <PillarTag pillar={suggestedPillar} />
                <span className="text-[10px] text-text-muted"> expected for this day</span>
              </div>
            )}
          </div>
          <button type="button" className={`btn-ghost p-1 ${FOCO}`} onClick={onClose} aria-label="Close">
            <X size={14} aria-hidden="true" />
          </button>
        </div>

        <div>
          <label className="label" htmlFor="day-action-time">Time</label>
          <input
            ref={timeRef}
            id="day-action-time"
            type="time"
            className="input"
            value={time}
            onChange={(e) => setTime(e.target.value || DEFAULT_POST_TIME)}
          />
        </div>

        {!picking ? (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn-primary justify-center" onClick={() => onNewPost(time)}>
              New post
            </button>
            <button type="button" className="btn-secondary justify-center" onClick={() => setPicking(true)}>
              Use an existing post
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="label" htmlFor="day-action-search">Undated posts (idea, draft, revised)</label>
            <input
              id="day-action-search"
              className="input"
              placeholder="Search by hook..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <ul className="max-h-60 overflow-y-auto space-y-1" aria-label="Posts without a date">
              {candidates.length === 0 && (
                <li className="text-xs text-text-muted px-1 py-2">No undated idea, draft or revised posts.</li>
              )}
              {candidates.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => pick(p)}
                    className={`w-full text-left rounded-lg border border-border bg-bg-elevated px-2 py-1.5 hover:border-flowity-purple disabled:cursor-wait ${FOCO}`}
                  >
                    <span className="block text-xs text-text-primary line-clamp-2">{p.hook}</span>
                    <span className="flex items-center gap-2 mt-0.5 text-[10px] text-text-muted">
                      {p.status}
                      <PillarTag pillar={p.pillar} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="btn-ghost text-xs" onClick={() => setPicking(false)}>
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
