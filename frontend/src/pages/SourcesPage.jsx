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
  const [editingSource, setEditingSource] = useState(null);
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
      console.error("Error loading sources:", err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingSource(null);
    setShowForm(true);
  }

  function openEditForm(source) {
    setEditingSource(source);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingSource(null);
  }

  async function handleSave(data) {
    setSaving(true);
    try {
      if (editingSource) {
        await sourcesApi.update(editingSource.id, data);
      } else {
        await sourcesApi.create(data);
      }
      closeForm();
      fetchSources();
    } catch (err) {
      console.error("Error saving source:", err);
    } finally {
      setSaving(false);
    }
  }

  const filtered = sources.filter((s) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm) ||
      s.content.toLowerCase().includes(searchTerm);
    const matchesType = typeFilter ? s.source_type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Library</h1>
          <p className="text-text-muted text-sm mt-0.5">
            {sources.length} saved reference{sources.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn-primary" onClick={openCreateForm}>
          <Plus size={16} />
          New source
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">
            {editingSource ? "Edit source" : "New reference"}
          </h2>
          <NewSourceForm
            initialData={editingSource}
            onSave={handleSave}
            onCancel={closeForm}
            loading={saving}
          />
        </div>
      )}

      <div className="mb-4">
        <SourceFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title={search || typeFilter ? "No sources found" : "No sources yet"}
          description={
            search || typeFilter
              ? "Try another search term or remove the filters."
              : "Add your first content reference."
          }
          action={
            !search && !typeFilter && (
              <button className="btn-primary" onClick={openCreateForm}>
                <Plus size={16} /> Add source
              </button>
            )
          }
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              onSelect={() => openEditForm(source)}
              selected={editingSource?.id === source.id}
              selectedLabel="Open"
            />
          ))}
        </div>
      )}
    </div>
  );
}
