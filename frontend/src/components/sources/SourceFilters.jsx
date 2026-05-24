import React from "react";
import { Search } from "lucide-react";
import SelectField from "../shared/SelectField";

const SOURCE_TYPE_OPTIONS = [
  { value: "post_antigo", label: "Old post" },
  { value: "insight", label: "Insight" },
  { value: "frase", label: "Positioning line" },
  { value: "objecao", label: "Objection" },
  { value: "dor", label: "Pain point" },
  { value: "trecho", label: "Excerpt" },
  { value: "comentario", label: "Comment" },
  { value: "newsletter", label: "Newsletter" },
  { value: "referencia", label: "Reference" },
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
          placeholder="Search sources..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <SelectField
        value={typeFilter}
        onChange={(e) => onTypeFilterChange(e.target.value)}
        options={[{ value: "", label: "All types" }, ...SOURCE_TYPE_OPTIONS]}
        selectClassName={`w-40 text-sm ${typeFilter ? "text-flowity-cyan border-flowity-cyan" : "text-text-muted"}`}
      />
    </div>
  );
}
