import React, { useState, useEffect } from "react";
import { Plus, BookOpen } from "lucide-react";
import SourceCard from "../components/sources/SourceCard";
import NewSourceForm from "../components/sources/NewSourceForm";
import SourceFilters from "../components/sources/SourceFilters";
import EmptyState from "../components/shared/EmptyState";
import { sourcesApi } from "../lib/api";

export default function SourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    fetchSources();
  }, []);

  async function fetchSources() {
    setLoading(true);
    try {
      const res = await sourcesApi.list();
      setSources(res.data);
    } catch (err) {
      console.error("Erro ao carregar sources:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data) {
    setSaving(true);
    try {
      await sourcesApi.create(data);
      setShowForm(false);
      fetchSources();
    } catch (err) {
      console.error("Erro ao criar source:", err);
    } finally {
      setSaving(false);
    }
  }

  const filtered = sources.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.content.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? s.source_type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Library</h1>
          <p className="text-text-muted text-sm mt-0.5">
            {sources.length} referência{sources.length !== 1 ? "s" : ""} cadastrada{sources.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Nova source
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Nova referência</h2>
          <NewSourceForm
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
            loading={saving}
          />
        </div>
      )}

      {/* Filtros */}
      <div className="mb-4">
        <SourceFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse" />
          ))}
        </div>
      )}

      {/* Vazio */}
      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title={search || typeFilter ? "Nenhuma source encontrada" : "Nenhuma source ainda"}
          description={
            search || typeFilter
              ? "Tente outro termo ou remova os filtros."
              : "Adicione sua primeira referência de conteúdo."
          }
          action={
            !search && !typeFilter && (
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={16} /> Adicionar source
              </button>
            )
          }
        />
      )}

      {/* Grid de cards */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              onSelect={() => {}}
              selected={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
