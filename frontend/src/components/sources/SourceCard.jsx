import React from "react";
import { BookOpen, Check } from "lucide-react";

const TYPE_LABELS = {
  post_antigo: "Old post",
  insight: "Insight",
  frase: "Positioning line",
  objecao: "Objection",
  dor: "Pain point",
  trecho: "Excerpt",
  comentario: "Comment",
  newsletter: "Newsletter",
  referencia: "Reference",
};

export default function SourceCard({ source, onSelect, selected, selectedLabel = "Selected" }) {
  const typeLabel = TYPE_LABELS[source.source_type] || source.source_type;
  const preview = source.content
    ? source.content.slice(0, 100) + (source.content.length > 100 ? "..." : "")
    : "";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      className={`card cursor-pointer transition-all duration-200 hover:border-border-bright ${
        selected ? "border-flowity-purple purple-glow" : ""
      }`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
    >
      <div className="flex items-start gap-3">
        <BookOpen size={16} className="text-text-muted mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-text-primary font-medium text-sm truncate">{source.title}</p>
            {selected && (
              <span className="badge border border-flowity-purple/30 bg-flowity-purple/10 text-flowity-purple text-[10px] flex items-center gap-1">
                <Check size={12} /> {selectedLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="badge border border-flowity-purple/30 bg-flowity-purple/10 text-flowity-purple text-[10px]">
              {typeLabel}
            </span>
            {source.theme && (
              <span className="badge border border-flowity-cyan/30 bg-flowity-cyan/10 text-flowity-cyan text-[10px]">
                {source.theme}
              </span>
            )}
            {source.origin && (
              <span className="badge border border-border bg-bg-elevated text-text-muted text-[10px]">
                {source.origin}
              </span>
            )}
          </div>
          {preview && (
            <p className="text-text-muted text-xs mt-2 leading-relaxed line-clamp-2">{preview}</p>
          )}
        </div>
      </div>
    </div>
  );
}
