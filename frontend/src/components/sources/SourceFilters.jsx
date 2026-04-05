/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  TAREFA DO INTEGRANTE 7 — UI Polish (SourceFilters)                ║
 * ║  Issue: #7 no GitHub Projects                                       ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 * Adicione filtros de busca por tipo e tema para a lista de sources.
 */
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
      {/* TODO Integrante 7: adicione um select para filtrar por source_type */}
    </div>
  );
}
