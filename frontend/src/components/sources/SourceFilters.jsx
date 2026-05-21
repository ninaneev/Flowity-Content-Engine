import React from "react";
import { Search } from "lucide-react";

const SOURCE_TYPE_OPTIONS = [
  { value: "post_antigo", label: "Post antigo" },
  { value: "insight", label: "Insight" },
  { value: "frase", label: "Frase" },
  { value: "objecao", label: "Objeção" },
  { value: "dor", label: "Dor" },
  { value: "trecho", label: "Trecho" },
  { value: "comentario", label: "Comentário" },
  { value: "newsletter", label: "Newsletter" },
  { value: "referencia", label: "Referência" },
];

export default function SourceFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          className="input pl-8 text-sm bg-bg-surface focus:ring-1 focus:ring-flowity-cyan transition"
          placeholder="Buscar sources..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <select
        className={`input text-sm bg-bg-surface transition cursor-pointer hover:opacity-90 w-36 ${
          typeFilter ? "text-flowity-cyan border-flowity-cyan" : "text-text-muted"
        }`}
        value={typeFilter}
        onChange={(e) => onTypeFilterChange(e.target.value)}
      >
        <option value="">Todos os tipos</option>
        {SOURCE_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
