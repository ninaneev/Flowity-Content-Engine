import React from "react";
import { BookOpen } from "lucide-react";

const TYPE_LABELS = {
  post_antigo: "Post antigo",
  insight: "Insight",
  frase: "Frase",
  objecao: "Objeção",
  dor: "Dor",
  trecho: "Trecho",
  comentario: "Comentário",
  newsletter: "Newsletter",
  referencia: "Referência",
};

export default function SourceCard({ source, onSelect, selected }) {
  const typeLabel = TYPE_LABELS[source.source_type] || source.source_type;
  const preview = source.content
    ? source.content.slice(0, 100) + (source.content.length > 100 ? "..." : "")
    : "";

  return (
    <div
      className={`card cursor-pointer transition-all duration-200 hover:border-border-bright ${
        selected ? "border-flowity-purple purple-glow border-2" : "border"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <BookOpen size={16} className="text-text-muted mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          {/* Título em destaque */}
          <p className="text-text-primary font-bold text-base mb-2 truncate">
            {source.title}
          </p>
          
          {/* Badges coloridos */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="badge border border-flowity-purple/30 bg-flowity-purple/10 text-flowity-purple text-[10px] font-semibold">
              {typeLabel}
            </span>
            {source.theme && (
              <span className="badge border border-flowity-cyan/30 bg-flowity-cyan/10 text-flowity-cyan text-[10px] font-semibold">
                {source.theme}
              </span>
            )}
            {source.origin && (
              <span className="badge border border-border bg-bg-elevated text-text-muted text-[10px]">
                {source.origin}
              </span>
            )}
          </div>
          
          {/* Preview do conteúdo */}
          {preview && (
            <p className="text-text-muted text-xs mt-3 leading-relaxed line-clamp-2">
              {preview}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
