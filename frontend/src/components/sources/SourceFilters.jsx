/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  TAREFA DO INTEGRANTE 7 — UI Polish (SourceFilters)                ║
 * ║  Issue: #7 no GitHub Projects                                       ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 * Adicione filtros de busca por tipo e tema para a lista de sources.
 */

/**
//CODIGO ANTIGO
import React from "react";
import { Search } from "lucide-react";

export default function SourceFilters({ search, onSearchChange }) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <input
        className="input pl-8 text-sm"
        placeholder="Buscar sources..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      { // TODO Integrante 7: adicione um select para filtrar por source_type }
    </div>
  );
}
*/

import React from "react";
import { Search } from "lucide-react";

export default function SourceFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
}) {
  return (
    <div className="flex items-center gap-2">
      
      {/* 🔍 Input de busca */}
      <div className="relative flex-1">
        <Search
          //size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          className="input pl-8 text-sm bg-bg-surface focus:ring-1 focus:ring-flowity-cyan transition"
          placeholder="  Buscar sources..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* 🧩 Select de tipo */}
      <select
        className={`input text-sm bg-bg-surface transition cursor-pointer hover:opacity-90 w-32 ${
        typeFilter
        ? "text-flowity-cyan border-flowity-cyan"
         : "text-flowity-purple"
        }`}
      >
        <option value="">Todos</option>
        <option value="rss">RSS</option>
        <option value="twitter">Twitter</option>
        <option value="youtube">YouTube</option>
        <option value="website">Website</option>
      </select>

    </div>
  );
}
